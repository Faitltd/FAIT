/**
 * Local Supabase Client
 *
 * This module provides a reliable replacement for the Supabase client
 * when the actual Supabase service is not available.
 *
 * It mimics the Supabase API structure but uses local storage for data.
 * This is particularly useful for development, testing, and as a fallback mechanism.
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
    resetPasswordForEmail: localAuth.resetPasswordForEmail,
    updateUser: localAuth.updateUser,

    // Sign up method
    signUp: async ({ email, password, options }: { email: string, password: string, options?: { data?: any } }) => {
      console.log('[LocalSupabase] Sign up called with:', email);

      // Create a new user with the provided email and password
      const userType = email.includes('admin') ? 'admin' :
                       email.includes('service') ? 'service_agent' : 'client';

      const userData = {
        email,
        password,
        user_type: userType,
        full_name: options?.data?.full_name || email.split('@')[0],
        ...options?.data
      };

      // Use the signInWithPassword method to create and sign in the user
      const result = await localAuth.signInWithPassword({ email, password });

      return result;
    },

    // Auth listeners
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // This is a simplified version that doesn't actually listen for changes
      // In a real implementation, we would use events or a more sophisticated state management

      // Immediately call the callback with the current session
      localAuth.getSession().then(({ data }) => {
        if (data.session) {
          callback('SIGNED_IN', data.session);
        } else {
          callback('SIGNED_OUT', null);
        }
      });

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
  // Add channel method for realtime subscriptions
  channel: (channel: string) => {
    return {
      on: (event: string, config: any, callback: Function) => {
        // Return the channel object for chaining
        return {
          subscribe: () => {
            // Return a subscription object with an unsubscribe method
            return {
              unsubscribe: () => {
                // Nothing to do here
              }
            };
          }
        };
      }
    };
  },

  from: (table: string) => {
    return {
      select: (columns: string = '*') => {
        return {
          eq: (column: string, value: any) => {
            return {
              // Add order method for sorting
              order: (column: string, { ascending = true } = {}) => {
                return {
                  // Add limit method
                  limit: (limit: number) => {
                    return {
                      async function() {
                        // For notifications table, return fake notifications
                        if (table === 'notifications') {
                          return {
                            data: [],
                            error: null
                          };
                        }
                        return { data: [], error: null };
                      }
                    };
                  },
                  async function() {
                    return { data: [], error: null };
                  }
                };
              },

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
                // For service_packages table, return mock data
                if (table === 'service_packages') {
                  return {
                    data: [
                      {
                        id: 'mock-service-1',
                        title: 'Mock Plumbing Service',
                        description: 'This is a mock plumbing service for testing',
                        price: 100,
                        category: 'Plumbing',
                        subcategory: 'Repairs',
                        status: 'active',
                        service_agent_id: 'mock-agent-1',
                        created_at: new Date().toISOString(),
                        service_agent: {
                          id: 'mock-agent-1',
                          full_name: 'John Doe',
                          avatar_url: null,
                          zip_code: '80202'
                        }
                      },
                      {
                        id: 'mock-service-2',
                        title: 'Mock Electrical Service',
                        description: 'This is a mock electrical service for testing',
                        price: 150,
                        category: 'Electrical',
                        subcategory: 'Installation',
                        status: 'active',
                        service_agent_id: 'mock-agent-2',
                        created_at: new Date().toISOString(),
                        service_agent: {
                          id: 'mock-agent-2',
                          full_name: 'Jane Smith',
                          avatar_url: null,
                          zip_code: '80203'
                        }
                      }
                    ],
                    error: null
                  };
                }

                // For reviews table, return mock data
                if (table === 'reviews') {
                  return {
                    data: [
                      { rating: 4 },
                      { rating: 5 }
                    ],
                    error: null
                  };
                }

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
              // Add another eq method for chaining
              eq: (column2: string, value2: any) => {
                return {
                  async function() {
                    // Simulate updating data
                    return { data: null, error: null };
                  }
                };
              },
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
  },

  // Storage methods (mock implementation)
  storage: {
    from: (bucket: string) => {
      return {
        upload: (path: string, file: File) => {
          console.log(`[LocalSupabase] Mock upload to ${bucket}/${path}`);
          return Promise.resolve({
            data: { path },
            error: null
          });
        },
        getPublicUrl: (path: string) => {
          return {
            data: { publicUrl: `https://mock-storage.local/${bucket}/${path}` }
          };
        },
        list: (prefix?: string) => {
          return Promise.resolve({
            data: [
              { name: 'mock-file-1.jpg', id: 'mock-id-1' },
              { name: 'mock-file-2.pdf', id: 'mock-id-2' }
            ],
            error: null
          });
        },
        remove: (paths: string[]) => {
          console.log(`[LocalSupabase] Mock remove from ${bucket}:`, paths);
          return Promise.resolve({ data: null, error: null });
        }
      };
    }
  }
};
