-- Schritt 1: Füge die role Spalte zur profiles Tabelle hinzu
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'resident';

-- Schritt 2: Update den User auf supervisor role
UPDATE public.profiles 
SET role = 'supervisor'
WHERE user_id = '2f6311eb-8c68-4925-82e0-ea3a249ee129';

-- Schritt 3: Verifiziere das Update
SELECT user_id, full_name, email, role, pgy_level 
FROM public.profiles 
WHERE user_id = '2f6311eb-8c68-4925-82e0-ea3a249ee129';
