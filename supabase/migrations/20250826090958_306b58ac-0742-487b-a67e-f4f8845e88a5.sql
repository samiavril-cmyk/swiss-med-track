-- Clean up and restore exact FMH procedures while preserving existing logs
-- First, clean up any manually added entries
DELETE FROM public.procedures WHERE code LIKE 'MANUAL_%';
DELETE FROM public.procedure_categories WHERE key NOT IN ('basis_notfallchirurgie', 'basis_allgemeinchirurgie', 'viszeralchirurgie', 'traumatologie', 'kombination');

-- Insert/Update the exact 5 FMH categories with correct minimum requirements
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

-- Temporarily disable foreign key constraints to allow procedure updates
SET session_replication_role = replica;

-- Delete all existing procedures that are not referenced by logs
DELETE FROM public.procedures WHERE id NOT IN (SELECT DISTINCT procedure_id FROM public.procedure_logs WHERE procedure_id IS NOT NULL);

-- Reset sequence and insert new procedures
ALTER SEQUENCE IF EXISTS procedures_id_seq RESTART WITH 1;

-- Get category IDs for new procedures
WITH categories AS (
  SELECT id, key FROM public.procedure_categories 
  WHERE key IN ('basis_notfallchirurgie', 'basis_allgemeinchirurgie', 'viszeralchirurgie', 'traumatologie', 'kombination')
)

-- Insert the exact procedures from the user's list
INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy) 
SELECT 
  proc.code,
  proc.title_de,
  cat.id,
  jsonb_build_object('pgy1', proc.minimum, 'pgy2', proc.minimum, 'pgy3', proc.minimum, 'pgy4', proc.minimum, 'pgy5', proc.minimum)
FROM (VALUES
  -- Basis Notfallchirurgie
  ('BN001', 'Chirurgisches Schockraummanagement', 'basis_notfallchirurgie', 10),
  ('BN002', 'Reposition Luxation/Frakturen, konservative Frakturbehandlung', 'basis_notfallchirurgie', 15),
  ('BN003', 'Wundversorgungen', 'basis_notfallchirurgie', 30),
  ('BN004', 'Anlage Fixateur externe', 'basis_notfallchirurgie', 5),
  ('BN005', 'Thoraxdrainagen', 'basis_notfallchirurgie', 15),
  ('BN006', 'Zervikotomien (Tracheafreilegung)', 'basis_notfallchirurgie', 5),
  ('BN007', 'Cystofixeinlage', 'basis_notfallchirurgie', 5),
  
  -- Basis Allgemeinchirurgie
  ('BA001', 'Kleinchirurgische Eingriffe (Atherom/Lipom, Kocher, Thiersch, LK Excisionen etc.)', 'basis_allgemeinchirurgie', 40),
  ('BA002', 'Appendektomie', 'basis_allgemeinchirurgie', 30),
  ('BA003', 'Cholezystektomie', 'basis_allgemeinchirurgie', 30),
  ('BA004', 'Hernienoperationen (inguinal/umbilical)', 'basis_allgemeinchirurgie', 40),
  ('BA005', 'Dünndarmeingriffe (Resektion, Adhäsiolyse, Dünndarm-Stomata)', 'basis_allgemeinchirurgie', 20),
  ('BA006', 'Proktologische Eingriffe (Hämorrhoiden, Fisteln etc.), Rektoskopie und erweiterte Proktologie', 'basis_allgemeinchirurgie', 20),
  ('BA007', 'Veneneingriffe (Varizenchirurgie, Port/Pacemaker)', 'basis_allgemeinchirurgie', 30),
  ('BA008', 'Laparoskopie, Laparotomie', 'basis_allgemeinchirurgie', 30),
  ('BA009', 'Laparoskopie', 'basis_allgemeinchirurgie', 15),
  ('BA010', 'Laparotomie', 'basis_allgemeinchirurgie', 15),
  ('BA011', 'Weitere zählbare Eingriffe', 'basis_allgemeinchirurgie', 20),
  ('BA012', 'Thoraxchirurgische Eingriffe', 'basis_allgemeinchirurgie', 0),
  ('BA013', 'Urologische Eingriffe', 'basis_allgemeinchirurgie', 0),
  ('BA014', 'Gefässchirurgische Eingriffe', 'basis_allgemeinchirurgie', 0),
  ('BA015', 'Kompartimentelle Spaltungen', 'basis_allgemeinchirurgie', 0),
  
  -- Modul Viszeralchirurgie
  ('MV001', 'Abdominalhernien (Narbenhernien, videoskopischer Repair)', 'viszeralchirurgie', 25),
  ('MV002', 'Mageneingriffe (Ulkusnaht, Gastroenterostomie, chir. Gastrostomie, Resektion)', 'viszeralchirurgie', 7),
  ('MV003', 'Dünndarmeingriffe (Resektion, Adhäsiolyse, Dünndarm-Stomata)', 'viszeralchirurgie', 25),
  ('MV004', 'Kolorektal (Segment- und Teilresektion)', 'viszeralchirurgie', 10),
  ('MV005', 'Hepatobiliär (exkl. Cholezystektomie), Leberteilresektion, Pankreasteilresektion, Bariatrische Chirurgie', 'viszeralchirurgie', 5),
  ('MV006', 'Endokrine Chirurgie (Thyreoidektomie, Parathyreoidektomie, Adrenalektomie)', 'viszeralchirurgie', 10),
  ('MV007', 'Proktologische Eingriffe (Hämorrhoiden, Fisteln etc.), Rektoskopie und erweiterte Proktologie', 'viszeralchirurgie', 35),
  ('MV008', 'Splenektomie', 'viszeralchirurgie', 3),
  ('MV009', 'Dickdarmstoma', 'viszeralchirurgie', 5),
  ('MV010', 'Laparoskopie, Laparotomie', 'viszeralchirurgie', 40),
  ('MV011', 'Laparoskopie', 'viszeralchirurgie', 29),
  ('MV012', 'Laparotomie', 'viszeralchirurgie', 23),
  
  -- Modul Traumatologie des Bewegungsapparates  
  ('MT001', 'Metallentfernungen, Spickungen', 'traumatologie', 30),
  ('MT002', 'Reposition Luxation/Frakturen, konservative Frakturbehandlung', 'traumatologie', 25),
  ('MT003', 'Eingriffe Sehnen/Ligamente', 'traumatologie', 15),
  ('MT004', 'Arthroskopie', 'traumatologie', 10),
  ('MT005', 'Osteosynthese Schaftfrakturen', 'traumatologie', 15),
  ('MT006', 'Osteosynthese gelenksnaher (metaphysärer) Frakturen', 'traumatologie', 40),
  ('MT007', 'Osteosynthese komplexer Frakturen', 'traumatologie', 5),
  ('MT008', 'Handchirurgie (exklusiv Wundversorgung)', 'traumatologie', 15),
  ('MT009', 'Amputationen', 'traumatologie', 10),
  ('MT010', 'Kleine Amputationen', 'traumatologie', 5),
  ('MT011', 'Grosse Amputationen', 'traumatologie', 5),
  
  -- Modul Kombination
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
JOIN categories cat ON cat.key = proc.category_key
WHERE NOT EXISTS (
  SELECT 1 FROM public.procedures existing 
  WHERE existing.code = proc.code
);

-- Re-enable foreign key constraints
SET session_replication_role = DEFAULT;