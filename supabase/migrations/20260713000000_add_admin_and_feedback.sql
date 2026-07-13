-- =======================================================
-- Migration: Add Profile Roles and User Feedbacks (Avis)
-- =======================================================

-- 1. Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Create Feedbacks Table
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS (Row Level Security)
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Feedbacks Table

-- Policy: Anyone (both anonymous and authenticated) can insert feedback
CREATE POLICY "Anyone can insert feedbacks" 
ON public.feedbacks 
FOR INSERT 
WITH CHECK (true);

-- Policy: Only admin profiles can view all feedbacks
CREATE POLICY "Admins can view all feedbacks" 
ON public.feedbacks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 5. Additional Policies for Profiles Table (Admin access)

-- Policy: Allow admins to view all profiles (for the admin dashboard list)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 6. Correction des valeurs NULL de auth.users locaux qui font planter GoTrue
UPDATE auth.users 
SET confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    phone = COALESCE(phone, '');
