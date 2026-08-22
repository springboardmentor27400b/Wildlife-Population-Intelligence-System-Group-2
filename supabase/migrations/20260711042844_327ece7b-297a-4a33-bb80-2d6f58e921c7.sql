
ALTER TABLE public.protected_areas
  ADD COLUMN IF NOT EXISTS forest_type text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS total_area_sqkm numeric,
  ADD COLUMN IF NOT EXISTS conservation_status text,
  ADD COLUMN IF NOT EXISTS number_of_rangers integer DEFAULT 0;

-- Backfill total_area_sqkm from existing area_hectares where missing
UPDATE public.protected_areas
  SET total_area_sqkm = ROUND((area_hectares / 100.0)::numeric, 2)
  WHERE total_area_sqkm IS NULL;

-- Backfill state from region where missing
UPDATE public.protected_areas
  SET state = region WHERE state IS NULL;
