// Modelos de dados para o sistema de chat do PI_Club.
// ARQUITETO DE SOFTWARE: Substituir dados mock por Firebase Firestore + Realtime Database.

export interface ChatRoom {
  id: string;
  type: 'club' | 'direct';
  name: string;
  icon?: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  createdAt: string;
  isOwn: boolean;
}

// ===== DADOS MOCK =====

export const mockChatRooms: ChatRoom[] = [
  { id: 'r1', type: 'club', name: 'Robótica', icon: 'Bot', participants: ['u1', 'u2'], lastMessage: 'Alguém leva os parafusos amanhã?', lastMessageTime: '2026-03-16T09:30:00Z', unreadCount: 3 },
  { id: 'r2', type: 'club', name: 'Xadrez', icon: 'Crown', participants: ['u1', 'u4'], lastMessage: 'Partida marcada pra sexta!', lastMessageTime: '2026-03-16T08:15:00Z', unreadCount: 1 },
  { id: 'r3', type: 'club', name: 'Teatro', icon: 'Drama', participants: ['u3', 'u5'], lastMessage: 'O figurino ficou lindo!', lastMessageTime: '2026-03-15T22:00:00Z', unreadCount: 0 },
  { id: 'r4', type: 'direct', name: 'Pedro Lucas', participants: ['u1', 'u2'], lastMessage: 'Valeu pela ajuda no projeto!', lastMessageTime: '2026-03-15T20:30:00Z', unreadCount: 2 },
  { id: 'r5', type: 'direct', name: 'Maria Clara', participants: ['u1', 'u3'], lastMessage: 'Vamos ensaiar juntas?', lastMessageTime: '2026-03-15T18:00:00Z', unreadCount: 0 },
  { id: 'r6', type: 'club', name: 'Música', icon: 'Music', participants: ['u1', 'u6'], lastMessage: 'O festival vai ser demais 🎶', lastMessageTime: '2026-03-15T16:45:00Z', unreadCount: 0 },
];

export const mockMessages: Record<string, ChatMessage[]> = {
  r1: [
    { id: 'm1', roomId: 'r1', senderId: 'u2', senderName: 'Pedro Lucas', senderAvatar: '', content: 'E aí pessoal, como ficou o braço do robô?', createdAt: '2026-03-16T09:00:00Z', isOwn: false },
    { id: 'm2', roomId: 'r1', senderId: 'u1', senderName: 'Ana Beatriz', senderAvatar: '', content: 'Ficou top! Só falta calibrar o sensor.', createdAt: '2026-03-16T09:10:00Z', isOwn: true },
    { id: 'm3', roomId: 'r1', senderId: 'u2', senderName: 'Pedro Lucas', senderAvatar: '', content: 'Show! Eu trago o multímetro.', createdAt: '2026-03-16T09:20:00Z', isOwn: false },
    { id: 'm4', roomId: 'r1', senderId: 'u2', senderName: 'Pedro Lucas', senderAvatar: '', content: 'Alguém leva os parafusos amanhã?', createdAt: '2026-03-16T09:30:00Z', isOwn: false },
  ],
  r2: [
    { id: 'm5', roomId: 'r2', senderId: 'u4', senderName: 'João Henrique', senderAvatar: '', content: 'Bora jogar uma blitz?', createdAt: '2026-03-16T08:00:00Z', isOwn: false },
    { id: 'm6', roomId: 'r2', senderId: 'u1', senderName: 'Ana Beatriz', senderAvatar: '', content: 'Bora sim! 5 minutos?', createdAt: '2026-03-16T08:05:00Z', isOwn: true },
    { id: 'm7', roomId: 'r2', senderId: 'u4', senderName: 'João Henrique', senderAvatar: '', content: 'Partida marcada pra sexta!', createdAt: '2026-03-16T08:15:00Z', isOwn: false },
  ],
  r4: [
    { id: 'm8', roomId: 'r4', senderId: 'u2', senderName: 'Pedro Lucas', senderAvatar: '', content: 'Ana, conseguiu terminar o código?', createdAt: '2026-03-15T20:00:00Z', isOwn: false },
    { id: 'm9', roomId: 'r4', senderId: 'u1', senderName: 'Ana Beatriz', senderAvatar: '', content: 'Sim! Tá no GitHub já.', createdAt: '2026-03-15T20:15:00Z', isOwn: true },
    { id: 'm10', roomId: 'r4', senderId: 'u2', senderName: 'Pedro Lucas', senderAvatar: '', content: 'Valeu pela ajuda no projeto!', createdAt: '2026-03-15T20:30:00Z', isOwn: false },
  ],
};
