import { useState } from 'react';
import NotificationsBell from '@/components/NotificationsBell';
import { useProfile, useProfileClubs, useUserPosts } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import PostCard from '@/components/PostCard';
import EditProfileDialog from '@/components/EditProfileDialog';
import ProfileAvatar from '@/components/ProfileAvatar';
import FollowListDialog from '@/components/FollowListDialog';
import { Settings, Edit3 } from 'lucide-react';
import TeacherBadge from '@/components/TeacherBadge';
import AchievementsBadges from '@/components/AchievementsBadges';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2);

const ProfileScreen = () => {
  const { profileId } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [followDialog, setFollowDialog] = useState<null | 'followers' | 'following'>(null);
  const { data: user, isLoading: loadingUser } = useProfile(profileId || '');
  const { data: memberships } = useProfileClubs(profileId || '');
  const { data: userPostsData } = useUserPosts(profileId || undefined);

  const userClubs = (memberships || []).map(m => m.clubs).filter(Boolean);
  const userPosts = userPostsData || [];

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
          <div className="flex items-center gap-1">
            <NotificationsBell />
            <Link
              to="/settings"
              className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
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
            <ProfileAvatar
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-full"
              emojiClassName="text-[3.5rem]"
              fallback={<span className="text-2xl font-extrabold text-primary">{getInitials(user.name)}</span>}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
                {(user as { is_teacher?: boolean }).is_teacher && <TeacherBadge size="md" />}
              </div>
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
              <p className="text-lg font-extrabold text-foreground">{userPosts.length}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <button onClick={() => setFollowDialog('followers')} className="text-center hover:opacity-80 transition-opacity">
              <p className="text-lg font-extrabold text-foreground">{user.followers_count}</p>
              <p className="text-xs text-muted-foreground">Seguidores</p>
            </button>
            <button onClick={() => setFollowDialog('following')} className="text-center hover:opacity-80 transition-opacity">
              <p className="text-lg font-extrabold text-foreground">{user.following_count}</p>
              <p className="text-xs text-muted-foreground">Seguindo</p>
            </button>
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

          <AchievementsBadges
            postsCount={user.posts_count || 0}
            followersCount={user.followers_count || 0}
            createdAt={user.created_at}
          />
        </motion.div>

        <div className="p-4 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground">Publicações</h3>
          {userPosts.length > 0 ? (
            userPosts.map((post, i) => (
              <PostCard
                key={post.id}
                post={{
                  id: post.id,
                  authorId: post.author_id,
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
      <FollowListDialog
        open={followDialog !== null}
        onOpenChange={(o) => !o && setFollowDialog(null)}
        profileId={profileId || ''}
        mode={followDialog || 'followers'}
      />
    </div>
  );
};

export default ProfileScreen;
