
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('administrator', 'researcher', 'officer');
CREATE TYPE public.conservation_status AS ENUM ('LC','NT','VU','EN','CR','EW','EX','DD');
CREATE TYPE public.survey_status AS ENUM ('planned','in_progress','completed','archived');
CREATE TYPE public.threat_level AS ENUM ('low','moderate','elevated','critical');
CREATE TYPE public.habitat_status AS ENUM ('optimal','stable','caution','degraded','critical');

-- ============ UPDATED_AT TRIGGER ============
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Field Researcher',
  organization TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "roles readable to authenticated" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'administrator'))
  WITH CHECK (public.has_role(auth.uid(),'administrator'));

-- ============ HANDLE NEW USER: auto profile + default researcher role ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles(id, full_name, organization)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
          NEW.raw_user_meta_data->>'organization');
  INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'researcher');
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ PROTECTED AREAS ============
CREATE TABLE public.protected_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  region TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  area_hectares NUMERIC(12,2) NOT NULL DEFAULT 0,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  designation TEXT,
  established_year INT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.protected_areas TO authenticated;
GRANT ALL ON public.protected_areas TO service_role;
ALTER TABLE public.protected_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PA read all authed" ON public.protected_areas FOR SELECT TO authenticated USING (true);
CREATE POLICY "PA admin write" ON public.protected_areas FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'administrator'))
  WITH CHECK (public.has_role(auth.uid(),'administrator'));
CREATE TRIGGER pa_updated BEFORE UPDATE ON public.protected_areas FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ SPECIES ============
CREATE TABLE public.species (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  common_name TEXT NOT NULL,
  scientific_name TEXT NOT NULL UNIQUE,
  family TEXT,
  conservation_status public.conservation_status NOT NULL DEFAULT 'LC',
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.species TO authenticated;
GRANT ALL ON public.species TO service_role;
ALTER TABLE public.species ENABLE ROW LEVEL SECURITY;
CREATE POLICY "species read" ON public.species FOR SELECT TO authenticated USING (true);
CREATE POLICY "species admin write" ON public.species FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'administrator'))
  WITH CHECK (public.has_role(auth.uid(),'administrator'));
CREATE TRIGGER species_updated BEFORE UPDATE ON public.species FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ SURVEYS ============
CREATE TABLE public.surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  researcher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  protected_area_id UUID REFERENCES public.protected_areas(id) ON DELETE SET NULL,
  survey_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status public.survey_status NOT NULL DEFAULT 'planned',
  notes TEXT,
  weather TEXT,
  team_size INT DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.surveys TO authenticated;
GRANT ALL ON public.surveys TO service_role;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "surveys read" ON public.surveys FOR SELECT TO authenticated USING (true);
CREATE POLICY "surveys insert own" ON public.surveys FOR INSERT TO authenticated WITH CHECK (auth.uid() = researcher_id);
CREATE POLICY "surveys update own or admin" ON public.surveys FOR UPDATE TO authenticated
  USING (auth.uid() = researcher_id OR public.has_role(auth.uid(),'administrator'));
CREATE POLICY "surveys delete own or admin" ON public.surveys FOR DELETE TO authenticated
  USING (auth.uid() = researcher_id OR public.has_role(auth.uid(),'administrator'));
CREATE TRIGGER surveys_updated BEFORE UPDATE ON public.surveys FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ SURVEY IMAGES ============
CREATE TABLE public.survey_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  caption TEXT,
  captured_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.survey_images TO authenticated;
GRANT ALL ON public.survey_images TO service_role;
ALTER TABLE public.survey_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "images read" ON public.survey_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "images write own survey" ON public.survey_images FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.surveys s WHERE s.id = survey_id AND (s.researcher_id = auth.uid() OR public.has_role(auth.uid(),'administrator'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.surveys s WHERE s.id = survey_id AND s.researcher_id = auth.uid()));

-- ============ SURVEY AUDIO ============
CREATE TABLE public.survey_audio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  caption TEXT,
  duration_seconds INT,
  captured_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.survey_audio TO authenticated;
GRANT ALL ON public.survey_audio TO service_role;
ALTER TABLE public.survey_audio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audio read" ON public.survey_audio FOR SELECT TO authenticated USING (true);
CREATE POLICY "audio write own survey" ON public.survey_audio FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.surveys s WHERE s.id = survey_id AND (s.researcher_id = auth.uid() OR public.has_role(auth.uid(),'administrator'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.surveys s WHERE s.id = survey_id AND s.researcher_id = auth.uid()));

-- ============ IMAGE DETECTIONS (AI) ============
CREATE TABLE public.image_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID NOT NULL REFERENCES public.survey_images(id) ON DELETE CASCADE,
  species_id UUID REFERENCES public.species(id) ON DELETE SET NULL,
  species_label TEXT NOT NULL,
  confidence NUMERIC(5,4) NOT NULL,
  bbox_x NUMERIC(6,4), bbox_y NUMERIC(6,4), bbox_w NUMERIC(6,4), bbox_h NUMERIC(6,4),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.image_detections TO authenticated;
GRANT ALL ON public.image_detections TO service_role;
ALTER TABLE public.image_detections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "img detections read" ON public.image_detections FOR SELECT TO authenticated USING (true);
CREATE POLICY "img detections write authed" ON public.image_detections FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ============ AUDIO DETECTIONS (AI) ============
CREATE TABLE public.audio_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id UUID NOT NULL REFERENCES public.survey_audio(id) ON DELETE CASCADE,
  species_id UUID REFERENCES public.species(id) ON DELETE SET NULL,
  species_label TEXT NOT NULL,
  confidence NUMERIC(5,4) NOT NULL,
  start_seconds NUMERIC(8,2), end_seconds NUMERIC(8,2),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audio_detections TO authenticated;
GRANT ALL ON public.audio_detections TO service_role;
ALTER TABLE public.audio_detections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aud detections read" ON public.audio_detections FOR SELECT TO authenticated USING (true);
CREATE POLICY "aud detections write authed" ON public.audio_detections FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ============ POPULATION STATISTICS ============
CREATE TABLE public.population_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id UUID NOT NULL REFERENCES public.species(id) ON DELETE CASCADE,
  protected_area_id UUID REFERENCES public.protected_areas(id) ON DELETE SET NULL,
  observed_count INT NOT NULL DEFAULT 0,
  estimated_count INT NOT NULL DEFAULT 0,
  observation_year INT NOT NULL,
  observation_month INT NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.population_statistics TO authenticated;
GRANT ALL ON public.population_statistics TO service_role;
ALTER TABLE public.population_statistics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "popstats read" ON public.population_statistics FOR SELECT TO authenticated USING (true);
CREATE POLICY "popstats write authed" ON public.population_statistics FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ============ HABITAT HEALTH ============
CREATE TABLE public.habitat_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protected_area_id UUID NOT NULL REFERENCES public.protected_areas(id) ON DELETE CASCADE,
  status public.habitat_status NOT NULL DEFAULT 'stable',
  vegetation_index NUMERIC(5,2) NOT NULL DEFAULT 0,
  conservation_score INT NOT NULL DEFAULT 0,
  temperature_c NUMERIC(5,2),
  rainfall_mm NUMERIC(6,2),
  notes TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habitat_health TO authenticated;
GRANT ALL ON public.habitat_health TO service_role;
ALTER TABLE public.habitat_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hab read" ON public.habitat_health FOR SELECT TO authenticated USING (true);
CREATE POLICY "hab write authed" ON public.habitat_health FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ============ REPORTS ============
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  report_type TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports read" ON public.reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "reports insert own" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "reports delete own or admin" ON public.reports FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(),'administrator'));

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif read own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif update own" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif insert authed" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "notif delete own" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());
