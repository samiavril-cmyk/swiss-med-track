-- Add missing procedures to Viszeralchirurgie module
-- First get the category ID for viszeralchirurgie
INSERT INTO public.procedures (code, title_de, category_id, active, min_required_by_pgy)
SELECT 
  'VS006',
  'Mageneingriffe (Ulkusnaht, Gastroenterostomie, chir. Gastrostomie, Resektion)',
  pc.id,
  true,
  '{"PGY1": 5, "PGY2": 10, "PGY3": 15, "PGY4": 20, "PGY5": 25}'::jsonb
FROM public.procedure_categories pc 
WHERE pc.key = 'viszeralchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, active, min_required_by_pgy)
SELECT 
  'VS007',
  'Dünndarmeingriffe (Resektion, Adhäsiolyse, Dünndarm-Stomata)',
  pc.id,
  true,
  '{"PGY1": 5, "PGY2": 10, "PGY3": 15, "PGY4": 20, "PGY5": 25}'::jsonb
FROM public.procedure_categories pc 
WHERE pc.key = 'viszeralchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, active, min_required_by_pgy)
SELECT 
  'VS008',
  'Kolorektal (Segment- und Teilresektion)',
  pc.id,
  true,
  '{"PGY1": 3, "PGY2": 5, "PGY3": 7, "PGY4": 8, "PGY5": 10}'::jsonb
FROM public.procedure_categories pc 
WHERE pc.key = 'viszeralchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, active, min_required_by_pgy)
SELECT 
  'VS009',
  'Hepatobiliär (exkl. Cholezystektomie), Leberteilresektion, Pankreasteilresektion, Bariatrische Chirurgie',
  pc.id,
  true,
  '{"PGY1": 0, "PGY2": 2, "PGY3": 5, "PGY4": 8, "PGY5": 10}'::jsonb
FROM public.procedure_categories pc 
WHERE pc.key = 'viszeralchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, active, min_required_by_pgy)
SELECT 
  'VS010',
  'Proktologische Eingriffe (Hämorrhoiden, Fisteln etc.), Rektoskopie und erweiterte Proktologie',
  pc.id,
  true,
  '{"PGY1": 3, "PGY2": 5, "PGY3": 8, "PGY4": 10, "PGY5": 12}'::jsonb
FROM public.procedure_categories pc 
WHERE pc.key = 'viszeralchirurgie';