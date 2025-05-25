import { ApiClient } from './client';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock server setup
const server = setupServer(
  rest.get('https://api.example.com/users/123', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'client',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      })
    );
  }),
  
  rest.get('https://api.example.com/projects', (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 10;
    
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          {
            id: '456',
            title: 'Test Project',
            description: 'A test project',
            clientId: '123',
            status: 'in_progress',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
        ],
        pagination: {
          page,
          pageSize,
          totalItems: 1,
          totalPages: 1,
        },
      })
    );
  }),
  
  rest.post('https://api.example.com/projects', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: '789',
        ...(req.body as object),
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      })
    );
  })
);

// Start the server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close the server after all tests
afterAll(() => server.close());

describe('ApiClient', () => {
  let apiClient: ApiClient;
  
  beforeEach(() => {
    apiClient = new ApiClient({
      baseUrl: 'https://api.example.com',
      supabaseUrl: 'https://example.supabase.co',
      supabaseKey: 'test-key',
    });
  });
  
  describe('getUser', () => {
    it('should fetch a user by ID', async () => {
      const user = await apiClient.getUser('123');
      
      expect(user).toEqual({
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'client',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      });
    });
  });
  
  describe('getProjects', () => {
    it('should fetch paginated projects', async () => {
      const result = await apiClient.getProjects(1, 10);
      
      expect(result).toEqual({
        data: [
          {
            id: '456',
            title: 'Test Project',
            description: 'A test project',
            clientId: '123',
            status: 'in_progress',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          totalItems: 1,
          totalPages: 1,
        },
      });
    });
  });
  
  describe('createProject', () => {
    it('should create a new project', async () => {
      const projectData = {
        title: 'New Project',
        description: 'A new project',
        clientId: '123',
        status: 'draft' as const,
      };
      
      const project = await apiClient.createProject(projectData);
      
      expect(project).toEqual({
        id: '789',
        ...projectData,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      });
    });
  });
});
