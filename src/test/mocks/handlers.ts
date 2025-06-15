import { rest } from 'msw';
import { environment } from '../../config/environment';

export const handlers = [
  rest.get(`${environment.apiUrl}/health`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ status: 'healthy' })
    );
  }),
  
  rest.post(`${environment.apiUrl}/auth/login`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ token: 'fake-token' })
    );
  }),
  
  // Add more API mocks as needed
];