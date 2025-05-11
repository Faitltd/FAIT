#!/usr/bin/env node

/**
 * Database optimization script for the FAIT Co-Op Platform
 * 
 * This script performs various database optimizations:
 * 1. Analyzes tables to update statistics
 * 2. Adds missing indexes
 * 3. Vacuums the database to reclaim space
 * 4. Checks for slow queries and suggests optimizations
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Create Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration
const config = {
  // Tables to analyze
  tablesToAnalyze: [
    'profiles',
    'service_agents',
    'clients',
    'services',
    'service_packages',
    'bookings',
    'reviews',
    'messages',
    'sms_messages',
    'sms_conversations',
    'warranties',
    'warranty_claims',
    'subscriptions',
    'payments',
    'commissions'
  ],
  
  // Indexes to add
  indexesToAdd: [
    {
      table: 'profiles',
      columns: ['user_type'],
      name: 'idx_profiles_user_type'
    },
    {
      table: 'services',
      columns: ['service_agent_id'],
      name: 'idx_services_service_agent_id'
    },
    {
      table: 'services',
      columns: ['zip_code'],
      name: 'idx_services_zip_code'
    },
    {
      table: 'bookings',
      columns: ['client_id'],
      name: 'idx_bookings_client_id'
    },
    {
      table: 'bookings',
      columns: ['service_agent_id'],
      name: 'idx_bookings_service_agent_id'
    },
    {
      table: 'bookings',
      columns: ['status'],
      name: 'idx_bookings_status'
    },
    {
      table: 'messages',
      columns: ['sender_id'],
      name: 'idx_messages_sender_id'
    },
    {
      table: 'messages',
      columns: ['recipient_id'],
      name: 'idx_messages_recipient_id'
    },
    {
      table: 'sms_messages',
      columns: ['user_id'],
      name: 'idx_sms_messages_user_id'
    },
    {
      table: 'sms_messages',
      columns: ['from_number'],
      name: 'idx_sms_messages_from_number'
    },
    {
      table: 'sms_messages',
      columns: ['to_number'],
      name: 'idx_sms_messages_to_number'
    },
    {
      table: 'sms_conversations',
      columns: ['user_id'],
      name: 'idx_sms_conversations_user_id'
    },
    {
      table: 'sms_conversations',
      columns: ['phone_number'],
      name: 'idx_sms_conversations_phone_number'
    },
    {
      table: 'warranties',
      columns: ['service_id'],
      name: 'idx_warranties_service_id'
    },
    {
      table: 'warranties',
      columns: ['client_id'],
      name: 'idx_warranties_client_id'
    },
    {
      table: 'warranty_claims',
      columns: ['warranty_id'],
      name: 'idx_warranty_claims_warranty_id'
    },
    {
      table: 'subscriptions',
      columns: ['user_id'],
      name: 'idx_subscriptions_user_id'
    },
    {
      table: 'subscriptions',
      columns: ['status'],
      name: 'idx_subscriptions_status'
    },
    {
      table: 'payments',
      columns: ['user_id'],
      name: 'idx_payments_user_id'
    },
    {
      table: 'commissions',
      columns: ['service_agent_id'],
      name: 'idx_commissions_service_agent_id'
    }
  ],
  
  // Composite indexes to add
  compositeIndexes: [
    {
      table: 'services',
      columns: ['service_agent_id', 'status'],
      name: 'idx_services_agent_status'
    },
    {
      table: 'bookings',
      columns: ['service_agent_id', 'status'],
      name: 'idx_bookings_agent_status'
    },
    {
      table: 'bookings',
      columns: ['client_id', 'status'],
      name: 'idx_bookings_client_status'
    },
    {
      table: 'messages',
      columns: ['sender_id', 'recipient_id'],
      name: 'idx_messages_sender_recipient'
    },
    {
      table: 'sms_messages',
      columns: ['user_id', 'direction'],
      name: 'idx_sms_messages_user_direction'
    }
  ],
  
  // Full-text search indexes
  fullTextIndexes: [
    {
      table: 'services',
      columns: ['title', 'description'],
      name: 'idx_services_fts'
    },
    {
      table: 'messages',
      columns: ['content'],
      name: 'idx_messages_fts'
    },
    {
      table: 'sms_messages',
      columns: ['message_text'],
      name: 'idx_sms_messages_fts'
    }
  ]
};

/**
 * Main function
 */
async function main() {
  console.log('=== FAIT Co-Op Platform Database Optimization ===');
  
  // Check database connection
  try {
    const { data, error } = await supabase.from('profiles').select('count(*)', { count: 'exact', head: true });
    if (error) throw error;
    console.log('✅ Connected to database successfully');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    process.exit(1);
  }
  
  // Ask for confirmation
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const answer = await new Promise(resolve => {
    rl.question('This script will perform database optimizations. Continue? (y/n) ', resolve);
  });
  
  if (answer.toLowerCase() !== 'y') {
    console.log('Operation cancelled');
    rl.close();
    process.exit(0);
  }
  
  rl.close();
  
  try {
    // Step 1: Analyze tables
    await analyzeTables();
    
    // Step 2: Add missing indexes
    await addMissingIndexes();
    
    // Step 3: Add composite indexes
    await addCompositeIndexes();
    
    // Step 4: Add full-text search indexes
    await addFullTextIndexes();
    
    // Step 5: Vacuum database
    await vacuumDatabase();
    
    // Step 6: Check for slow queries
    await checkSlowQueries();
    
    console.log('\n✅ Database optimization completed successfully');
  } catch (error) {
    console.error('\n❌ Database optimization failed:', error.message);
    process.exit(1);
  }
}

/**
 * Analyze tables to update statistics
 */
async function analyzeTables() {
  console.log('\n=== Analyzing Tables ===');
  
  for (const table of config.tablesToAnalyze) {
    try {
      console.log(`Analyzing table: ${table}...`);
      
      const { data, error } = await supabase.rpc('pg_analyze', { table_name: table });
      
      if (error) {
        console.warn(`⚠️ Failed to analyze table ${table}: ${error.message}`);
      } else {
        console.log(`✅ Table ${table} analyzed successfully`);
      }
    } catch (error) {
      console.warn(`⚠️ Error analyzing table ${table}: ${error.message}`);
    }
  }
}

/**
 * Add missing indexes
 */
async function addMissingIndexes() {
  console.log('\n=== Adding Missing Indexes ===');
  
  for (const index of config.indexesToAdd) {
    try {
      console.log(`Checking index on ${index.table}(${index.columns.join(', ')})...`);
      
      // Check if index already exists
      const { data: existingIndexes, error: checkError } = await supabase.rpc('pg_get_indexes', { 
        table_name: index.table 
      });
      
      if (checkError) {
        console.warn(`⚠️ Failed to check indexes for table ${index.table}: ${checkError.message}`);
        continue;
      }
      
      const indexExists = existingIndexes.some(idx => 
        idx.indexname === index.name || 
        (idx.indexdef && idx.indexdef.includes(`(${index.columns.join(', ')})`))
      );
      
      if (indexExists) {
        console.log(`✅ Index already exists on ${index.table}(${index.columns.join(', ')})`);
        continue;
      }
      
      // Create the index
      console.log(`Creating index ${index.name} on ${index.table}(${index.columns.join(', ')})...`);
      
      const { data, error } = await supabase.rpc('pg_create_index', { 
        table_name: index.table,
        column_names: index.columns.join(', '),
        index_name: index.name
      });
      
      if (error) {
        console.warn(`⚠️ Failed to create index ${index.name}: ${error.message}`);
      } else {
        console.log(`✅ Index ${index.name} created successfully`);
      }
    } catch (error) {
      console.warn(`⚠️ Error creating index ${index.name}: ${error.message}`);
    }
  }
}

/**
 * Add composite indexes
 */
async function addCompositeIndexes() {
  console.log('\n=== Adding Composite Indexes ===');
  
  for (const index of config.compositeIndexes) {
    try {
      console.log(`Checking composite index on ${index.table}(${index.columns.join(', ')})...`);
      
      // Check if index already exists
      const { data: existingIndexes, error: checkError } = await supabase.rpc('pg_get_indexes', { 
        table_name: index.table 
      });
      
      if (checkError) {
        console.warn(`⚠️ Failed to check indexes for table ${index.table}: ${checkError.message}`);
        continue;
      }
      
      const indexExists = existingIndexes.some(idx => 
        idx.indexname === index.name || 
        (idx.indexdef && idx.indexdef.includes(`(${index.columns.join(', ')})`))
      );
      
      if (indexExists) {
        console.log(`✅ Composite index already exists on ${index.table}(${index.columns.join(', ')})`);
        continue;
      }
      
      // Create the index
      console.log(`Creating composite index ${index.name} on ${index.table}(${index.columns.join(', ')})...`);
      
      const { data, error } = await supabase.rpc('pg_create_index', { 
        table_name: index.table,
        column_names: index.columns.join(', '),
        index_name: index.name
      });
      
      if (error) {
        console.warn(`⚠️ Failed to create composite index ${index.name}: ${error.message}`);
      } else {
        console.log(`✅ Composite index ${index.name} created successfully`);
      }
    } catch (error) {
      console.warn(`⚠️ Error creating composite index ${index.name}: ${error.message}`);
    }
  }
}

/**
 * Add full-text search indexes
 */
async function addFullTextIndexes() {
  console.log('\n=== Adding Full-Text Search Indexes ===');
  
  for (const index of config.fullTextIndexes) {
    try {
      console.log(`Checking full-text search index on ${index.table}(${index.columns.join(', ')})...`);
      
      // Check if index already exists
      const { data: existingIndexes, error: checkError } = await supabase.rpc('pg_get_indexes', { 
        table_name: index.table 
      });
      
      if (checkError) {
        console.warn(`⚠️ Failed to check indexes for table ${index.table}: ${checkError.message}`);
        continue;
      }
      
      const indexExists = existingIndexes.some(idx => 
        idx.indexname === index.name || 
        (idx.indexdef && idx.indexdef.includes('to_tsvector') && 
         index.columns.every(col => idx.indexdef.includes(col)))
      );
      
      if (indexExists) {
        console.log(`✅ Full-text search index already exists on ${index.table}(${index.columns.join(', ')})`);
        continue;
      }
      
      // Create the index
      console.log(`Creating full-text search index ${index.name} on ${index.table}(${index.columns.join(', ')})...`);
      
      const { data, error } = await supabase.rpc('pg_create_fts_index', { 
        table_name: index.table,
        column_names: index.columns.join(', '),
        index_name: index.name
      });
      
      if (error) {
        console.warn(`⚠️ Failed to create full-text search index ${index.name}: ${error.message}`);
      } else {
        console.log(`✅ Full-text search index ${index.name} created successfully`);
      }
    } catch (error) {
      console.warn(`⚠️ Error creating full-text search index ${index.name}: ${error.message}`);
    }
  }
}

/**
 * Vacuum database to reclaim space
 */
async function vacuumDatabase() {
  console.log('\n=== Vacuuming Database ===');
  
  try {
    console.log('Running VACUUM ANALYZE...');
    
    const { data, error } = await supabase.rpc('pg_vacuum_analyze');
    
    if (error) {
      console.warn(`⚠️ Failed to vacuum database: ${error.message}`);
    } else {
      console.log('✅ Database vacuumed successfully');
    }
  } catch (error) {
    console.warn(`⚠️ Error vacuuming database: ${error.message}`);
  }
}

/**
 * Check for slow queries and suggest optimizations
 */
async function checkSlowQueries() {
  console.log('\n=== Checking for Slow Queries ===');
  
  try {
    console.log('Retrieving slow queries from pg_stat_statements...');
    
    const { data, error } = await supabase.rpc('pg_get_slow_queries');
    
    if (error) {
      console.warn(`⚠️ Failed to retrieve slow queries: ${error.message}`);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('✅ No slow queries found');
      return;
    }
    
    console.log(`Found ${data.length} slow queries:`);
    
    // Write slow queries to a file
    const slowQueriesFile = path.resolve(__dirname, '../slow-queries.json');
    fs.writeFileSync(slowQueriesFile, JSON.stringify(data, null, 2));
    
    console.log(`Slow queries written to: ${slowQueriesFile}`);
    
    // Analyze and suggest optimizations
    for (let i = 0; i < Math.min(data.length, 5); i++) {
      const query = data[i];
      console.log(`\nSlow Query #${i + 1}:`);
      console.log(`- Query: ${query.query.substring(0, 100)}...`);
      console.log(`- Calls: ${query.calls}`);
      console.log(`- Total Time: ${query.total_time.toFixed(2)}ms`);
      console.log(`- Mean Time: ${query.mean_time.toFixed(2)}ms`);
      
      // Suggest optimizations
      await suggestOptimizations(query.query);
    }
  } catch (error) {
    console.warn(`⚠️ Error checking slow queries: ${error.message}`);
  }
}

/**
 * Suggest optimizations for a slow query
 */
async function suggestOptimizations(query) {
  try {
    console.log('Suggested optimizations:');
    
    // Check for missing WHERE clauses
    if (!query.toLowerCase().includes('where')) {
      console.log('- Add a WHERE clause to filter results');
    }
    
    // Check for missing indexes on JOIN conditions
    const joinMatches = query.match(/JOIN\s+(\w+)\s+ON\s+(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/gi);
    if (joinMatches) {
      for (const joinMatch of joinMatches) {
        const parts = joinMatch.match(/JOIN\s+(\w+)\s+ON\s+(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/i);
        if (parts) {
          const [, joinTable, leftTable, leftCol, rightTable, rightCol] = parts;
          console.log(`- Consider adding an index on ${leftTable}.${leftCol} and ${rightTable}.${rightCol}`);
        }
      }
    }
    
    // Check for ORDER BY without index
    const orderByMatches = query.match(/ORDER\s+BY\s+(\w+\.\w+|\w+)/gi);
    if (orderByMatches) {
      for (const orderByMatch of orderByMatches) {
        const parts = orderByMatch.match(/ORDER\s+BY\s+(\w+\.\w+|\w+)/i);
        if (parts) {
          const [, orderByCol] = parts;
          console.log(`- Consider adding an index on ${orderByCol} for ORDER BY`);
        }
      }
    }
    
    // Check for GROUP BY without index
    const groupByMatches = query.match(/GROUP\s+BY\s+(\w+\.\w+|\w+)/gi);
    if (groupByMatches) {
      for (const groupByMatch of groupByMatches) {
        const parts = groupByMatch.match(/GROUP\s+BY\s+(\w+\.\w+|\w+)/i);
        if (parts) {
          const [, groupByCol] = parts;
          console.log(`- Consider adding an index on ${groupByCol} for GROUP BY`);
        }
      }
    }
    
    // Check for LIKE without index
    const likeMatches = query.match(/(\w+\.\w+|\w+)\s+LIKE\s+['%]/gi);
    if (likeMatches) {
      for (const likeMatch of likeMatches) {
        const parts = likeMatch.match(/(\w+\.\w+|\w+)\s+LIKE\s+['%]/i);
        if (parts) {
          const [, likeCol] = parts;
          console.log(`- Consider using a full-text search index instead of LIKE on ${likeCol}`);
        }
      }
    }
    
    // Check for large IN clauses
    const inMatches = query.match(/IN\s+\([^)]{100,}\)/gi);
    if (inMatches) {
      console.log('- Consider using a JOIN instead of a large IN clause');
    }
    
    // Check for subqueries
    if (query.includes('SELECT') && query.indexOf('SELECT') !== query.lastIndexOf('SELECT')) {
      console.log('- Consider replacing subqueries with JOINs');
    }
    
    // Suggest EXPLAIN ANALYZE
    console.log('- Run EXPLAIN ANALYZE to get more detailed information');
    
  } catch (error) {
    console.warn(`⚠️ Error suggesting optimizations: ${error.message}`);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
