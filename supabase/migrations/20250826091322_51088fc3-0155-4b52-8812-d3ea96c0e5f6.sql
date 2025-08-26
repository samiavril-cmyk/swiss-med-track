-- Complete restoration of FMH procedures to exact specifications
-- Update categories with correct minimum requirements
INSERT INTO public.procedure_categories (key, title_de, minimum_required, sort_index) VALUES
('basis_notfallchirurgie', 'Basis Notfallchirurgie', 90, 1),
('basis_allgemeinchirurgie', 'Basis Allgemeinchirurgie', 280, 2),
('viszeralchirurgie', 'Modul Viszeralchirurgie', 217, 3),
('traumatologie', 'Modul Traumatologie des Bewegungsapparates', 170, 4),
('kombination', 'Modul Kombination', 131, 5)
ON CONFLICT (key) DO UPDATE SET
title_de = EXCLUDED.title_de,
minimum_required = EXCLUDED.minimum_required,
sort_index = EXCLUDED.sort_index;

-- Merge duplicate procedure logs to consolidated procedures first
-- Move logs from old procedures to the main ones we'll keep
WITH log_updates AS (
  SELECT DISTINCT procedure_id FROM procedure_logs 
  WHERE procedure_id IN (
    SELECT id FROM procedures 
    WHERE code IN ('CHOL-001', 'APP-001', 'LAP-001', 'HER-001')
  )
)
UPDATE procedure_logs 
SET procedure_id = CASE 
  WHEN procedure_id = (SELECT id FROM procedures WHERE code = 'CHOL-001') 
    THEN (SELECT id FROM procedures WHERE code = 'BA002')
  WHEN procedure_id = (SELECT id FROM procedures WHERE code = 'APP-001') 
    THEN (SELECT id FROM procedures WHERE code = 'BA001')
  WHEN procedure_id = (SELECT id FROM procedures WHERE code = 'LAP-001') 
    THEN (SELECT id FROM procedures WHERE code = 'BA001')
  WHEN procedure_id = (SELECT id FROM procedures WHERE code = 'HER-001') 
    THEN (SELECT id FROM procedures WHERE code = 'BA003')
  ELSE procedure_id
END
WHERE procedure_id IN (
  SELECT id FROM procedures 
  WHERE code IN ('CHOL-001', 'APP-001', 'LAP-001', 'HER-001')
);

-- Delete duplicate/extra procedures that aren't referenced by logs
DELETE FROM public.procedures 
WHERE code IN ('CHOL-001', 'APP-001', 'LAP-001', 'HER-001', 'TR002', 'TR003', 'TR004', 'VS003', 'VS006', 'VS007', 'VS008', 'VS009', 'VS010')
AND id NOT IN (SELECT DISTINCT procedure_id FROM procedure_logs WHERE procedure_id IS NOT NULL);

-- Update existing procedures to match exact FMH specifications
WITH category_mapping AS (
  SELECT id, key FROM public.procedure_categories 
  WHERE key IN ('basis_notfallchirurgie', 'basis_allgemeinchirurgie', 'viszeralchirurgie', 'traumatologie', 'kombination')
)
UPDATE public.procedures 
SET 
  code = mapping.new_code,
  title_de = mapping.new_title,
  category_id = cat.id,
  min_required_by_pgy = jsonb_build_object('pgy1', mapping.minimum, 'pgy2', mapping.minimum, 'pgy3', mapping.minimum, 'pgy4', mapping.minimum, 'pgy5', mapping.minimum),
  active = true
FROM (VALUES
  ('2bf1809e-38e9-4a96-8d3b-1f2c026cf451', 'BN001', 'Chirurgisches Schockraummanagement', 'basis_notfallchirurgie', 10),
  ('2b925c67-20d3-4de3-acba-d49e909d61e5', 'BN002', 'Reposition Luxation/Frakturen, konservative Frakturbehandlung', 'basis_notfallchirurgie', 15),
  ('5395bc3d-e7c9-4bf3-a91c-8dbaed404735', 'BN003', 'Wundversorgungen', 'basis_notfallchirurgie', 30),
  ('ea9885b9-01f7-4e3c-add5-e8f947945c6e', 'BN006', 'Zervikotomien (Tracheafreilegung)', 'basis_notfallchirurgie', 5),
  ('d9ba7f86-224e-4379-bfe2-10cef56ba3f6', 'BA001', 'Kleinchirurgische Eingriffe (Atherom/Lipom, Kocher, Thiersch, LK Excisionen etc.)', 'basis_allgemeinchirurgie', 40),
  ('8be19224-4db7-403a-b443-354934326daa', 'BA002', 'Appendektomie', 'basis_allgemeinchirurgie', 30),
  ('751ae4d2-aac0-4f75-abf6-34d3d3789471', 'BA003', 'Cholezystektomie', 'basis_allgemeinchirurgie', 30),
  ('781c6f96-c156-48ba-8089-3f178d446215', 'BA004', 'Hernienoperationen (inguinal/umbilical)', 'basis_allgemeinchirurgie', 40),
  ('491e2148-51a6-425b-8003-e2cc968dcb5d', 'BA005', 'Dünndarmeingriffe (Resektion, Adhäsiolyse, Dünndarm-Stomata)', 'basis_allgemeinchirurgie', 20),
  ('f7953b6f-5a70-4684-baeb-15a2071adaf3', 'BA006', 'Proktologische Eingriffe (Hämorrhoiden, Fisteln etc.), Rektoskopie und erweiterte Proktologie', 'basis_allgemeinchirurgie', 20),
  ('9916e987-5f82-4c8c-a27d-a25ce37f4a6c', 'BA007', 'Veneneingriffe (Varizenchirurgie, Port/Pacemaker)', 'basis_allgemeinchirurgie', 30),
  ('e53b079f-7421-4c04-83e7-a84e70512afd', 'BA008', 'Laparoskopie, Laparotomie', 'basis_allgemeinchirurgie', 30),
  ('863c9b5f-8256-4a8b-9871-62e9f538f628', 'MV001', 'Abdominalhernien (Narbenhernien, videoskopischer Repair)', 'viszeralchirurgie', 25),
  ('fa696caa-9e4a-4213-9634-c83f2408adf4', 'MV002', 'Mageneingriffe (Ulkusnaht, Gastroenterostomie, chir. Gastrostomie, Resektion)', 'viszeralchirurgie', 7),
  ('a6266973-70a6-4416-b0b7-ab8e9756ffe9', 'MV006', 'Endokrine Chirurgie (Thyreoidektomie, Parathyreoidektomie, Adrenalektomie)', 'viszeralchirurgie', 10),
  ('20cb1aa1-b142-4dfe-8842-91f7a7678db0', 'MV009', 'Dickdarmstoma', 'viszeralchirurgie', 5),
  ('3d253b62-f584-4dd5-98ba-18bf1352ac6e', 'MT002', 'Reposition Luxation/Frakturen, konservative Frakturbehandlung', 'traumatologie', 25)
) AS mapping(proc_id, new_code, new_title, category_key, minimum)
JOIN category_mapping cat ON cat.key = mapping.category_key
WHERE procedures.id::text = mapping.proc_id;

-- Insert all missing procedures from the complete FMH list
WITH category_mapping AS (
  SELECT id, key FROM public.procedure_categories 
  WHERE key IN ('basis_notfallchirurgie', 'basis_allgemeinchirurgie', 'viszeralchirurgie', 'traumatologie', 'kombination')
)
INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active) 
SELECT 
  proc.code,
  proc.title_de,
  cat.id,
  jsonb_build_object('pgy1', proc.minimum, 'pgy2', proc.minimum, 'pgy3', proc.minimum, 'pgy4', proc.minimum, 'pgy5', proc.minimum),
  true
FROM (VALUES
  ('BN004', 'Anlage Fixateur externe', 'basis_notfallchirurgie', 5),
  ('BN005', 'Thoraxdrainagen', 'basis_notfallchirurgie', 15),
  ('BN007', 'Cystofixeinlage', 'basis_notfallchirurgie', 5),
  ('BA009', 'Laparoskopie', 'basis_allgemeinchirurgie', 15),
  ('BA010', 'Laparotomie', 'basis_allgemeinchirurgie', 15),
  ('BA011', 'Weitere zählbare Eingriffe', 'basis_allgemeinchirurgie', 20),
  ('BA012', 'Thoraxchirurgische Eingriffe', 'basis_allgemeinchirurgie', 0),
  ('BA013', 'Urologische Eingriffe', 'basis_allgemeinchirurgie', 0),
  ('BA014', 'Gefässchirurgische Eingriffe', 'basis_allgemeinchirurgie', 0),
  ('BA015', 'Kompartimentelle Spaltungen', 'basis_allgemeinchirurgie', 0),
  ('MV003', 'Dünndarmeingriffe (Resektion, Adhäsiolyse, Dünndarm-Stomata)', 'viszeralchirurgie', 25),
  ('MV004', 'Kolorektal (Segment- und Teilresektion)', 'viszeralchirurgie', 10),
  ('MV005', 'Hepatobiliär (exkl. Cholezystektomie), Leberteilresektion, Pankreasteilresektion, Bariatrische Chirurgie', 'viszeralchirurgie', 5),
  ('MV007', 'Proktologische Eingriffe (Hämorrhoiden, Fisteln etc.), Rektoskopie und erweiterte Proktologie', 'viszeralchirurgie', 35),
  ('MV008', 'Splenektomie', 'viszeralchirurgie', 3),
  ('MV010', 'Laparoskopie, Laparotomie', 'viszeralchirurgie', 40),
  ('MV011', 'Laparoskopie', 'viszeralchirurgie', 29),
  ('MV012', 'Laparotomie', 'viszeralchirurgie', 23),
  ('MT001', 'Metallentfernungen, Spickungen', 'traumatologie', 30),
  ('MT003', 'Eingriffe Sehnen/Ligamente', 'traumatologie', 15),
  ('MT004', 'Arthroskopie', 'traumatologie', 10),
  ('MT005', 'Osteosynthese Schaftfrakturen', 'traumatologie', 15),
  ('MT006', 'Osteosynthese gelenksnaher (metaphysärer) Frakturen', 'traumatologie', 40),
  ('MT007', 'Osteosynthese komplexer Frakturen', 'traumatologie', 5),
  ('MT008', 'Handchirurgie (exklusiv Wundversorgung)', 'traumatologie', 15),
  ('MT009', 'Amputationen', 'traumatologie', 10),
  ('MT010', 'Kleine Amputationen', 'traumatologie', 5),
  ('MT011', 'Grosse Amputationen', 'traumatologie', 5),
  ('MK001', 'Abdominalhernien (Narbenhernien, videoskopischer Repair)', 'kombination', 15),
  ('MK002', 'Mageneingriffe (Ulkusnaht, Gastroenterostomie, chir. Gastrostomie, Resektion)', 'kombination', 5),
  ('MK003', 'Dünndarmeingriffe (Resektion, Adhäsiolyse, Dünndarm-Stomata)', 'kombination', 15),
  ('MK004', 'Kolorektal (Segment- und Teilresektion)', 'kombination', 5),
  ('MK005', 'Endokrine Chirurgie (Thyreoidektomie, Parathyreoidektomie, Adrenalektomie)', 'kombination', 5),
  ('MK006', 'Proktologische Eingriffe (Hämorrhoiden, Fisteln etc.), Rektoskopie und erweiterte Proktologie', 'kombination', 20),
  ('MK007', 'Dickdarmstoma', 'kombination', 5),
  ('MK008', 'Metallentfernungen, Spickungen', 'kombination', 20),
  ('MK009', 'Reposition Luxation/Frakturen, konservative Frakturbehandlung', 'kombination', 15),
  ('MK010', 'Eingriffe Sehnen/Ligamente', 'kombination', 5),
  ('MK011', 'Osteosynthese Schaftfrakturen', 'kombination', 10),
  ('MK012', 'Osteosynthese gelenksnaher (metaphysärer) Frakturen', 'kombination', 20),
  ('MK013', 'Handchirurgie (exklusiv Wundversorgung)', 'kombination', 10),
  ('MK014', 'Laparoskopie, Laparotomie', 'kombination', 11),
  ('MK015', 'Laparoskopie', 'kombination', 29),
  ('MK016', 'Laparotomie', 'kombination', 23),
  ('MK017', 'Amputationen', 'kombination', 4),
  ('MK018', 'Kleine Amputationen', 'kombination', 2),
  ('MK019', 'Grosse Amputationen', 'kombination', 2)
) AS proc(code, title_de, category_key, minimum)
JOIN category_mapping cat ON cat.key = proc.category_key
WHERE NOT EXISTS (
  SELECT 1 FROM public.procedures existing 
  WHERE existing.code = proc.code
);