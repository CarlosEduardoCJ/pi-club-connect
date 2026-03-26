// Modelos de dados para funcionalidades sociais do PI_Club.
// ARQUITETO DE SOFTWARE: Substituir todos os dados mock por consultas ao Firebase Firestore.

import { Club } from './club';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  grade: string; // série/turma
  joinedClubs: string[]; // IDs dos clubes
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorUsername: string;
  clubId: string;
  clubName: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string; // ISO date
}

export interface ClubEvent {
  id: string;
  clubId: string;
  clubName: string;
  clubIcon: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendeesCount: number;
  isAttending: boolean;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'event' | 'join' | 'mention';
  message: string;
  fromUser: string;
  fromAvatar: string;
  createdAt: string;
  isRead: boolean;
}

// ===== DADOS MOCK =====

export const mockUser: UserProfile = {
  id: 'u1',
  name: 'Ana Beatriz',
  username: '@anabeatriz',
  avatar: '',
  bio: '🤖 Apaixonada por robótica e xadrez. 3º ano do EM. Sonhando com engenharia!',
  grade: '3º Ano A',
  joinedClubs: ['1', '2', '6'],
  postsCount: 24,
  followersCount: 142,
  followingCount: 89,
};

export const mockMembers: UserProfile[] = [
  { id: 'u1', name: 'Ana Beatriz', username: '@anabeatriz', avatar: '', bio: '', grade: '3º Ano A', joinedClubs: ['1', '2', '6'], postsCount: 24, followersCount: 142, followingCount: 89 },
  { id: 'u2', name: 'Pedro Lucas', username: '@pedrolucas', avatar: '', bio: '', grade: '2º Ano B', joinedClubs: ['1', '5'], postsCount: 12, followersCount: 98, followingCount: 67 },
  { id: 'u3', name: 'Maria Clara', username: '@mariaclara', avatar: '', bio: '', grade: '1º Ano C', joinedClubs: ['3', '6', '8'], postsCount: 45, followersCount: 201, followingCount: 120 },
  { id: 'u4', name: 'João Henrique', username: '@joaohenrique', avatar: '', bio: '', grade: '3º Ano B', joinedClubs: ['4', '9'], postsCount: 8, followersCount: 56, followingCount: 34 },
  { id: 'u5', name: 'Sofia Almeida', username: '@sofiaalmeida', avatar: '', bio: '', grade: '2º Ano A', joinedClubs: ['7', '8'], postsCount: 31, followersCount: 175, followingCount: 92 },
  { id: 'u6', name: 'Lucas Gabriel', username: '@lucasgabriel', avatar: '', bio: '', grade: '1º Ano A', joinedClubs: ['5', '9'], postsCount: 5, followersCount: 43, followingCount: 28 },
];

export const mockPosts: Post[] = [
  {
    id: 'p1', authorId: 'u1', authorName: 'Ana Beatriz', authorAvatar: '', authorUsername: '@anabeatriz',
    clubId: '1', clubName: 'Robótica', content: 'Nosso robô ficou em 2º lugar na competição regional! 🏆🤖 Orgulho demais do time!',
    likesCount: 47, commentsCount: 12, isLiked: false, createdAt: '2026-03-11T10:30:00Z',
  },
  {
    id: 'p2', authorId: 'u3', authorName: 'Maria Clara', authorAvatar: '', authorUsername: '@mariaclara',
    clubId: '3', clubName: 'Teatro', content: 'Ensaio geral amanhã às 15h! Quem vai estar lá? 🎭 A peça está ficando incrível.',
    likesCount: 23, commentsCount: 8, isLiked: true, createdAt: '2026-03-10T18:15:00Z',
  },
  {
    id: 'p3', authorId: 'u5', authorName: 'Sofia Almeida', authorAvatar: '', authorUsername: '@sofiaalmeida',
    clubId: '7', clubName: 'Culinária', content: 'Hoje aprendemos a fazer cuscuz nordestino! Receita da vó ficou perfeita 😋🫕',
    likesCount: 65, commentsCount: 19, isLiked: false, createdAt: '2026-03-10T14:00:00Z',
  },
  {
    id: 'p4', authorId: 'u2', authorName: 'Pedro Lucas', authorAvatar: '', authorUsername: '@pedrolucas',
    clubId: '5', clubName: 'Esportes', content: 'Treino de futsal confirmado pra sexta! Bora time! ⚽💪',
    likesCount: 34, commentsCount: 6, isLiked: true, createdAt: '2026-03-09T20:45:00Z',
  },
  {
    id: 'p5', authorId: 'u4', authorName: 'João Henrique', authorAvatar: '', authorUsername: '@joaohenrique',
    clubId: '4', clubName: 'Matemática', content: 'Resolvemos o problema da semana! Alguém mais tentou o desafio de combinatória? 🧮',
    likesCount: 18, commentsCount: 4, isLiked: false, createdAt: '2026-03-09T16:30:00Z',
  },
  {
    id: 'p6', authorId: 'u6', authorName: 'Lucas Gabriel', authorAvatar: '', authorUsername: '@lucasgabriel',
    clubId: '9', clubName: 'Socorristas', content: 'Certificação de primeiros socorros concluída! Agora sou oficialmente um socorrista da escola 🏥✅',
    likesCount: 52, commentsCount: 15, isLiked: true, createdAt: '2026-03-08T11:00:00Z',
  },
];

export const mockEvents: ClubEvent[] = [
  { id: 'e1', clubId: '1', clubName: 'Robótica', clubIcon: 'Bot', title: 'Hackathon de Robótica', description: 'Competição de 24h para construir um robô autônomo.', date: '2026-03-22', time: '08:00', location: 'Laboratório de Informática', attendeesCount: 28, isAttending: false },
  { id: 'e2', clubId: '3', clubName: 'Teatro', clubIcon: 'Drama', title: 'Apresentação: "O Auto da Compadecida"', description: 'Peça teatral com o elenco do clube.', date: '2026-03-28', time: '19:00', location: 'Auditório Principal', attendeesCount: 95, isAttending: true },
  { id: 'e3', clubId: '5', clubName: 'Esportes', clubIcon: 'Trophy', title: 'Torneio Interclasses de Futsal', description: 'Campeonato entre as turmas do ensino médio.', date: '2026-04-05', time: '14:00', location: 'Quadra Poliesportiva', attendeesCount: 120, isAttending: true },
  { id: 'e4', clubId: '6', clubName: 'Música', clubIcon: 'Music', title: 'Festival de Talentos', description: 'Apresentações musicais abertas a todos os alunos.', date: '2026-04-12', time: '18:30', location: 'Pátio Central', attendeesCount: 67, isAttending: false },
  { id: 'e5', clubId: '2', clubName: 'Xadrez', clubIcon: 'Crown', title: 'Campeonato de Xadrez Relâmpago', description: 'Partidas de 5 minutos. Quem será o mais rápido?', date: '2026-03-15', time: '10:00', location: 'Sala de Jogos', attendeesCount: 32, isAttending: false },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'like', message: 'curtiu sua publicação sobre o robô', fromUser: 'Pedro Lucas', fromAvatar: '', createdAt: '2026-03-11T11:00:00Z', isRead: false },
  { id: 'n2', type: 'comment', message: 'comentou: "Parabéns pelo resultado!"', fromUser: 'Maria Clara', fromAvatar: '', createdAt: '2026-03-11T10:45:00Z', isRead: false },
  { id: 'n3', type: 'event', message: 'Hackathon de Robótica começa em 11 dias!', fromUser: 'Robótica', fromAvatar: '', createdAt: '2026-03-11T08:00:00Z', isRead: false },
  { id: 'n4', type: 'join', message: 'entrou no clube de Xadrez', fromUser: 'Sofia Almeida', fromAvatar: '', createdAt: '2026-03-10T15:30:00Z', isRead: true },
  { id: 'n5', type: 'mention', message: 'mencionou você em uma publicação', fromUser: 'João Henrique', fromAvatar: '', createdAt: '2026-03-10T12:00:00Z', isRead: true },
  { id: 'n6', type: 'like', message: 'curtiu sua publicação sobre culinária', fromUser: 'Lucas Gabriel', fromAvatar: '', createdAt: '2026-03-09T20:00:00Z', isRead: true },
];
