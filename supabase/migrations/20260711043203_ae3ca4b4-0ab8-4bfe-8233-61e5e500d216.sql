
DO $$ BEGIN
  CREATE TYPE public.species_category AS ENUM ('mammal','bird','reptile','amphibian','fish','insect');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE public.species
  ADD COLUMN IF NOT EXISTS category public.species_category,
  ADD COLUMN IF NOT EXISTS population integer,
  ADD COLUMN IF NOT EXISTS average_lifespan integer,
  ADD COLUMN IF NOT EXISTS habitat text,
  ADD COLUMN IF NOT EXISTS food_type text;
