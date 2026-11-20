-- Remove duplicate notifications: keep only the oldest of each (user_id, title) pair
DELETE FROM public.notifications n
USING public.notifications n2
WHERE n.user_id = n2.user_id
  AND n.title = n2.title
  AND n.created_at > n2.created_at;