import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the migration file
const migrationContent = fs.readFileSync(
  path.join(__dirname, 'supabase/migrations/20240711000001_verification_system.sql'),
  'utf8'
);

// Create a Supabase client
const supabaseUrl = 'http://localhost:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'; // service_role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    // Split the migration into individual statements
    const statements = migrationContent.split(';').filter(stmt => stmt.trim().length > 0);

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement separately
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim() + ';';
      console.log(`Executing statement ${i + 1}/${statements.length}`);

      try {
        const { error } = await supabase.rpc('pg_execute', { sql: statement });

        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
          console.error('Statement:', statement);
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } catch (stmtError) {
        console.error(`Error executing statement ${i + 1}:`, stmtError);
        console.error('Statement:', statement);
      }
    }

    console.log('Migration process completed');
  } catch (error) {
    console.error('Error:', error);
  }
}

applyMigration();
