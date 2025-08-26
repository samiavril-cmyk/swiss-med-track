-- FMH procedures restoration - handle conflicts by renaming temporarily
-- First, rename all existing codes to temporary names to avoid conflicts
UPDATE public.procedures SET code = 'TEMP_' || code WHERE code NOT LIKE 'TEMP_%';

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

-- Now update existing procedures to match exact FMH specifications
WITH category_mapping AS (
  SELECT id, key FROM public.procedure_categories 
  WHERE key IN ('basis_notfallchirurgie', 'basis_allgemeinchirurgie', 'viszeralchirurgie', 'traumatologie', 'kombination')
)
UPDATE public.procedures 
SET 
  code = CASE id::text
    WHEN '2bf1809e-38e9-4a96-8d3b-1f2c026cf451' THEN 'BN001'
    WHEN '2b925c67-20d3-4de3-acba-d49e909d61e5' THEN 'BN005'  -- This was Thoraxdrainage, now becomes BN005
    WHEN '5395bc3d-e7c9-4bf3-a91c-8dbaed404735' THEN 'BN003'
    WHEN 'ea9885b9-01f7-4e3c-add5-e8f947945c6e' THEN 'BN006'
    WHEN 'd9ba7f86-224e-4379-bfe2-10cef56ba3f6' THEN 'BA001'
    WHEN '8be19224-4db7-403a-b443-354934326daa' THEN 'BA002'
    WHEN '751ae4d2-aac0-4f75-abf6-34d3d3789471' THEN 'BA003'
    WHEN '781c6f96-c156-48ba-8089-3f178d446215' THEN 'BA004'
    WHEN '491e2148-51a6-425b-8003-e2cc968dcb5d' THEN 'BA005'
    WHEN 'f7953b6f-5a70-4684-baeb-15a2071adaf3' THEN 'BA006'
    WHEN '9916e987-5f82-4c8c-a27d-a25ce37f4a6c' THEN 'BA007'
    WHEN 'e53b079f-7421-4c04-83e7-a84e70512afd' THEN 'BA008'
    WHEN '863c9b5f-8256-4a8b-9871-62e9f538f628' THEN 'MV001'
    WHEN 'fa696caa-9e4a-4213-9634-c83f2408adf4' THEN 'MV002'
    WHEN 'a6266973-70a6-4416-b0b7-ab8e9756ffe9' THEN 'MV006'
    WHEN '20cb1aa1-b142-4dfe-8842-91f7a7678db0' THEN 'MV009'
    WHEN '3d253b62-f584-4dd5-98ba-18bf1352ac6e' THEN 'MT002'
    ELSE code
  END,
  title_de = CASE id::text
    WHEN '2bf1809e-38e9-4a96-8d3b-1f2c026cf451' THEN 'Chirurgisches Schockraummanagement'
    WHEN '2b925c67-20d3-4de3-acba-d49e909d61e5' THEN 'Thoraxdrainagen'
    WHEN '5395bc3d-e7c9-4bf3-a91c-8dbaed404735' THEN 'Wundversorgungen'
    WHEN 'ea9885b9-01f7-4e3c-add5-e8f947945c6e' THEN 'Zervikotomien (Tracheafreilegung)'
    WHEN 'd9ba7f86-224e-4379-bfe2-10cef56ba3f6' THEN 'Kleinchirurgische Eingriffe (Atherom/Lipom, Kocher, Thiersch, LK Excisionen etc.)'
    WHEN '8be19224-4db7-403a-b443-354934326daa' THEN 'Appendektomie'
    WHEN '751ae4d2-aac0-4f75-abf6-34d3d3789471' THEN 'Cholezystektomie'
    WHEN '781c6f96-c156-48ba-8089-3f178d446215' THEN 'Hernienoperationen (inguinal/umbilical)'
    WHEN '491e2148-51a6-425b-8003-e2cc968dcb5d' THEN 'Dünndarmeingriffe (Resektion, Adhäsiolyse, Dünndarm-Stomata)'
    WHEN 'f7953b6f-5a70-4684-baeb-15a2071adaf3' THEN 'Proktologische Eingriffe (Hämorrhoiden, Fisteln etc.), Rektoskopie und erweiterte Proktologie'
    WHEN '9916e987-5f82-4c8c-a27d-a25ce37f4a6c' THEN 'Veneneingriffe (Varizenchirurgie, Port/Pacemaker)'
    WHEN 'e53b079f-7421-4c04-83e7-a84e70512afd' THEN 'Laparoskopie, Laparotomie'
    WHEN '863c9b5f-8256-4a8b-9871-62e9f538f628' THEN 'Abdominalhernien (Narbenhernien, videoskopischer Repair)'
    WHEN 'fa696caa-9e4a-4213-9634-c83f2408adf4' THEN 'Mageneingriffe (Ulkusnaht, Gastroenterostomie, chir. Gastrostomie, Resektion)'
    WHEN 'a6266973-70a6-4416-b0b7-ab8e9756ffe9' THEN 'Endokrine Chirurgie (Thyreoidektomie, Parathyreoidektomie, Adrenalektomie)'
    WHEN '20cb1aa1-b142-4dfe-8842-91f7a7678db0' THEN 'Dickdarmstoma'
    WHEN '3d253b62-f584-4dd5-98ba-18bf1352ac6e' THEN 'Reposition Luxation/Frakturen, konservative Frakturbehandlung'
    ELSE title_de
  END,
  category_id = CASE id::text
    WHEN '2bf1809e-38e9-4a96-8d3b-1f2c026cf451' THEN (SELECT id FROM category_mapping WHERE key = 'basis_notfallchirurgie')
    WHEN '2b925c67-20d3-4de3-acba-d49e909d61e5' THEN (SELECT id FROM category_mapping WHERE key = 'basis_notfallchirurgie')
    WHEN '5395bc3d-e7c9-4bf3-a91c-8dbaed404735' THEN (SELECT id FROM category_mapping WHERE key = 'basis_notfallchirurgie')
    WHEN 'ea9885b9-01f7-4e3c-add5-e8f947945c6e' THEN (SELECT id FROM category_mapping WHERE key = 'basis_notfallchirurgie')
    WHEN 'd9ba7f86-224e-4379-bfe2-10cef56ba3f6' THEN (SELECT id FROM category_mapping WHERE key = 'basis_allgemeinchirurgie')
    WHEN '8be19224-4db7-403a-b443-354934326daa' THEN (SELECT id FROM category_mapping WHERE key = 'basis_allgemeinchirurgie')
    WHEN '751ae4d2-aac0-4f75-abf6-34d3d3789471' THEN (SELECT id FROM category_mapping WHERE key = 'basis_allgemeinchirurgie')
    WHEN '781c6f96-c156-48ba-8089-3f178d446215' THEN (SELECT id FROM category_mapping WHERE key = 'basis_allgemeinchirurgie')
    WHEN '491e2148-51a6-425b-8003-e2cc968dcb5d' THEN (SELECT id FROM category_mapping WHERE key = 'basis_allgemeinchirurgie')
    WHEN 'f7953b6f-5a70-4684-baeb-15a2071adaf3' THEN (SELECT id FROM category_mapping WHERE key = 'basis_allgemeinchirurgie')
    WHEN '9916e987-5f82-4c8c-a27d-a25ce37f4a6c' THEN (SELECT id FROM category_mapping WHERE key = 'basis_allgemeinchirurgie')
    WHEN 'e53b079f-7421-4c04-83e7-a84e70512afd' THEN (SELECT id FROM category_mapping WHERE key = 'basis_allgemeinchirurgie')
    WHEN '863c9b5f-8256-4a8b-9871-62e9f538f628' THEN (SELECT id FROM category_mapping WHERE key = 'viszeralchirurgie')
    WHEN 'fa696caa-9e4a-4213-9634-c83f2408adf4' THEN (SELECT id FROM category_mapping WHERE key = 'viszeralchirurgie')
    WHEN 'a6266973-70a6-4416-b0b7-ab8e9756ffe9' THEN (SELECT id FROM category_mapping WHERE key = 'viszeralchirurgie')
    WHEN '20cb1aa1-b142-4dfe-8842-91f7a7678db0' THEN (SELECT id FROM category_mapping WHERE key = 'viszeralchirurgie')
    WHEN '3d253b62-f584-4dd5-98ba-18bf1352ac6e' THEN (SELECT id FROM category_mapping WHERE key = 'traumatologie')
    ELSE category_id
  END,
  min_required_by_pgy = CASE id::text
    WHEN '2bf1809e-38e9-4a96-8d3b-1f2c026cf451' THEN jsonb_build_object('pgy1', 10, 'pgy2', 10, 'pgy3', 10, 'pgy4', 10, 'pgy5', 10)
    WHEN '2b925c67-20d3-4de3-acba-d49e909d61e5' THEN jsonb_build_object('pgy1', 15, 'pgy2', 15, 'pgy3', 15, 'pgy4', 15, 'pgy5', 15)
    WHEN '5395bc3d-e7c9-4bf3-a91c-8dbaed404735' THEN jsonb_build_object('pgy1', 30, 'pgy2', 30, 'pgy3', 30, 'pgy4', 30, 'pgy5', 30)
    WHEN 'ea9885b9-01f7-4e3c-add5-e8f947945c6e' THEN jsonb_build_object('pgy1', 5, 'pgy2', 5, 'pgy3', 5, 'pgy4', 5, 'pgy5', 5)
    WHEN 'd9ba7f86-224e-4379-bfe2-10cef56ba3f6' THEN jsonb_build_object('pgy1', 40, 'pgy2', 40, 'pgy3', 40, 'pgy4', 40, 'pgy5', 40)
    WHEN '8be19224-4db7-403a-b443-354934326daa' THEN jsonb_build_object('pgy1', 30, 'pgy2', 30, 'pgy3', 30, 'pgy4', 30, 'pgy5', 30)
    WHEN '751ae4d2-aac0-4f75-abf6-34d3d3789471' THEN jsonb_build_object('pgy1', 30, 'pgy2', 30, 'pgy3', 30, 'pgy4', 30, 'pgy5', 30)
    WHEN '781c6f96-c156-48ba-8089-3f178d446215' THEN jsonb_build_object('pgy1', 40, 'pgy2', 40, 'pgy3', 40, 'pgy4', 40, 'pgy5', 40)
    WHEN '491e2148-51a6-425b-8003-e2cc968dcb5d' THEN jsonb_build_object('pgy1', 20, 'pgy2', 20, 'pgy3', 20, 'pgy4', 20, 'pgy5', 20)
    WHEN 'f7953b6f-5a70-4684-baeb-15a2071adaf3' THEN jsonb_build_object('pgy1', 20, 'pgy2', 20, 'pgy3', 20, 'pgy4', 20, 'pgy5', 20)
    WHEN '9916e987-5f82-4c8c-a27d-a25ce37f4a6c' THEN jsonb_build_object('pgy1', 30, 'pgy2', 30, 'pgy3', 30, 'pgy4', 30, 'pgy5', 30)
    WHEN 'e53b079f-7421-4c04-83e7-a84e70512afd' THEN jsonb_build_object('pgy1', 30, 'pgy2', 30, 'pgy3', 30, 'pgy4', 30, 'pgy5', 30)
    WHEN '863c9b5f-8256-4a8b-9871-62e9f538f628' THEN jsonb_build_object('pgy1', 25, 'pgy2', 25, 'pgy3', 25, 'pgy4', 25, 'pgy5', 25)
    WHEN 'fa696caa-9e4a-4213-9634-c83f2408adf4' THEN jsonb_build_object('pgy1', 7, 'pgy2', 7, 'pgy3', 7, 'pgy4', 7, 'pgy5', 7)
    WHEN 'a6266973-70a6-4416-b0b7-ab8e9756ffe9' THEN jsonb_build_object('pgy1', 10, 'pgy2', 10, 'pgy3', 10, 'pgy4', 10, 'pgy5', 10)
    WHEN '20cb1aa1-b142-4dfe-8842-91f7a7678db0' THEN jsonb_build_object('pgy1', 5, 'pgy2', 5, 'pgy3', 5, 'pgy4', 5, 'pgy5', 5)
    WHEN '3d253b62-f584-4dd5-98ba-18bf1352ac6e' THEN jsonb_build_object('pgy1', 25, 'pgy2', 25, 'pgy3', 25, 'pgy4', 25, 'pgy5', 25)
    ELSE min_required_by_pgy
  END,
  active = true
WHERE id::text IN (
  '2bf1809e-38e9-4a96-8d3b-1f2c026cf451', '2b925c67-20d3-4de3-acba-d49e909d61e5', '5395bc3d-e7c9-4bf3-a91c-8dbaed404735', 'ea9885b9-01f7-4e3c-add5-e8f947945c6e',
  'd9ba7f86-224e-4379-bfe2-10cef56ba3f6', '8be19224-4db7-403a-b443-354934326daa', '751ae4d2-aac0-4f75-abf6-34d3d3789471', '781c6f96-c156-48ba-8089-3f178d446215',
  '491e2148-51a6-425b-8003-e2cc968dcb5d', 'f7953b6f-5a70-4684-baeb-15a2071adaf3', '9916e987-5f82-4c8c-a27d-a25ce37f4a6c', 'e53b079f-7421-4c04-83e7-a84e70512afd',
  '863c9b5f-8256-4a8b-9871-62e9f538f628', 'fa696caa-9e4a-4213-9634-c83f2408adf4', 'a6266973-70a6-4416-b0b7-ab8e9756ffe9', '20cb1aa1-b142-4dfe-8842-91f7a7678db0',
  '3d253b62-f584-4dd5-98ba-18bf1352ac6e'
);

-- Delete unused procedures that have temporary codes (no longer needed)
DELETE FROM public.procedures 
WHERE code LIKE 'TEMP_%' 
AND id NOT IN (SELECT DISTINCT procedure_id FROM procedure_logs WHERE procedure_id IS NOT NULL);