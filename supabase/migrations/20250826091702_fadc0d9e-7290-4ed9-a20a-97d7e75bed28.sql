-- Insert all remaining missing procedures from the complete FMH list
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
  -- Missing Basis Notfallchirurgie procedures
  ('BN002', 'Reposition Luxation/Frakturen, konservative Frakturbehandlung', 'basis_notfallchirurgie', 15),
  ('BN004', 'Anlage Fixateur externe', 'basis_notfallchirurgie', 5),
  ('BN007', 'Cystofixeinlage', 'basis_notfallchirurgie', 5),
  
  -- Missing Basis Allgemeinchirurgie procedures
  ('BA009', 'Laparoskopie', 'basis_allgemeinchirurgie', 15),
  ('BA010', 'Laparotomie', 'basis_allgemeinchirurgie', 15),
  ('BA011', 'Weitere zählbare Eingriffe', 'basis_allgemeinchirurgie', 20),
  ('BA012', 'Thoraxchirurgische Eingriffe', 'basis_allgemeinchirurgie', 0),
  ('BA013', 'Urologische Eingriffe', 'basis_allgemeinchirurgie', 0),
  ('BA014', 'Gefässchirurgische Eingriffe', 'basis_allgemeinchirurgie', 0),
  ('BA015', 'Kompartimentelle Spaltungen', 'basis_allgemeinchirurgie', 0),
  
  -- Missing Modul Viszeralchirurgie procedures
  ('MV003', 'Dünndarmeingriffe (Resektion, Adhäsiolyse, Dünndarm-Stomata)', 'viszeralchirurgie', 25),
  ('MV004', 'Kolorektal (Segment- und Teilresektion)', 'viszeralchirurgie', 10),
  ('MV005', 'Hepatobiliär (exkl. Cholezystektomie), Leberteilresektion, Pankreasteilresektion, Bariatrische Chirurgie', 'viszeralchirurgie', 5),
  ('MV007', 'Proktologische Eingriffe (Hämorrhoiden, Fisteln etc.), Rektoskopie und erweiterte Proktologie', 'viszeralchirurgie', 35),
  ('MV008', 'Splenektomie', 'viszeralchirurgie', 3),
  ('MV010', 'Laparoskopie, Laparotomie', 'viszeralchirurgie', 40),
  ('MV011', 'Laparoskopie', 'viszeralchirurgie', 29),
  ('MV012', 'Laparotomie', 'viszeralchirurgie', 23),
  
  -- Missing Modul Traumatologie procedures
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
  
  -- All Modul Kombination procedures
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