-- Service Agent Verification System Migration
-- This migration creates the tables and functions needed for the service agent verification workflow

-- Create verification_requests table
CREATE TABLE IF NOT EXISTS public.verification_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'expired')),
    
    -- Business Information
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL CHECK (business_type IN ('sole_proprietor', 'llc', 'corporation', 'partnership', 'other')),
    business_registration_number TEXT,
    years_in_business INTEGER NOT NULL CHECK (years_in_business >= 0),
    
    -- License Information
    license_number TEXT NOT NULL,
    license_type TEXT NOT NULL,
    license_state TEXT NOT NULL,
    license_expiry_date DATE NOT NULL,
    
    -- Insurance Information
    insurance_provider TEXT NOT NULL,
    insurance_policy_number TEXT NOT NULL,
    insurance_expiry_date DATE NOT NULL,
    liability_coverage_amount DECIMAL(10, 2) NOT NULL CHECK (liability_coverage_amount > 0),
    
    -- Additional Information
    specialties TEXT[] NOT NULL DEFAULT '{}',
    service_areas TEXT[] NOT NULL DEFAULT '{}',
    certifications JSONB DEFAULT '[]',
    
    -- Documents (stored as references to storage bucket)
    documents JSONB DEFAULT '{}',
    
    -- Review Information
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Create verification_documents table for document tracking
CREATE TABLE IF NOT EXISTS public.verification_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    verification_request_id UUID NOT NULL REFERENCES public.verification_requests(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('license', 'insurance', 'business_registration', 'certification', 'other')),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    verified BOOLEAN DEFAULT FALSE,
    verification_notes TEXT
);

-- Add verification fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_badge_type TEXT CHECK (verification_badge_type IN ('basic', 'premium', 'elite'));

-- Create verification_history table to track all verification attempts
CREATE TABLE IF NOT EXISTS public.verification_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    verification_request_id UUID REFERENCES public.verification_requests(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected', 'expired', 'renewed')),
    performed_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON public.verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_created_at ON public.verification_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_documents_request_id ON public.verification_documents(verification_request_id);
CREATE INDEX IF NOT EXISTS idx_verification_history_user_id ON public.verification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON public.profiles(is_verified);

-- Create function to update profile verification status
CREATE OR REPLACE FUNCTION update_profile_verification_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        UPDATE public.profiles
        SET 
            is_verified = TRUE,
            verified_at = NOW(),
            verification_expires_at = NOW() + INTERVAL '1 year',
            verification_badge_type = 'basic'
        WHERE user_id = NEW.user_id;
        
        -- Insert into history
        INSERT INTO public.verification_history (user_id, verification_request_id, action, performed_by)
        VALUES (NEW.user_id, NEW.id, 'approved', NEW.reviewed_by);
        
    ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
        -- Insert into history
        INSERT INTO public.verification_history (user_id, verification_request_id, action, performed_by, notes)
        VALUES (NEW.user_id, NEW.id, 'rejected', NEW.reviewed_by, NEW.rejection_reason);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for verification status updates
CREATE TRIGGER update_profile_verification_trigger
AFTER UPDATE OF status ON public.verification_requests
FOR EACH ROW
EXECUTE FUNCTION update_profile_verification_status();

-- Create function to check and expire verifications
CREATE OR REPLACE FUNCTION check_expired_verifications()
RETURNS void AS $$
BEGIN
    -- Expire verification requests
    UPDATE public.verification_requests
    SET status = 'expired'
    WHERE status = 'pending' 
    AND expires_at < NOW();
    
    -- Expire profile verifications
    UPDATE public.profiles
    SET is_verified = FALSE
    WHERE is_verified = TRUE 
    AND verification_expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS Policies

-- Enable RLS
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_history ENABLE ROW LEVEL SECURITY;

-- Verification requests policies
CREATE POLICY "Users can view their own verification requests"
    ON public.verification_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verification requests"
    ON public.verification_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending verification requests"
    ON public.verification_requests FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all verification requests"
    ON public.verification_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update verification requests"
    ON public.verification_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Verification documents policies
CREATE POLICY "Users can view their own verification documents"
    ON public.verification_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.verification_requests
            WHERE verification_requests.id = verification_documents.verification_request_id
            AND verification_requests.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can upload verification documents"
    ON public.verification_documents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.verification_requests
            WHERE verification_requests.id = verification_documents.verification_request_id
            AND verification_requests.user_id = auth.uid()
            AND verification_requests.status = 'pending'
        )
    );

CREATE POLICY "Admins can view all verification documents"
    ON public.verification_documents FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Verification history policies
CREATE POLICY "Users can view their own verification history"
    ON public.verification_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all verification history"
    ON public.verification_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-documents', 'verification-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for verification documents
CREATE POLICY "Users can upload their verification documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'verification-documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own verification documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'verification-documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Admins can view all verification documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'verification-documents'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create function to get verification statistics
CREATE OR REPLACE FUNCTION get_verification_statistics()
RETURNS TABLE (
    total_requests BIGINT,
    pending_requests BIGINT,
    approved_requests BIGINT,
    rejected_requests BIGINT,
    expired_requests BIGINT,
    verified_agents BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_requests,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_requests,
        COUNT(*) FILTER (WHERE status = 'approved')::BIGINT as approved_requests,
        COUNT(*) FILTER (WHERE status = 'rejected')::BIGINT as rejected_requests,
        COUNT(*) FILTER (WHERE status = 'expired')::BIGINT as expired_requests,
        (SELECT COUNT(*) FROM public.profiles WHERE is_verified = TRUE)::BIGINT as verified_agents
    FROM public.verification_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;