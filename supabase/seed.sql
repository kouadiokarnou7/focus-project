-- ==========================================
-- seed.sql : Seed Data for pomoBEAK Local Dev
-- ==========================================

-- 1. Insert seed users into auth.users (local development only)
-- We use fixed UUIDs so that they remain consistent.
-- Passwords are set to "password123" (hashed using bcrypt)

-- Utilisateur Admin: admin@pomobeak.com
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, phone)
VALUES (
  'a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6',
  '00000000-0000-0000-0000-000000000000',
  'admin@pomobeak.com',
  '$2a$10$tZ2c6XvXq3zZ4oD6Y1BvOeJ7e3L6S5K/m.w1fP4mUu1bC2WJ.bJ1G', -- "password123"
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin pomoBEAK"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '', -- confirmation_token
  '', -- recovery_token
  '', -- email_change_token_new
  '', -- email_change
  '', -- email_change_token_current
  '', -- phone_change
  '', -- phone_change_token
  ''  -- phone
) ON CONFLICT (id) DO NOTHING;

-- Utilisateur Classique 1: user1@pomobeak.com
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, phone)
VALUES (
  'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  '00000000-0000-0000-0000-000000000000',
  'user1@pomobeak.com',
  '$2a$10$tZ2c6XvXq3zZ4oD6Y1BvOeJ7e3L6S5K/m.w1fP4mUu1bC2WJ.bJ1G',
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Jean Dupont"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '', -- confirmation_token
  '', -- recovery_token
  '', -- email_change_token_new
  '', -- email_change
  '', -- email_change_token_current
  '', -- phone_change
  '', -- phone_change_token
  ''  -- phone
) ON CONFLICT (id) DO NOTHING;

-- Utilisateur Classique 2: user2@pomobeak.com
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, phone)
VALUES (
  'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
  '00000000-0000-0000-0000-000000000000',
  'user2@pomobeak.com',
  '$2a$10$tZ2c6XvXq3zZ4oD6Y1BvOeJ7e3L6S5K/m.w1fP4mUu1bC2WJ.bJ1G',
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Alice Martin"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '', -- confirmation_token
  '', -- recovery_token
  '', -- email_change_token_new
  '', -- email_change
  '', -- email_change_token_current
  '', -- phone_change
  '', -- phone_change_token
  ''  -- phone
) ON CONFLICT (id) DO NOTHING;

-- 2. Update user profiles (created automatically by triggers on user signup)
-- Set admin role for the admin user
UPDATE public.profiles 
SET role = 'admin', streak = 12, completed_sessions_today = 4, total_focus_time_today = 7200
WHERE id = 'a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6';

-- Set stats for regular user 1
UPDATE public.profiles 
SET streak = 5, completed_sessions_today = 2, total_focus_time_today = 3000
WHERE id = 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e';

-- Set stats for regular user 2
UPDATE public.profiles 
SET streak = 8, completed_sessions_today = 5, total_focus_time_today = 9000
WHERE id = 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f';

-- 3. Seed some tasks for the users
-- Tasks for Admin
INSERT INTO public.tasks (user_id, name, description, priority, estimated_pomodoros, completed_pomodoros, status) VALUES
  ('a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6', 'Refonte des paramètres', 'Ajouter des onglets et la gestion audio avancée', 'high', 4, 2, 'todo'),
  ('a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6', 'Créer base de données avis', 'Créer la migration pour public.feedbacks', 'medium', 2, 2, 'completed');

-- Tasks for User 1
INSERT INTO public.tasks (user_id, name, description, priority, estimated_pomodoros, completed_pomodoros, status) VALUES
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Etudier le design system', 'Parcourir les règles CSS globales', 'low', 1, 0, 'todo'),
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Développer widget stats', 'Créer le graphique hebdo', 'high', 5, 3, 'in_progress');

-- 4. Seed some feedbacks (Avis utilisateurs)
INSERT INTO public.feedbacks (user_id, rating, comment, created_at) VALUES
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 5, 'Super application ! Les animations de minuteurs sont très fluides et la responsivité est parfaite.', NOW() - INTERVAL '2 days'),
  ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 4, 'Très bon compagnon de focus. Le mode Zen permet de bien se concentrer sans distractions.', NOW() - INTERVAL '1 day'),
  (NULL, 3, 'L''application est cool, mais j''aimerais avoir plus de choix de musiques d''ambiance.', NOW() - INTERVAL '12 hours');
