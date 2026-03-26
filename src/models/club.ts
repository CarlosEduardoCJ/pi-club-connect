// Modelo de dados dos clubes estudantis.
// ARQUITETO DE SOFTWARE: Substituir estes dados mock por uma consulta ao Firebase Firestore
// Ex: collection('clubs').get() ou onSnapshot() para dados em tempo real.

export interface Club {
  id: string;
  name: string;
  icon: string; // Nome do ícone Lucide
  description: string;
}

export const mockClubs: Club[] = [
  { id: '1', name: 'Robótica', icon: 'Bot', description: 'Construa robôs e aprenda programação aplicada à automação.' },
  { id: '2', name: 'Xadrez', icon: 'Crown', description: 'Desenvolva raciocínio estratégico com o esporte da mente.' },
  { id: '3', name: 'Teatro', icon: 'Drama', description: 'Expresse-se através da arte cênica e interpretação.' },
  { id: '4', name: 'Matemática', icon: 'Calculator', description: 'Explore a beleza dos números e resolva desafios olímpicos.' },
  { id: '5', name: 'Esportes', icon: 'Trophy', description: 'Pratique esportes variados e participe de campeonatos.' },
  { id: '6', name: 'Música', icon: 'Music', description: 'Aprenda instrumentos, cante e componha com outros músicos.' },
  { id: '7', name: 'Culinária', icon: 'ChefHat', description: 'Descubra receitas e técnicas culinárias de todo o mundo.' },
  { id: '8', name: 'Leitura', icon: 'BookOpen', description: 'Compartilhe leituras e mergulhe em universos literários.' },
  { id: '9', name: 'Socorristas', icon: 'HeartPulse', description: 'Aprenda primeiros socorros e salve vidas.' },
];
