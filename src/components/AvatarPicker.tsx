import { PRESET_AVATARS, PresetAvatar } from '@/lib/presetAvatars';
import { Check } from 'lucide-react';

interface AvatarPickerProps {
  selectedId?: string | null;
  onSelect: (avatar: PresetAvatar) => void;
}

const AvatarPicker = ({ selectedId, onSelect }: AvatarPickerProps) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {PRESET_AVATARS.map((a) => {
        const selected = a.id === selectedId;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a)}
            className={`relative aspect-square rounded-full bg-gradient-to-br ${a.gradient} flex items-center justify-center transition-transform hover:scale-105 ${
              selected ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : ''
            }`}
            aria-label={a.label}
          >
            <span className="text-2xl select-none" role="img" aria-hidden>
              {a.emoji}
            </span>
            {selected && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                <Check className="w-3 h-3" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default AvatarPicker;
