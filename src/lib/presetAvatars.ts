// Galeria de avatares pré-definidos para escolha do usuário.
// O valor salvo em `profiles.avatar` é uma string no formato `preset:<id>`.

export interface PresetAvatar {
  id: string;
  emoji: string;
  gradient: string; // tailwind classes
  label: string;
  category?: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  // Animais (mantidos)
  { id: '1',  emoji: '🦊', gradient: 'from-orange-400 to-rose-500',     label: 'Raposa', category: 'Animais' },
  { id: '2',  emoji: '🐼', gradient: 'from-slate-300 to-slate-600',     label: 'Panda', category: 'Animais' },
  { id: '3',  emoji: '🦁', gradient: 'from-amber-300 to-orange-600',    label: 'Leão', category: 'Animais' },
  { id: '4',  emoji: '🐸', gradient: 'from-lime-300 to-emerald-600',    label: 'Sapo', category: 'Animais' },
  { id: '5',  emoji: '🐙', gradient: 'from-pink-300 to-fuchsia-600',    label: 'Polvo', category: 'Animais' },
  { id: '6',  emoji: '🦄', gradient: 'from-violet-300 to-purple-600',   label: 'Unicórnio', category: 'Animais' },
  { id: '7',  emoji: '🐧', gradient: 'from-sky-300 to-indigo-600',      label: 'Pinguim', category: 'Animais' },
  { id: '8',  emoji: '🐯', gradient: 'from-yellow-300 to-amber-600',    label: 'Tigre', category: 'Animais' },
  { id: '9',  emoji: '🐨', gradient: 'from-zinc-300 to-zinc-600',       label: 'Coala', category: 'Animais' },
  { id: '10', emoji: '🦉', gradient: 'from-amber-200 to-stone-600',     label: 'Coruja', category: 'Animais' },
  { id: '11', emoji: '🐳', gradient: 'from-cyan-300 to-blue-600',       label: 'Baleia', category: 'Animais' },
  { id: '12', emoji: '🦋', gradient: 'from-teal-300 to-sky-600',        label: 'Borboleta', category: 'Animais' },
  { id: '13', emoji: '🐢', gradient: 'from-green-300 to-teal-700',      label: 'Tartaruga', category: 'Animais' },
  { id: '14', emoji: '🐝', gradient: 'from-yellow-200 to-yellow-600',   label: 'Abelha', category: 'Animais' },
  { id: '15', emoji: '🦖', gradient: 'from-emerald-300 to-green-700',   label: 'Dino', category: 'Animais' },
  { id: '16', emoji: '🐠', gradient: 'from-orange-300 to-pink-500',     label: 'Peixe', category: 'Animais' },

  // Programação
  { id: '17', emoji: '🤖', gradient: 'from-slate-400 to-zinc-700',      label: 'Robô', category: 'Programação' },
  { id: '18', emoji: '💻', gradient: 'from-indigo-400 to-blue-700',     label: 'Computador', category: 'Programação' },
  { id: '19', emoji: '👨‍💻', gradient: 'from-blue-400 to-indigo-700',    label: 'Código', category: 'Programação' },

  // Xadrez
  { id: '20', emoji: '♟️', gradient: 'from-stone-400 to-stone-700',     label: 'Peão', category: 'Xadrez' },
  { id: '21', emoji: '♚', gradient: 'from-amber-400 to-yellow-700',     label: 'Rei', category: 'Xadrez' },
  { id: '22', emoji: '♞', gradient: 'from-neutral-400 to-neutral-700',  label: 'Cavalo', category: 'Xadrez' },

  // Esportes
  { id: '23', emoji: '⚽', gradient: 'from-green-400 to-emerald-700',   label: 'Bola', category: 'Esportes' },
  { id: '24', emoji: '🏆', gradient: 'from-yellow-300 to-amber-600',    label: 'Troféu', category: 'Esportes' },
  { id: '25', emoji: '🏅', gradient: 'from-amber-300 to-orange-700',    label: 'Medalha', category: 'Esportes' },

  // Música
  { id: '26', emoji: '🎵', gradient: 'from-pink-400 to-rose-700',       label: 'Nota Musical', category: 'Música' },
  { id: '27', emoji: '🎸', gradient: 'from-red-400 to-rose-700',        label: 'Guitarra', category: 'Música' },
  { id: '28', emoji: '🎧', gradient: 'from-violet-400 to-purple-700',   label: 'Fone', category: 'Música' },

  // Robótica
  { id: '29', emoji: '⚙️', gradient: 'from-zinc-400 to-slate-700',      label: 'Engrenagem', category: 'Robótica' },

  // Teatro
  { id: '30', emoji: '🎭', gradient: 'from-fuchsia-400 to-purple-700',  label: 'Máscaras', category: 'Teatro' },
  { id: '31', emoji: '🎬', gradient: 'from-rose-400 to-red-700',        label: 'Cortina', category: 'Teatro' },

  // Matemática
  { id: '32', emoji: '🧮', gradient: 'from-orange-300 to-red-600',      label: 'Calculadora', category: 'Matemática' },
  { id: '33', emoji: '♾️', gradient: 'from-cyan-400 to-blue-700',       label: 'Infinito', category: 'Matemática' },

  // Leitura
  { id: '34', emoji: '📚', gradient: 'from-amber-400 to-orange-700',    label: 'Livros', category: 'Leitura' },
  { id: '35', emoji: '👓', gradient: 'from-slate-300 to-gray-600',      label: 'Óculos', category: 'Leitura' },

  // Culinária
  { id: '36', emoji: '👨‍🍳', gradient: 'from-red-300 to-orange-600',    label: 'Chef', category: 'Culinária' },
  { id: '37', emoji: '🍳', gradient: 'from-yellow-300 to-orange-600',   label: 'Panela', category: 'Culinária' },

  // Fotografia
  { id: '38', emoji: '📷', gradient: 'from-neutral-400 to-zinc-700',    label: 'Câmera', category: 'Fotografia' },

  // Eco-Turismo
  { id: '39', emoji: '🌳', gradient: 'from-green-400 to-emerald-700',   label: 'Árvore', category: 'Eco-Turismo' },
  { id: '40', emoji: '🍃', gradient: 'from-lime-300 to-green-600',      label: 'Folha', category: 'Eco-Turismo' },
  { id: '41', emoji: '🏔️', gradient: 'from-sky-300 to-slate-600',      label: 'Montanha', category: 'Eco-Turismo' },

  // Competições Acadêmicas
  { id: '42', emoji: '🥇', gradient: 'from-yellow-400 to-amber-700',    label: 'Ouro', category: 'Competições' },
  { id: '43', emoji: '⭐', gradient: 'from-yellow-300 to-orange-600',   label: 'Estrela', category: 'Competições' },
];

export const PRESET_PREFIX = 'preset:';

export const parseAvatar = (value?: string | null): PresetAvatar | null => {
  if (!value || !value.startsWith(PRESET_PREFIX)) return null;
  const id = value.slice(PRESET_PREFIX.length);
  return PRESET_AVATARS.find(a => a.id === id) || null;
};

export const buildAvatarValue = (id: string) => `${PRESET_PREFIX}${id}`;
