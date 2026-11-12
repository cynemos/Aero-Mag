-- Drop existing view if it exists
DROP VIEW IF EXISTS chat_messages_with_profiles;
DROP VIEW IF EXISTS chat_users_with_messages;

-- Recreate chat_messages table with proper relations
CREATE TABLE IF NOT EXISTS chat_messages_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text NOT NULL,
  is_admin_message boolean NOT NULL DEFAULT false,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT chat_messages_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Copy data if the old table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chat_messages') THEN
    INSERT INTO chat_messages_new (id, user_id, content, is_admin_message, read, created_at)
    SELECT id, user_id, content, is_admin_message, read, created_at
    FROM chat_messages;
  END IF;
END $$;

-- Drop old table and rename new one
DROP TABLE IF EXISTS chat_messages;
ALTER TABLE chat_messages_new RENAME TO chat_messages;

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Users can view their own messages and admin responses"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR (is_admin_message = true AND user_id = auth.uid())
    OR auth.jwt() ->> 'email' = 'cynemos@gmail.com'
  );

CREATE POLICY "Users can create their own messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    (auth.jwt() ->> 'email' = 'cynemos@gmail.com' AND is_admin_message = true)
  );

CREATE POLICY "Admin can update message status"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'cynemos@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'cynemos@gmail.com');

-- Create indexes
CREATE INDEX chat_messages_user_id_idx ON chat_messages(user_id);
CREATE INDEX chat_messages_created_at_idx ON chat_messages(created_at);

-- Create view for chat messages with profiles
CREATE VIEW chat_messages_with_profiles AS
SELECT 
  cm.*,
  p.first_name,
  p.last_name,
  p.email
FROM chat_messages cm
JOIN profiles p ON p.user_id = cm.user_id;

-- Create view for chat users with messages
CREATE VIEW chat_users_with_messages AS
WITH last_messages AS (
  SELECT DISTINCT ON (user_id)
    user_id,
    content,
    created_at as last_message_time,
    is_admin_message,
    read
  FROM chat_messages
  ORDER BY user_id, created_at DESC
),
unread_counts AS (
  SELECT 
    user_id,
    COUNT(*) as unread_count
  FROM chat_messages
  WHERE NOT read AND NOT is_admin_message
  GROUP BY user_id
)
SELECT 
  p.user_id,
  p.email,
  p.first_name,
  p.last_name,
  COALESCE(uc.unread_count, 0) as unread_count,
  lm.content as last_message_content,
  lm.last_message_time,
  lm.is_admin_message as last_message_is_admin
FROM profiles p
LEFT JOIN last_messages lm ON lm.user_id = p.user_id
LEFT JOIN unread_counts uc ON uc.user_id = p.user_id
WHERE EXISTS (
  SELECT 1 
  FROM chat_messages cm 
  WHERE cm.user_id = p.user_id
)
AND p.email != 'cynemos@gmail.com';

-- Grant access to views
GRANT SELECT ON chat_messages_with_profiles TO authenticated;
GRANT SELECT ON chat_users_with_messages TO authenticated;
