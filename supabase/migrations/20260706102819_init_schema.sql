-- ==========================================
-- FocusFlow Supabase Schema & RLS Policies
-- ==========================================

-- 1. Create Profiles Table (Linked to Auth Users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  streak INTEGER DEFAULT 0,
  completed_sessions_today INTEGER DEFAULT 0,
  total_focus_time_today INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Columns Table (Customizable Kanban Columns)
CREATE TABLE public.columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Tasks Table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'development',
  priority TEXT DEFAULT 'medium',
  estimated_pomodoros INTEGER DEFAULT 1,
  completed_pomodoros INTEGER DEFAULT 0,
  status TEXT NOT NULL, -- This links to the custom column IDs
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- Row Level Security (RLS) Policies
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Columns: Users can only CRUD their own columns
CREATE POLICY "Users can view own columns" ON public.columns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own columns" ON public.columns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own columns" ON public.columns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own columns" ON public.columns FOR DELETE USING (auth.uid() = user_id);

-- Tasks: Users can only CRUD their own tasks
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- Trigger: Auto-create Profile on Signup
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);

  -- Insert default columns for the new user
  INSERT INTO public.columns (user_id, title, position) VALUES 
    (new.id, 'À Faire', 0),
    (new.id, 'En Cours', 1),
    (new.id, 'Terminées', 2);
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
