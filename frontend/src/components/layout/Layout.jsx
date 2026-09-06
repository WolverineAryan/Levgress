import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useSocket } from '../../hooks/useSocket';
import { getStudentDashboard } from '../../api/students';
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
  XCircle,
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

  // Global Level Up Animation States
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [celebratedLevel, setCelebratedLevel] = useState(1);
  const [streakDays, setStreakDays] = useState(0);
  const [badgesCount, setBadgesCount] = useState(0);

  useEffect(() => {
    if (!socket) return;

    // Listen for level-up celebration
    const handleLevelUp = async (data) => {
      setCelebratedLevel(data.level || 1);
      setShowLevelUp(true);
      
      try {
        const res = await getStudentDashboard();
        const stats = res.data.data.stats;
        setStreakDays(stats.streak || 0);
        setBadgesCount(stats.badgesCount || 0);
      } catch (err) {
        console.error('Failed to load level up stats:', err);
      }
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
      const type = notification.type || '';
      
      if (type === 'MILESTONE_VERIFIED') {
        setCelebration({
          type: 'milestone',
          title: 'MILESTONE ACCEPTED!',
          subtitle: 'Milestone Accepted',
          description: msg,
          themeColor: 'text-status-success border-status-success/30 shadow-status-success/10',
          isRejected: false,
        });
      } else if (type === 'MILESTONE_REJECTED') {
        setCelebration({
          type: 'milestone',
          title: 'MILESTONE REJECTED!',
          subtitle: 'Milestone Rejected',
          description: msg,
          themeColor: 'text-status-danger border-status-danger/30 shadow-status-danger/10',
          isRejected: true,
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
    if (celebration.isRejected) {
      return <XCircle className="w-16 h-16 text-status-danger animate-bounce" />;
    }
    return <CheckCircle2 className="w-16 h-16 text-status-success animate-pulse" />;
  };

  const confettiColors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444'];
  const confettiPieces = Array.from({ length: 60 }).map((_, idx) => {
    const left = `${Math.random() * 100}%`;
    const delay = `${Math.random() * 3}s`;
    const duration = `${3 + Math.random() * 2}s`;
    const color = confettiColors[idx % confettiColors.length];
    const rotate = `${Math.random() * 360}deg`;
    return (
      <div
        key={idx}
        className="confetti-piece"
        style={{
          left,
          animationDelay: delay,
          animationDuration: duration,
          backgroundColor: color,
          transform: `rotate(${rotate})`,
        }}
      />
    );
  });

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
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-6 border ${
                celebration.isRejected 
                  ? 'bg-status-danger/10 text-status-danger border-status-danger/20' 
                  : celebration.type === 'milestone'
                    ? 'bg-status-success/10 text-status-success border-status-success/20'
                    : 'bg-accent-primary/10 text-accent-primary border-accent-primary/20'
              }`}>
                <Sparkles className="w-3 h-3" />
                {celebration.title}
              </div>

              {/* Central Celebration Icon */}
              <div className="flex justify-center mb-6">
                {renderCelebrationIcon()}
              </div>

              {/* Achievement Text */}
              <h2 className={`text-xl font-extrabold tracking-tight leading-snug ${
                celebration.isRejected ? 'text-status-danger' : celebration.type === 'milestone' ? 'text-status-success' : 'text-text-primary'
              }`}>
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
                className={`mt-8 w-full py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
                  celebration.isRejected
                    ? 'bg-status-danger hover:bg-status-danger/90 text-text-primary shadow-status-danger/10 hover:shadow-status-danger/20'
                    : 'bg-accent-primary hover:bg-accent-hover text-bg-primary shadow-accent-primary/10 hover:shadow-accent-hover/20'
                }`}
              >
                {celebration.isRejected ? 'Close' : 'Awesome!'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Level Up Screen Animation Overlay */}
      <AnimatePresence>
        {showLevelUp && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-4 overflow-hidden select-none">
            <style>{`
              @keyframes confetti-fall {
                0% { transform: translateY(-10%) rotate(0deg); opacity: 1; }
                100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
              }
              .confetti-piece {
                position: absolute;
                top: -5%;
                width: 8px;
                height: 16px;
                border-radius: 3px;
                animation: confetti-fall 4s linear infinite;
              }
            `}</style>
            
            {/* Confetti Rain */}
            {confettiPieces}

            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 260 }}
              className="flex flex-col items-center max-w-md w-full bg-bg-card/90 border border-accent-primary/40 rounded-3xl p-8 backdrop-blur-2xl shadow-[0_0_80px_rgba(192,133,82,0.25)] text-center space-y-6 relative overflow-hidden"
            >
              {/* Background Glow Burst */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent-primary/25 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="w-32 h-32 rounded-full bg-gradient-to-tr from-accent-primary via-amber-400 to-purple-600 p-[3px] flex items-center justify-center shadow-2xl relative"
                >
                  <div className="w-full h-full rounded-full bg-bg-primary flex flex-col items-center justify-center border border-border-subtle">
                    <span className="text-[10px] font-black uppercase text-accent-primary tracking-widest leading-none">LEVEL</span>
                    <span className="text-5xl font-black text-text-primary tracking-tighter mt-1">{celebratedLevel}</span>
                  </div>
                </motion.div>
                <div className="absolute -top-1 -right-1 p-2 bg-amber-400 rounded-xl text-black shadow-lg animate-bounce">
                  <Award className="w-5 h-5 fill-black" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-accent-primary/10 text-accent-primary border border-accent-primary/25 inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {celebratedLevel >= 20 ? 'Master Architect' : celebratedLevel >= 10 ? 'Senior Engineer' : celebratedLevel >= 5 ? 'Rising Developer' : 'Apprentice'}
                </span>
                <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-amber-300 to-purple-400 uppercase">
                  LEVEL UP!
                </h2>
                <p className="text-xs text-text-secondary leading-relaxed max-w-[300px] mx-auto">
                  Congratulations! You have promoted to Level <span className="font-extrabold text-accent-primary">{celebratedLevel}</span>. Your active learning streaks and completed milestones are paying off!
                </p>
              </div>

              <div className="w-full p-4 bg-bg-secondary/60 border border-border-subtle rounded-2xl flex items-center justify-around text-xs">
                <div className="flex flex-col items-center">
                  <span className="text-text-muted font-bold text-[9px] uppercase tracking-wider">Level Target</span>
                  <span className="font-extrabold text-text-primary mt-1 text-sm">+{celebratedLevel * 150} XP</span>
                </div>
                <div className="h-8 w-[1px] bg-border-subtle" />
                <div className="flex flex-col items-center">
                  <span className="text-text-muted font-bold text-[9px] uppercase tracking-wider">Streak</span>
                  <span className="font-extrabold text-status-warning mt-1 text-sm">{streakDays} Days 🔥</span>
                </div>
                <div className="h-8 w-[1px] bg-border-subtle" />
                <div className="flex flex-col items-center">
                  <span className="text-text-muted font-bold text-[9px] uppercase tracking-wider">Badges</span>
                  <span className="font-extrabold text-accent-primary mt-1 text-sm">{badgesCount} Unlocked</span>
                </div>
              </div>

              <button
                onClick={() => setShowLevelUp(false)}
                className="w-full h-12 bg-gradient-to-r from-accent-primary via-amber-500 to-purple-600 hover:from-accent-hover hover:to-purple-500 text-bg-primary font-black rounded-xl cursor-pointer text-xs uppercase tracking-widest shadow-xl shadow-accent-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Claim Rewards & Continue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
