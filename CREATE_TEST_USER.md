# 🔧 Test User erstellen - Schnelle Lösung

## Problem
Die Sample-User aus der Migration existieren noch nicht in der Datenbank.

## Lösung: Test User direkt erstellen

### Option 1: Über Supabase Dashboard
1. Gehe zu: https://supabase.com/dashboard
2. Wähle dein Projekt
3. Gehe zu "Authentication" → "Users"
4. Klicke "Add user"
5. Erstelle einen User:
   ```
   Email: jose.obermann@hospital.ch
   Password: password123
   ```

### Option 2: Über die App (Registrierung)
1. Gehe zu: https://samiavril-cmyk.github.io/swiss-med-track/auth
2. Klicke auf "Registrieren"
3. Erstelle einen Account:
   ```
   Email: jose.obermann@hospital.ch
   Password: password123
   ```

### Option 3: SQL direkt ausführen
Führe diese SQL in Supabase SQL Editor aus:

```sql
-- Erstelle Test User
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'jose.obermann@hospital.ch',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Dr. Jose Obermann"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Erstelle Profile
INSERT INTO public.profiles (user_id, full_name, email, role, department, hospital, pgy_level, is_public, public_fields) VALUES
('11111111-1111-1111-1111-111111111111', 'Dr. Jose Obermann', 'jose.obermann@hospital.ch', 'supervisor', 'Allgemeinchirurgie', 'Universitätsspital Zürich', 10, true, '{"courses": true, "awards": true, "publications": true, "procedures": false}');
```

## Nach dem Erstellen
1. Teste den Login: https://samiavril-cmyk.github.io/swiss-med-track/auth
2. Du solltest den "Supervisor" Link im Header sehen
3. Klicke darauf → Supervisor Dashboard

## Falls immer noch Probleme
- Prüfe die Browser-Konsole auf Fehler
- Stelle sicher, dass Supabase richtig konfiguriert ist
- Teste mit einem anderen Browser/Incognito-Modus
