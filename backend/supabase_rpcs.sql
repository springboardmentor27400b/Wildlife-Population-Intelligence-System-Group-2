-- 1. Species Occurrence (Counts the number of documents/sightings)
CREATE OR REPLACE FUNCTION rpc_get_species_occurrence()
RETURNS TABLE (species_name text, count bigint) AS $$
BEGIN
    RETURN QUERY 
    SELECT o.species_name::text, COUNT(*)::bigint as count 
    FROM observation_records o 
    GROUP BY o.species_name 
    ORDER BY count DESC 
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- 2. Observation Trend (YYYY-MM)
CREATE OR REPLACE FUNCTION rpc_get_observation_trend()
RETURNS TABLE (period text, count bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT SUBSTRING(o.observed_at FROM 1 FOR 7)::text as period, COUNT(*)::bigint as count
    FROM observation_records o
    WHERE o.observed_at IS NOT NULL
    GROUP BY period
    ORDER BY period ASC;
END;
$$ LANGUAGE plpgsql;

-- 3. Population by Species (Latest)
CREATE OR REPLACE FUNCTION rpc_get_population_by_species()
RETURNS TABLE (species_name text, estimated_population bigint, confidence_score numeric) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (p.species_name) 
        p.species_name::text, 
        p.estimated_population::bigint, 
        p.confidence_score::numeric
    FROM population_estimations p
    ORDER BY p.species_name, p.calculation_date DESC;
END;
$$ LANGUAGE plpgsql;

-- 4. Population Trend (YYYY-MM)
CREATE OR REPLACE FUNCTION rpc_get_population_trend()
RETURNS TABLE (period text, estimated_population numeric) AS $$
BEGIN
    RETURN QUERY
    SELECT SUBSTRING(p.calculation_date FROM 1 FOR 7)::text as period, SUM(p.estimated_population)::numeric as estimated_population
    FROM population_estimations p
    WHERE p.calculation_date IS NOT NULL
    GROUP BY period
    ORDER BY period ASC;
END;
$$ LANGUAGE plpgsql;

-- 5. Species At Risk
CREATE OR REPLACE FUNCTION rpc_get_species_at_risk()
RETURNS TABLE (species_name text, conservation_status text) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.species_name::text, p.conservation_status::text
    FROM unified_prediction_records p
    WHERE p.conservation_status IN ('Endangered', 'Vulnerable', 'Critically Endangered', 'Near Threatened');
END;
$$ LANGUAGE plpgsql;

-- 6. Map Service Species Distribution
CREATE OR REPLACE FUNCTION rpc_get_map_species_distribution(
    start_date text DEFAULT NULL,
    end_date text DEFAULT NULL
)
RETURNS TABLE (species_name text, observation_count bigint, verified_count bigint, pending_count bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.species_name::text, 
        SUM(o.count)::bigint as observation_count,
        SUM(CASE WHEN o.verification_status = 'Verified' THEN o.count ELSE 0 END)::bigint as verified_count,
        SUM(CASE WHEN o.verification_status IN ('Pending Verification', 'Pending Validation', 'Pending') THEN o.count ELSE 0 END)::bigint as pending_count
    FROM observation_records o
    WHERE (start_date IS NULL OR o.observed_at >= start_date)
      AND (end_date IS NULL OR o.observed_at <= end_date)
    GROUP BY o.species_name
    ORDER BY observation_count DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- 7. Distinct Helper (Monitored Species)
CREATE OR REPLACE FUNCTION rpc_get_distinct_species_monitored()
RETURNS TABLE (species_name text) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT o.species_name::text FROM observation_records o WHERE o.species_name IS NOT NULL
    UNION
    SELECT DISTINCT p.species_name::text FROM unified_prediction_records p WHERE p.species_name IS NOT NULL;
END;
$$ LANGUAGE plpgsql;
