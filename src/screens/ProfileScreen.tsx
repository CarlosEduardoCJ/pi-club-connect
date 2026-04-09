import { useState } from 'react';
import { useProfile, useProfileClubs, usePosts } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import PostCard from '@/components/PostCard';
import EditProfileDialog from '@/components/EditProfileDialog';
import { Settings, Edit3 } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2);

const ProfileScreen = () => {
  const { profileId } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const { data: user, isLoading: loadingUser } = useProfile(profileId || '');
  const { data: memberships } = useProfileClubs(profileId || '');
  const { data: allPosts } = usePosts();

  const userClubs = (memberships || []).map(m => m.clubs).filter(Boolean);
  const userPosts = (allPosts || []).filter(p => p.author_id === profileId);

  if (loadingUser || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-tight">Perfil</h1>
          <Link
            to="/settings"
            className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card p-6"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-extrabold text-primary">{getInitials(user.name)}</span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.username}</p>
              <p className="text-xs text-accent font-semibold mt-0.5">{user.grade}</p>
            </div>
            <button onClick={() => setEditOpen(true)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-accent/10 transition-colors">
              <Edit3 className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <p className="text-sm text-foreground leading-relaxed mb-4">{user.bio}</p>

          <div className="flex items-center justify-around py-3 border-t border-b border-border">
            <div className="text-center">
              <p className="text-lg font-extrabold text-foreground">{user.posts_count}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-foreground">{user.followers_count}</p>
              <p className="text-xs text-muted-foreground">Seguidores</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-foreground">{user.following_count}</p>
              <p className="text-xs text-muted-foreground">Seguindo</p>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-bold text-foreground mb-3">Meus Clubes</h3>
            <div className="flex gap-2 flex-wrap">
              {userClubs.map(club => {
                if (!club) return null;
                const ClubIcon = (Icons as unknown as Record<string, LucideIcon>)[club.icon] || Icons.Circle;
                return (
                  <Link
                    key={club.id}
                    to={`/club/${club.id}`}
                    className="flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-accent/20 transition-colors"
                  >
                    <ClubIcon className="w-3 h-3" />
                    {club.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>

        <div className="p-4 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground">Publicações</h3>
          {userPosts.length > 0 ? (
            userPosts.map((post, i) => (
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
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma publicação ainda.</p>
          )}
        </div>
      </main>
      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={{ id: user.id, name: user.name, username: user.username, bio: user.bio || '', grade: user.grade || '', avatar: user.avatar || '' }}
      />
    </div>
  );
};

export default ProfileScreen;
