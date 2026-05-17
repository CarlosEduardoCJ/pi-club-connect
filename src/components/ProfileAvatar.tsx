import { ReactNode } from 'react';
import { parseAvatar } from '@/lib/presetAvatars';

interface ProfileAvatarProps {
  /** Valor salvo em profiles.avatar (formato `preset:<id>`). */
  src?: string | null;
  alt?: string;
  fallback?: ReactNode;
  className?: string;
}

/**
 * Avatar baseado em galeria de presets. Se o valor não for um preset
 * válido, renderiza o fallback (geralmente as iniciais do usuário).
 */
const ProfileAvatar = ({
  src,
  alt = '',
  fallback,
  className = 'w-10 h-10 rounded-full',
}: ProfileAvatarProps) => {
  const preset = parseAvatar(src);

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${
        preset ? `bg-gradient-to-br ${preset.gradient}` : 'bg-primary/10'
      } ${className}`}
      aria-label={alt}
    >
      {preset ? (
        <span className="text-[55%] leading-none select-none" role="img" aria-hidden>
          {preset.emoji}
        </span>
      ) : (
        fallback
      )}
    </div>
  );
};

export default ProfileAvatar;
