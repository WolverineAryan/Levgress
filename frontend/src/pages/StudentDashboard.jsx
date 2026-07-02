import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as studentsApi from '../api/students';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, LevelRing, ProgressBar, Badge } from '../components/ui';
import { StreakHeatmap, XPAreaChart } from '../components/charts';
import { Flame, FolderOpen, Award, ArrowUpRight, Plus, Rocket, CheckCircle2, ChevronRight } from 'lucide-react';
import { formatDateTime } from '../utils/date';

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Level Up Animation States
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [celebratedLevel, setCelebratedLevel] = useState(1);

  const fetchDashboardData = async () => {
    try {
      const res = await studentsApi.getStudentDashboard();
      const dashboardData = res.data.data;
      setData(dashboardData);

      // Trigger Level Up check
      if (dashboardData?.stats?.level) {
        const currentLevel = dashboardData.stats.level;
        const lastKnownLevelStr = localStorage.getItem('lastKnownLevel');
        if (lastKnownLevelStr) {
          const lastKnown = parseInt(lastKnownLevelStr, 10);
          if (currentLevel > lastKnown) {
            setCelebratedLevel(currentLevel);
            setShowLevelUp(true);
          }
        }
        localStorage.setItem('lastKnownLevel', currentLevel.toString());
      }
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex flex-col space-y-4 animate-pulse">
        <div className="h-20 bg-bg-card rounded-2xl w-2/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-bg-card rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-bg-card rounded-2xl lg:col-span-2"></div>
          <div className="h-80 bg-bg-card rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-status-danger/10 border border-status-danger/25 text-status-danger rounded-xl text-center">
        {error || 'Dashboard failed to load.'}
      </div>
    );
  }

  const { stats, activeProjects, activityFeed } = data;

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
    <div className="flex flex-col space-y-8 select-none">
      {/* Welcome Banner */}
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            {getGreeting()}, Student!
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Ready to make some progress and gain some XP today?
          </p>
        </div>
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-bg-primary font-bold text-sm rounded-lg hover:bg-accent-hover transition-colors shadow-lg shadow-accent-primary/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Stats Counter Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Level Ring widget */}
        <Card 
          className="flex items-center justify-between p-6"
        >
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Level Status</span>
            <span className="text-xs text-text-muted mt-1">
              {stats.level >= 100 ? 'Max Level' : `${stats.xp} / ${stats.xpNeeded} XP`}
            </span>
          </div>
          <LevelRing level={stats.level} xp={stats.xp} xpNeeded={stats.xpNeeded} size={70} />
        </Card>

        {/* Streak Flame Card */}
        <Card className="flex items-center justify-between p-6">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Daily Streak</span>
            <span className="text-2xl font-black text-text-primary mt-2">{stats.streak} Days</span>
            <span className="text-[10px] text-text-muted mt-1">Keep it burning!</span>
          </div>
          <div className="p-3.5 bg-status-warning/10 text-status-warning rounded-2xl border border-status-warning/20">
            <Flame className="w-7 h-7 fill-status-warning/10" />
          </div>
        </Card>

        {/* Projects Card */}
        <Card className="flex items-center justify-between p-6">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Completed</span>
            <span className="text-2xl font-black text-text-primary mt-2">{stats.completedProjectsCount} Projects</span>
            <span className="text-[10px] text-text-muted mt-1">Milestone 5 validation successes</span>
          </div>
          <div className="p-3.5 bg-status-success/10 text-status-success rounded-2xl border border-status-success/20">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        </Card>

        {/* Badges Earned Card */}
        <Card className="flex items-center justify-between p-6">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Badges</span>
            <span className="text-2xl font-black text-text-primary mt-2">{stats.badgesCount} Earned</span>
            <span className="text-[10px] text-text-muted mt-1">Unlocks achieved</span>
          </div>
          <div className="p-3.5 bg-accent-primary/10 text-accent-primary rounded-2xl border border-accent-primary/20">
            <Award className="w-7 h-7" />
          </div>
        </Card>
      </div>

      {/* Main content Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Active Projects list */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <h2 className="text-lg font-bold tracking-tight text-text-primary flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-accent-primary" /> Active Projects
          </h2>

          {activeProjects.length === 0 ? (
            <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed">
              <Rocket className="w-12 h-12 text-text-muted mb-4 animate-float" />
              <CardTitle>No Active Projects</CardTitle>
              <CardDescription className="max-w-xs mt-2 text-center">
                Launch a new project scaffolding to start documenting milestones and gaining XP.
              </CardDescription>
              <button
                onClick={() => navigate('/projects')}
                className="mt-6 px-4 py-2 bg-bg-elevated hover:bg-neutral-800 text-text-primary font-semibold text-xs border border-border-subtle rounded-lg cursor-pointer transition-colors"
              >
                Get Started
              </button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeProjects.map((project) => (
                <Card
                  key={project._id}
                  onClick={() => navigate(`/project/${project._id}`)}
                  className="cursor-pointer hover:border-accent-primary/45 group"
                >
                  <CardHeader className="flex flex-row justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-accent-primary tracking-widest uppercase">
                        {project.status}
                      </span>
                      <CardTitle className="mt-1 group-hover:text-accent-primary transition-colors text-base truncate max-w-[180px]">
                        {project.title}
                      </CardTitle>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-accent-primary transition-colors" />
                  </CardHeader>
                  <CardContent className="mb-4">
                    <p className="text-xs text-text-secondary line-clamp-2 h-8">
                      {project.description}
                    </p>
                  </CardContent>
                  <CardContent>
                    <div className="flex justify-between items-center text-[10px] text-text-muted mb-1.5 font-semibold">
                      <span>Milestones Progress</span>
                      <span>{project.completedMilestonesCount} / {project.milestonesCount}</span>
                    </div>
                    <ProgressBar value={project.completedMilestonesCount} max={project.milestonesCount} segmented />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* XP History Chart */}
          <div className="mt-4 flex flex-col space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-text-primary">XP Activity Trend</h2>
            <Card className="p-6">
              <XPAreaChart data={activityFeed} />
            </Card>
          </div>
        </div>

        {/* Right Side: Streak Heatmap & Recent Activity Feed */}
        <div className="flex flex-col space-y-8">
          {/* Daily Streak calendar */}
          <div className="flex flex-col space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-text-primary">Activity Heatmap</h2>
            <Card className="p-6 flex flex-col items-center">
              <StreakHeatmap activityLogs={activityFeed} />
            </Card>
          </div>

          {/* Recent Activity Timelines */}
          <div className="flex flex-col space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-text-primary">Activity Log</h2>
            <Card className="p-6 max-h-[350px] overflow-y-auto">
              {activityFeed.length === 0 ? (
                <div className="text-center text-xs text-text-muted py-6">No recent logs</div>
              ) : (
                <div className="flex flex-col space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-border-subtle">
                  {activityFeed.map((log) => (
                    <div key={log._id} className="flex items-start gap-4 relative z-10 text-xs">
                      {/* Timeline Dot Indicator */}
                      <div className="w-4 h-4 rounded-full bg-bg-card border-2 border-accent-primary flex items-center justify-center mt-0.5" />
                      <div className="flex flex-col space-y-0.5">
                        <span className="font-semibold text-text-primary">{log.details}</span>
                        <span className="text-[10px] text-text-muted">{formatDateTime(log.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Level Up Screen Animation Overlay */}
      {showLevelUp && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 overflow-hidden select-none animate-in fade-in duration-300">
          <style>{`
            @keyframes confetti-fall {
              0% { transform: translateY(-10%) rotate(0deg); opacity: 1; }
              100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
            }
            @keyframes pulse-glow {
              0%, 100% { transform: scale(1); filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.5)); }
              50% { transform: scale(1.06); filter: drop-shadow(0 0 45px rgba(139, 92, 246, 0.95)); }
            }
            @keyframes bounce-scale {
              0% { transform: scale(0.3); opacity: 0; }
              50% { transform: scale(1.1); }
              70% { transform: scale(0.9); }
              100% { transform: scale(1); opacity: 1; }
            }
            .confetti-piece {
              position: absolute;
              top: -5%;
              width: 10px;
              height: 20px;
              border-radius: 4px;
              animation: confetti-fall 4.5s linear infinite;
            }
            .level-glow-circle {
              animation: pulse-glow 3s ease-in-out infinite;
            }
            .pop-in-card {
              animation: bounce-scale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
          `}</style>
          
          {/* Confetti Rain */}
          {confettiPieces}

          <div className="pop-in-card flex flex-col items-center max-w-sm w-full bg-bg-secondary/60 border border-accent-primary/25 rounded-3xl p-8 backdrop-blur-lg shadow-2xl text-center space-y-6 relative">
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-accent-primary/20 rounded-full blur-[60px] pointer-events-none" />

            <div className="level-glow-circle w-28 h-28 rounded-full bg-gradient-to-tr from-accent-primary via-accent-hover to-purple-500 p-[3px] flex items-center justify-center shadow-lg relative">
              <div className="w-full h-full rounded-full bg-bg-primary flex flex-col items-center justify-center">
                <span className="text-[10px] font-black uppercase text-accent-primary tracking-widest leading-none">LEVEL</span>
                <span className="text-4xl font-black text-text-primary tracking-tighter mt-1">{celebratedLevel}</span>
              </div>
              <div className="absolute -top-2 -right-2 p-1.5 bg-yellow-500 rounded-lg text-black animate-bounce">
                <Award className="w-5 h-5 fill-black" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-white to-purple-400 uppercase">
                LEVEL UP!
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed max-w-[280px] mx-auto">
                Congratulations! You have reached Level <span className="font-extrabold text-accent-primary">{celebratedLevel}</span>. Your dedication and learning streaks are paying off!
              </p>
            </div>

            <div className="w-full p-4 bg-bg-primary/40 border border-border-subtle rounded-2xl flex items-center justify-around text-xs">
              <div className="flex flex-col items-center">
                <span className="text-text-muted font-bold text-[9px] uppercase">XP Goal</span>
                <span className="font-extrabold text-text-primary mt-1">+{celebratedLevel * 100} XP</span>
              </div>
              <div className="h-8 w-[1px] bg-border-subtle" />
              <div className="flex flex-col items-center">
                <span className="text-text-muted font-bold text-[9px] uppercase">Streaks</span>
                <span className="font-extrabold text-text-primary mt-1">{stats.streak} Days</span>
              </div>
              <div className="h-8 w-[1px] bg-border-subtle" />
              <div className="flex flex-col items-center">
                <span className="text-text-muted font-bold text-[9px] uppercase">Badges</span>
                <span className="font-extrabold text-text-primary mt-1">{stats.badgesCount} Earned</span>
              </div>
            </div>

            <button
              onClick={() => setShowLevelUp(false)}
              className="w-full h-11 bg-gradient-to-r from-accent-primary to-purple-600 hover:from-accent-hover hover:to-purple-500 text-bg-primary font-black rounded-xl cursor-pointer text-xs uppercase tracking-widest shadow-lg shadow-accent-primary/10 hover:shadow-accent-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Continue Journey
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
