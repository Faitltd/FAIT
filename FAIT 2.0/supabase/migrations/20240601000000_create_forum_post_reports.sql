-- Create forum_post_reports table
CREATE TABLE IF NOT EXISTS public.forum_post_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  moderator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolution TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add status column to forum_posts if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'forum_posts' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.forum_posts ADD COLUMN status TEXT NOT NULL DEFAULT 'published';
  END IF;
END $$;

-- Add RLS policies for forum_post_reports
ALTER TABLE public.forum_post_reports ENABLE ROW LEVEL SECURITY;

-- Allow users to create reports
CREATE POLICY "Users can create reports" ON public.forum_post_reports
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow users to view their own reports
CREATE POLICY "Users can view their own reports" ON public.forum_post_reports
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Allow admins to view all reports
CREATE POLICY "Admins can view all reports" ON public.forum_post_reports
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

-- Allow admins to update reports
CREATE POLICY "Admins can update reports" ON public.forum_post_reports
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER set_forum_post_reports_updated_at
BEFORE UPDATE ON public.forum_post_reports
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create notifications for admins when a post is reported
CREATE OR REPLACE FUNCTION public.notify_admins_on_post_report()
RETURNS TRIGGER AS $$
DECLARE
  admin_id UUID;
  post_content TEXT;
  thread_title TEXT;
BEGIN
  -- Get post content and thread title
  SELECT p.content, t.title INTO post_content, thread_title
  FROM public.forum_posts p
  JOIN public.forum_threads t ON p.thread_id = t.id
  WHERE p.id = NEW.post_id;

  -- Create notification for each admin
  FOR admin_id IN
    SELECT id FROM public.profiles WHERE user_role = 'admin'
  LOOP
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      action_url,
      related_id,
      related_type
    ) VALUES (
      admin_id,
      'New Post Report',
      'A post in "' || thread_title || '" has been reported for "' || NEW.reason || '"',
      'forum_report',
      '/admin/forum/moderation',
      NEW.id,
      'forum_post_report'
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for admin notifications
CREATE TRIGGER notify_admins_on_post_report
AFTER INSERT ON public.forum_post_reports
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_on_post_report();
