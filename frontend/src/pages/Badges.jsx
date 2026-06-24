import { useState, useEffect } from 'react';
import * as studentsApi from '../api/students';
import { Card, CardHeader, CardTitle, CardContent, Badge as Tag, CardDescription } from '../components/ui';
import { Award, Flame, Rocket, Star, Target, Zap, Book, Shield, Lock } from 'lucide-react';
import { formatDate } from '../utils/date';
import { cn } from '../utils/classnames';

const BADGE_ICONS = {
  rocket: Rocket,
  target: Target,
  flame: Flame,
  zap: Zap,
  star: Star,
  award: Award,
  book: Book,
  shield: Shield,
};

export const Badges = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBadges = async () => {
    try {
      const res = await studentsApi.getMyBadges();
      setBadges(res.data.data.badges);
    } catch (err) {
      setError('Failed to fetch badges inventory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col space-y-4 animate-pulse">
        <div className="h-10 bg-bg-card w-1/4 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-bg-card rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  // Count earned badges
  const earnedCount = badges.filter((b) => b.isEarned).length;

  return (
    <div className="flex flex-col space-y-8 select-none">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Award className="text-accent-primary" /> Achieved Badges
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Unlock gamified achievements. You have earned {earnedCount} / {badges.length} badges.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {badges.map((b) => {
          const Icon = BADGE_ICONS[b.icon] || Award;
          const isEarned = b.isEarned;

          return (
            <Card
              key={b._id}
              className={cn(
                "flex flex-col items-center text-center p-6 transition-all duration-300 relative border-t-2",
                isEarned
                  ? "border-t-accent-primary bg-accent-primary/[0.01] shadow-[0_0_15px_rgba(192,133,82,0.02)]"
                  : "border-t-transparent opacity-60"
              )}
            >
              {/* Badge Icon bubble */}
              <div className={cn(
                "p-4 rounded-full border mb-4 relative",
                isEarned
                  ? "bg-accent-primary/10 text-accent-primary border-accent-primary/20 shadow-[0_0_10px_var(--color-accent-glow)] animate-float"
                  : "bg-bg-elevated text-text-muted border-border-subtle"
              )}>
                <Icon className="w-8 h-8" />
                {!isEarned && (
                  <div className="absolute -top-1 -right-1 p-1 bg-bg-card border border-border-subtle rounded-full text-text-muted">
                    <Lock className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>

              <CardTitle className="text-sm font-bold text-text-primary">{b.name}</CardTitle>
              
              <span className="text-[10px] text-status-success font-black mt-1.5 bg-status-success/10 px-2 py-0.5 rounded-full border border-status-success/15 select-none">
                +{b.xpReward || 200} XP
              </span>
              
              <CardDescription className="text-xs text-text-secondary mt-2 max-w-[180px] leading-relaxed">
                {b.description}
              </CardDescription>

              {isEarned ? (
                <span className="text-[9px] text-accent-primary font-bold mt-4">
                  Unlocked {formatDate(b.earnedAt)}
                </span>
              ) : (
                <span className="text-[9px] text-text-muted font-semibold mt-4">
                  LOCKED
                </span>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
