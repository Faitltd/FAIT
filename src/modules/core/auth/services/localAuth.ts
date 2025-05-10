/**
 * Local Authentication Service
 * 
 * This file implements the authentication provider interface using local storage.
 * It's intended for development and testing purposes only.
 */

import { AuthProvider, AuthResponse, TestUser, UserType } from '../types';
import { User, Session } from '@supabase/supabase-js';

// Test users for local authentication
export const TEST_USERS: TestUser[] = [
  {
    id: '1',
    email: 'admin@itsfait.com',
    password: 'admin123',
    full_name: 'Admin User',
    user_type: 'admin'
  },
  {
    id: '2',
    email: 'client@itsfait.com',
    password: 'client123',
    full_name: 'Client User',
    user_type: 'client'
  },
  {
    id: '3',
    email: 'service@itsfait.com',
    password: 'service123',
    full_name: 'Service Agent',
    user_type: 'service_agent'
  }
];

/**
 * Local authentication provider implementation
 */
export class LocalAuthProvider implements AuthProvider {
  private user: User | null = null;
  private session: Session | null = null;
  private sessionExpiryTime: number | null = null;

  constructor() {
    // Initialize from localStorage if available
    this.loadFromStorage();
  }

  /**
   * Load authentication state from localStorage
   */
  private loadFromStorage(): void {
    try {
      const storedUser = localStorage.getItem('localAuth.user');
      const storedSession = localStorage.getItem('localAuth.session');
      const storedExpiry = localStorage.getItem('localAuth.expiry');

      if (storedUser) {
        this.user = JSON.parse(storedUser);
      }

      if (storedSession) {
        this.session = JSON.parse(storedSession);
      }

      if (storedExpiry) {
        this.sessionExpiryTime = parseInt(storedExpiry, 10);
        
        // Check if session has expired
        if (this.sessionExpiryTime < Date.now()) {
          this.clearStorage();
        }
      }
    } catch (error) {
      console.error('[LocalAuth] Error loading from storage:', error);
      this.clearStorage();
    }
  }

  /**
   * Save authentication state to localStorage
   */
  private saveToStorage(): void {
    try {
      if (this.user) {
        localStorage.setItem('localAuth.user', JSON.stringify(this.user));
      }

      if (this.session) {
        localStorage.setItem('localAuth.session', JSON.stringify(this.session));
      }

      if (this.sessionExpiryTime) {
        localStorage.setItem('localAuth.expiry', this.sessionExpiryTime.toString());
      }
    } catch (error) {
      console.error('[LocalAuth] Error saving to storage:', error);
    }
  }

  /**
   * Clear authentication state from localStorage
   */
  private clearStorage(): void {
    localStorage.removeItem('localAuth.user');
    localStorage.removeItem('localAuth.session');
    localStorage.removeItem('localAuth.expiry');
    this.user = null;
    this.session = null;
    this.sessionExpiryTime = null;
  }

  /**
   * Create a mock user from a test user
   */
  private createMockUser(testUser: TestUser): User {
    return {
      id: testUser.id,
      email: testUser.email,
      user_metadata: {
        full_name: testUser.full_name,
        user_type: testUser.user_type
      },
      app_metadata: {},
      created_at: new Date().toISOString(),
      aud: 'authenticated',
      role: ''
    } as User;
  }

  /**
   * Create a mock session
   */
  private createMockSession(user: User): Session {
    // Session expires in 24 hours
    const expiresAt = Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000);
    this.sessionExpiryTime = expiresAt * 1000;

    return {
      access_token: `local-token-${Date.now()}`,
      refresh_token: `local-refresh-${Date.now()}`,
      expires_at: expiresAt,
      expires_in: 24 * 60 * 60,
      token_type: 'bearer',
      user
    } as Session;
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // Find matching test user
      const testUser = TEST_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!testUser) {
        return {
          data: null,
          error: new Error('Invalid email or password')
        };
      }

      // Create mock user and session
      const mockUser = this.createMockUser(testUser);
      const mockSession = this.createMockSession(mockUser);

      this.user = mockUser;
      this.session = mockSession;
      this.saveToStorage();

      return {
        data: {
          user: mockUser,
          session: mockSession
        },
        error: null
      };
    } catch (error) {
      console.error('[LocalAuth] Sign in error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, userData: any): Promise<AuthResponse> {
    // For local auth, just sign in the user as if they already exist
    return this.signIn(email, password);
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    this.clearStorage();
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<AuthResponse> {
    // Mock implementation
    return {
      data: { message: 'Password reset email sent' },
      error: null
    };
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userData: any): Promise<AuthResponse> {
    try {
      if (!this.user) {
        return {
          data: null,
          error: new Error('No user is signed in')
        };
      }

      // Update user metadata
      this.user = {
        ...this.user,
        user_metadata: {
          ...this.user.user_metadata,
          ...userData
        }
      };

      this.saveToStorage();

      return {
        data: { user: this.user },
        error: null
      };
    } catch (error) {
      console.error('[LocalAuth] Update profile error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<AuthResponse> {
    // Use admin user for OAuth testing
    const testUser = TEST_USERS.find(u => u.email === 'admin@itsfait.com');
    
    if (!testUser) {
      return {
        data: null,
        error: new Error('Test user not found')
      };
    }

    const mockUser = this.createMockUser(testUser);
    mockUser.app_metadata.provider = 'google';
    
    const mockSession = this.createMockSession(mockUser);

    this.user = mockUser;
    this.session = mockSession;
    this.saveToStorage();

    return {
      data: {
        user: mockUser,
        session: mockSession
      },
      error: null
    };
  }

  /**
   * Sign in with Facebook
   */
  async signInWithFacebook(): Promise<AuthResponse> {
    // Use client user for OAuth testing
    const testUser = TEST_USERS.find(u => u.email === 'client@itsfait.com');
    
    if (!testUser) {
      return {
        data: null,
        error: new Error('Test user not found')
      };
    }

    const mockUser = this.createMockUser(testUser);
    mockUser.app_metadata.provider = 'facebook';
    
    const mockSession = this.createMockSession(mockUser);

    this.user = mockUser;
    this.session = mockSession;
    this.saveToStorage();

    return {
      data: {
        user: mockUser,
        session: mockSession
      },
      error: null
    };
  }

  /**
   * Set up multi-factor authentication
   */
  async setupMFA(): Promise<AuthResponse> {
    // Mock implementation
    return {
      data: { secret: 'mock-mfa-secret', qr_code: 'mock-qr-code' },
      error: null
    };
  }

  /**
   * Verify MFA code
   */
  async verifyMFA(code: string): Promise<AuthResponse> {
    // Mock implementation - accept any 6-digit code
    if (/^\d{6}$/.test(code)) {
      return {
        data: { message: 'MFA verified successfully' },
        error: null
      };
    }
    
    return {
      data: null,
      error: new Error('Invalid MFA code')
    };
  }

  /**
   * Disable MFA
   */
  async disableMFA(): Promise<AuthResponse> {
    // Mock implementation
    return {
      data: { message: 'MFA disabled successfully' },
      error: null
    };
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<AuthResponse> {
    if (!this.user || !this.session) {
      return {
        data: null,
        error: new Error('No active session')
      };
    }

    // Create a new session with extended expiry
    const mockSession = this.createMockSession(this.user);
    this.session = mockSession;
    this.saveToStorage();

    return {
      data: {
        user: this.user,
        session: mockSession
      },
      error: null
    };
  }

  /**
   * Get session expiry timestamp
   */
  getSessionExpiry(): number | null {
    return this.sessionExpiryTime;
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
