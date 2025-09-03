-- Complete FMH Procedures Implementation based on official procedure list
-- This migration ensures all procedures match the exact specifications from procedure list.mdc

-- First, update the procedure categories with correct minimum requirements from FMH Modules
UPDATE public.procedure_categories SET 
  minimum_required = CASE 
    WHEN key = 'basis_notfallchirurgie' THEN 85
    WHEN key = 'basis_allgemeinchirurgie' THEN 260
    WHEN key = 'viszeralchirurgie' THEN 165
    WHEN key = 'traumatologie' THEN 165
    WHEN key = 'kombination' THEN 165
    ELSE minimum_required
  END,
  module_type = CASE
    WHEN key IN ('basis_notfallchirurgie', 'basis_allgemeinchirurgie') THEN 'basis'
    WHEN key = 'viszeralchirurgie' THEN 'viszeral'
    WHEN key = 'traumatologie' THEN 'trauma'
    WHEN key = 'kombination' THEN 'kombi'
    ELSE module_type
  END
WHERE key IN ('basis_notfallchirurgie', 'basis_allgemeinchirurgie', 'viszeralchirurgie', 'traumatologie', 'kombination');

-- Clear existing procedures to start fresh
DELETE FROM public.procedures WHERE code LIKE 'BN-%' OR code LIKE 'BA-%' OR code LIKE 'MV-%' OR code LIKE 'MT-%' OR code LIKE 'MK-%';

-- Insert all procedures from procedure list.mdc with correct codes and requirements

-- Basis Notfallchirurgie (BN001-BN007)
INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BN001', 'Chirurgisches Schockraummanagement',
  pc.id, '{"pgy1": 10, "pgy2": 10, "pgy3": 10, "pgy4": 10, "pgy5": 10}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_notfallchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BN002', 'Reposition Luxation/Frakturen, konservative Frakturbehandlung',
  pc.id, '{"pgy1": 15, "pgy2": 15, "pgy3": 15, "pgy4": 15, "pgy5": 15}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_notfallchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BN003', 'Wundversorgungen',
  pc.id, '{"pgy1": 30, "pgy2": 30, "pgy3": 30, "pgy4": 30, "pgy5": 30}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_notfallchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BN004', 'Anlage Fixateur externe',
  pc.id, '{"pgy1": 5, "pgy2": 5, "pgy3": 5, "pgy4": 5, "pgy5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_notfallchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BN005', 'Thoraxdrainagen',
  pc.id, '{"pgy1": 15, "pgy2": 15, "pgy3": 15, "pgy4": 15, "pgy5": 15}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_notfallchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BN006', 'Zervikotomien (Tracheafreilegung)',
  pc.id, '{"pgy1": 5, "pgy2": 5, "pgy3": 5, "pgy4": 5, "pgy5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_notfallchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BN007', 'Cystofixeinlage',
  pc.id, '{"pgy1": 5, "pgy2": 5, "pgy3": 5, "pgy4": 5, "pgy5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_notfallchirurgie';

-- Basis Allgemeinchirurgie (BA001-BA015)
INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA001', 'Kleinchirurgische Eingriffe (Atherom/Lipom, Kocher, Thiersch, LK Excisionen etc.)',
  pc.id, '{"pgy1": 40, "pgy2": 40, "pgy3": 40, "pgy4": 40, "pgy5": 40}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA002', 'Appendektomie',
  pc.id, '{"pgy1": 30, "pgy2": 30, "pgy3": 30, "pgy4": 30, "pgy5": 30}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA003', 'Cholezystektomie',
  pc.id, '{"pgy1": 30, "pgy2": 30, "pgy3": 30, "pgy4": 30, "pgy5": 30}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA004', 'Hernienoperationen (inguinal/umbilical)',
  pc.id, '{"pgy1": 40, "pgy2": 40, "pgy3": 40, "pgy4": 40, "pgy5": 40}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA005', 'Dünndarmeingriffe (Resektion, Adhäsiolyse, Dünndarm-Stomata)',
  pc.id, '{"pgy1": 20, "pgy2": 20, "pgy3": 20, "pgy4": 20, "pgy5": 20}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA006', 'Proktologische Eingriffe (Hämorrhoiden, Fisteln etc.), Rektoskopie und erweiterte Proktologie',
  pc.id, '{"pgy1": 20, "pgy2": 20, "pgy3": 20, "pgy4": 20, "pgy5": 20}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA007', 'Veneneingriffe (Varizenchirurgie, Port/Pacemaker)',
  pc.id, '{"pgy1": 30, "pgy2": 30, "pgy3": 30, "pgy4": 30, "pgy5": 30}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA008', 'Laparoskopie, Laparotomie',
  pc.id, '{"pgy1": 30, "pgy2": 30, "pgy3": 30, "pgy4": 30, "pgy5": 30}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA009', 'Laparoskopie',
  pc.id, '{"pgy1": 15, "pgy2": 15, "pgy3": 15, "pgy4": 15, "pgy5": 15}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA010', 'Laparotomie',
  pc.id, '{"pgy1": 15, "pgy2": 15, "pgy3": 15, "pgy4": 15, "pgy5": 15}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA011', 'Weitere zählbare Eingriffe',
  pc.id, '{"pgy1": 20, "pgy2": 20, "pgy3": 20, "pgy4": 20, "pgy5": 20}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA012', 'Thoraxchirurgische Eingriffe',
  pc.id, '{"pgy1": 0, "pgy2": 0, "pgy3": 0, "pgy4": 0, "pgy5": 0}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA013', 'Urologische Eingriffe',
  pc.id, '{"pgy1": 0, "pgy2": 0, "pgy3": 0, "pgy4": 0, "pgy5": 0}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA014', 'Gefässchirurgische Eingriffe',
  pc.id, '{"pgy1": 0, "pgy2": 0, "pgy3": 0, "pgy4": 0, "pgy5": 0}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA015', 'Kompartimentelle Spaltungen',
  pc.id, '{"pgy1": 0, "pgy2": 0, "pgy3": 0, "pgy4": 0, "pgy5": 0}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie';

-- Viszeralchirurgie (MV003-MV012) - Note: MV001, MV002, MV006, MV009 are missing from the list
INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MV003', 'Dünndarmeingriffe (Resektion, Adhäsiolyse, Dünndarm-Stomata)',
  pc.id, '{"pgy1": 25, "pgy2": 25, "pgy3": 25, "pgy4": 25, "pgy5": 25}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'viszeralchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MV004', 'Kolorektal (Segment- und Teilresektion)',
  pc.id, '{"pgy1": 10, "pgy2": 10, "pgy3": 10, "pgy4": 10, "pgy5": 10}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'viszeralchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MV005', 'Hepatobiliär (exkl. Cholezystektomie), Leberteilresektion, Pankreasteilresektion, Bariatrische Chirurgie',
  pc.id, '{"pgy1": 5, "pgy2": 5, "pgy3": 5, "pgy4": 5, "pgy5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'viszeralchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MV007', 'Proktologische Eingriffe (Hämorrhoiden, Fisteln etc.), Rektoskopie und erweiterte Proktologie',
  pc.id, '{"pgy1": 35, "pgy2": 35, "pgy3": 35, "pgy4": 35, "pgy5": 35}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'viszeralchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MV008', 'Splenektomie',
  pc.id, '{"pgy1": 3, "pgy2": 3, "pgy3": 3, "pgy4": 3, "pgy5": 3}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'viszeralchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MV010', 'Laparoskopie, Laparotomie',
  pc.id, '{"pgy1": 40, "pgy2": 40, "pgy3": 40, "pgy4": 40, "pgy5": 40}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'viszeralchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MV011', 'Laparoskopie',
  pc.id, '{"pgy1": 29, "pgy2": 29, "pgy3": 29, "pgy4": 29, "pgy5": 29}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'viszeralchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MV012', 'Laparotomie',
  pc.id, '{"pgy1": 23, "pgy2": 23, "pgy3": 23, "pgy4": 23, "pgy5": 23}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'viszeralchirurgie';

-- Traumatologie (MT001-MT011) - Note: MT002 is missing from the list
INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MT001', 'Metallentfernungen, Spickungen',
  pc.id, '{"pgy1": 30, "pgy2": 30, "pgy3": 30, "pgy4": 30, "pgy5": 30}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MT003', 'Eingriffe Sehnen/Ligamente',
  pc.id, '{"pgy1": 15, "pgy2": 15, "pgy3": 15, "pgy4": 15, "pgy5": 15}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MT004', 'Arthroskopie',
  pc.id, '{"pgy1": 10, "pgy2": 10, "pgy3": 10, "pgy4": 10, "pgy5": 10}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MT005', 'Osteosynthese Schaftfrakturen',
  pc.id, '{"pgy1": 15, "pgy2": 15, "pgy3": 15, "pgy4": 15, "pgy5": 15}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MT006', 'Osteosynthese gelenksnaher (metaphysärer) Frakturen',
  pc.id, '{"pgy1": 40, "pgy2": 40, "pgy3": 40, "pgy4": 40, "pgy5": 40}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MT007', 'Osteosynthese komplexer Frakturen (intraartikulären Frakturen an den grossen Röhrenknochen und am Mittel- und Rückfuss sowie Becken-/Azetabulumfrakturen)',
  pc.id, '{"pgy1": 5, "pgy2": 5, "pgy3": 5, "pgy4": 5, "pgy5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MT008', 'Handchirurgie (exklusiv Wundversorgung)',
  pc.id, '{"pgy1": 15, "pgy2": 15, "pgy3": 15, "pgy4": 15, "pgy5": 15}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MT009', 'Amputationen',
  pc.id, '{"pgy1": 10, "pgy2": 10, "pgy3": 10, "pgy4": 10, "pgy5": 10}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MT010', 'Kleine Amputationen',
  pc.id, '{"pgy1": 5, "pgy2": 5, "pgy3": 5, "pgy4": 5, "pgy5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MT011', 'Grosse Amputationen',
  pc.id, '{"pgy1": 5, "pgy2": 5, "pgy3": 5, "pgy4": 5, "pgy5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie';

-- Kombination (MK001-MK019)
INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MK001', 'Abdominalhernien (Narbenhernien, videoskopischer Repair)',
  pc.id, '{"pgy1": 15, "pgy2": 15, "pgy3": 15, "pgy4": 15, "pgy5": 15}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MK002', 'Mageneingriffe (Ulkusnaht, Gastroenterostomie, chir. Gastrostomie, Resektion)',
  pc.id, '{"pgy1": 5, "pgy2": 5, "pgy3": 5, "pgy4": 5, "pgy5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MK003', 'Dünndarmeingriffe (Resektion, Adhäsiolyse, Dünndarm-Stomata)',
  pc.id, '{"pgy1": 15, "pgy2": 15, "pgy3": 15, "pgy4": 15, "pgy5": 15}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MK004', 'Kolorektal (Segment- und Teilresektion)',
  pc.id, '{"pgy1": 5, "pgy2": 5, "pgy3": 5, "pgy4": 5, "pgy5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MK005', 'Endokrine Chirurgie (Thyreoidektomie, Parathyreoidektomie, Adrenalektomie)',
  pc.id, '{"pgy1": 5, "pgy2": 5, "pgy3": 5, "pgy4": 5, "pgy5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MK006', 'Proktologische Eingriffe (Hämorrhoiden, Fisteln etc.), Rektoskopie und erweiterte Proktologie',
  pc.id, '{"pgy1": 20, "pgy2": 20, "pgy3": 20, "pgy4": 20, "pgy5": 20}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MK007', 'Dickdarmstoma',
  pc.id, '{"pgy1": 5, "pgy2": 5, "pgy3": 5, "pgy4": 5, "pgy5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MK008', 'Metallentfernungen, Spickungen',
  pc.id, '{"pgy1": 20, "pgy2": 20, "pgy3": 20, "pgy4": 20, "pgy5": 20}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MK009', 'Reposition Luxation/Frakturen, konservative Frakturbehandlung',
  pc.id, '{"pgy1": 15, "pgy2": 15, "pgy3": 15, "pgy4": 15, "pgy5": 15}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MK010', 'Eingriffe Sehnen/Ligamente',
  pc.id, '{"pgy1": 5, "pgy2": 5, "pgy3": 5, "pgy4": 5, "pgy5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MK011', 'Osteosynthese Schaftfrakturen',
  pc.id, '{"pgy1": 10, "pgy2": 10, "pgy3": 10, "pgy4": 10, "pgy5": 10}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MK012', 'Osteosynthese gelenksnaher (metaphysärer) Frakturen',
  pc.id, '{"pgy1": 20, "pgy2": 20, "pgy3": 20, "pgy4": 20, "pgy5": 20}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MK013', 'Handchirurgie (exklusiv Wundversorgung)',
  pc.id, '{"pgy1": 10, "pgy2": 10, "pgy3": 10, "pgy4": 10, "pgy5": 10}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MK014', 'Laparoskopie, Laparotomie',
  pc.id, '{"pgy1": 11, "pgy2": 11, "pgy3": 11, "pgy4": 11, "pgy5": 11}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MK015', 'Laparoskopie',
  pc.id, '{"pgy1": 29, "pgy2": 29, "pgy3": 29, "pgy4": 29, "pgy5": 29}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MK016', 'Laparotomie',
  pc.id, '{"pgy1": 23, "pgy2": 23, "pgy3": 23, "pgy4": 23, "pgy5": 23}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MK017', 'Amputationen',
  pc.id, '{"pgy1": 4, "pgy2": 4, "pgy3": 4, "pgy4": 4, "pgy5": 4}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MK018', 'Kleine Amputationen',
  pc.id, '{"pgy1": 2, "pgy2": 2, "pgy3": 2, "pgy4": 2, "pgy5": 2}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MK019', 'Grosse Amputationen',
  pc.id, '{"pgy1": 2, "pgy2": 2, "pgy3": 2, "pgy4": 2, "pgy5": 2}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination';

-- Add missing procedures that are referenced in the PDF data but not in the procedure list
-- These are additional procedures that should be included based on the FMHPDFDATA

-- Add missing Viszeralchirurgie procedures
INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MV001', 'Abdominalhernien (Narbenhernien, videoskopischer Repair)',
  pc.id, '{"pgy1": 25, "pgy2": 25, "pgy3": 25, "pgy4": 25, "pgy5": 25}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'viszeralchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MV002', 'Mageneingriffe (Ulkusnaht, Gastroenterostomie, chir. Gastrostomie, Resektion)',
  pc.id, '{"pgy1": 7, "pgy2": 7, "pgy3": 7, "pgy4": 7, "pgy5": 7}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'viszeralchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MV006', 'Endokrine Chirurgie (Thyreoidektomie, Parathyreoidektomie, Adrenalektomie)',
  pc.id, '{"pgy1": 10, "pgy2": 10, "pgy3": 10, "pgy4": 10, "pgy5": 10}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'viszeralchirurgie';

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MV009', 'Dickdarmstoma',
  pc.id, '{"pgy1": 5, "pgy2": 5, "pgy3": 5, "pgy4": 5, "pgy5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'viszeralchirurgie';

-- Add missing Traumatologie procedure
INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'MT002', 'Reposition Luxation/Frakturen, konservative Frakturbehandlung',
  pc.id, '{"pgy1": 25, "pgy2": 25, "pgy3": 25, "pgy4": 25, "pgy5": 25}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie';

-- Create a function to get procedure progress by module and user
CREATE OR REPLACE FUNCTION get_module_progress(user_id_param UUID, module_key TEXT)
RETURNS TABLE(
  module_name TEXT,
  total_weighted_score NUMERIC,
  total_minimum NUMERIC,
  progress_percentage NUMERIC,
  responsible_count INTEGER,
  instructing_count INTEGER,
  assistant_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH module_procedures AS (
    SELECT p.id, p.code, p.title_de, p.min_required_by_pgy
    FROM public.procedures p
    JOIN public.procedure_categories pc ON p.category_id = pc.id
    WHERE pc.key = module_key AND p.active = true
  ),
  user_logs AS (
    SELECT 
      pl.procedure_id,
      pl.role_in_surgery,
      COUNT(*) as count
    FROM public.procedure_logs pl
    WHERE pl.user_id = user_id_param
    GROUP BY pl.procedure_id, pl.role_in_surgery
  ),
  procedure_scores AS (
    SELECT 
      mp.id,
      mp.code,
      mp.title_de,
      mp.min_required_by_pgy,
      COALESCE(ul_responsible.count, 0) as responsible_count,
      COALESCE(ul_instructing.count, 0) as instructing_count,
      COALESCE(ul_assistant.count, 0) as assistant_count,
      -- Calculate weighted score: responsible=1.0, instructing=0.5, assistant=0.25
      (COALESCE(ul_responsible.count, 0) * 1.0 + 
       COALESCE(ul_instructing.count, 0) * 0.5 + 
       COALESCE(ul_assistant.count, 0) * 0.25) as weighted_score,
      -- Get minimum required for PGY5 (highest level)
      COALESCE((mp.min_required_by_pgy->>'pgy5')::NUMERIC, 0) as min_required
    FROM module_procedures mp
    LEFT JOIN user_logs ul_responsible ON mp.id = ul_responsible.procedure_id AND ul_responsible.role_in_surgery = 'primary'
    LEFT JOIN user_logs ul_instructing ON mp.id = ul_instructing.procedure_id AND ul_instructing.role_in_surgery = 'instructing'
    LEFT JOIN user_logs ul_assistant ON mp.id = ul_assistant.procedure_id AND ul_assistant.role_in_surgery = 'assist'
  )
  SELECT 
    pc.title_de as module_name,
    COALESCE(SUM(ps.weighted_score), 0) as total_weighted_score,
    COALESCE(SUM(ps.min_required), 0) as total_minimum,
    CASE 
      WHEN COALESCE(SUM(ps.min_required), 0) > 0 
      THEN (COALESCE(SUM(ps.weighted_score), 0) / COALESCE(SUM(ps.min_required), 0)) * 100
      ELSE 0 
    END as progress_percentage,
    COALESCE(SUM(ps.responsible_count), 0)::INTEGER as responsible_count,
    COALESCE(SUM(ps.instructing_count), 0)::INTEGER as instructing_count,
    COALESCE(SUM(ps.assistant_count), 0)::INTEGER as assistant_count
  FROM public.procedure_categories pc
  LEFT JOIN procedure_scores ps ON pc.id = ps.id
  WHERE pc.key = module_key
  GROUP BY pc.id, pc.title_de;
END;
$$ LANGUAGE plpgsql;
