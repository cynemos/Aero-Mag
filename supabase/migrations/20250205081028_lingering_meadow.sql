-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own messages" ON chat_messages;

-- Create new policy for viewing messages
CREATE POLICY "Users can view their own messages and admin responses"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    -- L'utilisateur peut voir ses propres messages
    auth.uid() = user_id
    OR
    -- L'utilisateur peut voir les réponses de l'admin qui lui sont destinées
    (
      is_admin_message = true 
      AND EXISTS (
        SELECT 1 
        FROM chat_messages user_msg 
        WHERE user_msg.user_id = auth.uid() 
        AND user_msg.user_id = chat_messages.user_id
      )
    )
    OR
    -- L'admin peut voir tous les messages
    auth.jwt() ->> 'email' = 'cynemos@gmail.com'
  );
