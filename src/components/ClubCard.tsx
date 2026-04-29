import { Club } from '@/models/club';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ClubCardProps {
  club: Club;
  index: number;
}

const ClubCard = ({ club, index }: ClubCardProps) => {
  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[club.icon] || Icons.Circle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link to={`/club/${club.id}`} className="block group h-full">
        <div
          className="bg-card rounded-[var(--radius)] p-4 h-full min-h-[160px] flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors shrink-0">
            <IconComponent className="w-7 h-7 text-accent" />
          </div>
          <span className="text-sm font-bold text-card-foreground text-center leading-tight line-clamp-2">
            {club.name}
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export default ClubCard;
