-- Function to handle new user signup
-- Runs with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role app_role;
BEGIN
  -- Get role from user metadata, default to viewer if not specified
  _role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'viewer'
  );
  
  -- Insert the user role
  INSERT INTO public.user_roles (user_id, role, display_name)
  VALUES (
    NEW.id,
    _role,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Role already exists, skip
    RETURN NEW;
END;
$$;

-- Trigger that fires after a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();