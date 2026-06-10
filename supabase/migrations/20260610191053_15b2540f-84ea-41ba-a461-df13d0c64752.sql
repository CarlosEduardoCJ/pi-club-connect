
-- Tabela de mensagens diretas persistentes (estilo WhatsApp)
CREATE TABLE public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) <= 300),
  deleted boolean NOT NULL DEFAULT false,
  reactions jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX direct_messages_pair_idx
  ON public.direct_messages (LEAST(sender_id, recipient_id), GREATEST(sender_id, recipient_id), created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.direct_messages TO authenticated;
GRANT ALL ON public.direct_messages TO service_role;

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Helper: o profile_id pertence ao usuário autenticado?
CREATE OR REPLACE FUNCTION public.profile_belongs_to_auth(_profile_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _profile_id AND user_id = auth.uid()
  )
$$;

-- SELECT: somente remetente ou destinatário
CREATE POLICY "DM: participantes podem ver"
ON public.direct_messages FOR SELECT TO authenticated
USING (
  public.profile_belongs_to_auth(sender_id)
  OR public.profile_belongs_to_auth(recipient_id)
);

-- INSERT: apenas o próprio remetente, e o destinatário precisa ser da mesma escola
CREATE POLICY "DM: enviar como dono e mesma escola"
ON public.direct_messages FOR INSERT TO authenticated
WITH CHECK (
  public.profile_belongs_to_auth(sender_id)
  AND EXISTS (
    SELECT 1
    FROM public.profiles s
    JOIN public.profiles r ON r.id = recipient_id
    WHERE s.id = sender_id
      AND s.school = r.school
      AND r.deleted_at IS NULL
  )
);

-- UPDATE: participantes podem atualizar (para apagar/reagir/marcar lido)
CREATE POLICY "DM: participantes podem atualizar"
ON public.direct_messages FOR UPDATE TO authenticated
USING (
  public.profile_belongs_to_auth(sender_id)
  OR public.profile_belongs_to_auth(recipient_id)
)
WITH CHECK (
  public.profile_belongs_to_auth(sender_id)
  OR public.profile_belongs_to_auth(recipient_id)
);

-- DELETE: apenas remetente
CREATE POLICY "DM: remetente pode excluir"
ON public.direct_messages FOR DELETE TO authenticated
USING (public.profile_belongs_to_auth(sender_id));

-- Habilita Realtime
ALTER TABLE public.direct_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
