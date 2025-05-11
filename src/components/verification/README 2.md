# Client Verification Module

This module provides a comprehensive client verification system for the FAIT Co-op platform. It allows clients to verify their identity, address, and phone number to build trust with service providers.

## Components

### Main Components

- `ClientVerificationProcess`: The main component that orchestrates the entire verification flow.
- `VerificationStatusBadge`: A reusable badge component that displays the user's verification status.

### Step Components

- `IdentityVerificationStep`: Handles uploading and validating identity documents.
- `AddressVerificationStep`: Handles uploading and validating address verification documents.
- `PhoneVerificationStep`: Handles phone number verification via SMS.
- `VerificationReviewStep`: Allows users to review their submitted information before final submission.

## Database Schema

The verification system uses the following database tables:

- `client_verifications`: Stores verification records, including document URLs, status, and timestamps.

## Verification Statuses

- `not_started`: User has not started the verification process.
- `in_progress`: User has started but not completed the verification process.
- `pending_review`: User has submitted verification documents for review.
- `approved`: User's verification has been approved.
- `rejected`: User's verification has been rejected.
- `expired`: User's verification has expired and needs renewal.

## Integration

To integrate this module into the main application:

1. Add the `ClientVerificationPage` component to your routing system.
2. Use the `VerificationStatusBadge` component in user profiles and dashboards.
3. Run the SQL in `verification_schema.sql` to set up the required database tables.
4. Create a storage bucket named `verification_documents` in Supabase.

## Usage

```jsx
// In your routing configuration
<Route path="/verification" element={<ClientVerificationPage />} />

// In a user profile component
<VerificationStatusBadge userId={user.id} />
```

## Security Considerations

- All document uploads are stored in a secure Supabase storage bucket.
- Row-level security policies ensure users can only access their own verification records.
- Admin-only policies allow authorized staff to review verification submissions.

## Future Enhancements

- Integration with third-party identity verification services.
- Automated document verification using AI/ML.
- Multi-factor authentication options.
- Periodic re-verification requirements.
