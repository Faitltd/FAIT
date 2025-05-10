-- Forum Module Migration

-- Forum Categories Table
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  type TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Forum Threads Table
CREATE TABLE IF NOT EXISTS forum_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Forum Posts Table
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES forum_posts(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  is_solution BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Forum Reactions Table
CREATE TABLE IF NOT EXISTS forum_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_forum_categories_slug ON forum_categories(slug);
CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_user_id ON forum_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_slug ON forum_threads(slug);
CREATE INDEX IF NOT EXISTS idx_forum_posts_thread_id ON forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_parent_id ON forum_posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_forum_reactions_post_id ON forum_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_reactions_user_id ON forum_reactions(user_id);

-- Create RLS policies
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_reactions ENABLE ROW LEVEL SECURITY;

-- Forum categories policies
CREATE POLICY "Anyone can view active forum categories"
  ON forum_categories FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Only admins can manage forum categories"
  ON forum_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Forum threads policies
CREATE POLICY "Anyone can view forum threads"
  ON forum_threads FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can create forum threads"
  ON forum_threads FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own forum threads"
  ON forum_threads FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete forum threads"
  ON forum_threads FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Forum posts policies
CREATE POLICY "Anyone can view published forum posts"
  ON forum_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can create forum posts"
  ON forum_posts FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    NOT EXISTS (
      SELECT 1 FROM forum_threads
      WHERE forum_threads.id = thread_id
      AND forum_threads.is_locked = TRUE
    )
  );

CREATE POLICY "Users can update their own forum posts"
  ON forum_posts FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete forum posts"
  ON forum_posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Forum reactions policies
CREATE POLICY "Anyone can view forum reactions"
  ON forum_reactions FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can create forum reactions"
  ON forum_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forum reactions"
  ON forum_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Create functions for forum
CREATE OR REPLACE FUNCTION increment_thread_view_count(
  _thread_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE forum_threads
  SET view_count = view_count + 1
  WHERE id = _thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get thread post count
CREATE OR REPLACE FUNCTION get_thread_post_count(
  _thread_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  _count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO _count
  FROM forum_posts
  WHERE thread_id = _thread_id
  AND status = 'published';
  
  RETURN _count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get category thread count
CREATE OR REPLACE FUNCTION get_category_thread_count(
  _category_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  _count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO _count
  FROM forum_threads
  WHERE category_id = _category_id;
  
  RETURN _count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get category post count
CREATE OR REPLACE FUNCTION get_category_post_count(
  _category_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  _count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO _count
  FROM forum_posts p
  JOIN forum_threads t ON t.id = p.thread_id
  WHERE t.category_id = _category_id
  AND p.status = 'published';
  
  RETURN _count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark a post as solution
CREATE OR REPLACE FUNCTION mark_post_as_solution(
  _post_id UUID,
  _thread_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- First, unmark any existing solution
  UPDATE forum_posts
  SET is_solution = FALSE
  WHERE thread_id = _thread_id
  AND is_solution = TRUE;
  
  -- Mark the new solution
  UPDATE forum_posts
  SET is_solution = TRUE
  WHERE id = _post_id
  AND thread_id = _thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update thread updated_at when a post is added
CREATE OR REPLACE FUNCTION update_thread_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_threads
  SET updated_at = NOW()
  WHERE id = NEW.thread_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_thread_timestamp
AFTER INSERT ON forum_posts
FOR EACH ROW
EXECUTE FUNCTION update_thread_updated_at();

-- Insert default forum categories
INSERT INTO forum_categories (name, slug, description, type, order_index)
VALUES
  ('General Discussion', 'general-discussion', 'General discussions about the FAIT platform and community', 'general', 1),
  ('Projects', 'projects', 'Discuss ongoing and completed projects', 'projects', 2),
  ('Services', 'services', 'Information and discussions about available services', 'services', 3),
  ('Questions & Answers', 'questions-answers', 'Ask questions and get answers from the community', 'questions', 4),
  ('Announcements', 'announcements', 'Official announcements from the FAIT team', 'announcements', 5),
  ('Feedback & Suggestions', 'feedback-suggestions', 'Share your feedback and suggestions for improvement', 'feedback', 6),
  ('Marketplace', 'marketplace', 'Discussions related to the marketplace', 'marketplace', 7);
