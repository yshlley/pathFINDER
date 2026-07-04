
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  requested_role app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, section, current_status, location_region, location_province, location_city)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'section',
    NEW.raw_user_meta_data->>'current_status',
    NEW.raw_user_meta_data->>'location_region',
    NEW.raw_user_meta_data->>'location_province',
    NEW.raw_user_meta_data->>'location_city'
  );

  -- Bootstrap admin: first signup using the reserved email gets admin role
  IF NEW.email = 'admin@pathfinder.local' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;

  requested_role := NULLIF(NEW.raw_user_meta_data->>'requested_role', '')::app_role;

  -- Everyone also gets student baseline unless they requested counselor and it's them-only
  IF requested_role = 'counselor' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'counselor') ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
