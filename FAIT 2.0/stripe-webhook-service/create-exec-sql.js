const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createExecSqlFunction() {
  try {
    console.log('🔧 Creating exec_sql function...');
    
    // Create the exec_sql function directly using the REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        sql: 'SELECT 1'
      })
    });
    
    if (response.ok) {
      console.log('✅ exec_sql function already exists!');
      return;
    }
    
    // If the function doesn't exist, create it
    console.log('Creating exec_sql function...');
    
    // Use the SQL API to create the function
    const createResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        query: `
          CREATE OR REPLACE FUNCTION exec_sql(sql text)
          RETURNS void AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      })
    });
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error(`❌ Error creating exec_sql function: ${errorText}`);
      
      // Try a different approach
      console.log('Trying a different approach...');
      
      // Use the SQL API directly
      const sqlResponse = await fetch(`${supabaseUrl}/rest/v1/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        },
        body: JSON.stringify({
          query: `
            CREATE OR REPLACE FUNCTION exec_sql(sql text)
            RETURNS void AS $$
            BEGIN
              EXECUTE sql;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
          `
        })
      });
      
      if (!sqlResponse.ok) {
        const sqlErrorText = await sqlResponse.text();
        console.error(`❌ Error creating exec_sql function (second attempt): ${sqlErrorText}`);
        return;
      }
      
      console.log('✅ exec_sql function created successfully (second attempt)!');
      return;
    }
    
    console.log('✅ exec_sql function created successfully!');
  } catch (error) {
    console.error('❌ Error creating exec_sql function:', error);
  }
}

createExecSqlFunction();
