// Galeria de avatares pré-definidos para escolha do usuário.
// O valor salvo em `profiles.avatar` é uma string no formato `preset:<id>`.

export interface PresetAvatar {
  id: string;
  emoji: string;
  gradient: string; // tailwind classes
  label: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  { id: '1',  emoji: '🦊', gradient: 'from-orange-400 to-rose-500',     label: 'Raposa' },
  { id: '2',  emoji: '🐼', gradient: 'from-slate-300 to-slate-600',     label: 'Panda' },
  { id: '3',  emoji: '🦁', gradient: 'from-amber-300 to-orange-600',    label: 'Leão' },
  { id: '4',  emoji: '🐸', gradient: 'from-lime-300 to-emerald-600',    label: 'Sapo' },
  { id: '5',  emoji: '🐙', gradient: 'from-pink-300 to-fuchsia-600',    label: 'Polvo' },
  { id: '6',  emoji: '🦄', gradient: 'from-violet-300 to-purple-600',   label: 'Unicórnio' },
  { id: '7',  emoji: '🐧', gradient: 'from-sky-300 to-indigo-600',      label: 'Pinguim' },
  { id: '8',  emoji: '🐯', gradient: 'from-yellow-300 to-amber-600',    label: 'Tigre' },
  { id: '9',  emoji: '🐨', gradient: 'from-zinc-300 to-zinc-600',       label: 'Coala' },
  { id: '10', emoji: '🦉', gradient: 'from-amber-200 to-stone-600',     label: 'Coruja' },
  { id: '11', emoji: '🐳', gradient: 'from-cyan-300 to-blue-600',       label: 'Baleia' },
  { id: '12', emoji: '🦋', gradient: 'from-teal-300 to-sky-600',        label: 'Borboleta' },
  { id: '13', emoji: '🐢', gradient: 'from-green-300 to-teal-700',      label: 'Tartaruga' },
  { id: '14', emoji: '🐝', gradient: 'from-yellow-200 to-yellow-600',   label: 'Abelha' },
  { id: '15', emoji: '🦖', gradient: 'from-emerald-300 to-green-700',   label: 'Dino' },
  { id: '16', emoji: '🐠', gradient: 'from-orange-300 to-pink-500',     label: 'Peixe' },
];

export const PRESET_PREFIX = 'preset:';

export const parseAvatar = (value?: string | null): PresetAvatar | null => {
  if (!value || !value.startsWith(PRESET_PREFIX)) return null;
  const id = value.slice(PRESET_PREFIX.length);
  return PRESET_AVATARS.find(a => a.id === id) || null;
};

export const buildAvatarValue = (id: string) => `${PRESET_PREFIX}${id}`;
