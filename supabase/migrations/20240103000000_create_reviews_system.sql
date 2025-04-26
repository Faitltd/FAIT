-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_package_id UUID REFERENCES public.service_packages(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    response TEXT,
    response_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('pending', 'published', 'rejected')),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create review_photos table
CREATE TABLE IF NOT EXISTS public.review_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    file_path TEXT,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    public_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create review_votes table (for helpful/not helpful votes)
CREATE TABLE IF NOT EXISTS public.review_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (review_id, user_id)
);

-- Create review_reports table (for reporting inappropriate reviews)
CREATE TABLE IF NOT EXISTS public.review_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add function to update service_agent average rating
CREATE OR REPLACE FUNCTION update_service_agent_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the service agent's average rating in the profiles table
    UPDATE public.profiles
    SET 
        avg_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM public.reviews
            WHERE service_agent_id = NEW.service_agent_id
            AND status = 'published'
        ),
        review_count = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE service_agent_id = NEW.service_agent_id
            AND status = 'published'
        ),
        updated_at = now()
    WHERE id = NEW.service_agent_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to update service_agent rating when reviews change
DROP TRIGGER IF EXISTS update_service_agent_rating_trigger ON public.reviews;
CREATE TRIGGER update_service_agent_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_service_agent_rating();

-- Add function to update service_package average rating
CREATE OR REPLACE FUNCTION update_service_package_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the service package's average rating
    UPDATE public.service_packages
    SET 
        avg_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM public.reviews
            WHERE service_package_id = NEW.service_package_id
            AND status = 'published'
        ),
        review_count = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE service_package_id = NEW.service_package_id
            AND status = 'published'
        ),
        updated_at = now()
    WHERE id = NEW.service_package_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to update service_package rating when reviews change
DROP TRIGGER IF EXISTS update_service_package_rating_trigger ON public.reviews;
CREATE TRIGGER update_service_package_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_service_package_rating();

-- Add columns to profiles table for ratings
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Add columns to service_packages table for ratings
ALTER TABLE public.service_packages
ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Create storage bucket for review photos
INSERT INTO storage.buckets (id, name, public) VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy for clients to create reviews for services they've booked
CREATE POLICY client_create_reviews_policy ON public.reviews
    FOR INSERT
    TO authenticated
    WITH CHECK (
        client_id = auth.uid() AND
        (
            booking_id IS NULL OR
            booking_id IN (
                SELECT id FROM public.bookings 
                WHERE client_id = auth.uid() AND status = 'completed'
            )
        )
    );

-- Policy for clients to update their own reviews
CREATE POLICY client_update_reviews_policy ON public.reviews
    FOR UPDATE
    TO authenticated
    USING (client_id = auth.uid())
    WITH CHECK (client_id = auth.uid() AND updated_at < now() - interval '24 hours');

-- Policy for service agents to respond to reviews about them
CREATE POLICY service_agent_respond_reviews_policy ON public.reviews
    FOR UPDATE
    TO authenticated
    USING (service_agent_id = auth.uid())
    WITH CHECK (
        service_agent_id = auth.uid() AND
        OLD.response IS NULL AND
        NEW.response IS NOT NULL AND
        NEW.response_date IS NOT NULL AND
        NEW.rating = OLD.rating AND
        NEW.title = OLD.title AND
        NEW.content = OLD.content AND
        NEW.client_id = OLD.client_id AND
        NEW.service_package_id = OLD.service_package_id AND
        NEW.booking_id = OLD.booking_id AND
        NEW.status = OLD.status
    );

-- Policy for everyone to view published reviews
CREATE POLICY view_published_reviews_policy ON public.reviews
    FOR SELECT
    TO authenticated
    USING (status = 'published');

-- Policy for admins to manage all reviews
CREATE POLICY admin_manage_reviews_policy ON public.reviews
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Set up RLS policies for review photos
ALTER TABLE public.review_photos ENABLE ROW LEVEL SECURITY;

-- Policy for clients to add photos to their own reviews
CREATE POLICY client_manage_review_photos_policy ON public.review_photos
    FOR ALL
    TO authenticated
    USING (
        review_id IN (
            SELECT id FROM public.reviews
            WHERE client_id = auth.uid()
        )
    );

-- Policy for everyone to view photos of published reviews
CREATE POLICY view_review_photos_policy ON public.review_photos
    FOR SELECT
    TO authenticated
    USING (
        review_id IN (
            SELECT id FROM public.reviews
            WHERE status = 'published'
        )
    );

-- Policy for admins to manage all review photos
CREATE POLICY admin_manage_review_photos_policy ON public.review_photos
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Set up RLS policies for review votes
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to vote on reviews
CREATE POLICY user_vote_reviews_policy ON public.review_votes
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Policy for users to update their own votes
CREATE POLICY user_update_votes_policy ON public.review_votes
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Policy for users to delete their own votes
CREATE POLICY user_delete_votes_policy ON public.review_votes
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Policy for everyone to view votes
CREATE POLICY view_votes_policy ON public.review_votes
    FOR SELECT
    TO authenticated
    USING (true);

-- Set up RLS policies for review reports
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to report reviews
CREATE POLICY user_report_reviews_policy ON public.review_reports
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Policy for users to view their own reports
CREATE POLICY user_view_reports_policy ON public.review_reports
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Policy for admins to manage all reports
CREATE POLICY admin_manage_reports_policy ON public.review_reports
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Set up storage policies for review photos
CREATE POLICY "Review photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-photos');

CREATE POLICY "Users can upload review photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'review-photos' AND
    (
        -- Extract review ID from the file path (format: {review_id}/{filename})
        SPLIT_PART(name, '/', 1) IN (
            SELECT id::text FROM public.reviews WHERE client_id = auth.uid()
        )
    )
);

CREATE POLICY "Users can update their review photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'review-photos' AND
    (
        -- Extract review ID from the file path (format: {review_id}/{filename})
        SPLIT_PART(name, '/', 1) IN (
            SELECT id::text FROM public.reviews WHERE client_id = auth.uid()
        )
    )
);

CREATE POLICY "Users can delete their review photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'review-photos' AND
    (
        -- Extract review ID from the file path (format: {review_id}/{filename})
        SPLIT_PART(name, '/', 1) IN (
            SELECT id::text FROM public.reviews WHERE client_id = auth.uid()
        )
    )
);
