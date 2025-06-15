import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../api';
import { supabase } from '../supabase';

// Mock the Supabase client
vi.mock('../supabase', () => {
  return {
    supabase: {
      auth: {
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        getUser: vi.fn(),
        getSession: vi.fn()
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn()
          })),
          order: vi.fn(() => ({
            order: vi.fn()
          }))
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn()
            }))
          }))
        })),
        delete: vi.fn(() => ({
          eq: vi.fn()
        }))
      }))
    }
  };
});

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('auth', () => {
    it('should sign in a user', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockResponse = { data: { user: mockUser, session: {} }, error: null };
      
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockResponse);
      
      const result = await api.auth.signIn('test@example.com', 'password');
      
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      });
      expect(result).toEqual({ user: mockUser, session: {} });
    });

    it('should sign up a user', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockAuthResponse = { data: { user: mockUser, session: {} }, error: null };
      const mockProfileResponse = { data: { name: 'Test User', role: 'client' }, error: null };
      
      vi.mocked(supabase.auth.signUp).mockResolvedValue(mockAuthResponse);
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockProfileResponse)
          })
        })
      } as any);
      
      const result = await api.auth.signUp('test@example.com', 'password', {
        name: 'Test User',
        role: 'client'
      });
      
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: {
          data: {
            name: 'Test User',
            role: 'client'
          }
        }
      });
      expect(result).toEqual({
        user: mockUser,
        profile: mockProfileResponse.data
      });
    });
  });

  describe('services', () => {
    it('should get all services', async () => {
      const mockServices = [
        { id: '1', title: 'Service 1' },
        { id: '2', title: 'Service 2' }
      ];
      const mockResponse = { data: mockServices, error: null };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue(mockResponse)
          })
        })
      } as any);
      
      const result = await api.services.getAll();
      
      expect(supabase.from).toHaveBeenCalledWith('services');
      expect(result).toEqual(mockServices);
    });

    it('should create a service', async () => {
      const mockService = { id: '1', title: 'New Service' };
      const mockResponse = { data: mockService, error: null };
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse)
          })
        })
      } as any);
      
      const result = await api.services.create({
        title: 'New Service',
        description: 'Description',
        category: 'cleaning',
        price: 25,
        price_type: 'hourly',
        duration: 60,
        active: true,
        provider_id: '123'
      });
      
      expect(supabase.from).toHaveBeenCalledWith('services');
      expect(result).toEqual(mockService);
    });
  });
});
