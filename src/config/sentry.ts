import * as Sentry from '@sentry/react';

export const initSentry = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.2,
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: ['localhost', 'your-production-domain.com'],
        }),
      ],
    });
  }
};