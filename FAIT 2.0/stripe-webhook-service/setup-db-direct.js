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

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');
    
    // Create users table
    console.log('Creating users table...');
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email TEXT UNIQUE NOT NULL,
          api_key TEXT UNIQUE NOT NULL,
          credits INTEGER NOT NULL DEFAULT 0,
          role TEXT NOT NULL DEFAULT 'user',
          status TEXT NOT NULL DEFAULT 'active',
          stripe_customer_id TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (usersError) {
      console.error('Error creating users table:', usersError.message);
    } else {
      console.log('✅ Users table created successfully');
    }
    
    // Create credit_transactions table
    console.log('Creating credit_transactions table...');
    const { error: txError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS credit_transactions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(id),
          amount INTEGER NOT NULL,
          type TEXT NOT NULL,
          description TEXT,
          stripe_session_id TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT positive_amount CHECK (amount != 0)
        );
      `
    });
    
    if (txError) {
      console.error('Error creating credit_transactions table:', txError.message);
    } else {
      console.log('✅ Credit transactions table created successfully');
    }
    
    // Create webhook_errors table
    console.log('Creating webhook_errors table...');
    const { error: errorsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS webhook_errors (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          event_type TEXT NOT NULL,
          event_id TEXT,
          error_message TEXT NOT NULL,
          error_stack TEXT,
          environment TEXT,
          service TEXT,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (errorsError) {
      console.error('Error creating webhook_errors table:', errorsError.message);
    } else {
      console.log('✅ Webhook errors table created successfully');
    }
    
    // Create processed_events table
    console.log('Creating processed_events table...');
    const { error: eventsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS processed_events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          event_id TEXT UNIQUE NOT NULL,
          event_type TEXT NOT NULL,
          processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS processed_events_event_id_idx ON processed_events(event_id);
      `
    });
    
    if (eventsError) {
      console.error('Error creating processed_events table:', eventsError.message);
    } else {
      console.log('✅ Processed events table created successfully');
    }
    
    // Create cleanup_processed_events function
    console.log('Creating cleanup_processed_events function...');
    const { error: cleanupError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION cleanup_processed_events() RETURNS void AS $$
        BEGIN
          DELETE FROM processed_events
          WHERE processed_at < NOW() - INTERVAL '30 days';
        END;
        $$ LANGUAGE plpgsql;
      `
    });
    
    if (cleanupError) {
      console.error('Error creating cleanup_processed_events function:', cleanupError.message);
    } else {
      console.log('✅ Cleanup processed events function created successfully');
    }
    
    // Create use_credit function
    console.log('Creating use_credit function...');
    const { error: useCreditError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION use_credit(
          user_id UUID,
          credit_amount INTEGER,
          transaction_type TEXT,
          transaction_description TEXT
        ) RETURNS TABLE (
          success BOOLEAN,
          new_balance INTEGER
        ) AS $$
        DECLARE
          current_credits INTEGER;
          new_credits INTEGER;
        BEGIN
          -- Get current credits
          SELECT credits INTO current_credits
          FROM users
          WHERE id = user_id;
          
          -- Check if user has enough credits
          IF current_credits < credit_amount THEN
            RETURN QUERY SELECT false AS success, current_credits AS new_balance;
            RETURN;
          END IF;
          
          -- Calculate new credits
          new_credits := current_credits - credit_amount;
          
          -- Update user's credits
          UPDATE users
          SET 
            credits = new_credits,
            updated_at = NOW()
          WHERE id = user_id;
          
          -- Log the transaction
          INSERT INTO credit_transactions (
            user_id,
            amount,
            type,
            description
          ) VALUES (
            user_id,
            -credit_amount,
            transaction_type,
            transaction_description
          );
          
          -- Return success and new balance
          RETURN QUERY SELECT true AS success, new_credits AS new_balance;
        END;
        $$ LANGUAGE plpgsql;
      `
    });
    
    if (useCreditError) {
      console.error('Error creating use_credit function:', useCreditError.message);
    } else {
      console.log('✅ Use credit function created successfully');
    }
    
    // Create add_credit function
    console.log('Creating add_credit function...');
    const { error: addCreditError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION add_credit(
          user_id UUID,
          credit_amount INTEGER,
          transaction_type TEXT,
          transaction_description TEXT,
          stripe_session_id TEXT DEFAULT NULL
        ) RETURNS TABLE (
          success BOOLEAN,
          new_balance INTEGER
        ) AS $$
        DECLARE
          current_credits INTEGER;
          new_credits INTEGER;
        BEGIN
          -- Get current credits
          SELECT credits INTO current_credits
          FROM users
          WHERE id = user_id;
          
          -- Calculate new credits
          new_credits := current_credits + credit_amount;
          
          -- Update user's credits
          UPDATE users
          SET 
            credits = new_credits,
            updated_at = NOW()
          WHERE id = user_id;
          
          -- Log the transaction
          INSERT INTO credit_transactions (
            user_id,
            amount,
            type,
            description,
            stripe_session_id
          ) VALUES (
            user_id,
            credit_amount,
            transaction_type,
            transaction_description,
            stripe_session_id
          );
          
          -- Return success and new balance
          RETURN QUERY SELECT true AS success, new_credits AS new_balance;
        END;
        $$ LANGUAGE plpgsql;
      `
    });
    
    if (addCreditError) {
      console.error('Error creating add_credit function:', addCreditError.message);
    } else {
      console.log('✅ Add credit function created successfully');
    }
    
    // Create create_user_with_api_key function
    console.log('Creating create_user_with_api_key function...');
    const { error: createUserError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION create_user_with_api_key(
          p_email TEXT,
          p_initial_credits INTEGER DEFAULT 0,
          p_role TEXT DEFAULT 'user'
        ) RETURNS TABLE (
          id UUID,
          email TEXT,
          api_key TEXT,
          credits INTEGER
        ) AS $$
        DECLARE
          v_api_key TEXT;
          v_user_id UUID;
        BEGIN
          -- Generate a random API key with a prefix
          v_api_key := 'fait_' || encode(gen_random_bytes(16), 'hex');
          
          -- Insert the user
          INSERT INTO users (
            email,
            api_key,
            credits,
            role,
            status,
            created_at,
            updated_at
          ) VALUES (
            p_email,
            v_api_key,
            p_initial_credits,
            p_role,
            'active',
            NOW(),
            NOW()
          )
          RETURNING id INTO v_user_id;
          
          -- Return the user details
          RETURN QUERY
          SELECT
            u.id,
            u.email,
            u.api_key,
            u.credits
          FROM
            users u
          WHERE
            u.id = v_user_id;
        END;
        $$ LANGUAGE plpgsql;
      `
    });
    
    if (createUserError) {
      console.error('Error creating create_user_with_api_key function:', createUserError.message);
    } else {
      console.log('✅ Create user with API key function created successfully');
    }
    
    console.log('✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
}

setupDatabase();
