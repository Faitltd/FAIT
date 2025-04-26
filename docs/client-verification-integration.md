# Client Verification Integration Guide

This guide explains how to integrate the new client verification module with the existing FAIT Co-op platform.

## Overview

The client verification module provides a comprehensive system for verifying client identities, addresses, and phone numbers. It includes a multi-step verification process, status tracking, and visual indicators of verification status.

## Integration Steps

### 1. Database Setup

Run the SQL script in `src/db/verification_schema.sql` to create the necessary database tables and security policies:

```bash
# Using the Supabase CLI
supabase db run < src/db/verification_schema.sql

# Or execute the SQL directly in the Supabase dashboard SQL editor
```

### 2. Storage Setup

Create a new storage bucket in Supabase for verification documents:

1. Go to the Supabase dashboard
2. Navigate to Storage
3. Create a new bucket named `verification_documents`
4. Set up the following RLS policies:

```sql
-- Users can upload their own verification documents
CREATE POLICY "Users can upload their own verification documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'verification_documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view their own verification documents
CREATE POLICY "Users can view their own verification documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'verification_documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can view all verification documents
CREATE POLICY "Admins can view all verification documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'verification_documents' AND
    auth.uid() IN (SELECT user_id FROM admin_users)
  );
```

### 3. Add Route to Existing Router

Add the client verification page to the existing router configuration in `src/App.tsx`:

```jsx
// Import the verification page
import ClientVerificationPage from './pages/verification/ClientVerificationPage';

// Add to your routes
<Route
  path="/verification/client"
  element={
    <ProtectedRoute>
      <Suspense fallback={<LoadingSpinner />}>
        <ClientVerificationPage />
      </Suspense>
    </ProtectedRoute>
  }
/>
```

### 4. Add Verification Badge to User Profiles

Add the verification status badge to user profile components:

```jsx
import VerificationStatusBadge from '../components/verification/VerificationStatusBadge';

// Inside your profile component
<div className="flex items-center">
  <h2 className="text-xl font-bold">{user.name}</h2>
  <VerificationStatusBadge userId={user.id} className="ml-2" />
</div>
```

### 5. Add Verification Link to Navigation

Add a link to the verification page in the user menu or sidebar:

```jsx
<Link
  to="/verification/client"
  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
  data-cy="verification-link"
>
  <div className="flex items-center">
    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
    Verification
  </div>
</Link>
```

### 6. Add Admin Verification Review Interface

For admin users, create a verification review interface that allows them to:

- View pending verification submissions
- Approve or reject verifications
- Add notes for rejected verifications

This can be integrated with the existing admin dashboard.

## Testing

The verification module includes Cypress tests that cover the entire verification flow. To run these tests:

```bash
npx cypress run --spec "cypress/e2e/client/verification-process.cy.js"
```

## Troubleshooting

### Common Issues

1. **Storage Permission Errors**: Ensure the storage bucket RLS policies are correctly configured.
2. **Database Schema Issues**: Check that all tables and indexes were created successfully.
3. **Component Integration**: If components aren't rendering correctly, check that all required props are being passed.

### Support

For additional help, contact the development team or refer to the detailed documentation in `src/components/verification/README.md`.
