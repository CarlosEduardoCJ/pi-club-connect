import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import ProfileAvatar from '@/components/ProfileAvatar';
import TeacherBadge from '@/components/TeacherBadge';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  profileId: string;
  mode: 'followers' | 'following';
}

interface Row {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  is_teacher?: boolean;
}

const FollowListDialog = ({ open, onOpenChange, profileId, mode }: Props) => {
  const [users, setUsers] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !profileId) return;
    const load = async () => {
      setLoading(true);
      const column = mode === 'followers' ? 'follower_id' : 'following_id';
      const filterColumn = mode === 'followers' ? 'following_id' : 'follower_id';
      const { data } = await supabase
        .from('follows')
        .select(`${column}, profile:profiles!follows_${column}_fkey(id, name, username, avatar, is_teacher)`)
        .eq(filterColumn, profileId);
      const list = ((data as any) || [])
        .map((r: any) => r.profile)
        .filter(Boolean);
      setUsers(list);
      setLoading(false);
    };
    load();
  }, [open, profileId, mode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{mode === 'followers' ? 'Seguidores' : 'Seguindo'}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-6">Carregando...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {mode === 'followers' ? 'Nenhum seguidor ainda.' : 'Ainda não segue ninguém.'}
            </p>
          ) : (
            users.map(u => (
              <Link
                key={u.id}
                to={`/user/${u.id}`}
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <ProfileAvatar
                  src={u.avatar}
                  alt={u.name}
                  className="w-10 h-10 rounded-full"
                  fallback={<span className="text-sm font-bold text-primary">{u.name.slice(0, 2).toUpperCase()}</span>}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-foreground truncate">{u.name}</p>
                    {u.is_teacher && <TeacherBadge />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowListDialog;
