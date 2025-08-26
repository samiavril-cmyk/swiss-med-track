-- Update minimum requirements for all procedures to match FMH specifications
-- Update Basis Notfallchirurgie procedures
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 10, 'pgy2', 10, 'pgy3', 10, 'pgy4', 10, 'pgy5', 10) WHERE code = 'BN001'; -- Chirurgisches Schockraummanagement: 10
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 15, 'pgy2', 15, 'pgy3', 15, 'pgy4', 15, 'pgy5', 15) WHERE code = 'BN002'; -- Reposition Luxation/Frakturen, konservative Frakturbehandlung: 15
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 30, 'pgy2', 30, 'pgy3', 30, 'pgy4', 30, 'pgy5', 30) WHERE code = 'BN003'; -- Wundversorgungen: 30
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 5, 'pgy2', 5, 'pgy3', 5, 'pgy4', 5, 'pgy5', 5) WHERE code = 'BN004'; -- Anlage Fixateur externe: 5
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 15, 'pgy2', 15, 'pgy3', 15, 'pgy4', 15, 'pgy5', 15) WHERE code = 'BN005'; -- Thoraxdrainagen: 15
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 5, 'pgy2', 5, 'pgy3', 5, 'pgy4', 5, 'pgy5', 5) WHERE code = 'BN006'; -- Zervikotomien (Tracheafreilegung): 5
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 5, 'pgy2', 5, 'pgy3', 5, 'pgy4', 5, 'pgy5', 5) WHERE code = 'BN007'; -- Cystofixeinlage: 5

-- Update Basis Allgemeinchirurgie procedures
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 40, 'pgy2', 40, 'pgy3', 40, 'pgy4', 40, 'pgy5', 40) WHERE code = 'BA001'; -- Kleinchirurgische Eingriffe: 40
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 30, 'pgy2', 30, 'pgy3', 30, 'pgy4', 30, 'pgy5', 30) WHERE code = 'BA002'; -- Appendektomie: 30
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 30, 'pgy2', 30, 'pgy3', 30, 'pgy4', 30, 'pgy5', 30) WHERE code = 'BA003'; -- Cholezystektomie: 30
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 40, 'pgy2', 40, 'pgy3', 40, 'pgy4', 40, 'pgy5', 40) WHERE code = 'BA004'; -- Hernienoperationen: 40
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 20, 'pgy2', 20, 'pgy3', 20, 'pgy4', 20, 'pgy5', 20) WHERE code = 'BA005'; -- Dünndarmeingriffe: 20
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 20, 'pgy2', 20, 'pgy3', 20, 'pgy4', 20, 'pgy5', 20) WHERE code = 'BA006'; -- Proktologische Eingriffe: 20
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 30, 'pgy2', 30, 'pgy3', 30, 'pgy4', 30, 'pgy5', 30) WHERE code = 'BA007'; -- Veneneingriffe: 30
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 30, 'pgy2', 30, 'pgy3', 30, 'pgy4', 30, 'pgy5', 30) WHERE code = 'BA008'; -- Laparoskopie, Laparotomie: 30
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 15, 'pgy2', 15, 'pgy3', 15, 'pgy4', 15, 'pgy5', 15) WHERE code = 'BA009'; -- Laparoskopie: 15
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 15, 'pgy2', 15, 'pgy3', 15, 'pgy4', 15, 'pgy5', 15) WHERE code = 'BA010'; -- Laparotomie: 15
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 20, 'pgy2', 20, 'pgy3', 20, 'pgy4', 20, 'pgy5', 20) WHERE code = 'BA011'; -- Weitere zählbare Eingriffe: 20
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 0, 'pgy2', 0, 'pgy3', 0, 'pgy4', 0, 'pgy5', 0) WHERE code = 'BA012'; -- Thoraxchirurgische Eingriffe: 0
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 0, 'pgy2', 0, 'pgy3', 0, 'pgy4', 0, 'pgy5', 0) WHERE code = 'BA013'; -- Urologische Eingriffe: 0
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 0, 'pgy2', 0, 'pgy3', 0, 'pgy4', 0, 'pgy5', 0) WHERE code = 'BA014'; -- Gefässchirurgische Eingriffe: 0
UPDATE public.procedures SET min_required_by_pgy = jsonb_build_object('pgy1', 0, 'pgy2', 0, 'pgy3', 0, 'pgy4', 0, 'pgy5', 0) WHERE code = 'BA015'; -- Kompartimentelle Spaltungen: 0

-- Update the module minimum requirements
UPDATE public.procedure_categories SET minimum_required = 85 WHERE key = 'basis_notfallchirurgie';
UPDATE public.procedure_categories SET minimum_required = 260 WHERE key = 'basis_allgemeinchirurgie';
UPDATE public.procedure_categories SET minimum_required = 165 WHERE key = 'viszeralchirurgie';
UPDATE public.procedure_categories SET minimum_required = 165 WHERE key = 'traumatologie';
UPDATE public.procedure_categories SET minimum_required = 165 WHERE key = 'kombination';