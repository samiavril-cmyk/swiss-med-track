import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { supabase } from '@/integrations/supabase/client';

// Configure PDF.js worker to use legacy build
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.js`;

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
    modules: any[];
    matched: number;
    needsReview: number;
  };
  stagingData?: any[];
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
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  };

  const parseWithAI = async (text: string, filename: string): Promise<ProcedureData[]> => {
    const response = await supabase.functions.invoke('parse-procedures', {
      body: { text, filename }
    });

    if (response.error) {
      throw new Error('AI parsing failed: ' + response.error.message);
    }

    return response.data;
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
      
      // Parse with AI
      const procedures = await parseWithAI(text, file.name);
      
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