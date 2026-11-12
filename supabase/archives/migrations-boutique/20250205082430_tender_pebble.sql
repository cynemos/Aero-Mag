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

-- Mettre à jour la vue pour inclure uniquement les messages pertinents
CREATE OR REPLACE VIEW chat_messages_with_profiles AS
SELECT 
  cm.*,
  p.first_name,
  p.last_name,
  p.email
FROM chat_messages cm
JOIN profiles p ON p.user_id = cm.user_id
WHERE 
  cm.user_id = auth.uid() 
  OR (cm.is_admin_message = true AND cm.user_id = auth.uid())
  OR auth.jwt() ->> 'email' = 'cynemos@gmail.com';

-- Mettre à jour la vue des utilisateurs du chat
CREATE OR REPLACE VIEW chat_users_with_messages AS
WITH last_messages AS (
  SELECT DISTINCT ON (user_id)
    user_id,
    content,
    created_at as last_message_time,
    is_admin_message,
    read
  FROM chat_messages
  WHERE 
    user_id = auth.uid() 
    OR (is_admin_message = true AND user_id = auth.uid())
    OR auth.jwt() ->> 'email' = 'cynemos@gmail.com'
  ORDER BY user_id, created_at DESC
),
unread_counts AS (
  SELECT 
    user_id,
    COUNT(*) as unread_count
  FROM chat_messages
  WHERE 
    NOT read 
    AND NOT is_admin_message
    AND (
      user_id = auth.uid() 
      OR auth.jwt() ->> 'email' = 'cynemos@gmail.com'
    )
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
WHERE 
  (EXISTS (
    SELECT 1 
    FROM chat_messages cm 
    WHERE cm.user_id = p.user_id
  )
  AND p.email != 'cynemos@gmail.com')
  OR auth.jwt() ->> 'email' = 'cynemos@gmail.com';
