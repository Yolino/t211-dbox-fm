DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'django') THEN
    CREATE USER django WITH PASSWORD :'django_password';
    GRANT CONNECT ON DATABASE :'db_name' TO django;
    GRANT USAGE ON SCHEMA public TO django;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO django;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO django;
  END IF;
END $$;
