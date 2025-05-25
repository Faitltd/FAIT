-- Forum System Migration

-- Create forum_categories table
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  icon_name VARCHAR(50),
  order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_threads table
CREATE TABLE IF NOT EXISTS forum_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  category_id UUID REFERENCES forum_categories(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  post_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  last_post_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'published',
  is_solution BOOLEAN NOT NULL DEFAULT false,
  parent_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_reactions table
CREATE TABLE IF NOT EXISTS forum_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  reaction_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- Create forum_polls table
CREATE TABLE IF NOT EXISTS forum_polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE NOT NULL,
  question VARCHAR(200) NOT NULL,
  is_multiple_choice BOOLEAN NOT NULL DEFAULT false,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id)
);

-- Create forum_poll_options table
CREATE TABLE IF NOT EXISTS forum_poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID REFERENCES forum_polls(id) ON DELETE CASCADE NOT NULL,
  text VARCHAR(200) NOT NULL,
  vote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_poll_votes table
CREATE TABLE IF NOT EXISTS forum_poll_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID REFERENCES forum_polls(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES forum_poll_options(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id, option_id)
);

-- Create forum_thread_views table
CREATE TABLE IF NOT EXISTS forum_thread_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_user_stats table
CREATE TABLE IF NOT EXISTS forum_user_stats (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  post_count INTEGER NOT NULL DEFAULT 0,
  thread_count INTEGER NOT NULL DEFAULT 0,
  reaction_count INTEGER NOT NULL DEFAULT 0,
  solution_count INTEGER NOT NULL DEFAULT 0,
  last_post_at TIMESTAMP WITH TIME ZONE,
  reputation INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update timestamp on forum_categories
CREATE OR REPLACE FUNCTION update_forum_categories_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_forum_categories_timestamp
BEFORE UPDATE ON forum_categories
FOR EACH ROW
EXECUTE FUNCTION update_forum_categories_timestamp();

-- Create function to update timestamp on forum_threads
CREATE OR REPLACE FUNCTION update_forum_threads_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_forum_threads_timestamp
BEFORE UPDATE ON forum_threads
FOR EACH ROW
EXECUTE FUNCTION update_forum_threads_timestamp();

-- Create function to update timestamp on forum_posts
CREATE OR REPLACE FUNCTION update_forum_posts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_forum_posts_timestamp
BEFORE UPDATE ON forum_posts
FOR EACH ROW
EXECUTE FUNCTION update_forum_posts_timestamp();

-- Create function to increment counter
CREATE OR REPLACE FUNCTION increment_counter(row_id UUID, table_name TEXT, counter_name TEXT)
RETURNS INTEGER AS $$
DECLARE
  current_value INTEGER;
  new_value INTEGER;
BEGIN
  EXECUTE format('SELECT %I FROM %I WHERE id = $1', counter_name, table_name)
  INTO current_value
  USING row_id;
  
  new_value := current_value + 1;
  
  EXECUTE format('UPDATE %I SET %I = $1 WHERE id = $2', table_name, counter_name)
  USING new_value, row_id;
  
  RETURN new_value;
END;
$$ LANGUAGE plpgsql;

-- Create function to create a forum thread with initial post
CREATE OR REPLACE FUNCTION create_forum_thread(
  p_user_id UUID,
  p_category_id UUID,
  p_title TEXT,
  p_slug TEXT,
  p_content TEXT
)
RETURNS TABLE (
  thread_id UUID,
  post_id UUID
) AS $$
DECLARE
  v_thread_id UUID;
  v_post_id UUID;
BEGIN
  -- Create the thread
  INSERT INTO forum_threads (
    title,
    slug,
    category_id,
    user_id,
    post_count,
    last_post_at
  ) VALUES (
    p_title,
    p_slug,
    p_category_id,
    p_user_id,
    1,
    NOW()
  ) RETURNING id INTO v_thread_id;
  
  -- Create the initial post
  INSERT INTO forum_posts (
    thread_id,
    user_id,
    content,
    status
  ) VALUES (
    v_thread_id,
    p_user_id,
    p_content,
    'published'
  ) RETURNING id INTO v_post_id;
  
  -- Update user stats
  INSERT INTO forum_user_stats (
    user_id,
    thread_count,
    post_count,
    last_post_at
  ) VALUES (
    p_user_id,
    1,
    1,
    NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    thread_count = forum_user_stats.thread_count + 1,
    post_count = forum_user_stats.post_count + 1,
    last_post_at = NOW();
  
  RETURN QUERY SELECT v_thread_id, v_post_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get forum stats
CREATE OR REPLACE FUNCTION get_forum_stats()
RETURNS TABLE (
  total_categories BIGINT,
  total_threads BIGINT,
  total_posts BIGINT,
  total_users BIGINT,
  latest_user JSON,
  most_active_category JSON
) AS $$
BEGIN
  RETURN QUERY
  WITH categories AS (
    SELECT
      c.id,
      c.name,
      COUNT(p.id) AS post_count
    FROM
      forum_categories c
      LEFT JOIN forum_threads t ON c.id = t.category_id
      LEFT JOIN forum_posts p ON t.id = p.thread_id
    WHERE
      c.is_active = true
    GROUP BY
      c.id, c.name
    ORDER BY
      post_count DESC
    LIMIT 1
  ),
  users AS (
    SELECT
      u.id,
      p.first_name,
      p.last_name,
      p.avatar_url,
      u.created_at
    FROM
      auth.users u
      JOIN profiles p ON u.id = p.id
    ORDER BY
      u.created_at DESC
    LIMIT 1
  )
  SELECT
    (SELECT COUNT(*) FROM forum_categories WHERE is_active = true),
    (SELECT COUNT(*) FROM forum_threads),
    (SELECT COUNT(*) FROM forum_posts WHERE status = 'published'),
    (SELECT COUNT(*) FROM forum_user_stats),
    (SELECT row_to_json(u) FROM users u),
    (SELECT row_to_json(c) FROM categories c);
END;
$$ LANGUAGE plpgsql;

-- Create function to get user forum stats
CREATE OR REPLACE FUNCTION get_user_forum_stats(p_user_id UUID)
RETURNS TABLE (
  post_count INTEGER,
  thread_count INTEGER,
  reaction_count INTEGER,
  solution_count INTEGER,
  last_post_at TIMESTAMP WITH TIME ZONE,
  join_date TIMESTAMP WITH TIME ZONE,
  reputation INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(s.post_count, 0) AS post_count,
    COALESCE(s.thread_count, 0) AS thread_count,
    COALESCE(s.reaction_count, 0) AS reaction_count,
    COALESCE(s.solution_count, 0) AS solution_count,
    s.last_post_at,
    u.created_at AS join_date,
    COALESCE(s.reputation, 0) AS reputation
  FROM
    auth.users u
    LEFT JOIN forum_user_stats s ON u.id = s.user_id
  WHERE
    u.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update thread last_post_at when a post is created
CREATE OR REPLACE FUNCTION update_thread_last_post_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_threads
  SET last_post_at = NEW.created_at
  WHERE id = NEW.thread_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_thread_last_post_at
AFTER INSERT ON forum_posts
FOR EACH ROW
EXECUTE FUNCTION update_thread_last_post_at();

-- Create trigger to update user stats when a post is created
CREATE OR REPLACE FUNCTION update_user_stats_on_post()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO forum_user_stats (
    user_id,
    post_count,
    last_post_at
  ) VALUES (
    NEW.user_id,
    1,
    NEW.created_at
  ) ON CONFLICT (user_id) DO UPDATE SET
    post_count = forum_user_stats.post_count + 1,
    last_post_at = NEW.created_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_stats_on_post
AFTER INSERT ON forum_posts
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_on_post();

-- Create trigger to update user stats when a reaction is created
CREATE OR REPLACE FUNCTION update_user_stats_on_reaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the stats of the post author
  WITH post_author AS (
    SELECT user_id FROM forum_posts WHERE id = NEW.post_id
  )
  INSERT INTO forum_user_stats (
    user_id,
    reaction_count
  ) 
  SELECT
    user_id,
    1
  FROM post_author
  ON CONFLICT (user_id) DO UPDATE SET
    reaction_count = forum_user_stats.reaction_count + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_stats_on_reaction
AFTER INSERT ON forum_reactions
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_on_reaction();

-- Create trigger to update user stats when a post is marked as solution
CREATE OR REPLACE FUNCTION update_user_stats_on_solution()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_solution = true AND (OLD.is_solution = false OR OLD.is_solution IS NULL) THEN
    INSERT INTO forum_user_stats (
      user_id,
      solution_count,
      reputation
    ) VALUES (
      NEW.user_id,
      1,
      15
    ) ON CONFLICT (user_id) DO UPDATE SET
      solution_count = forum_user_stats.solution_count + 1,
      reputation = forum_user_stats.reputation + 15;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_stats_on_solution
AFTER UPDATE OF is_solution ON forum_posts
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_on_solution();

-- Insert initial forum categories
INSERT INTO forum_categories (
  name,
  description,
  slug,
  type,
  icon_name,
  order,
  is_active
) VALUES
  (
    'General Discussion',
    'General discussions about FAIT Co-op and the construction industry',
    'general-discussion',
    'general',
    'general',
    1,
    true
  ),
  (
    'Projects',
    'Discuss ongoing and completed construction projects',
    'projects',
    'projects',
    'projects',
    2,
    true
  ),
  (
    'Services',
    'Discussions about various construction services and specialties',
    'services',
    'services',
    'services',
    3,
    true
  ),
  (
    'Questions & Answers',
    'Ask questions and get answers from the community',
    'questions-answers',
    'questions',
    'questions',
    4,
    true
  ),
  (
    'Announcements',
    'Official announcements from FAIT Co-op',
    'announcements',
    'announcements',
    'announcements',
    5,
    true
  ),
  (
    'Feedback & Suggestions',
    'Share your feedback and suggestions for FAIT Co-op',
    'feedback-suggestions',
    'feedback',
    'feedback',
    6,
    true
  ),
  (
    'Marketplace',
    'Buy, sell, or trade construction equipment and materials',
    'marketplace',
    'marketplace',
    'marketplace',
    7,
    true
  )
ON CONFLICT DO NOTHING;

-- Set up RLS policies
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_thread_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_user_stats ENABLE ROW LEVEL SECURITY;

-- Forum categories policies
CREATE POLICY "Anyone can view active forum categories"
  ON forum_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all forum categories"
  ON forum_categories FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert forum categories"
  ON forum_categories FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can update forum categories"
  ON forum_categories FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Forum threads policies
CREATE POLICY "Anyone can view forum threads"
  ON forum_threads FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert forum threads"
  ON forum_threads FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Thread authors and admins can update forum threads"
  ON forum_threads FOR UPDATE
  USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Thread authors and admins can delete forum threads"
  ON forum_threads FOR DELETE
  USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Forum posts policies
CREATE POLICY "Anyone can view published forum posts"
  ON forum_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can insert forum posts"
  ON forum_posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Post authors and admins can update forum posts"
  ON forum_posts FOR UPDATE
  USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Post authors and admins can delete forum posts"
  ON forum_posts FOR DELETE
  USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Forum reactions policies
CREATE POLICY "Anyone can view forum reactions"
  ON forum_reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert forum reactions"
  ON forum_reactions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own forum reactions"
  ON forum_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Forum polls policies
CREATE POLICY "Anyone can view forum polls"
  ON forum_polls FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert forum polls"
  ON forum_polls FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() IN (
      SELECT user_id FROM forum_posts WHERE id = post_id
    )
  );

-- Forum poll options policies
CREATE POLICY "Anyone can view forum poll options"
  ON forum_poll_options FOR SELECT
  USING (true);

CREATE POLICY "Poll creators can insert forum poll options"
  ON forum_poll_options FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() IN (
      SELECT p.user_id FROM forum_polls f
      JOIN forum_posts p ON f.post_id = p.id
      WHERE f.id = poll_id
    )
  );

-- Forum poll votes policies
CREATE POLICY "Anyone can view forum poll votes"
  ON forum_poll_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert forum poll votes"
  ON forum_poll_votes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own forum poll votes"
  ON forum_poll_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Forum thread views policies
CREATE POLICY "Anyone can view forum thread views"
  ON forum_thread_views FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert forum thread views"
  ON forum_thread_views FOR INSERT
  WITH CHECK (true);

-- Forum user stats policies
CREATE POLICY "Anyone can view forum user stats"
  ON forum_user_stats FOR SELECT
  USING (true);

CREATE POLICY "System can insert and update forum user stats"
  ON forum_user_stats FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update forum user stats"
  ON forum_user_stats FOR UPDATE
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_user_id ON forum_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_slug ON forum_threads(slug);
CREATE INDEX IF NOT EXISTS idx_forum_posts_thread_id ON forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_parent_id ON forum_posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_status ON forum_posts(status);
CREATE INDEX IF NOT EXISTS idx_forum_reactions_post_id ON forum_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_reactions_user_id ON forum_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_polls_post_id ON forum_polls(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_poll_options_poll_id ON forum_poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_forum_poll_votes_poll_id ON forum_poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_forum_poll_votes_option_id ON forum_poll_votes(option_id);
CREATE INDEX IF NOT EXISTS idx_forum_poll_votes_user_id ON forum_poll_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_thread_views_thread_id ON forum_thread_views(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_thread_views_user_id ON forum_thread_views(user_id);

-- Create text search indexes
CREATE INDEX IF NOT EXISTS idx_forum_threads_title_search ON forum_threads USING GIN (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_forum_posts_content_search ON forum_posts USING GIN (to_tsvector('english', content));
