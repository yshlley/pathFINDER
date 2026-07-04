
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('student', 'counselor', 'admin');
CREATE TYPE public.correction_status AS ENUM ('pending', 'approved', 'rejected');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  section TEXT,
  current_status TEXT,
  location_region TEXT,
  location_province TEXT,
  location_city TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Profiles policies
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'counselor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete profile" ON public.profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = id);

-- User roles policies
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'counselor'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ INTAKE RESPONSES ============
CREATE TABLE public.intake_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_status TEXT NOT NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',
  skills_other TEXT,
  hobbies TEXT[] NOT NULL DEFAULT '{}',
  hobbies_other TEXT,
  next_step TEXT NOT NULL,
  target_field TEXT NOT NULL,
  target_field_other TEXT,
  mode TEXT NOT NULL,
  budget TEXT NOT NULL,
  location_region TEXT,
  location_province TEXT,
  location_city TEXT,
  location_other TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.intake_responses TO authenticated;
GRANT ALL ON public.intake_responses TO service_role;
ALTER TABLE public.intake_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own intakes" ON public.intake_responses FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'counselor') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id);

-- ============ SAVED PLANS ============
CREATE TABLE public.saved_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intake_id UUID REFERENCES public.intake_responses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_plans TO authenticated;
GRANT ALL ON public.saved_plans TO service_role;
ALTER TABLE public.saved_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own plans" ON public.saved_plans FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'counselor') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id);

-- ============ SCHOOLS ============
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  region TEXT,
  city TEXT,
  tuition_min INT,
  tuition_max INT,
  accreditation TEXT,
  programs TEXT[] NOT NULL DEFAULT '{}',
  scholarships_available BOOLEAN NOT NULL DEFAULT false,
  pros TEXT,
  cons TEXT,
  fields TEXT[] NOT NULL DEFAULT '{}',
  source_url TEXT,
  last_verified DATE,
  valid_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.schools TO authenticated, anon;
GRANT ALL ON public.schools TO service_role;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads schools" ON public.schools FOR SELECT USING (true);
CREATE POLICY "Admins manage schools" ON public.schools FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ SCHOLARSHIPS ============
CREATE TABLE public.scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  eligibility TEXT,
  amount TEXT,
  application_window TEXT,
  deadline DATE,
  fields TEXT[] NOT NULL DEFAULT '{}',
  regions TEXT[] NOT NULL DEFAULT '{}',
  source_url TEXT,
  last_verified DATE,
  valid_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.scholarships TO authenticated, anon;
GRANT ALL ON public.scholarships TO service_role;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads scholarships" ON public.scholarships FOR SELECT USING (true);
CREATE POLICY "Admins manage scholarships" ON public.scholarships FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ CAREERS ============
CREATE TABLE public.careers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  field TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  typical_path TEXT,
  starting_salary_min INT,
  starting_salary_max INT,
  mid_salary_min INT,
  mid_salary_max INT,
  source_url TEXT,
  last_verified DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.careers TO authenticated, anon;
GRANT ALL ON public.careers TO service_role;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads careers" ON public.careers FOR SELECT USING (true);
CREATE POLICY "Admins manage careers" ON public.careers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ DATA CORRECTIONS ============
CREATE TABLE public.data_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  message TEXT NOT NULL,
  status correction_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.data_corrections TO authenticated;
GRANT ALL ON public.data_corrections TO service_role;
ALTER TABLE public.data_corrections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert corrections" ON public.data_corrections FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own corrections" ON public.data_corrections FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'counselor'));
CREATE POLICY "Admins update corrections" ON public.data_corrections FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ AUDIT LOG ============
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id UUID,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own audit" ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read audit" ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ SIGNUP TRIGGER ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger for profiles
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
