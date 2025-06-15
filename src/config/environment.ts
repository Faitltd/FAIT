export const environment = {
  production: process.env.NODE_ENV === 'production',
  apiUrl: process.env.REACT_APP_API_URL,
  sentryDsn: process.env.REACT_APP_SENTRY_DSN,
  googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  auth: {
    domain: process.env.REACT_APP_AUTH_DOMAIN,
    clientId: process.env.REACT_APP_AUTH_CLIENT_ID,
  },
  features: {
    subscriptions: process.env.REACT_APP_ENABLE_SUBSCRIPTIONS === 'true',
  }
};