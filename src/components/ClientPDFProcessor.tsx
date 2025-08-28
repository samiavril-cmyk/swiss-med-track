import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { supabase } from '@/integrations/supabase/client';

// Disable worker to avoid loading issues
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

interface ProcedureData {
  proc_name: string;
  module_name: string;
  minimum: number;
  responsible: number;
  instructing: number;
  assistant: number;
  total: number;
}

interface ProcessResult {
  success: boolean;
  runId?: string;
  summary?: {
    filename: string;
    standDate?: string;
    totalProcedures: number;
    modules: unknown[];
    matched: number;
    needsReview: number;
  };
  stagingData?: unknown[];
  error?: string;
}

export const useClientPDFProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = (textContent.items as Array<{ str?: string }>)
          .map((item) => item.str ?? '')
          .join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  };

  const parseTextLocally = (text: string): ProcedureData[] => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const procedures: ProcedureData[] = [];
    let currentModule = '';

    const isModuleHeader = (line: string) => /^(Basis|Modul)\s+.+$/i.test(line);
    const isNumeric = (line: string) => /^\d+$/.test(line);

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith('Stand:') || /SIWF|Seite\s+\d+|Erfasste Prozeduren/i.test(line)) {
        i++; continue;
      }

      if (isModuleHeader(line)) {
        currentModule = line;
        // Skip typical 5 header labels if present
        i++;
        continue;
      }

      // A procedure line usually: name then following lines are numbers
      if (currentModule && !isNumeric(line)) {
        const name = line;
        const nums: number[] = [];
        let j = i + 1;
        while (j < lines.length && j < i + 10) {
          const nxt = lines[j];
          if (isNumeric(nxt)) { nums.push(parseInt(nxt)); j++; continue; }
          if (isModuleHeader(nxt)) break;
          if (!isNumeric(nxt)) break;
          j++;
        }
        if (nums.length > 0) {
          const minimum = nums[0] || 0;
          const responsible = nums[1] || 0;
          const instructing = nums[2] || 0;
          const assistant = nums[3] || 0;
          const total = nums[4] || (responsible + instructing + assistant);
          procedures.push({
            proc_name: name,
            module_name: currentModule,
            minimum,
            responsible,
            instructing,
            assistant,
            total,
          });
          i = j; continue;
        }
      }

      i++;
    }

    return procedures;
  };

  const createImportRun = async (filename: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('import_runs')
      .insert({
        user_id: user.id,
        pdf_filename: filename,
        source: 'client_ai_parse',
        status: 'running'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const processFile = async (file: File): Promise<ProcessResult> => {
    setIsProcessing(true);
    
    try {
      // Extract text from PDF
      const text = await extractTextFromPDF(file);
      
      // Parse locally (rules-based)
      const procedures = parseTextLocally(text);
      
      // Create import run
      const importRun = await createImportRun(file.name);
      
      // Save to staging
      const stagingPromises = procedures.map(proc => 
        supabase.from('import_procedure_staging').insert({
          run_id: importRun.id,
          proc_name: proc.proc_name,
          module_name: proc.module_name,
          minimum: proc.minimum,
          responsible: proc.responsible,
          instructing: proc.instructing,
          assistant: proc.assistant,
          total: proc.total,
          status: 'pending'
        })
      );

      await Promise.all(stagingPromises);

      return {
        success: true,
        runId: importRun.id,
        summary: {
          filename: file.name,
          totalProcedures: procedures.length,
          modules: [],
          matched: 0,
          needsReview: procedures.length
        },
        stagingData: procedures
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return { processFile, isProcessing };
};