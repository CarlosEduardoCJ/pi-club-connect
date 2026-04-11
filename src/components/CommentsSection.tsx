import { useState, useEffect } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: { name: string; avatar: string | null } | null;
}

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2);

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

const CommentsSection = ({ postId, initialCount, onCountChange }: { postId: string; initialCount: number; onCountChange: (count: number) => void }) => {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [displayCount, setDisplayCount] = useState(initialCount);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const { profileId } = useAuth();

  const fetchComments = async () => {
    const { data } = await supabase
      .from('post_comments')
      .select('id, content, created_at, profiles!post_comments_profile_id_fkey(name, avatar)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (data) {
      setComments(data as unknown as Comment[]);
      setDisplayCount(data.length);
      onCountChange(data.length);
    }
  };

  useEffect(() => {
    if (open) fetchComments();
  }, [open]);

  const handleSubmit = async () => {
    const trimmed = newComment.trim();
    if (!trimmed || !profileId || sending) return;
    if (trimmed.length > 500) { toast.error('Comentário muito longo (máx 500 caracteres)'); return; }
    setSending(true);
    const { error } = await supabase.from('post_comments').insert({
      post_id: postId,
      profile_id: profileId,
      content: trimmed,
    });
    setSending(false);
    if (error) { toast.error('Erro ao comentar'); return; }
    setNewComment('');
    fetchComments();
  };

  return (
    <>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <MessageCircle className="w-4 h-4" />
        <span>{comments.length || ''}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="col-span-full overflow-hidden"
          >
            <div className="pt-3 flex flex-col gap-2">
              {comments.map(c => (
                <div key={c.id} className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary">{getInitials(c.profiles?.name || '?')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{c.profiles?.name}</span>
                      <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_at)}</span>
                    </div>
                    <p className="text-xs text-foreground/80 break-words">{c.content}</p>
                  </div>
                </div>
              ))}

              {profileId && (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="Escreva um comentário..."
                    maxLength={500}
                    className="flex-1 text-xs bg-muted/50 rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button onClick={handleSubmit} disabled={sending || !newComment.trim()} className="text-accent disabled:opacity-40">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CommentsSection;
