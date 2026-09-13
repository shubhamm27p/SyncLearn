# Supabase schema

The project uses PostgreSQL on Supabase. Apply these files in the Supabase SQL editor, in order:

1. `migrations/000_core_supabase.sql`
2. `migrations/001_mcq_supabase.sql`

The old `schema.sql` pointer was removed because the SQL Server language service treated valid PostgreSQL syntax as incorrect T-SQL.