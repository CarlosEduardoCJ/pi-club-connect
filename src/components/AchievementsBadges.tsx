import { Award, Calendar, Users, Flame } from 'lucide-react';

interface Achievement {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  unlocked: boolean;
}

interface Props {
  postsCount: number;
  followersCount: number;
  createdAt: string;
}

const AchievementsBadges = ({ postsCount, followersCount, createdAt }: Props) => {
  const daysOnApp = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);

  const achievements: Achievement[] = [
    { id: 'first-post', label: 'Primeiro Post', description: 'Publicou o primeiro post', icon: Award, unlocked: postsCount >= 1 },
    { id: '30-days', label: 'Membro há 30 dias', description: 'Completou 30 dias no app', icon: Calendar, unlocked: daysOnApp >= 30 },
    { id: 'popular', label: 'Popular', description: 'Atingiu 10 seguidores', icon: Users, unlocked: followersCount >= 10 },
    { id: 'active', label: 'Ativo', description: 'Fez 5 posts', icon: Flame, unlocked: postsCount >= 5 },
  ];

  return (
    <div className="mt-5">
      <h3 className="text-sm font-bold text-foreground mb-3">Conquistas</h3>
      <div className="grid grid-cols-2 gap-2">
        {achievements.map((a) => {
          const Icon = a.icon;
          return (
            <div
              key={a.id}
              className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${
                a.unlocked
                  ? 'border-accent/30 bg-accent/5'
                  : 'border-border bg-muted/40 opacity-50'
              }`}
              title={a.description}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  a.unlocked ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{a.label}</p>
                <p className="text-[10px] text-muted-foreground truncate">{a.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsBadges;
