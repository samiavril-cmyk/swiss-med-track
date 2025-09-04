-- Schnelle Reparatur: Erstelle nur das Profil ohne die fehlenden Spalten
INSERT INTO public.profiles (
    user_id, 
    full_name, 
    email, 
    pgy_level
) VALUES (
    '2f6311eb-8c68-4925-82e0-ea3a249ee129',
    'Dr. Jose Obermann',
    'jose.obermann@hospital.ch',
    10
) ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    pgy_level = EXCLUDED.pgy_level;
