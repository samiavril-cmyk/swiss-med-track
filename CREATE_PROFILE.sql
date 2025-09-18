-- Create profile for user 8b02ffe9-7d51-43d3-8e75-17191df46588
INSERT INTO public.profiles (
  user_id,
  email,
  full_name,
  role,
  pgy_level,
  department,
  hospital,
  created_at,
  updated_at
) VALUES (
  '8b02ffe9-7d51-43d3-8e75-17191df46588',
  'samiavril@gmail.com',
  'Sami Avril',
  'admin',
  5,
  'Chirurgie',
  'Universitätsspital Zürich',
  NOW(),
  NOW()
);
