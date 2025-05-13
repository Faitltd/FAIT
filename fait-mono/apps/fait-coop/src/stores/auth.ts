import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

// Force mock authentication mode
const useMockAuth = false

// Mock users for local development or fallback
const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'password',
    user_type: 'admin',
    full_name: 'Admin User',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    email: 'client@example.com',
    password: 'password',
    user_type: 'client',
    full_name: 'Client User',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    email: 'service@example.com',
    password: 'password',
    user_type: 'service_agent',
    full_name: 'Service Agent',
    created_at: new Date().toISOString()
  }
]

// Define user types
export type UserType = 'admin' | 'client' | 'service_agent'

// Define user interface
export interface User {
  id: string
  email: string
  user_type?: UserType
  full_name?: string
  created_at?: string
  user_metadata?: {
    full_name?: string
    user_type?: UserType
  }
}

// Define auth store
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const isLocalAuth = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userType = computed(() => user.value?.user_type || user.value?.user_metadata?.user_type || null)

  // Actions
  async function initialize() {
    loading.value = true
    try {
      if (useMockAuth) {
        // Check if user is stored in localStorage
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          user.value = JSON.parse(storedUser) as User
          isLocalAuth.value = true
        }
      } else {
        // Get session from Supabase
        const { data, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (data.session) {
          user.value = {
            id: data.session.user.id,
            email: data.session.user.email || '',
            user_type: data.session.user.user_metadata?.user_type,
            full_name: data.session.user.user_metadata?.full_name,
            created_at: data.session.user.created_at,
            user_metadata: data.session.user.user_metadata
          }
        }
      }
    } catch (err) {
      console.error('Error initializing auth:', err)
      error.value = 'Failed to initialize authentication'
    } finally {
      loading.value = false
    }
  }

  async function signIn(email: string, password: string) {
    loading.value = true
    error.value = null

    try {
      if (useMockAuth) {
        // Find user in mock data
        const foundUser = mockUsers.find(u => u.email === email && u.password === password)

        if (!foundUser) {
          throw new Error('Invalid email or password')
        }

        // Create a user object without the password
        const { password: _, ...userWithoutPassword } = foundUser

        // Store user in state and localStorage
        user.value = userWithoutPassword as User
        localStorage.setItem('user', JSON.stringify(userWithoutPassword))
        isLocalAuth.value = true
      } else {
        // Sign in with Supabase
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (signInError) {
          throw signInError
        }

        if (data.user) {
          user.value = {
            id: data.user.id,
            email: data.user.email || '',
            user_type: data.user.user_metadata?.user_type,
            full_name: data.user.user_metadata?.full_name,
            created_at: data.user.created_at,
            user_metadata: data.user.user_metadata
          }
        }
      }

      return { success: true }
    } catch (err: any) {
      console.error('Sign in error:', err)
      error.value = err.message || 'Failed to sign in'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function signUp(email: string, password: string, userData: any) {
    loading.value = true
    error.value = null

    try {
      if (useMockAuth) {
        // Check if email already exists
        if (mockUsers.some(u => u.email === email)) {
          throw new Error('Email already in use')
        }

        // Create new user
        const newUser = {
          id: (mockUsers.length + 1).toString(),
          email,
          password,
          user_type: userData.user_type || 'client',
          full_name: userData.full_name || '',
          created_at: new Date().toISOString()
        }

        // Add to mock users (in a real app, this would be stored in a database)
        mockUsers.push(newUser)

        // Create a user object without the password
        const { password: _, ...userWithoutPassword } = newUser

        // Store user in state and localStorage
        user.value = userWithoutPassword as User
        localStorage.setItem('user', JSON.stringify(userWithoutPassword))
        isLocalAuth.value = true
      } else {
        // Sign up with Supabase
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_type: userData.user_type || 'client',
              full_name: userData.full_name || ''
            }
          }
        })

        if (signUpError) {
          throw signUpError
        }

        if (data.user) {
          user.value = {
            id: data.user.id,
            email: data.user.email || '',
            user_type: userData.user_type || 'client',
            full_name: userData.full_name || '',
            created_at: data.user.created_at,
            user_metadata: data.user.user_metadata
          }
        }
      }

      return { success: true }
    } catch (err: any) {
      console.error('Sign up error:', err)
      error.value = err.message || 'Failed to sign up'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    loading.value = true
    error.value = null

    try {
      if (useMockAuth) {
        // Clear user from state and localStorage
        user.value = null
        localStorage.removeItem('user')
        isLocalAuth.value = false
      } else {
        // Sign out with Supabase
        const { error: signOutError } = await supabase.auth.signOut()

        if (signOutError) {
          throw signOutError
        }

        // Clear user from state
        user.value = null
      }

      return { success: true }
    } catch (err: any) {
      console.error('Sign out error:', err)
      error.value = err.message || 'Failed to sign out'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Initialize auth state
  initialize()

  return {
    user,
    loading,
    error,
    isLocalAuth,
    isAuthenticated,
    userType,
    initialize,
    signIn,
    signUp,
    signOut
  }
})
