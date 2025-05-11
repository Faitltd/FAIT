/**
 * Supabase Authentication Service
 * 
 * This file implements the authentication provider interface using Supabase.
 */

import { supabase } from '../../../../lib/supabase';
import { AuthProvider, AuthResponse } from '../types';
import { User, Session } from '@supabase/supabase-js';

/**
 * Supabase authentication provider implementation
 */
export class SupabaseAuthProvider implements AuthProvider {
  private user: User | null = null;
  private session: Session | null = null;

  constructor() {
    // Initialize user and session
    this.initializeAuth();
  }

  /**
   * Initialize authentication state
   */
  private async initializeAuth(): Promise<void> {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        this.user = data.session.user;
        this.session = data.session;
      }
    } catch (error) {
      console.error('[SupabaseAuth] Error initializing auth:', error);
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (data.user) {
        this.user = data.user;
        this.session = data.session;
      }

      return { data, error };
    } catch (error) {
      console.error('[SupabaseAuth] Sign in error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, userData: any): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (data.user) {
        this.user = data.user;
        this.session = data.session;
      }

      return { data, error };
    } catch (error) {
      console.error('[SupabaseAuth] Sign up error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      this.user = null;
      this.session = null;
    } catch (error) {
      console.error('[SupabaseAuth] Sign out error:', error);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      return { data, error };
    } catch (error) {
      console.error('[SupabaseAuth] Reset password error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userData: any): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: userData
      });

      if (data.user) {
        this.user = data.user;
      }

      return { data, error };
    } catch (error) {
      console.error('[SupabaseAuth] Update profile error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/oauth-callback`
        }
      });

      return { data, error };
    } catch (error) {
      console.error('[SupabaseAuth] Google sign in error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  /**
   * Sign in with Facebook
   */
  async signInWithFacebook(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/oauth-callback`
        }
      });

      return { data, error };
    } catch (error) {
      console.error('[SupabaseAuth] Facebook sign in error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  /**
   * Set up multi-factor authentication
   */
  async setupMFA(): Promise<AuthResponse> {
    // Supabase MFA implementation
    return { data: null, error: new Error('MFA not implemented yet') };
  }

  /**
   * Verify MFA code
   */
  async verifyMFA(code: string): Promise<AuthResponse> {
    // Supabase MFA implementation
    return { data: null, error: new Error('MFA not implemented yet') };
  }

  /**
   * Disable MFA
   */
  async disableMFA(): Promise<AuthResponse> {
    // Supabase MFA implementation
    return { data: null, error: new Error('MFA not implemented yet') };
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (data.session) {
        this.session = data.session;
        this.user = data.session.user;
      }
      
      return { data, error };
    } catch (error) {
      console.error('[SupabaseAuth] Refresh session error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  /**
   * Get session expiry timestamp
   */
  getSessionExpiry(): number | null {
    return this.session?.expires_at ? this.session.expires_at * 1000 : null;
  }

  /**
   * Get current user
   */
  getUser(): User | null {
    return this.user;
  }

  /**
   * Get current session
   */
  getSession(): Session | null {
    return this.session;
  }
}
