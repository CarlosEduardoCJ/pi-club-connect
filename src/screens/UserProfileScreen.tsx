import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { usePosts } from '@/hooks/useSupabaseData';
import PostCard from '@/components/PostCard';
import ProfileAvatar from '@/components/ProfileAvatar';
import FollowListDialog from '@/components/FollowListDialog';
import TeacherBadge from '@/components/TeacherBadge';
import { ArrowLeft, UserPlus, UserCheck } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2);

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  grade: string | null;
  posts_count: number | null;
  followers_count: number | null;
  following_count: number | null;
  is_teacher?: boolean;
}

interface ClubInfo {
  id: string;
  name: string;
  icon: string;
}

const UserProfileScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profileId } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [clubs, setClubs] = useState<ClubInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [followDialog, setFollowDialog] = useState<null | 'followers' | 'following'>(null);
  const { data: allPosts } = usePosts();

  const userPosts = (allPosts || []).filter(p => p.author_id === id);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const [{ data: profile }, { data: memberships }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('club_members').select('*, clubs(*)').eq('profile_id', id),
      ]);
      if (profile) setUser(profile as UserProfile);
      if (memberships) setClubs(memberships.map((m: any) => m.clubs).filter(Boolean));

      if (profileId && profileId !== id) {
        const { data } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', profileId)
          .eq('following_id', id)
          .maybeSingle();
        setIsFollowing(!!data);
      }
      setLoading(false);
    };
    load();
  }, [id, profileId]);

  const toggleFollow = async () => {
    if (!profileId || !id || toggling || profileId === id) return;
    setToggling(true);
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', profileId).eq('following_id', id);
      setIsFollowing(false);
      setUser(prev => prev ? { ...prev, followers_count: Math.max(0, (prev.followers_count || 0) - 1) } : prev);
      toast.success('Deixou de seguir');
    } else {
      const { error } = await supabase.from('follows').insert({ follower_id: profileId, following_id: id });
      if (!error) {
        setIsFollowing(true);
        setUser(prev => prev ? { ...prev, followers_count: (prev.followers_count || 0) + 1 } : prev);
        toast.success('Seguindo!');
      }
    }
    setToggling(false);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando perfil...</p>
      </div>
    );
  }

  const isOwnProfile = profileId === id;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-extrabold tracking-tight">Perfil</h1>
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
              fallback={<span className="text-2xl font-extrabold text-primary">{getInitials(user.name)}</span>}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
                {user.is_teacher && <TeacherBadge size="md" />}
              </div>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              {user.grade && <p className="text-xs text-accent font-semibold mt-0.5">{user.grade}</p>}
            </div>
            {!isOwnProfile && profileId && (
              <button
                onClick={toggleFollow}
                disabled={toggling}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                  isFollowing
                    ? 'bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                    : 'bg-accent text-accent-foreground hover:bg-accent/90'
                }`}
              >
                {isFollowing ? (
                  <><UserCheck className="w-3.5 h-3.5" /> Seguindo</>
                ) : (
                  <><UserPlus className="w-3.5 h-3.5" /> Seguir</>
                )}
              </button>
            )}
          </div>

          {user.bio && <p className="text-sm text-foreground leading-relaxed mb-4">{user.bio}</p>}

          <div className="flex items-center justify-around py-3 border-t border-b border-border">
            <div className="text-center">
              <p className="text-lg font-extrabold text-foreground">{user.posts_count || 0}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <button onClick={() => setFollowDialog('followers')} className="text-center hover:opacity-80 transition-opacity">
              <p className="text-lg font-extrabold text-foreground">{user.followers_count || 0}</p>
              <p className="text-xs text-muted-foreground">Seguidores</p>
            </button>
            <button onClick={() => setFollowDialog('following')} className="text-center hover:opacity-80 transition-opacity">
              <p className="text-lg font-extrabold text-foreground">{user.following_count || 0}</p>
              <p className="text-xs text-muted-foreground">Seguindo</p>
            </button>
          </div>

          {clubs.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Clubes</h3>
              <div className="flex gap-2 flex-wrap">
                {clubs.map(club => {
                  const ClubIcon = (Icons as unknown as Record<string, LucideIcon>)[club.icon] || Icons.Circle;
                  return (
                    <span key={club.id} className="flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-semibold">
                      <ClubIcon className="w-3 h-3" />
                      {club.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
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
      <FollowListDialog
        open={followDialog !== null}
        onOpenChange={(o) => !o && setFollowDialog(null)}
        profileId={id || ''}
        mode={followDialog || 'followers'}
      />
    </div>
  );
};

export default UserProfileScreen;
