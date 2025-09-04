-- Fix für User Profile Problem
-- User ID: 2f6311eb-8c68-4925-82e0-ea3a249ee129

-- Erstelle Profil für den existierenden User
INSERT INTO public.profiles (
    user_id, 
    full_name, 
    email, 
    role, 
    department, 
    hospital, 
    pgy_level, 
    is_public, 
    public_fields
) VALUES (
    '2f6311eb-8c68-4925-82e0-ea3a249ee129',
    'Dr. Jose Obermann',
    'jose.obermann@hospital.ch',
    'supervisor',
    'Allgemeinchirurgie',
    'Universitätsspital Zürich',
    10,
    true,
    '{"courses": true, "awards": true, "publications": true, "procedures": false}'
) ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    hospital = EXCLUDED.hospital,
    pgy_level = EXCLUDED.pgy_level,
    is_public = EXCLUDED.is_public,
    public_fields = EXCLUDED.public_fields;
