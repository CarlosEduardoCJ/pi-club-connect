
-- Notifications triggers: likes, follows, DMs, competitions, events
-- and realtime publication for notifications

CREATE OR REPLACE FUNCTION public.notify_post_like()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _author_id uuid;
  _liker_name text;
  _liker_avatar text;
BEGIN
  SELECT author_id INTO _author_id FROM public.posts WHERE id = NEW.post_id;
  IF _author_id IS NULL OR _author_id = NEW.profile_id THEN RETURN NEW; END IF;
  SELECT name, COALESCE(avatar, '') INTO _liker_name, _liker_avatar
    FROM public.profiles WHERE id = NEW.profile_id;
  INSERT INTO public.notifications (profile_id, type, message, from_user, from_avatar, is_read)
  VALUES (_author_id, 'like', 'curtiu sua publicação', COALESCE(_liker_name,'Alguém'), _liker_avatar, false);
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS notify_post_like_trg ON public.post_likes;
CREATE TRIGGER notify_post_like_trg AFTER INSERT ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.notify_post_like();

CREATE OR REPLACE FUNCTION public.notify_new_follower()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _follower_name text; _follower_avatar text;
BEGIN
  IF NEW.follower_id = NEW.following_id THEN RETURN NEW; END IF;
  SELECT name, COALESCE(avatar, '') INTO _follower_name, _follower_avatar
    FROM public.profiles WHERE id = NEW.follower_id;
  INSERT INTO public.notifications (profile_id, type, message, from_user, from_avatar, is_read)
  VALUES (NEW.following_id, 'follow', 'começou a te seguir', COALESCE(_follower_name,'Alguém'), _follower_avatar, false);
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS notify_new_follower_trg ON public.follows;
CREATE TRIGGER notify_new_follower_trg AFTER INSERT ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.notify_new_follower();

CREATE OR REPLACE FUNCTION public.notify_new_dm()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _sender_name text; _sender_avatar text; _preview text;
BEGIN
  IF NEW.sender_id = NEW.recipient_id THEN RETURN NEW; END IF;
  SELECT name, COALESCE(avatar, '') INTO _sender_name, _sender_avatar
    FROM public.profiles WHERE id = NEW.sender_id;
  _preview := left(COALESCE(NEW.content,''), 80);
  INSERT INTO public.notifications (profile_id, type, message, from_user, from_avatar, is_read)
  VALUES (NEW.recipient_id, 'message',
          CASE WHEN _preview = '' THEN 'te enviou uma mensagem' ELSE 'te enviou: ' || _preview END,
          COALESCE(_sender_name,'Alguém'), _sender_avatar, false);
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS notify_new_dm_trg ON public.direct_messages;
CREATE TRIGGER notify_new_dm_trg AFTER INSERT ON public.direct_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_new_dm();

CREATE OR REPLACE FUNCTION public.notify_new_competition()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (profile_id, type, message, from_user, from_avatar, is_read)
  SELECT p.id, 'competition', 'Nova olimpíada: ' || NEW.name, 'Pi Club', '', false
    FROM public.profiles p
    WHERE p.deleted_at IS NULL;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS notify_new_competition_trg ON public.competitions;
CREATE TRIGGER notify_new_competition_trg AFTER INSERT ON public.competitions
FOR EACH ROW EXECUTE FUNCTION public.notify_new_competition();

CREATE OR REPLACE FUNCTION public.notify_new_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _school text;
BEGIN
  _school := NEW.school;
  IF _school IS NULL AND NEW.club_id IS NOT NULL THEN
    SELECT school INTO _school FROM public.clubs WHERE id = NEW.club_id;
  END IF;
  IF _school IS NULL THEN RETURN NEW; END IF;
  INSERT INTO public.notifications (profile_id, type, message, from_user, from_avatar, is_read)
  SELECT p.id, 'event', 'Novo evento na sua escola: ' || NEW.title, 'Pi Club', '', false
    FROM public.profiles p
    WHERE p.deleted_at IS NULL AND p.school = _school;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS notify_new_event_trg ON public.events;
CREATE TRIGGER notify_new_event_trg AFTER INSERT ON public.events
FOR EACH ROW EXECUTE FUNCTION public.notify_new_event();

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
