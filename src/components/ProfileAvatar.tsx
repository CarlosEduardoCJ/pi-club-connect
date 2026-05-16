import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useSupabaseData';

interface ProfileAvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: ReactNode;
  className?: string;
  /** Tailwind text size for the watermark, e.g. 'text-[8px]'. */
  watermarkTextClass?: string;
}

/**
 * Avatar/foto de perfil com marca d'água do USUÁRIO QUE ESTÁ VISUALIZANDO
 * (não o dono da foto), exibida na parte inferior em branco semitransparente
 * com sombra escura para legibilidade.
 */
const ProfileAvatar = ({
  src,
  alt = '',
  fallback,
  className = 'w-10 h-10 rounded-full',
  watermarkTextClass = 'text-[8px]',
}: ProfileAvatarProps) => {
  const { profileId } = useAuth();
  const { data: viewer } = useProfile(profileId || '');
  const label = viewer?.username || viewer?.name || '';

  return (
    <div className={`relative overflow-hidden bg-primary/10 flex items-center justify-center ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        fallback
      )}
      {label && (
        <span
          aria-hidden="true"
          className={`pointer-events-none select-none absolute inset-x-0 bottom-0 text-center text-white/70 ${watermarkTextClass} font-semibold leading-tight px-0.5 truncate`}
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.75), 0 0 1px rgba(0,0,0,0.9)' }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default ProfileAvatar;
