
ALTER TYPE public.survey_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE public.survey_status ADD VALUE IF NOT EXISTS 'active';
ALTER TYPE public.survey_status ADD VALUE IF NOT EXISTS 'cancelled';

ALTER TABLE public.surveys
  ADD COLUMN IF NOT EXISTS survey_time time,
  ADD COLUMN IF NOT EXISTS latitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS longitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS temperature numeric(5,2),
  ADD COLUMN IF NOT EXISTS species_observed text,
  ADD COLUMN IF NOT EXISTS animal_count integer DEFAULT 0;
