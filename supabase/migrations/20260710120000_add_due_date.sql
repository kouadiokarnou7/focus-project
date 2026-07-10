-- Add due_date / start reminder column to tasks table if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'tasks' 
      AND column_name = 'due_date'
  ) THEN
    ALTER TABLE public.tasks ADD COLUMN due_date TIMESTAMPTZ;
  END IF;
END $$;
