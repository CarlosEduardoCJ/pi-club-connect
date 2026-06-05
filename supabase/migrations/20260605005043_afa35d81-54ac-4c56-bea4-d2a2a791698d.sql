CREATE OR REPLACE FUNCTION public.prevent_manual_developer_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.developer IS TRUE
       AND auth.uid() IS NOT NULL
       AND NOT public.has_role(auth.uid(), 'developer'::app_role) THEN
      RAISE EXCEPTION 'Apenas o fluxo protegido de desenvolvedor pode criar perfis de desenvolvedor.'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
    RETURN NEW;
  END IF;

  IF COALESCE(OLD.developer, false) IS DISTINCT FROM COALESCE(NEW.developer, false)
     AND auth.uid() IS NOT NULL
     AND NOT public.has_role(auth.uid(), 'developer'::app_role) THEN
    RAISE EXCEPTION 'Você não pode alterar o marcador de desenvolvedor.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.is_valid_dev_setup_password(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_manual_developer_profile_changes() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;