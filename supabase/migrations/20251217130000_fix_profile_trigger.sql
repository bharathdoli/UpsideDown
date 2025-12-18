-- Fix the handle_new_user trigger to ensure it works properly
-- This ensures the trigger can insert even if RLS is enabled

-- Drop and recreate the function with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name text;
  v_college text;
  v_branch text;
BEGIN
  v_full_name := COALESCE(new.raw_user_meta_data ->> 'full_name', 'User');
  v_college := new.raw_user_meta_data ->> 'college';
  v_branch := new.raw_user_meta_data ->> 'branch';

  INSERT INTO public.profiles (user_id, full_name, college, branch)
  VALUES (new.id, v_full_name, v_college, v_branch)
  ON CONFLICT (user_id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        college = EXCLUDED.college,
        branch = EXCLUDED.branch;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth user creation
    RAISE WARNING 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

