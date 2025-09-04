-- Sample Data for Supervisor System
-- Create example supervisors, residents, and procedure data

-- Insert sample supervisors
INSERT INTO public.profiles (user_id, full_name, email, role, department, hospital, pgy_level, is_public, public_fields) VALUES
-- Supervisor 1: Jose
('11111111-1111-1111-1111-111111111111', 'Dr. Jose Martinez', 'jose.martinez@hospital.ch', 'supervisor', 'Allgemeinchirurgie', 'Universitätsspital Zürich', 10, true, '{"courses": true, "awards": true, "publications": true, "procedures": false}'),

-- Supervisor 2: Matthias
('22222222-2222-2222-2222-222222222222', 'Prof. Dr. Matthias Weber', 'matthias.weber@hospital.ch', 'supervisor', 'Traumatologie', 'Universitätsspital Basel', 12, true, '{"courses": true, "awards": true, "publications": true, "procedures": false}');

-- Insert sample residents
INSERT INTO public.profiles (user_id, full_name, email, role, department, hospital, pgy_level, supervisor_id, is_public, public_fields) VALUES
-- Jose's Team (Allgemeinchirurgie)
('33333333-3333-3333-3333-333333333333', 'Dr. Anna Schmidt', 'anna.schmidt@hospital.ch', 'resident', 'Allgemeinchirurgie', 'Universitätsspital Zürich', 3, '11111111-1111-1111-1111-111111111111', true, '{"courses": true, "awards": true, "publications": true, "procedures": true}'),
('44444444-4444-4444-4444-444444444444', 'Dr. Michael Müller', 'michael.mueller@hospital.ch', 'resident', 'Allgemeinchirurgie', 'Universitätsspital Zürich', 4, '11111111-1111-1111-1111-111111111111', true, '{"courses": true, "awards": true, "publications": true, "procedures": true}'),
('55555555-5555-5555-5555-555555555555', 'Dr. Sarah Johnson', 'sarah.johnson@hospital.ch', 'resident', 'Allgemeinchirurgie', 'Universitätsspital Zürich', 2, '11111111-1111-1111-1111-111111111111', true, '{"courses": true, "awards": true, "publications": true, "procedures": true}'),
('66666666-6666-6666-6666-666666666666', 'Dr. Thomas Brown', 'thomas.brown@hospital.ch', 'resident', 'Allgemeinchirurgie', 'Universitätsspital Zürich', 5, '11111111-1111-1111-1111-111111111111', true, '{"courses": true, "awards": true, "publications": true, "procedures": true}'),
('77777777-7777-7777-7777-777777777777', 'Dr. Lisa Garcia', 'lisa.garcia@hospital.ch', 'resident', 'Allgemeinchirurgie', 'Universitätsspital Zürich', 3, '11111111-1111-1111-1111-111111111111', true, '{"courses": true, "awards": true, "publications": true, "procedures": true}'),

-- Matthias's Team (Traumatologie)
('88888888-8888-8888-8888-888888888888', 'Dr. David Wilson', 'david.wilson@hospital.ch', 'resident', 'Traumatologie', 'Universitätsspital Basel', 4, '22222222-2222-2222-2222-222222222222', true, '{"courses": true, "awards": true, "publications": true, "procedures": true}'),
('99999999-9999-9999-9999-999999999999', 'Dr. Emma Davis', 'emma.davis@hospital.ch', 'resident', 'Traumatologie', 'Universitätsspital Basel', 2, '22222222-2222-2222-2222-222222222222', true, '{"courses": true, "awards": true, "publications": true, "procedures": true}'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dr. James Miller', 'james.miller@hospital.ch', 'resident', 'Traumatologie', 'Universitätsspital Basel', 3, '22222222-2222-2222-2222-222222222222', true, '{"courses": true, "awards": true, "publications": true, "procedures": true}'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Dr. Maria Rodriguez', 'maria.rodriguez@hospital.ch', 'resident', 'Traumatologie', 'Universitätsspital Basel', 5, '22222222-2222-2222-2222-222222222222', true, '{"courses": true, "awards": true, "publications": true, "procedures": true}'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Dr. Robert Taylor', 'robert.taylor@hospital.ch', 'resident', 'Traumatologie', 'Universitätsspital Basel', 1, '22222222-2222-2222-2222-222222222222', true, '{"courses": true, "awards": true, "publications": true, "procedures": true}');

-- Create sample teams
INSERT INTO public.supervisor_teams (supervisor_id, team_name, department, hospital, description) VALUES
('11111111-1111-1111-1111-111111111111', 'Allgemeinchirurgie Team A', 'Allgemeinchirurgie', 'Universitätsspital Zürich', 'Erfahrenes Team für komplexe abdominale Eingriffe'),
('22222222-2222-2222-2222-222222222222', 'Traumatologie Team B', 'Traumatologie', 'Universitätsspital Basel', 'Spezialisiert auf Unfallchirurgie und Frakturbehandlung');

-- Get team IDs for member assignment
DO $$
DECLARE
    team1_id UUID;
    team2_id UUID;
BEGIN
    SELECT id INTO team1_id FROM public.supervisor_teams WHERE team_name = 'Allgemeinchirurgie Team A';
    SELECT id INTO team2_id FROM public.supervisor_teams WHERE team_name = 'Traumatologie Team B';
    
    -- Add residents to Jose's team
    INSERT INTO public.team_members (team_id, resident_id, notes) VALUES
    (team1_id, '33333333-3333-3333-3333-333333333333', 'Sehr motiviert, gute technische Fähigkeiten'),
    (team1_id, '44444444-4444-4444-4444-444444444444', 'Erfahren in laparoskopischen Eingriffen'),
    (team1_id, '55555555-5555-5555-5555-555555555555', 'Starke Kommunikationsfähigkeiten'),
    (team1_id, '66666666-6666-6666-6666-666666666666', 'Senior Resident, bereit für komplexe Fälle'),
    (team1_id, '77777777-7777-7777-7777-777777777777', 'Gute Teamplayerin, zuverlässig');
    
    -- Add residents to Matthias's team
    INSERT INTO public.team_members (team_id, resident_id, notes) VALUES
    (team2_id, '88888888-8888-8888-8888-888888888888', 'Spezialist für Beckenfrakturen'),
    (team2_id, '99999999-9999-9999-9999-999999999999', 'Begabt in der Arthroskopie'),
    (team2_id, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Starke anatomische Kenntnisse'),
    (team2_id, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Erfahren in der Notfallchirurgie'),
    (team2_id, 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Neuer Resident, vielversprechend');
END $$;

-- Create sample procedure logs for 2023-2025
-- First, get some procedure IDs to work with
DO $$
DECLARE
    proc1_id UUID;
    proc2_id UUID;
    proc3_id UUID;
    proc4_id UUID;
    proc5_id UUID;
    proc6_id UUID;
    proc7_id UUID;
    proc8_id UUID;
    proc9_id UUID;
    proc10_id UUID;
    resident_id UUID;
    i INTEGER;
    j INTEGER;
    procedure_date DATE;
    role_choice TEXT;
    roles TEXT[] := ARRAY['primary', 'responsible', 'instructing', 'assistant', 'assist'];
BEGIN
    -- Get procedure IDs (assuming these exist from previous migrations)
    SELECT id INTO proc1_id FROM public.procedures WHERE code = 'BA001' LIMIT 1;
    SELECT id INTO proc2_id FROM public.procedures WHERE code = 'BA002' LIMIT 1;
    SELECT id INTO proc3_id FROM public.procedures WHERE code = 'BA003' LIMIT 1;
    SELECT id INTO proc4_id FROM public.procedures WHERE code = 'BA004' LIMIT 1;
    SELECT id INTO proc5_id FROM public.procedures WHERE code = 'BA005' LIMIT 1;
    SELECT id INTO proc6_id FROM public.procedures WHERE code = 'MT001' LIMIT 1;
    SELECT id INTO proc7_id FROM public.procedures WHERE code = 'MT002' LIMIT 1;
    SELECT id INTO proc8_id FROM public.procedures WHERE code = 'MT003' LIMIT 1;
    SELECT id INTO proc9_id FROM public.procedures WHERE code = 'MT004' LIMIT 1;
    SELECT id INTO proc10_id FROM public.procedures WHERE code = 'MT005' LIMIT 1;
    
    -- If procedures don't exist, create some basic ones
    IF proc1_id IS NULL THEN
        -- Get category IDs first
        DECLARE
            basis_cat_id UUID;
            trauma_cat_id UUID;
        BEGIN
            SELECT id INTO basis_cat_id FROM public.procedure_categories WHERE key = 'basis_allgemeinchirurgie' LIMIT 1;
            SELECT id INTO trauma_cat_id FROM public.procedure_categories WHERE key = 'traumatologie' LIMIT 1;
            
            -- Insert basic procedures if they don't exist
            INSERT INTO public.procedures (code, title_de, category_id, min_required_by_pgy, active) VALUES
            ('BA001', 'Kleinchirurgische Eingriffe', basis_cat_id, '{"pgy1": 5, "pgy2": 10, "pgy3": 15, "pgy4": 20, "pgy5": 25}', true),
            ('BA002', 'Appendektomie', basis_cat_id, '{"pgy1": 2, "pgy2": 5, "pgy3": 8, "pgy4": 12, "pgy5": 15}', true),
            ('BA003', 'Cholezystektomie', basis_cat_id, '{"pgy1": 1, "pgy2": 3, "pgy3": 5, "pgy4": 8, "pgy5": 10}', true),
            ('BA004', 'Hernienoperationen', basis_cat_id, '{"pgy1": 2, "pgy2": 4, "pgy3": 6, "pgy4": 8, "pgy5": 10}', true),
            ('BA005', 'Dünndarmeingriffe', basis_cat_id, '{"pgy1": 1, "pgy2": 2, "pgy3": 3, "pgy4": 4, "pgy5": 5}', true),
            ('MT001', 'Metallentfernungen', trauma_cat_id, '{"pgy1": 3, "pgy2": 6, "pgy3": 9, "pgy4": 12, "pgy5": 15}', true),
            ('MT002', 'Reposition Frakturen', trauma_cat_id, '{"pgy1": 2, "pgy2": 4, "pgy3": 6, "pgy4": 8, "pgy5": 10}', true),
            ('MT003', 'Sehnen/Ligament Eingriffe', trauma_cat_id, '{"pgy1": 1, "pgy2": 2, "pgy3": 3, "pgy4": 4, "pgy5": 5}', true),
            ('MT004', 'Arthroskopie', trauma_cat_id, '{"pgy1": 1, "pgy2": 2, "pgy3": 3, "pgy4": 4, "pgy5": 5}', true),
            ('MT005', 'Osteosynthese Schaftfrakturen', trauma_cat_id, '{"pgy1": 1, "pgy2": 2, "pgy3": 3, "pgy4": 4, "pgy5": 5}', true)
            ON CONFLICT (code) DO NOTHING;
            
            -- Get the IDs again
            SELECT id INTO proc1_id FROM public.procedures WHERE code = 'BA001' LIMIT 1;
            SELECT id INTO proc2_id FROM public.procedures WHERE code = 'BA002' LIMIT 1;
            SELECT id INTO proc3_id FROM public.procedures WHERE code = 'BA003' LIMIT 1;
            SELECT id INTO proc4_id FROM public.procedures WHERE code = 'BA004' LIMIT 1;
            SELECT id INTO proc5_id FROM public.procedures WHERE code = 'BA005' LIMIT 1;
            SELECT id INTO proc6_id FROM public.procedures WHERE code = 'MT001' LIMIT 1;
            SELECT id INTO proc7_id FROM public.procedures WHERE code = 'MT002' LIMIT 1;
            SELECT id INTO proc8_id FROM public.procedures WHERE code = 'MT003' LIMIT 1;
            SELECT id INTO proc9_id FROM public.procedures WHERE code = 'MT004' LIMIT 1;
            SELECT id INTO proc10_id FROM public.procedures WHERE code = 'MT005' LIMIT 1;
        END;
    END IF;
    
    -- Generate procedure logs for each resident for 2023-2025
    FOR resident_id IN 
        SELECT user_id FROM public.profiles WHERE role = 'resident'
    LOOP
        -- Generate 20-50 procedures per resident over 3 years
        FOR i IN 1..(20 + (random() * 30)::INTEGER) LOOP
            -- Random date between 2023-01-01 and 2025-12-31
            procedure_date := '2023-01-01'::DATE + (random() * 1095)::INTEGER;
            
            -- Random procedure (mix of general and trauma procedures)
            j := (random() * 9)::INTEGER + 1;
            
            -- Random role
            role_choice := roles[(random() * array_length(roles, 1))::INTEGER + 1];
            
            -- Insert procedure log
            INSERT INTO public.procedure_logs (user_id, procedure_id, performed_date, role_in_surgery, notes) VALUES
            (resident_id, 
             CASE j
                 WHEN 1 THEN proc1_id
                 WHEN 2 THEN proc2_id
                 WHEN 3 THEN proc3_id
                 WHEN 4 THEN proc4_id
                 WHEN 5 THEN proc5_id
                 WHEN 6 THEN proc6_id
                 WHEN 7 THEN proc7_id
                 WHEN 8 THEN proc8_id
                 WHEN 9 THEN proc9_id
                 WHEN 10 THEN proc10_id
             END,
             procedure_date,
             role_choice,
             'Sample procedure log entry for testing supervisor system');
        END LOOP;
    END LOOP;
END $$;

-- Create some sample supervisor reports
INSERT INTO public.supervisor_reports (supervisor_id, resident_id, report_period_start, report_period_end, total_procedures, procedures_by_module, progress_summary, recommendations, supervisor_notes) VALUES
-- Jose's reports for his residents
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '2024-01-01', '2024-06-30', 45, '{"basis_allgemeinchirurgie": 30, "viszeralchirurgie": 15}', '{"overall_progress": 85, "strengths": ["Laparoskopie", "Teamarbeit"], "areas_for_improvement": ["Komplexe Fälle"]}', 'Weiterhin gute Fortschritte. Fokus auf komplexere abdominale Eingriffe.', 'Anna zeigt sehr gute technische Fähigkeiten und ist bereit für anspruchsvollere Fälle.'),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '2024-01-01', '2024-06-30', 52, '{"basis_allgemeinchirurgie": 35, "viszeralchirurgie": 17}', '{"overall_progress": 92, "strengths": ["Laparoskopie", "Führung"], "areas_for_improvement": ["Dokumentation"]}', 'Exzellente Leistung. Bereit für Senior-Level Verantwortung.', 'Michael ist ein natürlicher Führer und technisch sehr versiert.'),
('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', '2024-01-01', '2024-06-30', 28, '{"basis_allgemeinchirurgie": 20, "viszeralchirurgie": 8}', '{"overall_progress": 65, "strengths": ["Kommunikation", "Patientenbetreuung"], "areas_for_improvement": ["Technische Fähigkeiten"]}', 'Gute Fortschritte. Mehr Fokus auf technische Perfektion.', 'Sarah hat ausgezeichnete Kommunikationsfähigkeiten, sollte mehr operative Erfahrung sammeln.'),

-- Matthias's reports for his residents
('22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888888', '2024-01-01', '2024-06-30', 48, '{"traumatologie": 35, "basis_notfallchirurgie": 13}', '{"overall_progress": 88, "strengths": ["Frakturen", "Notfallmanagement"], "areas_for_improvement": ["Arthroskopie"]}', 'Sehr gute Leistung in der Traumatologie. Arthroskopische Fähigkeiten ausbauen.', 'David ist ein Experte für Frakturbehandlung und zeigt ausgezeichnete Notfallkompetenz.'),
('22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999', '2024-01-01', '2024-06-30', 35, '{"traumatologie": 25, "basis_notfallchirurgie": 10}', '{"overall_progress": 78, "strengths": ["Arthroskopie", "Anatomie"], "areas_for_improvement": ["Komplexe Frakturen"]}', 'Gute Fortschritte. Mehr Erfahrung mit komplexen Frakturen sammeln.', 'Emma zeigt besondere Begabung in der Arthroskopie und hat sehr gute anatomische Kenntnisse.'),
('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-01', '2024-06-30', 42, '{"traumatologie": 30, "basis_notfallchirurgie": 12}', '{"overall_progress": 82, "strengths": ["Anatomie", "Technische Präzision"], "areas_for_improvement": ["Führung"]}', 'Solide Leistung. Führungsqualitäten entwickeln.', 'James ist technisch sehr präzise und hat ausgezeichnete anatomische Kenntnisse.');

-- Update team member counts
UPDATE public.supervisor_teams SET 
    member_count = (
        SELECT COUNT(*) 
        FROM public.team_members 
        WHERE team_id = supervisor_teams.id AND status = 'active'
    );
