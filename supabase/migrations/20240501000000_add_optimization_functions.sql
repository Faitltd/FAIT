-- Add database optimization functions
-- These functions are used by the optimize-database.js script

-- Function to analyze a table
CREATE OR REPLACE FUNCTION pg_analyze(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE 'ANALYZE ' || quote_ident(table_name);
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error analyzing table %: %', table_name, SQLERRM;
END;
$$;

-- Function to get indexes for a table
CREATE OR REPLACE FUNCTION pg_get_indexes(table_name text)
RETURNS TABLE(
  indexname name,
  indexdef text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.relname AS indexname,
    pg_get_indexdef(i.oid) AS indexdef
  FROM
    pg_index x
    JOIN pg_class c ON c.oid = x.indrelid
    JOIN pg_class i ON i.oid = x.indexrelid
    LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE
    c.relkind = 'r'
    AND c.relname = table_name
    AND n.nspname = 'public';
END;
$$;

-- Function to create an index
CREATE OR REPLACE FUNCTION pg_create_index(
  table_name text,
  column_names text,
  index_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE 'CREATE INDEX IF NOT EXISTS ' || quote_ident(index_name) || 
          ' ON ' || quote_ident(table_name) || ' (' || column_names || ')';
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating index %: %', index_name, SQLERRM;
END;
$$;

-- Function to create a full-text search index
CREATE OR REPLACE FUNCTION pg_create_fts_index(
  table_name text,
  column_names text,
  index_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  columns_array text[];
  column_expr text;
  i integer;
BEGIN
  -- Split column names into array
  columns_array := string_to_array(column_names, ',');
  
  -- Build the to_tsvector expression
  column_expr := '';
  FOR i IN 1..array_length(columns_array, 1) LOOP
    columns_array[i] := trim(columns_array[i]);
    IF i > 1 THEN
      column_expr := column_expr || ' || '' '' || ';
    END IF;
    column_expr := column_expr || 'coalesce(' || quote_ident(columns_array[i]) || ', '''')';
  END LOOP;
  
  -- Create the index
  EXECUTE 'CREATE INDEX IF NOT EXISTS ' || quote_ident(index_name) || 
          ' ON ' || quote_ident(table_name) || 
          ' USING gin(to_tsvector(''english'', ' || column_expr || '))';
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating FTS index %: %', index_name, SQLERRM;
END;
$$;

-- Function to vacuum analyze the database
CREATE OR REPLACE FUNCTION pg_vacuum_analyze()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- We can't use VACUUM FULL with SECURITY DEFINER
  -- So we'll just use VACUUM ANALYZE
  VACUUM ANALYZE;
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error vacuuming database: %', SQLERRM;
END;
$$;

-- Function to get slow queries from pg_stat_statements
-- Note: pg_stat_statements extension must be enabled
CREATE OR REPLACE FUNCTION pg_get_slow_queries()
RETURNS TABLE(
  query text,
  calls bigint,
  total_time double precision,
  mean_time double precision,
  rows bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if pg_stat_statements is available
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
  ) THEN
    RETURN QUERY
    SELECT
      pss.query,
      pss.calls,
      pss.total_exec_time AS total_time,
      pss.mean_exec_time AS mean_time,
      pss.rows
    FROM
      pg_stat_statements pss
    WHERE
      pss.mean_exec_time > 100 -- Only queries taking more than 100ms on average
      AND pss.calls > 10 -- Only queries called at least 10 times
    ORDER BY
      pss.mean_exec_time DESC
    LIMIT 20;
  ELSE
    -- If pg_stat_statements is not available, return empty result
    RETURN QUERY
    SELECT
      'pg_stat_statements extension is not enabled'::text,
      0::bigint,
      0::double precision,
      0::double precision,
      0::bigint
    LIMIT 0;
  END IF;
END;
$$;

-- Function to get table sizes
CREATE OR REPLACE FUNCTION pg_get_table_sizes()
RETURNS TABLE(
  table_name text,
  size_bytes bigint,
  size_pretty text,
  total_size_bytes bigint,
  total_size_pretty text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.relname::text AS table_name,
    pg_table_size(c.oid) AS size_bytes,
    pg_size_pretty(pg_table_size(c.oid)) AS size_pretty,
    pg_total_relation_size(c.oid) AS total_size_bytes,
    pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size_pretty
  FROM
    pg_class c
    LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE
    n.nspname = 'public'
    AND c.relkind = 'r'
  ORDER BY
    pg_total_relation_size(c.oid) DESC;
END;
$$;

-- Function to get unused indexes
CREATE OR REPLACE FUNCTION pg_get_unused_indexes()
RETURNS TABLE(
  indexname text,
  tablename text,
  size_pretty text,
  index_scans bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.indexrelname::text AS indexname,
    i.relname::text AS tablename,
    pg_size_pretty(pg_relation_size(quote_ident(i.schemaname) || '.' || quote_ident(i.indexrelname)))::text AS size_pretty,
    i.idx_scan AS index_scans
  FROM
    pg_stat_user_indexes i
    JOIN pg_index idx ON idx.indexrelid = i.indexrelid
  WHERE
    i.idx_scan = 0 -- Index has never been scanned
    AND NOT idx.indisprimary -- Not a primary key
    AND NOT idx.indisunique -- Not a unique constraint
  ORDER BY
    pg_relation_size(quote_ident(i.schemaname) || '.' || quote_ident(i.indexrelname)) DESC;
END;
$$;

-- Function to get table bloat
CREATE OR REPLACE FUNCTION pg_get_table_bloat()
RETURNS TABLE(
  table_name text,
  bloat_ratio numeric,
  wasted_bytes bigint,
  wasted_pretty text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH constants AS (
    SELECT current_setting('block_size')::numeric AS bs, 23 AS hdr, 8 AS ma
  ),
  bloat_info AS (
    SELECT
      ma,bs,schemaname,tablename,
      (datawidth+(hdr+ma-(case when hdr%ma=0 THEN ma ELSE hdr%ma END)))::numeric AS datahdr,
      (maxfracsum*(nullhdr+ma-(case when nullhdr%ma=0 THEN ma ELSE nullhdr%ma END))) AS nullhdr2
    FROM (
      SELECT
        schemaname, tablename, hdr, ma, bs,
        SUM((1-null_frac)*avg_width) AS datawidth,
        MAX(null_frac) AS maxfracsum,
        hdr+(
          SELECT 1+count(*)/8
          FROM pg_stats s2
          WHERE null_frac<>0 AND s2.schemaname = s.schemaname AND s2.tablename = s.tablename
        ) AS nullhdr
      FROM pg_stats s, constants
      GROUP BY 1,2,3,4,5
    ) AS foo
  ),
  table_bloat AS (
    SELECT
      schemaname, tablename, cc.relpages, bs,
      CEIL((cc.reltuples*((datahdr+ma-
        (CASE WHEN datahdr%ma=0 THEN ma ELSE datahdr%ma END))+nullhdr2+4))/(bs-20::float)) AS otta
    FROM bloat_info
    JOIN pg_class cc ON cc.relname = bloat_info.tablename
    JOIN pg_namespace nn ON cc.relnamespace = nn.oid AND nn.nspname = bloat_info.schemaname
    WHERE nn.nspname = 'public'
  ),
  final_bloat AS (
    SELECT
      tablename,
      ROUND(100 * (relpages-otta) / NULLIF(relpages, 0), 1) AS bloat_ratio,
      CASE WHEN relpages > otta THEN (bs*(relpages-otta))::bigint ELSE 0 END AS wasted_bytes
    FROM table_bloat
  )
  SELECT
    tablename::text AS table_name,
    bloat_ratio,
    wasted_bytes,
    pg_size_pretty(wasted_bytes) AS wasted_pretty
  FROM final_bloat
  WHERE bloat_ratio > 10 -- Only tables with more than 10% bloat
  ORDER BY wasted_bytes DESC;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION pg_analyze(text) TO authenticated;
GRANT EXECUTE ON FUNCTION pg_get_indexes(text) TO authenticated;
GRANT EXECUTE ON FUNCTION pg_create_index(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION pg_create_fts_index(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION pg_vacuum_analyze() TO authenticated;
GRANT EXECUTE ON FUNCTION pg_get_slow_queries() TO authenticated;
GRANT EXECUTE ON FUNCTION pg_get_table_sizes() TO authenticated;
GRANT EXECUTE ON FUNCTION pg_get_unused_indexes() TO authenticated;
GRANT EXECUTE ON FUNCTION pg_get_table_bloat() TO authenticated;
