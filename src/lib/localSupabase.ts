/**
 * Local Supabase Client
 *
 * This module provides a temporary replacement for the Supabase client
 * when the actual Supabase service is not available.
 *
 * It mimics the Supabase API structure but uses local storage for data.
 */

import * as localAuth from './localAuth';

// Create a local version of the Supabase client
export const localSupabase = {
  auth: {
    // Auth methods
    signInWithPassword: localAuth.signInWithPassword,
    signOut: localAuth.signOut,
    getSession: localAuth.getSession,
    getUser: localAuth.getUser,

    // Auth listeners
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // This is a simplified version that doesn't actually listen for changes
      // In a real implementation, we would use events or a more sophisticated state management

      // Return a fake subscription object
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              // Nothing to do here
            }
          }
        }
      };
    }
  },

  // Simplified database operations
  from: (table: string) => {
    return {
      select: (columns: string = '*') => {
        return {
          eq: (column: string, value: any) => {
            return {
              single: async () => {
                // For profiles table, return fake profile data
                if (table === 'profiles') {
                  const { data } = await localAuth.getSession();
                  if (data.session && data.session.user.id === value) {
                    return {
                      data: {
                        id: data.session.user.id,
                        user_type: data.session.user.user_type,
                        full_name: data.session.user.full_name,
                        email: data.session.user.email,
                        created_at: data.session.user.created_at
                      },
                      error: null
                    };
                  }
                }

                return { data: null, error: { code: 'PGRST116', message: 'No rows found' } };
              },

              // For non-single queries
              async function() {
                return { data: [], error: null };
              }
            };
          },

          // For non-filtered queries
          async function() {
            return { data: [], error: null };
          }
        };
      },

      insert: (data: any) => {
        return {
          select: () => {
            return {
              single: async function() {
                // Simulate inserting data
                return {
                  data: { ...data, id: `local-${Date.now()}`, created_at: new Date().toISOString() },
                  error: null
                };
              }
            };
          }
        };
      },

      update: (data: any) => {
        return {
          eq: (column: string, value: any) => {
            return {
              async function() {
                // Simulate updating data
                return { data: null, error: null };
              }
            };
          }
        };
      },

      delete: () => {
        return {
          eq: (column: string, value: any) => {
            return {
              async function() {
                // Simulate deleting data
                return { data: null, error: null };
              }
            };
          }
        };
      }
    };
  }
};

// No longer needed as we always use local auth in this simplified version
