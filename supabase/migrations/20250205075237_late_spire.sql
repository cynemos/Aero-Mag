-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_new_message ON chat_messages;
DROP FUNCTION IF EXISTS notify_new_message();

-- Drop existing table and recreate it with proper structure
DROP TABLE IF EXISTS chat_messages;

CREATE TABLE chat_messages (
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

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Users can view their own messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' = 'cynemos@gmail.com'
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

-- Create a view to join chat_messages with profiles
CREATE OR REPLACE VIEW chat_messages_with_profiles AS
SELECT 
  cm.*,
  p.first_name,
  p.last_name,
  p.email
FROM chat_messages cm
JOIN profiles p ON p.user_id = cm.user_id;

-- Grant access to the view
GRANT SELECT ON chat_messages_with_profiles TO authenticated;

-- Create notification function
CREATE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'new_message',
    json_build_object(
      'id', NEW.id,
      'user_id', NEW.user_id,
      'is_admin_message', NEW.is_admin_message
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifications
CREATE TRIGGER on_new_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();
