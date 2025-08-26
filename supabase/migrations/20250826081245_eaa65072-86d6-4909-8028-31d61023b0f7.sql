-- Update procedure_categories with correct minimum_required values
UPDATE public.procedure_categories SET minimum_required = 260 WHERE key = 'basis_allgemein';
UPDATE public.procedure_categories SET minimum_required = 165 WHERE key = 'viszeralchirurgie';
UPDATE public.procedure_categories SET minimum_required = 165 WHERE key = 'traumatologie';
UPDATE public.procedure_categories SET minimum_required = 165 WHERE key = 'kombination';