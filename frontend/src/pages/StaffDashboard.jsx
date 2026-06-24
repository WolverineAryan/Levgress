import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as studentsApi from '../api/students';
import { Card, CardHeader, CardTitle, CardContent, Badge as Tag, CardDescription } from '../components/ui';
import { ClipboardList, Users, CheckCircle, AlertTriangle, ChevronRight, Activity, Clock } from 'lucide-react';
import { formatDateTime } from '../utils/date';
import { cn } from '../utils/classnames';

export const StaffDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStaffData = async () => {
    try {
      const res = await studentsApi.getStaffDashboard();
      setData(res.data.data);
    } catch (err) {
      setError('Failed to load instructor metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

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
        {error || 'Overview statistics not available.'}
      </div>
    );
  }

  const { metrics, stagnationAlerts, pendingSubmissions } = data;

  return (
    <div className="flex flex-col space-y-8 select-none">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Instructor Console</h1>
        <p className="text-xs text-text-secondary mt-1">Monitor cohort metrics, staled pipelines, and pending reviews.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Cohort</span>
            <span className="text-2xl font-black text-text-primary mt-2">{metrics.studentsCount} Students</span>
          </div>
          <div className="p-3.5 bg-accent-primary/10 text-accent-primary rounded-2xl border border-accent-primary/20">
            <Users className="w-7 h-7" />
          </div>
        </Card>

        <Card className="p-6 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Portfolios</span>
            <span className="text-2xl font-black text-text-primary mt-2">{metrics.projectsCount} Projects</span>
          </div>
          <div className="p-3.5 bg-status-info/10 text-status-info rounded-2xl border border-status-info/20">
            <ClipboardList className="w-7 h-7" />
          </div>
        </Card>

        <Card className="p-6 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Pending Review</span>
            <span className="text-2xl font-black text-text-primary mt-2">{metrics.pendingMilestonesCount} Items</span>
          </div>
          <div className="p-3.5 bg-status-warning/10 text-status-warning rounded-2xl border border-status-warning/20">
            <Clock className="w-7 h-7" />
          </div>
        </Card>

        <Card className="p-6 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Completion Rate</span>
            <span className="text-2xl font-black text-text-primary mt-2">{metrics.completionRate}%</span>
          </div>
          <div className="p-3.5 bg-status-success/10 text-status-success rounded-2xl border border-status-success/20">
            <CheckCircle className="w-7 h-7" />
          </div>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Pending reviews list */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent-primary" /> Submissions Feed
          </h2>

          {pendingSubmissions.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <CheckCircle className="w-12 h-12 text-status-success mx-auto mb-4" />
              <CardTitle>Cohort Caught Up</CardTitle>
              <CardDescription className="mt-1">All milestone submissions verified or reviewed.</CardDescription>
            </Card>
          ) : (
            <div className="flex flex-col space-y-4">
              {pendingSubmissions.map((sub) => (
                <Card
                  key={sub._id}
                  onClick={() => navigate('/project-review')}
                  className="cursor-pointer hover:border-accent-primary/20 flex justify-between items-center group p-5 bg-bg-card/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-bg-secondary border border-border-subtle flex items-center justify-center font-bold text-xs mt-0.5">
                      {sub.project.student.name.charAt(0)}
                    </div>
                    
                    <div className="flex flex-col space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary">{sub.project.student.name}</span>
                        <span className="text-[10px] text-text-muted">submitted</span>
                      </div>
                      <h4 className="text-xs font-bold text-accent-primary">{sub.title}</h4>
                      <p className="text-[10px] text-text-secondary leading-relaxed line-clamp-1 max-w-sm">
                        Project: "{sub.project.title}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[9px] text-text-muted">{formatDateTime(sub.updatedAt)}</span>
                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent-primary transition-colors" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Stagnation alerts */}
        <div className="flex flex-col space-y-6">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-status-warning" /> Inactivity Alerts
          </h2>

          <Card className="p-6 max-h-[400px] overflow-y-auto">
            {stagnationAlerts.length === 0 ? (
              <div className="text-center text-xs text-text-muted py-8">
                All students active in the last 72 hours
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                {stagnationAlerts.map((student) => (
                  <div
                    key={student.studentId}
                    className="flex justify-between items-center gap-3 pb-3 border-b border-border-subtle last:border-b-0 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-bg-secondary border border-border-subtle flex items-center justify-center font-semibold text-xs">
                        {student.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-text-primary truncate max-w-[110px]">{student.name}</span>
                        <span className="text-[9px] text-text-muted mt-0.5">Inactive {student.daysInactive} days</span>
                      </div>
                    </div>

                    <span className={cn(
                      "text-[9px] font-black uppercase px-2 py-0.5 rounded border",
                      student.severity === 'CRITICAL' && "bg-status-danger/10 text-status-danger border-status-danger/20 animate-pulse",
                      student.severity === 'STAGNATED' && "bg-status-warning/10 text-status-warning border-status-warning/20",
                      student.severity === 'SLOW' && "bg-neutral-800 text-text-secondary border-neutral-700"
                    )}>
                      {student.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
