-- Ensure new auth users automatically get a profile + default 'user' role via public.handle_new_user()
-- 1) Remove any existing trigger to avoid duplicates
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2) Create the trigger that calls our SECURITY DEFINER function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();