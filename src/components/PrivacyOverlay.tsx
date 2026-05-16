import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Camada de proteção de privacidade: marca d'água diagonal repetida
 * em tela cheia com o nome completo + ID do usuário logado.
 *
 * O nó é injetado diretamente no <body> via DOM imperativo e protegido
 * por um MutationObserver que recria/restaura o overlay caso alguém
 * tente removê-lo ou alterar seus estilos via DevTools.
 */
const PrivacyOverlay = () => {
  const { user, profileId } = useAuth();
  const nameRef = useRef<string>('');

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    let overlay: HTMLDivElement | null = null;
    let bodyObserver: MutationObserver | null = null;
    let selfObserver: MutationObserver | null = null;

    const STYLE = [
      'position:fixed',
      'inset:0',
      'width:100vw',
      'height:100vh',
      'pointer-events:none',
      'z-index:2147483000',
      'overflow:hidden',
      'user-select:none',
      'opacity:1',
      'display:block',
      'visibility:visible',
      'background:transparent',
    ].join(';') + ';';

    const build = (label: string) => {
      const el = document.createElement('div');
      el.setAttribute('data-privacy-shield', '1');
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = STYLE;

      const inner = document.createElement('div');
      inner.style.cssText = [
        'position:absolute',
        'top:-50%',
        'left:-50%',
        'width:200%',
        'height:200%',
        'transform:rotate(-30deg)',
        'display:grid',
        'grid-template-columns:repeat(auto-fill, minmax(180px, 1fr))',
        'gap:28px 24px',
        'padding:24px',
        'color:rgba(120,120,120,0.15)',
        'font-family:ui-sans-serif,system-ui,sans-serif',
        'font-size:10px',
        'font-weight:500',
        'letter-spacing:0.02em',
        'white-space:nowrap',
      ].join(';') + ';';

      // ~ enough cells to comfortably cover rotated viewport
      const cells = 260;
      for (let i = 0; i < cells; i++) {
        const span = document.createElement('span');
        span.textContent = label;
        span.style.cssText = 'text-align:center;overflow:hidden;';
        inner.appendChild(span);
      }
      el.appendChild(inner);
      return el;
    };

    const ensure = (label: string) => {
      if (cancelled) return;
      const existing = document.querySelector('[data-privacy-shield="1"]');
      if (existing && existing === overlay) {
        // Re-apply style in case it was tampered with
        (overlay as HTMLDivElement).style.cssText = STYLE;
        return;
      }
      if (existing && existing !== overlay) {
        existing.remove();
      }
      overlay = build(label);
      document.body.appendChild(overlay);

      // Re-attach observer to the new node
      if (selfObserver) selfObserver.disconnect();
      selfObserver = new MutationObserver(() => {
        if (!overlay) return;
        if (overlay.style.cssText !== STYLE) {
          overlay.style.cssText = STYLE;
        }
      });
      selfObserver.observe(overlay, { attributes: true, attributeFilter: ['style', 'class'] });
    };

    const start = (label: string) => {
      nameRef.current = label;
      ensure(label);
      bodyObserver = new MutationObserver(() => ensure(nameRef.current));
      bodyObserver.observe(document.body, { childList: true });
    };

    // Try to get the full name from profiles; fall back to email
    (async () => {
      let name = user.email?.split('@')[0] || 'usuário';
      if (profileId) {
        const { data } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', profileId)
          .maybeSingle();
        if (data?.name) name = data.name;
      }
      const label = `${name} · ${user.id}`;
      if (!cancelled) start(label);
    })();

    return () => {
      cancelled = true;
      bodyObserver?.disconnect();
      selfObserver?.disconnect();
      overlay?.remove();
      overlay = null;
    };
  }, [user, profileId]);

  return null;
};

export default PrivacyOverlay;
