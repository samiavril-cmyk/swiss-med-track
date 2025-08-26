-- Clean up duplicate categories and legacy procedures
-- First remove the TEMP procedure
DELETE FROM public.procedures WHERE code LIKE 'TEMP_%';

-- Remove duplicate/legacy categories, keeping only the 5 correct FMH modules
DELETE FROM public.procedure_categories 
WHERE key IN ('basis_allgemein', 'basis_notfall', 'general', 'trauma', 'laparoscopy', 'vascular');