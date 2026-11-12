/*
  # Module de chat

  1. Nouvelle Table
    - `chat_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `content` (text)
      - `is_admin_message` (boolean)
      - `read` (boolean)
      - `created_at` (timestamp)

  2. Sécurité
    - Enable RLS
    - Policies pour la lecture et l'écriture des messages
*/

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  content text NOT NULL,
  is_admin_message boolean NOT NULL DEFAULT false,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chat_messages

-- Users can view their own messages
CREATE POLICY "Users can view their own messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' = 'cynemos@gmail.com'
  );

-- Users can create their own messages
CREATE POLICY "Users can create their own messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    (auth.jwt() ->> 'email' = 'cynemos@gmail.com' AND is_admin_message = true)
  );

-- Only admin can update message read status
CREATE POLICY "Admin can update message status"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'cynemos@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'cynemos@gmail.com');

-- Create index for better performance
CREATE INDEX chat_messages_user_id_idx ON chat_messages(user_id);
CREATE INDEX chat_messages_created_at_idx ON chat_messages(created_at);

-- Function to notify on new messages
CREATE OR REPLACE FUNCTION notify_new_message()
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

-- Trigger for new message notifications
CREATE TRIGGER on_new_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();
