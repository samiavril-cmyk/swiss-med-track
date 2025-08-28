import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';
import PDFParser from "https://esm.sh/pdf2json@3.0.4";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interfaces based on masterplan
interface ModuleData {
  name: string;
  minimum: number;
  responsible: number;
  instructing: number;
  assistant: number;
  total: number;
}

interface ProcedureData {
  name: string;
  module: string;
  minimum: number;
  responsible: number;
  instructing: number;
  assistant: number;
  total: number;
  originalLine?: string;
}

interface ParsedPDFData {
  filename: string;
  standDate?: string;
  modules: ModuleData[];
  procedures: ProcedureData[];
  rawText?: string;
}

interface MatchResult {
  procedureId: string | null;
  confidence: number;
  method: 'exact' | 'alias' | 'fuzzy' | 'manual';
  candidateName?: string;
}

// PDF parsing functions
function cleanPDFText(text: string): string[] {
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    // Remove headers/footers
    .filter(line => !line.match(/^(Stand:|Seite \d+|\d+ \| \d+|SIWF \| ISFM|Erfasste Prozeduren)/i));
  
  // Handle line breaks and hyphenation
  const mergedLines: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];
    
    // If line ends with hyphen and next line doesn't start with module header, merge
    if (line.endsWith('-') && nextLine && !isModuleHeader(nextLine)) {
      // Remove hyphen and merge with next line
      mergedLines.push(line.slice(0, -1) + ' ' + nextLine);
      i++; // Skip next line
    } else {
      mergedLines.push(line);
    }
  }
  
  return mergedLines;
}

function isModuleHeader(line: string): boolean {
  const modulePattern = /^(Basis .*|Modul .*) Minimum Verantwortlich Instruierend Assistent Total$/;
  return modulePattern.test(line);
}

function parseModuleTotals(line: string): ModuleData | null {
  const totalsPattern = /^(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)$/;
  const match = line.match(totalsPattern);
  
  if (!match) return null;
  
  return {
    name: '', // Will be set by caller
    minimum: parseInt(match[1]),
    responsible: parseInt(match[2]),
    instructing: parseInt(match[3]),
    assistant: parseInt(match[4]),
    total: parseInt(match[5])
  };
}

function parseProcedureLine(line: string, currentModule: string): ProcedureData | null {
  // Extract numbers from end of line using simple regex
  const numberRegex = /(\s+\d+)+$/;
  const match = line.match(numberRegex);
  
  if (!match) return null;
  
  const numberText = match[0];
  const name = line.slice(0, -numberText.length).trim();
  const numbers = numberText.trim().split(/\s+/).map(n => parseInt(n));
  
  // Map numbers based on count (as per masterplan)
  let minimum = 0, responsible = 0, instructing = 0, assistant = 0, total = 0;
  
  if (numbers.length === 5) {
    [minimum, responsible, instructing, assistant, total] = numbers;
  } else if (numbers.length === 4) {
    [minimum, responsible, instructing, assistant] = numbers;
    total = responsible + instructing + assistant;
  } else if (numbers.length === 3) {
    [minimum, responsible, instructing] = numbers;
    assistant = 0;
    total = responsible + instructing;
  } else if (numbers.length === 2) {
    [minimum, responsible] = numbers;
    instructing = 0;
    assistant = 0;
    total = responsible;
  } else if (numbers.length === 1) {
    minimum = numbers[0];
    // Rest stay 0
  }
  
  return {
    name,
    module: currentModule,
    minimum,
    responsible,
    instructing,
    assistant,
    total,
    originalLine: line
  };
}

function extractStandDate(text: string): string | undefined {
  const standPattern = /Stand:\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/i;
  const match = text.match(standPattern);
  if (match) {
    return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
  }
  return undefined;
}

function parsePDFContent(text: string, filename: string): ParsedPDFData {
  console.log('📄 Starting PDF parsing...');
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const modules: ModuleData[] = [];
  const procedures: ProcedureData[] = [];
  let currentModule = '';
  
  const standDate = extractStandDate(text);
  console.log(`📅 Extracted stand date: ${standDate || 'None found'}`);
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // Skip headers and metadata
    if (line.includes('Stand:') || line.includes('SIWF') || line.includes('Seite') || 
        line.includes('Erfasste Prozeduren') || line.includes('Sami Zacharia')) {
      i++;
      continue;
    }
    
    // Check for module header (simplified pattern for SIWF structure)
    if (/^(Basis|Modul)\s+(.+)$/.test(line)) {
      currentModule = line;
      console.log(`📦 Found module: ${currentModule}`);
      
      // Skip column headers (next 5 lines: Minimum, Verantwortlich, Instruierend, Assistent, Total)
      i += 6;
      
      // Parse module totals (next 5 lines should be numbers)
      if (i + 4 < lines.length) {
        try {
          const minimum = parseInt(lines[i]);
          const responsible = parseInt(lines[i + 1]);
          const instructing = parseInt(lines[i + 2]);
          const assistant = parseInt(lines[i + 3]);
          const total = parseInt(lines[i + 4]);
          
          modules.push({
            name: currentModule,
            minimum,
            responsible,
            instructing,
            assistant,
            total
          });
          
          console.log(`✅ Module totals: ${minimum}/${responsible}/${instructing}/${assistant}/${total}`);
          i += 5;
        } catch (error) {
          console.error(`Failed to parse module totals at line ${i}`);
          i++;
        }
      }
      continue;
    }
    
    // Parse procedure lines (text followed by numbers on separate lines)
    if (currentModule && !/^\d+$/.test(line) && 
        !/(Minimum|Verantwortlich|Instruierend|Assistent|Total)/.test(line)) {
      
      const procedureName = line;
      const numbers: number[] = [];
      
      // Collect numbers from following lines
      let j = i + 1;
      while (j < lines.length && j < i + 10) {
        const nextLine = lines[j].trim();
        if (/^\d+$/.test(nextLine)) {
          numbers.push(parseInt(nextLine));
          j++;
        } else if (/^(Basis|Modul)\s+(.+)$/.test(nextLine)) {
          break; // Hit next module
        } else if (nextLine && !/^\d+$/.test(nextLine) && 
                  !/(Minimum|Verantwortlich|Instruierend|Assistent|Total)/.test(nextLine)) {
          break; // Hit next procedure
        } else {
          j++;
        }
      }
      
      if (numbers.length > 0) {
        const minimum = numbers[0] || 0;
        const responsible = numbers[1] || 0;
        const instructing = numbers[2] || 0;
        const assistant = numbers[3] || 0;
        const total = numbers[4] || (responsible + instructing + assistant);
        
        procedures.push({
          name: procedureName,
          module: currentModule,
          minimum,
          responsible,
          instructing,
          assistant,
          total
        });
        
        console.log(`📋 Parsed procedure: ${procedureName} (${responsible}/${instructing}/${assistant})`);
      }
      
      i = Math.max(i + 1, j);
    } else {
      i++;
    }
  }
  
  console.log(`🎯 Parsing complete: ${modules.length} modules, ${procedures.length} procedures`);
  
  return {
    filename,
    standDate,
    modules,
    procedures,
    rawText: text.slice(0, 1000) // First 1000 chars for debugging
  };
}

// Matching functions with fuzzy logic
async function findProcedureMatch(procedureName: string): Promise<MatchResult> {
  console.log(`🔍 Finding match for: "${procedureName}"`);
  
  // 1. Exact match
  const { data: exactMatch } = await supabase
    .from('procedures')
    .select('id, title_de')
    .eq('title_de', procedureName)
    .eq('active', true)
    .single();
  
  if (exactMatch) {
    console.log(`✅ Exact match found: ${exactMatch.title_de}`);
    return {
      procedureId: exactMatch.id,
      confidence: 1.0,
      method: 'exact',
      candidateName: exactMatch.title_de
    };
  }
  
  // 2. Alias match
  const { data: aliasMatch } = await supabase
    .from('procedure_aliases')
    .select('procedure_id, procedures!inner(id, title_de, active)')
    .eq('alias_name', procedureName)
    .eq('procedures.active', true)
    .single();
  
  if (aliasMatch) {
    console.log(`🔗 Alias match found: ${procedureName} -> ${aliasMatch.procedures.title_de}`);
    return {
      procedureId: aliasMatch.procedure_id,
      confidence: 0.95,
      method: 'alias',
      candidateName: aliasMatch.procedures.title_de
    };
  }
  
  // 3. Fuzzy match using simple string similarity
  const { data: allProcedures } = await supabase
    .from('procedures')
    .select('id, title_de')
    .eq('active', true);
  
  if (allProcedures) {
    let bestMatch: { procedure: any; score: number } | null = null;
    
    for (const proc of allProcedures) {
      const score = calculateSimilarity(procedureName.toLowerCase(), proc.title_de.toLowerCase());
      if (score > 0.8 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { procedure: proc, score };
      }
    }
    
    if (bestMatch) {
      console.log(`🎯 Fuzzy match found: ${procedureName} -> ${bestMatch.procedure.title_de} (${bestMatch.score.toFixed(2)})`);
      return {
        procedureId: bestMatch.procedure.id,
        confidence: bestMatch.score,
        method: 'fuzzy',
        candidateName: bestMatch.procedure.title_de
      };
    }
  }
  
  console.log(`❌ No match found for: "${procedureName}"`);
  return {
    procedureId: null,
    confidence: 0,
    method: 'manual'
  };
}

function calculateSimilarity(str1: string, str2: string): number {
  // Simple Levenshtein distance-based similarity
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return 1 - (distance / maxLen);
}

// Import staging functions
async function createImportRun(userId: string, filename: string, standDate?: string): Promise<string> {
  const { data, error } = await supabase
    .from('import_runs')
    .insert({
      user_id: userId,
      pdf_filename: filename,
      pdf_stand_date: standDate,
      source: 'siwf_pdf'
    })
    .select('id')
    .single();
  
  if (error) throw error;
  return data.id;
}

async function stageProcedures(runId: string, procedures: ProcedureData[]): Promise<void> {
  console.log(`📊 Staging ${procedures.length} procedures for preview...`);
  
  const stagingData = [];
  
  for (const proc of procedures) {
    const match = await findProcedureMatch(proc.name);
    
    stagingData.push({
      run_id: runId,
      module_name: proc.module,
      proc_name: proc.name,
      minimum: proc.minimum,
      responsible: proc.responsible,
      instructing: proc.instructing,
      assistant: proc.assistant,
      total: proc.total,
      matched_proc_id: match.procedureId,
      match_confidence: match.confidence,
      match_method: match.method,
      status: match.procedureId ? 'matched' : 'needs_review'
    });
  }
  
  const { error } = await supabase
    .from('import_procedure_staging')
    .insert(stagingData);
  
  if (error) throw error;
  console.log(`✅ Staged ${stagingData.length} procedures`);
}

// Extract text from PDF buffer
async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    console.log('🔄 Extracting text from PDF...');
    const uint8Array = new Uint8Array(buffer);
    
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();
      
      pdfParser.on("pdfParser_dataError", (errData: any) => {
        console.error('PDF parsing error:', errData.parserError);
        reject(new Error(`PDF parsing failed: ${errData.parserError}`));
      });
      
      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        try {
          console.log('✅ PDF data extracted successfully');
          
          // Extract text from all pages
          let fullText = '';
          if (pdfData.Pages) {
            for (const page of pdfData.Pages) {
              if (page.Texts) {
                for (const text of page.Texts) {
                  if (text.R) {
                    for (const run of text.R) {
                      if (run.T) {
                        fullText += decodeURIComponent(run.T) + ' ';
                      }
                    }
                  }
                  fullText += '\n';
                }
              }
            }
          }
          
          console.log(`📄 Extracted ${fullText.length} characters from PDF`);
          resolve(fullText);
        } catch (error) {
          console.error('Error processing PDF data:', error);
          reject(new Error(`PDF data processing failed: ${error.message}`));
        }
      });
      
      pdfParser.parseBuffer(uint8Array);
    });
  } catch (error) {
    console.error('PDF extraction failed:', error);
    throw new Error(`PDF text extraction failed: ${error.message}`);
  }
}

// Real PDF parser implementation
async function parsePDFBuffer(buffer: ArrayBuffer, filename: string): Promise<ParsedPDFData> {
  console.log(`📁 Processing PDF: ${filename} (${buffer.byteLength} bytes)`);
  
  try {
    // Extract text from PDF
    const text = await extractTextFromPDF(buffer);
    console.log('📄 PDF text extracted, starting parsing...');
    
    return parsePDFContent(text, filename);
  } catch (error) {
    console.error('❌ PDF parsing failed:', error);
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}

// Main handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`🚀 PDF Parser started - Method: ${req.method}`);
    
    // Authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('❌ No authorization header');
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('❌ Authentication failed:', authError?.message);
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ User authenticated: ${user.id}`);

    // Handle POST request (file upload)
    if (req.method === 'POST') {
      const formData = await req.formData();
      const file = formData.get('pdf') as File;
      
      if (!file) {
        console.log('❌ No PDF file provided');
        return new Response(JSON.stringify({ error: 'No PDF file provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log(`📁 File received: ${file.name} (${file.size} bytes)`);

      // Parse PDF
      const buffer = await file.arrayBuffer();
      const parsedData = await parsePDFBuffer(buffer, file.name);
      
      // Create import run
      const runId = await createImportRun(user.id, file.name, parsedData.standDate);
      console.log(`📝 Created import run: ${runId}`);
      
      // Stage procedures for preview
      await stageProcedures(runId, parsedData.procedures);
      
      // Get staging summary for preview
      const { data: stagingSummary } = await supabase
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
          matched_proc_id,
          match_confidence,
          match_method,
          status,
          procedures!matched_proc_id(title_de)
        `)
        .eq('run_id', runId)
        .order('module_name, proc_name');

      console.log(`✅ Import staging complete! Run ID: ${runId}`);

      return new Response(JSON.stringify({
        success: true,
        runId,
        summary: {
          filename: file.name,
          standDate: parsedData.standDate,
          totalProcedures: parsedData.procedures.length,
          modules: parsedData.modules,
          matched: stagingSummary?.filter(s => s.status === 'matched').length || 0,
          needsReview: stagingSummary?.filter(s => s.status === 'needs_review').length || 0
        },
        stagingData: stagingSummary,
        parsedModules: parsedData.modules
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in PDF parser:', error);
    return new Response(JSON.stringify({ 
      error: 'PDF parsing failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});