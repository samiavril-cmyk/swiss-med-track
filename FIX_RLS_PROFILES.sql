-- Fix RLS Policy für profiles Tabelle
-- Erlaube Users, ihr eigenes Profil zu lesen

-- Erst die bestehende Policy löschen (falls vorhanden)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Neue Policy erstellen
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Sicherstellen, dass RLS aktiviert ist
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Zusätzlich: Policy für Updates
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);
