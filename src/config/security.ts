export const securityHeaders = {
  'Content-Security-Policy': 
    "default-src 'self';" +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com;" +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;" +
    "img-src 'self' data: https://*.googleapis.com https://*.gstatic.com;" +
    "font-src 'self' https://fonts.gstatic.com;" +
    "connect-src 'self' https://api.your-domain.com https://*.sentry.io;" +
    "frame-src 'self' https://maps.googleapis.com;" +
    "object-src 'none';" +
    "base-uri 'self';" +
    "form-action 'self';",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(self), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};