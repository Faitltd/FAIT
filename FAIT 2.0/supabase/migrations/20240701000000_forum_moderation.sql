-- Forum Moderation Migration

-- Forum Post Reports Table
CREATE TABLE IF NOT EXISTS forum_post_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Forum Thread Locks Table (for tracking who locked a thread and why)
CREATE TABLE IF NOT EXISTS forum_thread_locks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  moderator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unlocked_at TIMESTAMPTZ,
  UNIQUE(thread_id, locked_at)
);

-- Forum Post Edits Table (for tracking edits to posts)
CREATE TABLE IF NOT EXISTS forum_post_edits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  editor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_content TEXT NOT NULL,
  reason TEXT,
  edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Forum Moderation Actions Table (for tracking all moderation actions)
CREATE TABLE IF NOT EXISTS forum_moderation_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moderator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_forum_post_reports_post_id ON forum_post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_reports_user_id ON forum_post_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_reports_status ON forum_post_reports(status);
CREATE INDEX IF NOT EXISTS idx_forum_thread_locks_thread_id ON forum_thread_locks(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_edits_post_id ON forum_post_edits(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_moderation_actions_entity_id ON forum_moderation_actions(entity_id);

-- Create RLS policies
ALTER TABLE forum_post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_thread_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_moderation_actions ENABLE ROW LEVEL SECURITY;

-- Forum post reports policies
CREATE POLICY "Users can create reports"
  ON forum_post_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports"
  ON forum_post_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Moderators can view all reports"
  ON forum_post_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.user_role = 'admin' OR profiles.user_role = 'moderator')
    )
  );

CREATE POLICY "Moderators can update reports"
  ON forum_post_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.user_role = 'admin' OR profiles.user_role = 'moderator')
    )
  );

-- Forum thread locks policies
CREATE POLICY "Anyone can view thread locks"
  ON forum_thread_locks FOR SELECT
  USING (TRUE);

CREATE POLICY "Moderators can manage thread locks"
  ON forum_thread_locks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.user_role = 'admin' OR profiles.user_role = 'moderator')
    )
  );

-- Forum post edits policies
CREATE POLICY "Anyone can view post edits"
  ON forum_post_edits FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can track their own post edits"
  ON forum_post_edits FOR INSERT
  WITH CHECK (auth.uid() = editor_id);

CREATE POLICY "Moderators can track any post edits"
  ON forum_post_edits FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.user_role = 'admin' OR profiles.user_role = 'moderator')
    )
  );

-- Forum moderation actions policies
CREATE POLICY "Moderators can create moderation actions"
  ON forum_moderation_actions FOR INSERT
  WITH CHECK (
    auth.uid() = moderator_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.user_role = 'admin' OR profiles.user_role = 'moderator')
    )
  );

CREATE POLICY "Moderators can view moderation actions"
  ON forum_moderation_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.user_role = 'admin' OR profiles.user_role = 'moderator')
    )
  );

-- Add function to log moderation actions
CREATE OR REPLACE FUNCTION log_moderation_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO forum_moderation_actions (
    moderator_id,
    action_type,
    entity_type,
    entity_id,
    details
  ) VALUES (
    auth.uid(),
    TG_ARGV[0],
    TG_ARGV[1],
    NEW.id,
    jsonb_build_object('data', row_to_json(NEW)::jsonb)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for logging moderation actions
CREATE TRIGGER log_thread_lock_action
AFTER INSERT ON forum_thread_locks
FOR EACH ROW
EXECUTE FUNCTION log_moderation_action('lock_thread', 'forum_thread');

CREATE TRIGGER log_thread_unlock_action
AFTER UPDATE ON forum_thread_locks
FOR EACH ROW
WHEN (OLD.unlocked_at IS NULL AND NEW.unlocked_at IS NOT NULL)
EXECUTE FUNCTION log_moderation_action('unlock_thread', 'forum_thread');

CREATE TRIGGER log_report_resolution_action
AFTER UPDATE ON forum_post_reports
FOR EACH ROW
WHEN (OLD.status = 'pending' AND NEW.status != 'pending')
EXECUTE FUNCTION log_moderation_action('resolve_report', 'forum_post_report');

-- Add function to create notification for post author when their post is reported
CREATE OR REPLACE FUNCTION notify_post_author_on_report()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  post_content TEXT;
  thread_title TEXT;
BEGIN
  -- Get post author and content
  SELECT posts.user_id, posts.content, threads.title
  INTO post_author_id, post_content, thread_title
  FROM forum_posts posts
  JOIN forum_threads threads ON posts.thread_id = threads.id
  WHERE posts.id = NEW.post_id;
  
  -- Create notification for post author
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    action_url,
    related_id,
    related_type
  ) VALUES (
    post_author_id,
    'Your post has been reported',
    'Your post in "' || thread_title || '" has been reported for "' || NEW.reason || '"',
    'forum_report',
    '/forum/thread/' || (SELECT slug FROM forum_threads WHERE id = (SELECT thread_id FROM forum_posts WHERE id = NEW.post_id)),
    NEW.post_id,
    'forum_post'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for notifying post author on report
CREATE TRIGGER notify_post_author_on_report_trigger
AFTER INSERT ON forum_post_reports
FOR EACH ROW
EXECUTE FUNCTION notify_post_author_on_report();
