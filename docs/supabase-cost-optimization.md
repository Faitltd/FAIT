# Supabase Cost Optimization Guide

## Overview

This document outlines the cost optimization strategies implemented for the FAIT project to reduce Supabase billing costs, particularly around authentication services.

## Previous Cost Issues

### High Auth MFA Phone Hours Cost
- **Previous Cost**: $76.41/month for Auth MFA Phone Hours
- **Usage**: 744 hours in billing period (May 10 - Jun 9, 2025)
- **Rate**: $0.1027 per hour
- **Issue**: Phone MFA was enabled but Twilio wasn't properly configured, causing failed attempts that still incurred charges

## Implemented Solutions

### 1. Disabled Phone/SMS MFA

**Changes Made:**
- Set `mfa_phone_enroll_enabled = false` in Supabase project config
- Set `mfa_phone_verify_enabled = false` in Supabase project config
- Updated `supabase/config.toml` to disable phone MFA
- Disabled Twilio SMS configuration

**Cost Impact:**
- Eliminates ~$76/month in Auth MFA Phone Hours charges
- Reduces total monthly cost by approximately 68%

### 2. TOTP-Only MFA Strategy

**Implementation:**
- Kept TOTP (Time-based One-Time Password) MFA enabled
- Users can use authenticator apps (Google Authenticator, Microsoft Authenticator, Authy, etc.)
- No additional costs for TOTP-based MFA

**Benefits:**
- Maintains security with 2FA
- Zero additional costs
- Better user experience (no SMS delays)
- Works offline

### 3. Code Optimizations

**Auth Flow Improvements:**
- Implemented proper error handling in MFA flows
- Added rate limiting to prevent excessive API calls
- Optimized Supabase auth service implementation
- Removed inefficient auth loops

**Session Management Optimizations:**
- Reduced SessionManager check frequency from 1 minute to 5 minutes
- Reduced useSessionManager update frequency from 1 second to 30 seconds
- Added 1-minute cooldown between session refresh attempts
- Optimized Supabase client configuration with longer refresh margins

**Rate Limiting Implementation:**
- Added `REFRESH_COOLDOWN` of 60 seconds between refresh calls
- Increased `refreshTokenMargin` to 300 seconds (5 minutes)
- Limited retry attempts to 3 maximum
- Increased retry delay to 2 seconds

## Current Configuration

### Enabled Features (No Additional Cost)
- Email authentication
- Google OAuth
- TOTP MFA
- Session management
- Password reset

### Disabled Features (Cost Savings)
- Phone/SMS authentication
- Phone MFA
- SMS OTP
- Twilio integration

## Monitoring and Maintenance

### Monthly Cost Monitoring
1. Review Supabase billing dashboard monthly
2. Monitor Auth usage patterns
3. Check for any unexpected spikes in usage

### Key Metrics to Watch
- Auth requests per month
- MFA verification attempts
- Session duration and frequency
- OAuth provider usage

### Alert Thresholds
- Set up billing alerts at $50/month
- Monitor if Auth usage exceeds expected patterns
- Watch for any re-enablement of phone features

## Alternative Solutions (If Phone MFA Needed)

If phone MFA becomes necessary in the future:

### Option 1: Implement Custom SMS Service
- Use direct Twilio integration
- Implement own rate limiting
- More control over costs

### Option 2: Hybrid Approach
- TOTP as primary MFA
- Phone MFA only for account recovery
- Strict rate limiting on phone verifications

### Option 3: Third-Party Auth Service
- Consider Auth0, Firebase Auth, or similar
- Compare pricing models
- Evaluate migration costs

## Expected Cost Reduction

### Before Optimization
- Auth MFA Phone Hours: $76.41
- Compute Hours: $28.60
- Custom Domain: $6.45
- **Total**: ~$111.46/month

### After Optimization
- Auth MFA Phone Hours: $0.00 (eliminated)
- Compute Hours: $28.60 (unchanged)
- Custom Domain: $6.45 (unchanged)
- **Total**: ~$35.05/month

### Savings
- **Monthly Savings**: $76.41 (68% reduction)
- **Annual Savings**: $916.92

## Implementation Checklist

- [x] Disable phone MFA in Supabase project config
- [x] Update local `supabase/config.toml`
- [x] Update auth service implementation
- [x] Add rate limiting to session refresh
- [x] Optimize session manager intervals
- [x] Configure Supabase client for cost optimization
- [x] Update documentation
- [x] Test TOTP MFA functionality
- [ ] Deploy changes to production
- [ ] Monitor costs for next billing cycle
- [ ] Update user documentation/help guides

## User Communication

### For Existing Users with Phone MFA
- Send notification about MFA method change
- Provide instructions for setting up TOTP
- Offer support during transition

### For New Users
- Default to TOTP MFA setup
- Provide clear instructions for authenticator apps
- Highlight security benefits of TOTP

## Rollback Plan

If issues arise:
1. Re-enable phone MFA in Supabase config
2. Revert code changes
3. Configure Twilio properly to avoid failed attempts
4. Implement strict rate limiting

## Next Steps

1. Deploy optimized configuration to production
2. Monitor billing for next 30 days
3. Gather user feedback on TOTP-only MFA
4. Document any issues or improvements needed
5. Consider implementing additional cost optimizations
