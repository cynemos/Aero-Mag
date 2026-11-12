-- Mettre à jour la vue chat_users_with_messages pour corriger le compteur de messages non lus
CREATE OR REPLACE VIEW chat_users_with_messages AS
WITH users_with_messages AS (
  SELECT DISTINCT user_id
  FROM chat_messages
  WHERE user_id != (
    SELECT id 
    FROM auth.users 
    WHERE email = 'cynemos@gmail.com'
    LIMIT 1
  )
),
last_messages AS (
  SELECT DISTINCT ON (user_id)
    user_id,
    content,
    created_at as last_message_time,
    is_admin_message,
    read
  FROM chat_messages
  WHERE user_id IN (SELECT user_id FROM users_with_messages)
  ORDER BY user_id, created_at DESC
),
unread_counts AS (
  SELECT 
    user_id,
    COUNT(*) as unread_count
  FROM chat_messages
  WHERE NOT read 
    AND NOT is_admin_message
    AND user_id IN (SELECT user_id FROM users_with_messages)
    -- Ajouter une condition pour exclure les messages des commandes annulées
    AND NOT EXISTS (
      SELECT 1 
      FROM orders o
      WHERE o.user_id = chat_messages.user_id
      AND o.status = 'cancelled'
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
FROM users_with_messages uwm
JOIN profiles p ON p.user_id = uwm.user_id
LEFT JOIN last_messages lm ON lm.user_id = uwm.user_id
LEFT JOIN unread_counts uc ON uc.user_id = uwm.user_id
WHERE p.email != 'cynemos@gmail.com'
ORDER BY lm.last_message_time DESC NULLS LAST;
