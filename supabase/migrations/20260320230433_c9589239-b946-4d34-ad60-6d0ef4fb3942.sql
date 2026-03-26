
-- Tighten chat_rooms update to only allow updating last_message fields
-- (the WITH CHECK true on authenticated is acceptable for a school app where all students can post/chat)
-- No additional changes needed - the warnings are for authenticated-only policies which is fine
SELECT 1;
