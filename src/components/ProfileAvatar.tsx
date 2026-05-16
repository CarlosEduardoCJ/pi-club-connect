import { ReactNode, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileAvatarProps {
  /** Either a full storage URL or a path inside the `avatars` bucket. */
  src?: string | null;
  alt?: string;
  fallback?: ReactNode;
  className?: string;
}

// Module-level cache: storage path -> object URL (blob)
const blobCache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

function extractAvatarPath(src?: string | null): string | null {
  if (!src) return null;
  if (!/^https?:\/\//i.test(src)) return src.replace(/^\/+/, '');
  const m = src.match(/\/avatars\/(.+?)(?:\?.*)?$/);
  return m ? m[1] : null;
}

async function loadWatermarkedPhoto(path: string): Promise<string | null> {
  if (blobCache.has(path)) return blobCache.get(path)!;
  if (inflight.has(path)) return inflight.get(path)!;

  const p = (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const url = `${SUPABASE_URL}/functions/v1/get-profile-photo?path=${encodeURIComponent(path)}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: SUPABASE_ANON,
      },
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    blobCache.set(path, objectUrl);
    return objectUrl;
  })().finally(() => inflight.delete(path));

  inflight.set(path, p);
  return p;
}

/**
 * Avatar de perfil. A foto é sempre carregada através da Edge Function
 * `get-profile-photo`, que aplica a marca d'água do usuário logado
 * diretamente nos pixels da imagem. O bucket `avatars` é privado — links
 * diretos não funcionam.
 */
const ProfileAvatar = ({
  src,
  alt = '',
  fallback,
  className = 'w-10 h-10 rounded-full',
}: ProfileAvatarProps) => {
  const path = extractAvatarPath(src);
  const [url, setUrl] = useState<string | null>(() =>
    path ? blobCache.get(path) ?? null : null,
  );

  useEffect(() => {
    let active = true;
    if (!path) {
      setUrl(null);
      return;
    }
    const cached = blobCache.get(path);
    if (cached) {
      setUrl(cached);
      return;
    }
    loadWatermarkedPhoto(path).then((u) => {
      if (active) setUrl(u);
    });
    return () => {
      active = false;
    };
  }, [path]);

  return (
    <div
      className={`relative overflow-hidden bg-primary/10 flex items-center justify-center ${className}`}
    >
      {url ? (
        <img src={url} alt={alt} className="w-full h-full object-cover" />
      ) : (
        fallback
      )}
    </div>
  );
};

export default ProfileAvatar;
