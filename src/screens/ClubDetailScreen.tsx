import { useParams, Link } from 'react-router-dom';
import { useClubById, useClubMembers, usePosts } from '@/hooks/useSupabaseData';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, Users, MessageCircle, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import PostCard from '@/components/PostCard';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2);

const ClubDetailScreen = () => {
  const { id } = useParams<{ id: string }>();
  const { data: club, isLoading } = useClubById(id);
  const { data: members } = useClubMembers(id);
  const { data: allPosts } = usePosts(id);
  const [activeTab, setActiveTab] = useState<'about' | 'members' | 'posts'>('about');
  const { profileId } = useAuth();
  const queryClient = useQueryClient();
  const [joining, setJoining] = useState(false);

  const isMember = (members || []).some(m => m.profile_id === profileId);

  const handleJoinLeave = async () => {
    if (!profileId || !id) return;
    setJoining(true);
    if (isMember) {
      const membership = (members || []).find(m => m.profile_id === profileId);
      if (membership) {
        const { error } = await supabase.from('club_members').delete().eq('id', membership.id);
        if (error) { toast.error('Erro ao sair do clube'); setJoining(false); return; }
        toast.success('Você saiu do clube');
      }
    } else {
      const { error } = await supabase.from('club_members').insert({ club_id: id, profile_id: profileId });
      if (error) { toast.error('Erro ao entrar no clube'); setJoining(false); return; }
      // Auto-create chat room for club if it doesn't exist
      const { data: existingRoom } = await supabase.from('chat_rooms').select('id').eq('club_id', id).maybeSingle();
      if (!existingRoom && club) {
        await supabase.from('chat_rooms').insert({
          name: `${club.name} - Chat`,
          type: 'club',
          club_id: id,
          icon: club.icon,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
      toast.success('Você entrou no clube!');
    }
    queryClient.invalidateQueries({ queryKey: ['club-members', id] });
    setJoining(false);
  };

  if (isLoading || !club) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{isLoading ? 'Carregando...' : 'Clube não encontrado.'}</p>
      </div>
    );
  }

  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[club.icon] || Icons.Circle;
  const clubMembers = (members || []).map(m => m.profiles).filter(Boolean);
  const clubPosts = allPosts || [];

  const tabs = [
    { key: 'about' as const, label: 'Sobre' },
    { key: 'members' as const, label: `Membros (${clubMembers.length})` },
    { key: 'posts' as const, label: `Posts (${clubPosts.length})` },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-background border-b border-border py-4 px-6 flex items-center gap-3 sticky top-0 z-10">
        <Link to="/" className="text-foreground hover:text-accent transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">{club.name}</h1>
      </header>

      <main className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center py-8 bg-card"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <IconComponent className="w-12 h-12 text-accent" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground">{club.name}</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {clubMembers.length} membros</span>
            <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {clubPosts.length} posts</span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-2 h-2 rounded-full bg-secondary" />
            <span className="text-xs font-semibold text-secondary">Inscrições Abertas</span>
          </div>
          {profileId && (
            <button
              onClick={handleJoinLeave}
              disabled={joining}
              className={`mt-4 px-8 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
                isMember
                  ? 'bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground'
                  : 'bg-accent text-accent-foreground hover:bg-accent/90'
              }`}
            >
              {isMember && <LogOut className="w-4 h-4" />}
              {joining ? 'Aguarde...' : isMember ? 'Sair do Clube' : 'Participar'}
            </button>
          )}
        </motion.div>

        <div className="flex border-b border-border bg-card sticky top-[57px] z-10">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-xs font-bold text-center transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'text-accent border-accent'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === 'about' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <h3 className="text-base font-bold text-foreground mb-3">Sobre o Clube</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{club.description}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                Junte-se a nós para desenvolver novas habilidades, participar de eventos e conhecer pessoas com os mesmos interesses.
              </p>
            </motion.div>
          )}

          {activeTab === 'members' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col gap-2">
              {clubMembers.map((member, i) => {
                if (!member) return null;
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 bg-card rounded-[var(--radius)] p-3"
                    style={{ boxShadow: 'var(--shadow-card)' }}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{getInitials(member.name)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.grade}</p>
                    </div>
                    <button className="text-xs font-semibold text-accent hover:underline">Seguir</button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'posts' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col gap-4">
              {clubPosts.length > 0 ? (
                clubPosts.map((post, i) => (
                  <PostCard
                    key={post.id}
                    post={{
                      id: post.id,
                      authorName: post.profiles?.name || '',
                      authorUsername: post.profiles?.username || '',
                      authorAvatar: post.profiles?.avatar || '',
                      clubName: post.clubs?.name || '',
                      content: post.content,
                      imageUrl: post.image_url || undefined,
                      likesCount: post.likes_count || 0,
                      commentsCount: post.comments_count || 0,
                      isLiked: false,
                      createdAt: post.created_at,
                    }}
                    index={i}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma publicação neste clube ainda.</p>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClubDetailScreen;
