-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own messages and admin responses" ON chat_messages;

-- Create new policy for viewing messages
CREATE POLICY "Users can view their own messages and admin responses"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    -- L'utilisateur peut voir ses propres messages
    auth.uid() = user_id
    OR
    -- L'utilisateur peut voir les réponses de l'admin destinées à ses conversations
    (
      is_admin_message = true 
      AND user_id = auth.uid()
    )
    OR
    -- L'admin peut voir tous les messages
    auth.jwt() ->> 'email' = 'cynemos@gmail.com'
  );
