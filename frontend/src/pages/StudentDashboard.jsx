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

  const fetchDashboardData = async () => {
    try {
      const res = await studentsApi.getStudentDashboard();
      setData(res.data.data);
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
        <Card className="flex items-center justify-between p-6">
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
    </div>
  );
};
