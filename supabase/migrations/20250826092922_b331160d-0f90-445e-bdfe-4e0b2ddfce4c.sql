-- Add all missing procedures for FMH modules

-- First, let's add all missing procedures for Basis Notfallchirurgie
INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BN-001', 'Chirurgisches Schockraummanagement',
  pc.id, '{"5": 10}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_notfallchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BN-002', 'Reposition Luxation/Frakturen, konservative Frakturbehandlung',
  pc.id, '{"5": 15}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_notfallchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BN-003', 'Wundversorgungen',
  pc.id, '{"5": 30}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_notfallchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BN-004', 'Anlage Fixateur externe',
  pc.id, '{"5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_notfallchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BN-005', 'Thoraxdrainagen',
  pc.id, '{"5": 15}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_notfallchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BN-006', 'Zervikotomien (Tracheafreilegung)',
  pc.id, '{"5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_notfallchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BN-007', 'Cystofixeinlage',
  pc.id, '{"5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_notfallchirurgie'
ON CONFLICT (code) DO NOTHING;

-- Add all missing procedures for Basis Allgemeinchirurgie
INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA-001', 'Kleinchirurgische Eingriffe (Atherom/Lipom, Kocher, Thiersch, LK Excisionen etc.)',
  pc.id, '{"5": 40}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA-002', 'Appendektomie',
  pc.id, '{"5": 30}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA-003', 'Cholezystektomie',
  pc.id, '{"5": 30}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA-004', 'Hernienoperationen (inguinal/umbilical)',
  pc.id, '{"5": 40}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA-005', 'Dünndarmeingriffe (Resektion, Adhäsiolyse, Dünndarm-Stomata)',
  pc.id, '{"5": 20}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA-006', 'Proktologische Eingriffe (Hämorrhoiden, Fisteln etc.), Rektoskopie und erweiterte Proktologie',
  pc.id, '{"5": 20}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA-007', 'Veneneingriffe (Varizenchirurgie, Port/Pacemaker)',
  pc.id, '{"5": 30}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA-008', 'Laparoskopie, Laparotomie',
  pc.id, '{"5": 30}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA-009', 'Laparoskopie',
  pc.id, '{"5": 15}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA-010', 'Laparotomie',
  pc.id, '{"5": 15}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA-011', 'Weitere zählbare Eingriffe',
  pc.id, '{"5": 20}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA-012', 'Thoraxchirurgische Eingriffe',
  pc.id, '{"5": 0}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA-013', 'Urologische Eingriffe',
  pc.id, '{"5": 0}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA-014', 'Gefässchirurgische Eingriffe',
  pc.id, '{"5": 0}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'BA-015', 'Kompartimentelle Spaltungen',
  pc.id, '{"5": 0}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'basis_allgemeinchirurgie'
ON CONFLICT (code) DO NOTHING;

-- Add all missing procedures for Viszeralchirurgie
INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'VZ-007', 'Laparoskopie, Laparotomie',
  pc.id, '{"5": 40}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'viszeralchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'VZ-008', 'Laparoskopie',
  pc.id, '{"5": 29}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'viszeralchirurgie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'VZ-009', 'Laparotomie',
  pc.id, '{"5": 23}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'viszeralchirurgie'
ON CONFLICT (code) DO NOTHING;

-- Add all missing procedures for Traumatologie
INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'TR-001', 'Metallentfernungen, Spickungen',
  pc.id, '{"5": 30}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'TR-002', 'Reposition Luxation/Frakturen, konservative Frakturbehandlung',
  pc.id, '{"5": 25}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'TR-003', 'Eingriffe Sehnen/Ligamente',
  pc.id, '{"5": 15}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'TR-004', 'Arthroskopie',
  pc.id, '{"5": 10}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'TR-005', 'Osteosynthese Schaftfrakturen',
  pc.id, '{"5": 15}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'TR-006', 'Osteosynthese gelenksnaher (metaphysärer) Frakturen',
  pc.id, '{"5": 40}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'TR-007', 'Osteosynthese komplexer Frakturen',
  pc.id, '{"5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'TR-008', 'Handchirurgie (exklusiv Wundversorgung)',
  pc.id, '{"5": 15}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'TR-009', 'Amputationen',
  pc.id, '{"5": 10}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'TR-010', 'Kleine Amputationen',
  pc.id, '{"5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'TR-011', 'Grosse Amputationen',
  pc.id, '{"5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'traumatologie'
ON CONFLICT (code) DO NOTHING;

-- Add all missing procedures for Kombination
INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'KO-001', 'Abdominalhernien (Narbenhernien, videoskopischer Repair)',
  pc.id, '{"5": 15}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'KO-002', 'Mageneingriffe (Ulkusnaht, Gastroenterostomie, chir. Gastrostomie, Resektion)',
  pc.id, '{"5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'KO-003', 'Dünndarmeingriffe (Resektion, Adhäsiolyse, Dünndarm-Stomata)',
  pc.id, '{"5": 15}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'KO-004', 'Kolorektal (Segment- und Teilresektion)',
  pc.id, '{"5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'KO-005', 'Endokrine Chirurgie (Thyreoidektomie, Parathyreoidektomie, Adrenalektomie)',
  pc.id, '{"5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'KO-006', 'Proktologische Eingriffe (Hämorrhoiden, Fisteln etc.), Rektoskopie und erweiterte Proktologie',
  pc.id, '{"5": 20}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'KO-007', 'Dickdarmstoma',
  pc.id, '{"5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'KO-008', 'Metallentfernungen, Spickungen',
  pc.id, '{"5": 20}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'KO-009', 'Reposition Luxation/Frakturen, konservative Frakturbehandlung',
  pc.id, '{"5": 15}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'KO-010', 'Eingriffe Sehnen/Ligamente',
  pc.id, '{"5": 5}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'KO-011', 'Osteosynthese Schaftfrakturen',
  pc.id, '{"5": 10}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'KO-012', 'Osteosynthese gelenksnaher (metaphysärer) Frakturen',
  pc.id, '{"5": 20}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'KO-013', 'Handchirurgie (exklusiv Wundversorgung)',
  pc.id, '{"5": 10}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'KO-014', 'Laparoskopie, Laparotomie',
  pc.id, '{"5": 11}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'KO-015', 'Laparoskopie',
  pc.id, '{"5": 29}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'KO-016', 'Laparotomie',
  pc.id, '{"5": 23}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'KO-017', 'Amputationen',
  pc.id, '{"5": 4}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'KO-018', 'Kleine Amputationen',
  pc.id, '{"5": 2}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active)
SELECT 
  'KO-019', 'Grosse Amputationen',
  pc.id, '{"5": 2}'::jsonb, true
FROM public.procedure_categories pc WHERE pc.key = 'kombination'
ON CONFLICT (code) DO NOTHING;