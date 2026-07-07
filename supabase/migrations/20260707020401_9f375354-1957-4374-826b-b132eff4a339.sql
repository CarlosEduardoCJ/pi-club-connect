
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS from_profile_id uuid;

CREATE OR REPLACE FUNCTION public.notify_post_like()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _author_id uuid; _liker_name text; _liker_avatar text;
BEGIN
  SELECT author_id INTO _author_id FROM public.posts WHERE id = NEW.post_id;
  IF _author_id IS NULL OR _author_id = NEW.profile_id THEN RETURN NEW; END IF;
  SELECT name, COALESCE(avatar, '') INTO _liker_name, _liker_avatar FROM public.profiles WHERE id = NEW.profile_id;
  INSERT INTO public.notifications (profile_id, type, message, from_user, from_avatar, from_profile_id, is_read)
  VALUES (_author_id, 'like', 'curtiu sua publicação', COALESCE(_liker_name,'Alguém'), _liker_avatar, NEW.profile_id, false);
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_new_follower()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _follower_name text; _follower_avatar text;
BEGIN
  IF NEW.follower_id = NEW.following_id THEN RETURN NEW; END IF;
  SELECT name, COALESCE(avatar, '') INTO _follower_name, _follower_avatar FROM public.profiles WHERE id = NEW.follower_id;
  INSERT INTO public.notifications (profile_id, type, message, from_user, from_avatar, from_profile_id, is_read)
  VALUES (NEW.following_id, 'follow', 'começou a te seguir', COALESCE(_follower_name,'Alguém'), _follower_avatar, NEW.follower_id, false);
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_new_dm()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _sender_name text; _sender_avatar text; _preview text;
BEGIN
  IF NEW.sender_id = NEW.recipient_id THEN RETURN NEW; END IF;
  SELECT name, COALESCE(avatar, '') INTO _sender_name, _sender_avatar FROM public.profiles WHERE id = NEW.sender_id;
  _preview := left(COALESCE(NEW.content,''), 80);
  INSERT INTO public.notifications (profile_id, type, message, from_user, from_avatar, from_profile_id, is_read)
  VALUES (NEW.recipient_id, 'message',
          CASE WHEN _preview = '' THEN 'te enviou uma mensagem' ELSE 'te enviou: ' || _preview END,
          COALESCE(_sender_name,'Alguém'), _sender_avatar, NEW.sender_id, false);
  RETURN NEW;
END; $$;

-- posts_count trigger
CREATE OR REPLACE FUNCTION public.update_profile_posts_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET posts_count = (SELECT count(*) FROM public.posts WHERE author_id = NEW.author_id) WHERE id = NEW.author_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET posts_count = (SELECT count(*) FROM public.posts WHERE author_id = OLD.author_id) WHERE id = OLD.author_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END; $$;

DROP TRIGGER IF EXISTS update_profile_posts_count_trg ON public.posts;
CREATE TRIGGER update_profile_posts_count_trg
AFTER INSERT OR DELETE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.update_profile_posts_count();

-- backfill posts_count
UPDATE public.profiles p SET posts_count = COALESCE((SELECT count(*) FROM public.posts WHERE author_id = p.id), 0);
