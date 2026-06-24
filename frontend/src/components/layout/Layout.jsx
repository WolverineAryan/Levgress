import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useSocket } from '../../hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Flame, 
  Rocket, 
  Star, 
  Target, 
  Zap, 
  Book, 
  Shield, 
  CheckCircle2,
  Sparkles,
  PartyPopper
} from 'lucide-react';

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

export const Layout = () => {
  const socket = useSocket();
  const [celebration, setCelebration] = useState(null);

  useEffect(() => {
    if (!socket) return;

    // Listen for level-up celebration
    const handleLevelUp = (data) => {
      setCelebration({
        type: 'level',
        title: 'LEVEL UP!',
        subtitle: `You reached Level ${data.level}!`,
        description: 'Your developer credentials have been upgraded. Keep completing milestones to reach the next tier!',
        themeColor: 'text-status-warning border-status-warning/30 shadow-status-warning/10',
      });
    };

    // Listen for badge-earned celebration
    const handleBadgeEarned = (badge) => {
      setCelebration({
        type: 'badge',
        title: 'NEW BADGE UNLOCKED!',
        subtitle: badge.name,
        description: badge.description,
        xpReward: badge.xpReward,
        iconName: badge.icon,
        themeColor: 'text-accent-primary border-accent-primary/30 shadow-accent-primary/10',
      });
    };

    // Listen for milestone completions (via special notifications)
    const handleNotification = (notification) => {
      const msg = notification.message || '';
      if (
        msg.toLowerCase().includes('approved') || 
        msg.toLowerCase().includes('completed') ||
        msg.toLowerCase().includes('validated')
      ) {
        setCelebration({
          type: 'milestone',
          title: 'MILESTONE COMPLETED!',
          subtitle: 'Validation Success',
          description: msg,
          themeColor: 'text-status-success border-status-success/30 shadow-status-success/10',
        });
      }
    };

    socket.on('level-up', handleLevelUp);
    socket.on('badge-earned', handleBadgeEarned);
    socket.on('notification', handleNotification);

    return () => {
      socket.off('level-up', handleLevelUp);
      socket.off('badge-earned', handleBadgeEarned);
      socket.off('notification', handleNotification);
    };
  }, [socket]);

  // Determine which icon to render
  const renderCelebrationIcon = () => {
    if (!celebration) return null;

    if (celebration.type === 'badge') {
      const IconComp = BADGE_ICONS[celebration.iconName] || Award;
      return <IconComp className="w-16 h-16 text-accent-primary animate-pulse" />;
    }

    if (celebration.type === 'level') {
      return (
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-status-warning/20 border-t-status-warning rounded-full animate-spin" />
          <Star className="w-10 h-10 text-status-warning animate-bounce" />
        </div>
      );
    }

    // Milestone completion
    return <CheckCircle2 className="w-16 h-16 text-status-success animate-pulse" />;
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col relative overflow-x-hidden">
      {/* Background ambient radial glow */}
      <div className="ambient-glow top-0 right-0" />
      <div className="ambient-glow bottom-0 left-0" />

      <Navbar />

      <div className="flex flex-1 relative z-10">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>

      {/* Celebration Popup Portal Overlay */}
      <AnimatePresence>
        {celebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
            {/* Animated glowing dots representing particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-accent-primary/30 blur-[2px]"
                  style={{
                    top: `${Math.random() * 80 + 10}%`,
                    left: `${Math.random() * 80 + 10}%`,
                    animation: `float 4s ease-in-out infinite ${i * 0.3}s`,
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className={`w-full max-w-sm bg-bg-card border p-8 rounded-2xl text-center relative overflow-hidden shadow-2xl ${celebration.themeColor}`}
            >
              {/* Top Poppers */}
              <div className="absolute -top-6 -left-6 opacity-20">
                <PartyPopper className="w-24 h-24 rotate-45 text-text-primary" />
              </div>
              <div className="absolute -top-6 -right-6 opacity-20">
                <PartyPopper className="w-24 h-24 -rotate-45 text-text-primary" />
              </div>

              {/* Sparkle background indicator */}
              <div className="inline-flex items-center gap-1 bg-accent-primary/10 text-accent-primary px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-6 border border-accent-primary/20">
                <Sparkles className="w-3 h-3" />
                {celebration.title}
              </div>

              {/* Central Celebration Icon */}
              <div className="flex justify-center mb-6">
                {renderCelebrationIcon()}
              </div>

              {/* Achievement Text */}
              <h2 className="text-xl font-extrabold text-text-primary tracking-tight leading-snug">
                {celebration.subtitle}
              </h2>
              <p className="text-xs text-text-secondary mt-3 leading-relaxed px-2">
                {celebration.description}
              </p>

              {celebration.xpReward && (
                <div className="mt-5 inline-flex items-center justify-center gap-1.5 bg-status-success/15 text-status-success px-4 py-1.5 rounded-full text-xs font-black border border-status-success/20 shadow-lg shadow-status-success/5 animate-pulse">
                  +{celebration.xpReward} XP REWARD
                </div>
              )}

              {/* Confirm/Dismiss Button */}
              <button
                onClick={() => setCelebration(null)}
                className="mt-8 w-full py-2.5 bg-accent-primary hover:bg-accent-hover text-bg-primary font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-accent-primary/10 hover:shadow-accent-hover/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                Awesome!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
