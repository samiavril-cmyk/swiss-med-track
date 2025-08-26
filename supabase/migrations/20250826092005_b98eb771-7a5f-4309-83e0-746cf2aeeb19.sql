-- First clean up the procedure logs that reference the TEMP procedure
DELETE FROM public.procedure_logs WHERE procedure_id IN (
  SELECT id FROM public.procedures WHERE code LIKE 'TEMP_%'
);

-- Now remove the TEMP procedure
DELETE FROM public.procedures WHERE code LIKE 'TEMP_%';

-- Remove duplicate/legacy categories, keeping only the 5 correct FMH modules
DELETE FROM public.procedure_categories 
WHERE key IN ('basis_allgemein', 'basis_notfall', 'general', 'trauma', 'laparoscopy', 'vascular');