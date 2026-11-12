-- Create a view for chat users with their last messages and unread count
CREATE OR REPLACE VIEW chat_users_with_messages AS
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

-- Grant access to the view
GRANT SELECT ON chat_users_with_messages TO authenticated;
