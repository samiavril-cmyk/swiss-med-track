import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type StagingRow = Database['public']['Tables']['import_procedure_staging']['Row'];
type StagingSelect = StagingRow & {
  procedures?: { title_de: string | null } | null;
};

interface ProcedureData {
  proc_name: string;
  module_name: string;
  minimum: number | null;
  responsible: number | null;
  instructing: number | null;
  assistant: number | null;
  total: number | null;
}

export interface PdfModuleSummary {
  name: string;
  minimum: number;
  responsible: number;
  instructing: number;
  assistant: number;
  total: number;
}

export interface PdfStagingProcedure {
  id: string;
  module_name: string;
  proc_name: string;
  minimum: number | null;
  responsible: number | null;
  instructing: number | null;
  assistant: number | null;
  total: number | null;
  status: string;
  matched_proc_id: string | null;
  match_confidence: number | null;
  match_method: string | null;
  procedures?: { title_de: string | null } | null;
}

interface ProcessResult {
  success: boolean;
  runId?: string;
  summary?: {
    filename: string;
    standDate?: string;
    totalProcedures: number;
    modules: PdfModuleSummary[];
    matched: number;
    needsReview: number;
  };
  stagingData?: PdfStagingProcedure[];
  error?: string;
}

const parseStandDate = (text: string): string | undefined => {
  const match = text.match(/Stand:\s*([0-9]{2}\.[0-9]{2}\.[0-9]{4})/i);
  return match ? match[1] : undefined;
};

const calculateModuleSummaries = (procedures: PdfStagingProcedure[]): PdfModuleSummary[] => {
  const moduleMap = new Map<string, PdfModuleSummary>();

  procedures.forEach((procedure) => {
    const existing = moduleMap.get(procedure.module_name) ?? {
      name: procedure.module_name,
      minimum: 0,
      responsible: 0,
      instructing: 0,
      assistant: 0,
      total: 0
    };

    existing.minimum += procedure.minimum ?? 0;
    existing.responsible += procedure.responsible ?? 0;
    existing.instructing += procedure.instructing ?? 0;
    existing.assistant += procedure.assistant ?? 0;

    const procedureTotal =
      procedure.total ??
      (procedure.responsible ?? 0) +
        (procedure.instructing ?? 0) +
        (procedure.assistant ?? 0);

    existing.total += procedureTotal;

    moduleMap.set(procedure.module_name, existing);
  });

  return Array.from(moduleMap.values());
};

const calculateTotalProcedures = (procedures: PdfStagingProcedure[]): number =>
  procedures.reduce((acc, procedure) => {
    const value =
      procedure.total ??
      (procedure.responsible ?? 0) +
        (procedure.instructing ?? 0) +
        (procedure.assistant ?? 0);
    return acc + value;
  }, 0);

export const useClientPDFProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
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
        i++;
        continue;
      }

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
          const minimum = nums[0] ?? null;
          const responsible = nums[1] ?? null;
          const instructing = nums[2] ?? null;
          const assistant = nums[3] ?? null;
          const total = nums[4] ?? null;
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
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('Not authenticated');

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('import_runs')
      .insert({
        user_id: user.id,
        pdf_filename: filename,
        source: 'client_ai_parse',
        status: 'running',
        started_at: now
      })
      .select()
      .single();

    if (error || !data) throw error ?? new Error('Import run could not be created');
    return data;
  };

  const processFile = async (file: File): Promise<ProcessResult> => {
    setIsProcessing(true);

    try {
      const text = await extractTextFromPDF(file);
      const procedures = parseTextLocally(text);

      if (procedures.length === 0) {
        throw new Error('Keine Prozeduren im PDF gefunden.');
      }

      const standDate = parseStandDate(text);
      const importRun = await createImportRun(file.name);

      const stagingPayload = procedures.map((proc) => ({
        run_id: importRun.id,
        proc_name: proc.proc_name,
        module_name: proc.module_name,
        minimum: proc.minimum,
        responsible: proc.responsible,
        instructing: proc.instructing,
        assistant: proc.assistant,
        total: proc.total,
        status: 'needs_review',
        match_method: 'manual',
        match_confidence: 0
      }));

      const { error: stagingError } = await supabase
        .from('import_procedure_staging')
        .insert(stagingPayload);

      if (stagingError) throw stagingError;

      const { data: stagingData, error: stagingFetchError } = await supabase
        .from('import_procedure_staging')
        .select(`
          id,
          module_name,
          proc_name,
          minimum,
          responsible,
          instructing,
          assistant,
          total,
          status,
          matched_proc_id,
          match_confidence,
          match_method,
          procedures ( title_de )
        `)
        .eq('run_id', importRun.id)
        .order('module_name')
        .order('proc_name');

      if (stagingFetchError) throw stagingFetchError;
      if (!stagingData) throw new Error('Keine Staging-Daten gefunden.');

      const normalizedStagingData: PdfStagingProcedure[] = (stagingData as StagingSelect[]).map((row) => ({
        ...row,
        status: row.status ?? 'needs_review',
        match_method: row.match_method ?? 'manual',
        match_confidence: row.match_confidence ?? 0,
        procedures: row.procedures ?? undefined,
      }));

      const moduleSummaries = calculateModuleSummaries(normalizedStagingData);
      const matchedCount = normalizedStagingData.filter((row) => row.status === 'matched').length;
      const needsReviewCount = normalizedStagingData.length - matchedCount;
      const totalProcedures = calculateTotalProcedures(normalizedStagingData);

      const summary = {
        filename: file.name,
        standDate,
        totalProcedures,
        modules: moduleSummaries,
        matched: matchedCount,
        needsReview: needsReviewCount,
      };

      const { error: updateError } = await supabase
        .from('import_runs')
        .update({
          status: 'ready_for_review',
          finished_at: new Date().toISOString(),
          pdf_stand_date: standDate ?? null,
          summary_json: summary,
        })
        .eq('id', importRun.id);

      if (updateError) throw updateError;

      return {
        success: true,
        runId: importRun.id,
        summary,
        stagingData: normalizedStagingData,
      };

    } catch (error) {
      console.error('PDF processing failed:', error);
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
