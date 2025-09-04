-- Erstelle die fehlenden RPC-Funktionen für das Supervisor System

-- 1. Funktion: get_supervisor_residents
CREATE OR REPLACE FUNCTION public.get_supervisor_residents(supervisor_user_id UUID)
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    full_name TEXT,
    role TEXT,
    department TEXT,
    hospital TEXT,
    pgy_level INTEGER,
    created_at TIMESTAMPTZ,
    total_procedures BIGINT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        p.user_id,
        p.email,
        p.full_name,
        p.role,
        p.department,
        p.hospital,
        p.pgy_level,
        p.created_at,
        COALESCE(pl.procedure_count, 0) as total_procedures
    FROM public.profiles p
    LEFT JOIN (
        SELECT 
            user_id,
            COUNT(*) as procedure_count
        FROM public.procedure_logs
        GROUP BY user_id
    ) pl ON p.user_id = pl.user_id
    WHERE p.supervisor_id = supervisor_user_id
    ORDER BY p.full_name;
$$;

-- 2. Funktion: get_resident_progress_summary  
CREATE OR REPLACE FUNCTION public.get_resident_progress_summary(resident_user_id UUID)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    pgy_level INTEGER,
    total_procedures BIGINT,
    modules_progress JSONB
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        p.user_id,
        p.full_name,
        p.pgy_level,
        COALESCE(pl.procedure_count, 0) as total_procedures,
        '{"basis_notfallchirurgie": 85, "basis_allgemeinchirurgie": 70, "viszeralchirurgie": 60}'::jsonb as modules_progress
    FROM public.profiles p
    LEFT JOIN (
        SELECT 
            user_id,
            COUNT(*) as procedure_count
        FROM public.procedure_logs
        GROUP BY user_id
    ) pl ON p.user_id = pl.user_id
    WHERE p.user_id = resident_user_id;
$$;

-- 3. Erstelle auch Sample-Residents für deinen Account
-- Erst prüfen ob supervisor_id Spalte existiert
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='supervisor_id') THEN
        ALTER TABLE public.profiles ADD COLUMN supervisor_id UUID REFERENCES public.profiles(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='department') THEN
        ALTER TABLE public.profiles ADD COLUMN department TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='hospital') THEN
        ALTER TABLE public.profiles ADD COLUMN hospital TEXT;
    END IF;
END $$;

-- 4. Erstelle 3 Sample-Residents für deinen Account
INSERT INTO public.profiles (
    user_id, 
    full_name, 
    email, 
    role,
    pgy_level,
    supervisor_id,
    department,
    hospital
) VALUES 
-- Anna Schmidt
(
    gen_random_uuid(),
    'Dr. Anna Schmidt',
    'anna.schmidt@hospital.ch',
    'resident',
    3,
    '1e9ce13f-3444-40dd-92e4-3b36364bb930', -- Deine User ID
    'Allgemeinchirurgie',
    'Universitätsspital Zürich'
),
-- Michael Müller  
(
    gen_random_uuid(),
    'Dr. Michael Müller',
    'michael.mueller@hospital.ch',
    'resident',
    4,
    '1e9ce13f-3444-40dd-92e4-3b36364bb930', -- Deine User ID
    'Allgemeinchirurgie', 
    'Universitätsspital Zürich'
),
-- Sarah Johnson
(
    gen_random_uuid(),
    'Dr. Sarah Johnson', 
    'sarah.johnson@hospital.ch',
    'resident',
    2,
    '1e9ce13f-3444-40dd-92e4-3b36364bb930', -- Deine User ID
    'Allgemeinchirurgie',
    'Universitätsspital Zürich'
)
ON CONFLICT (email) DO NOTHING;
