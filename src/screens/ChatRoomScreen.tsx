import { useParams, Link } from 'react-router-dom';
import { useChatRooms, useChatMessages } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Send, Smile, Flag } from 'lucide-react';
import ReportDialog from '@/components/ReportDialog';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const ChatRoomScreen = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { profileId } = useAuth();
  const { data: rooms } = useChatRooms();
  const { data: messages } = useChatMessages(roomId);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const room = (rooms || []).find(r => r.id === roomId);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`chat-${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', roomId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Conversa não encontrada.</p>
      </div>
    );
  }

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !profileId) return;
    setInput('');
    await supabase.from('chat_messages').insert({
      room_id: room.id,
      sender_id: profileId,
      content: text,
    });
    await supabase.from('chat_rooms').update({
      last_message: text,
      last_message_time: new Date().toISOString(),
    }).eq('id', room.id);
    queryClient.invalidateQueries({ queryKey: ['chat-messages', roomId] });
    queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground py-3 px-4 flex items-center gap-3 sticky top-0 z-10">
        <Link to="/chat" className="hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold truncate">{room.name}</h1>
          <p className="text-[10px] opacity-70">{room.type === 'club' ? 'Grupo do clube' : 'Mensagem direta'}</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-2">
        <div className="max-w-lg mx-auto flex flex-col gap-2">
          {(messages || []).map((msg, i) => {
            const isOwn = msg.sender_id === profileId;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  {!isOwn && (
                    <span className="text-[10px] font-semibold text-primary mb-0.5 ml-1">{msg.profiles?.name}</span>
                  )}
                  <div
                    className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-card text-foreground rounded-bl-md'
                    }`}
                    style={!isOwn ? { boxShadow: 'var(--shadow-card)' } : undefined}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-muted-foreground mt-0.5 mx-1">{formatTime(msg.created_at)}</span>
                </div>
              </motion.div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </main>

      <div className="border-t border-border bg-card px-4 py-3 sticky bottom-0">
        <div className="max-w-lg mx-auto flex items-end gap-2">
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <Smile className="w-5 h-5" />
          </button>
          <div className="flex-1 bg-background border border-border rounded-2xl px-4 py-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite uma mensagem..."
              rows={1}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none max-h-24"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-40 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoomScreen;
