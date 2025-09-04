-- Prüfe die erlaubten Rollen in der Check Constraint
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname = 'profiles_role_check';

-- Alternative: Prüfe alle Constraints auf der profiles Tabelle
SELECT 
    conname AS constraint_name,
    consrc AS constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'profiles' AND contype = 'c';
