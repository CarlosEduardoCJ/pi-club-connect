
-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. RLS policies for user_roles
CREATE POLICY "Roles viewable by authenticated users"
ON public.user_roles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Admin policies for clubs (CRUD)
CREATE POLICY "Admins can insert clubs"
ON public.clubs FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update clubs"
ON public.clubs FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete clubs"
ON public.clubs FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Admin policies for events
CREATE POLICY "Admins can insert events"
ON public.events FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update events"
ON public.events FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete events"
ON public.events FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Admin policies for posts (update + delete)
CREATE POLICY "Admins can update posts"
ON public.posts FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete posts"
ON public.posts FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Admin policies for notifications
CREATE POLICY "Admins can insert notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete notifications"
ON public.notifications FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 9. Admin policies for post_comments (delete any)
CREATE POLICY "Admins can delete any comment"
ON public.post_comments FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
