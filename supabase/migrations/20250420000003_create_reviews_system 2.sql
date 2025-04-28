-- Create enhanced reviews system tables

-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  service_package_id UUID NOT NULL REFERENCES public.service_packages(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  unhelpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create review_photos table
CREATE TABLE IF NOT EXISTS public.review_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  public_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create review_replies table
CREATE TABLE IF NOT EXISTS public.review_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create review_helpfulness table to track user votes
CREATE TABLE IF NOT EXISTS public.review_helpfulness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_service_package_id ON public.reviews(service_package_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client_id ON public.reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_reviews_service_agent_id ON public.reviews(service_agent_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_review_photos_review_id ON public.review_photos(review_id);
CREATE INDEX IF NOT EXISTS idx_review_replies_review_id ON public.review_replies(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpfulness_review_id ON public.review_helpfulness(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpfulness_user_id ON public.review_helpfulness(user_id);

-- Add triggers to update timestamps
CREATE OR REPLACE FUNCTION public.update_review_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_review_timestamp ON public.reviews;
CREATE TRIGGER update_review_timestamp
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_review_timestamp();

DROP TRIGGER IF EXISTS update_review_reply_timestamp ON public.review_replies;
CREATE TRIGGER update_review_reply_timestamp
BEFORE UPDATE ON public.review_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_review_timestamp();

-- Create function to update helpfulness counts
CREATE OR REPLACE FUNCTION public.update_review_helpfulness()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is an insert
  IF TG_OP = 'INSERT' THEN
    -- Increment the appropriate counter
    IF NEW.is_helpful THEN
      UPDATE public.reviews
      SET helpful_count = helpful_count + 1
      WHERE id = NEW.review_id;
    ELSE
      UPDATE public.reviews
      SET unhelpful_count = unhelpful_count + 1
      WHERE id = NEW.review_id;
    END IF;
  -- If this is an update and the helpfulness changed
  ELSIF TG_OP = 'UPDATE' AND OLD.is_helpful <> NEW.is_helpful THEN
    -- Decrement the old counter and increment the new one
    IF OLD.is_helpful THEN
      UPDATE public.reviews
      SET helpful_count = helpful_count - 1,
          unhelpful_count = unhelpful_count + 1
      WHERE id = NEW.review_id;
    ELSE
      UPDATE public.reviews
      SET helpful_count = helpful_count + 1,
          unhelpful_count = unhelpful_count - 1
      WHERE id = NEW.review_id;
    END IF;
  -- If this is a delete
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement the appropriate counter
    IF OLD.is_helpful THEN
      UPDATE public.reviews
      SET helpful_count = helpful_count - 1
      WHERE id = OLD.review_id;
    ELSE
      UPDATE public.reviews
      SET unhelpful_count = unhelpful_count - 1
      WHERE id = OLD.review_id;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_review_helpfulness_trigger ON public.review_helpfulness;
CREATE TRIGGER update_review_helpfulness_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.review_helpfulness
FOR EACH ROW
EXECUTE FUNCTION public.update_review_helpfulness();

-- Create function to notify service agent of new review
CREATE OR REPLACE FUNCTION public.notify_new_review()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for service agent
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    is_read
  ) VALUES (
    NEW.service_agent_id,
    'New Review',
    'A client has left a ' || NEW.rating || '-star review for your service.',
    'review',
    FALSE
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifying service agent of new review
DROP TRIGGER IF EXISTS notify_new_review_trigger ON public.reviews;
CREATE TRIGGER notify_new_review_trigger
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_review();

-- Add RLS policies
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpfulness ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Clients can create reviews for their bookings" ON public.reviews
  FOR INSERT
  WITH CHECK (
    client_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id AND client_id = auth.uid()
    )
  );

CREATE POLICY "Clients can update their own reviews" ON public.reviews
  FOR UPDATE
  USING (client_id = auth.uid());

-- Review photos policies
CREATE POLICY "Anyone can view review photos" ON public.review_photos
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Clients can add photos to their reviews" ON public.review_photos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reviews
      WHERE id = review_id AND client_id = auth.uid()
    )
  );

-- Review replies policies
CREATE POLICY "Anyone can view review replies" ON public.review_replies
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can reply to reviews" ON public.review_replies
  FOR INSERT
  WITH CHECK (
    -- Service agents can reply to reviews of their services
    EXISTS (
      SELECT 1 FROM public.reviews
      WHERE id = review_id AND service_agent_id = auth.uid()
    ) OR
    -- Clients can reply to reviews they created
    EXISTS (
      SELECT 1 FROM public.reviews
      WHERE id = review_id AND client_id = auth.uid()
    ) OR
    -- Admins can reply to any review
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Users can update their own replies" ON public.review_replies
  FOR UPDATE
  USING (user_id = auth.uid());

-- Review helpfulness policies
CREATE POLICY "Anyone can view review helpfulness" ON public.review_helpfulness
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can mark reviews as helpful/unhelpful" ON public.review_helpfulness
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own helpfulness votes" ON public.review_helpfulness
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own helpfulness votes" ON public.review_helpfulness
  FOR DELETE
  USING (user_id = auth.uid());

-- Create storage bucket for review photos
INSERT INTO storage.buckets (id, name, public) VALUES ('review-photos', 'review-photos', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for review photos
CREATE POLICY "Anyone can view review photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'review-photos');

CREATE POLICY "Authenticated users can upload review photos" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'review-photos' AND
    auth.role() = 'authenticated'
  );

-- Create function to mark a review as helpful
CREATE OR REPLACE FUNCTION public.mark_review_helpful(
  review_id UUID,
  is_helpful BOOLEAN
)
RETURNS BOOLEAN AS $$
DECLARE
  existing_vote UUID;
BEGIN
  -- Check if the user has already voted on this review
  SELECT id INTO existing_vote
  FROM public.review_helpfulness
  WHERE review_id = mark_review_helpful.review_id
  AND user_id = auth.uid();
  
  -- If the user has already voted, update their vote
  IF existing_vote IS NOT NULL THEN
    UPDATE public.review_helpfulness
    SET is_helpful = mark_review_helpful.is_helpful
    WHERE id = existing_vote;
  -- Otherwise, insert a new vote
  ELSE
    INSERT INTO public.review_helpfulness (
      review_id,
      user_id,
      is_helpful
    ) VALUES (
      mark_review_helpful.review_id,
      auth.uid(),
      mark_review_helpful.is_helpful
    );
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
