import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as studentsApi from '../api/students';
import * as milestonesApi from '../api/milestones';
import * as projectsApi from '../api/projects';
import { Card, CardHeader, CardTitle, CardContent, Button, GithubIcon } from '../components/ui';
import { Leaderboard } from './Leaderboard';
import { 
  ClipboardList, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  ChevronRight, 
  Activity, 
  Clock, 
  Search, 
  BarChart3, 
  GraduationCap, 
  LayoutGrid, 
  ArrowUpRight,
  ShieldCheck,
  Award,
  FileText,
  ArrowLeft,
  ChevronLeft,
  Lock,
  Send,
  Loader2,
  Globe,
  Trophy
} from 'lucide-react';
import { formatDateTime } from '../utils/date';
import { cn } from '../utils/classnames';

const BATCHES = ['All Batches', 'Batch 2024', 'Batch 2025', 'Batch 2026', 'Batch 2027'];
const DEPARTMENTS = [
  'All Departments',
  'Computer Science',
  'Information Technology',
  'Software Engineering',
  'Data Science & AI',
  'Electronics & Communication'
];

export const StaffDashboard = () => {
  const navigate = useNavigate();
  
  // Tab navigation
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'roster' | 'analytics'

  // Global filters
  const [selectedBatch, setSelectedBatch] = useState('All Batches');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  
  // Dashboard Overview state
  const [overviewData, setOverviewData] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState('');

  // Roster state
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');

  // Projects Portfolio state
  const [projectsList, setProjectsList] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState('');
  const [projectsSearch, setProjectsSearch] = useState('');
  const [projectsFilterStatus, setProjectsFilterStatus] = useState('All Statuses');
  
  // Selected project for sub-view portfolio details
  const [selectedProj, setSelectedProj] = useState(null);
  const [selectedProjLoading, setSelectedProjLoading] = useState(false);
  const [selectedProjMilestones, setSelectedProjMilestones] = useState([]);
  const [selectedProjComments, setSelectedProjComments] = useState([]);
  const [newProjCommentText, setNewProjCommentText] = useState('');
  const [selectedProjReplyTexts, setSelectedProjReplyTexts] = useState({});
  const [activeScreenshotIdx, setActiveScreenshotIdx] = useState(0);

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      setProjectsError('');
      const params = {};
      if (projectsFilterStatus !== 'All Statuses') params.status = projectsFilterStatus;
      
      const res = await projectsApi.getAllProjects(params);
      setProjectsList(res.data.data.projects || []);
    } catch (err) {
      setProjectsError('Failed to fetch projects list');
      console.error(err);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleSelectProject = async (projectId) => {
    try {
      setSelectedProjLoading(true);
      const res = await projectsApi.getProjectById(projectId);
      setSelectedProj(res.data.data.project);
      setSelectedProjMilestones(res.data.data.milestones);
      
      const commentsRes = await projectsApi.getComments(projectId);
      setSelectedProjComments(commentsRes.data.data.comments);
      setActiveScreenshotIdx(0);
    } catch (err) {
      console.error(err);
      alert('Failed to load project details: ' + (err.response?.data?.message || err.message));
    } finally {
      setSelectedProjLoading(false);
    }
  };

  const handlePostProjComment = async (parentId = null, text = '') => {
    const content = text || newProjCommentText;
    if (!content.trim() || !selectedProj) return;
    
    try {
      await projectsApi.addComment(selectedProj._id, content, parentId);
      // Re-fetch comments
      const commentsRes = await projectsApi.getComments(selectedProj._id);
      setSelectedProjComments(commentsRes.data.data.comments);
      if (!parentId) {
        setNewProjCommentText('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to post comment: ' + (err.response?.data?.message || err.message));
    }
  };

  const handlePortfolioReviewAction = async (milestoneId, action, feedback) => {
    if (!selectedProj) return;
    try {
      if (action === 'APPROVE') {
        await milestonesApi.staffApproveMilestone(milestoneId, feedback);
      } else {
        await milestonesApi.staffRejectMilestone(milestoneId, feedback);
      }
      // Re-fetch project details to update status
      await handleSelectProject(selectedProj._id);
      // Also refresh overview dashboard data
      fetchOverviewData();
    } catch (err) {
      console.error(err);
      alert('Failed to submit review decision: ' + (err.response?.data?.message || err.message));
    }
  };

  // 1. Fetch main dashboard metrics (filterable by batch and department)
  const fetchOverviewData = async () => {
    try {
      setOverviewLoading(true);
      const params = {};
      if (selectedBatch !== 'All Batches') params.batch = selectedBatch;
      if (selectedDept !== 'All Departments') params.department = selectedDept;

      const res = await studentsApi.getStaffDashboard(params);
      setOverviewData(res.data.data);
    } catch (err) {
      setOverviewError('Failed to load instructor metrics');
      console.error(err);
    } finally {
      setOverviewLoading(false);
    }
  };

  // 2. Fetch student roster with filters
  const fetchRoster = async () => {
    try {
      setRosterLoading(true);
      setRosterError('');
      const params = {};
      if (selectedBatch !== 'All Batches') params.batch = selectedBatch;
      if (selectedDept !== 'All Departments') params.department = selectedDept;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await studentsApi.getAllStudents(params);
      setRoster(res.data.data.students);
    } catch (err) {
      setRosterError('Failed to fetch student roster');
      console.error(err);
    } finally {
      setRosterLoading(false);
    }
  };

  // 3. Fetch cohort analytics with filters
  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError('');
      const params = {};
      if (selectedBatch !== 'All Batches') params.batch = selectedBatch;
      if (selectedDept !== 'All Departments') params.department = selectedDept;

      const res = await studentsApi.getCohortAnalytics(params);
      setAnalytics(res.data.data);
    } catch (err) {
      setAnalyticsError('Failed to fetch aggregate analytics');
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Trigger loading data
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverviewData();
    } else if (activeTab === 'roster') {
      fetchRoster();
    } else if (activeTab === 'projects') {
      fetchProjects();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, selectedBatch, selectedDept, searchQuery, projectsFilterStatus]);

  return (
    <div className="flex flex-col space-y-8 select-none">
      {/* Header & Global Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-subtle pb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <GraduationCap className="text-accent-primary w-7 h-7" /> Instructor Dashboard
          </h1>
          <p className="text-xs text-text-secondary mt-1">Monitor cohort metrics, filter student rosters, and view aggregate insights.</p>
        </div>

        {/* Global Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex flex-col space-y-1 w-full sm:w-40">
            <span className="text-[10px] font-bold text-text-secondary uppercase">Filter Batch</span>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-3 py-1.5 text-xs bg-bg-secondary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer w-full"
            >
              {BATCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-1 w-full sm:w-56">
            <span className="text-[10px] font-bold text-text-secondary uppercase">Filter Department</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 text-xs bg-bg-secondary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer w-full"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border-subtle/50 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all border border-transparent cursor-pointer",
            activeTab === 'overview'
              ? "bg-accent-primary/10 text-accent-primary border-accent-primary/20"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          <LayoutGrid size={14} /> Overview Feed
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all border border-transparent cursor-pointer",
            activeTab === 'roster'
              ? "bg-accent-primary/10 text-accent-primary border-accent-primary/20"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          <Users size={14} /> Student Roster
        </button>
        <button
          onClick={() => {
            setActiveTab('projects');
            setSelectedProj(null);
          }}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all border border-transparent cursor-pointer",
            activeTab === 'projects'
              ? "bg-accent-primary/10 text-accent-primary border-accent-primary/20"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          <ClipboardList size={14} /> Projects Portfolio
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all border border-transparent cursor-pointer",
            activeTab === 'analytics'
              ? "bg-accent-primary/10 text-accent-primary border-accent-primary/20"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          <BarChart3 size={14} /> Cohort Analytics
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all border border-transparent cursor-pointer",
            activeTab === 'leaderboard'
              ? "bg-accent-primary/10 text-accent-primary border-accent-primary/20"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          <Trophy size={14} /> Class Leaderboard
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {overviewLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-bg-card rounded-2xl"></div>
              ))}
            </div>
          ) : overviewError || !overviewData ? (
            <div className="p-6 bg-status-danger/10 border border-status-danger/25 text-status-danger rounded-xl text-center">
              {overviewError || 'Overview metrics not available.'}
            </div>
          ) : (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-5 flex items-center justify-between bg-bg-card/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Cohort</span>
                    <span className="text-xl font-black text-text-primary mt-1.5">{overviewData.metrics.studentsCount} Students</span>
                  </div>
                  <div className="p-2.5 bg-accent-primary/10 text-accent-primary rounded-xl border border-accent-primary/20">
                    <Users className="w-5 h-5" />
                  </div>
                </Card>

                <Card className="p-5 flex items-center justify-between bg-bg-card/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Project Portfolios</span>
                    <span className="text-xl font-black text-text-primary mt-1.5">{overviewData.metrics.projectsCount} Assigned</span>
                  </div>
                  <div className="p-2.5 bg-status-info/10 text-status-info rounded-xl border border-status-info/20">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                </Card>

                <Card className="p-5 flex items-center justify-between bg-bg-card/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Milestones Pending</span>
                    <span className="text-xl font-black text-text-primary mt-1.5">{overviewData.metrics.pendingMilestonesCount} Reviews</span>
                  </div>
                  <div className="p-2.5 bg-status-warning/10 text-status-warning rounded-xl border border-status-warning/20">
                    <Clock className="w-5 h-5" />
                  </div>
                </Card>

                <Card className="p-5 flex items-center justify-between bg-bg-card/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Average Completion</span>
                    <span className="text-xl font-black text-text-primary mt-1.5">{overviewData.metrics.completionRate}% Rate</span>
                  </div>
                  <div className="p-2.5 bg-status-success/10 text-status-success rounded-xl border border-status-success/20">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </Card>
              </div>

              {/* Cohort Inactivity Alerts */}
              <div className="flex flex-col space-y-4">
                <h2 className="text-sm font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-status-warning" /> Cohort Inactivity Alerts
                </h2>

                <Card className="p-5 bg-bg-card/30">
                  {overviewData.stagnationAlerts.length === 0 ? (
                    <div className="text-center text-xs text-text-muted py-12">
                      All students have been active in the last 72 hours.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {overviewData.stagnationAlerts.map((student, idx) => (
                        <div
                          key={idx}
                          onClick={() => navigate(`/profile/${student.studentId}`)}
                          className="flex justify-between items-center gap-3 p-3 bg-bg-secondary/20 hover:bg-bg-secondary/40 border border-border-subtle/50 rounded-xl transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={student.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${student.name}`}
                              alt={student.name}
                              className="w-7 h-7 rounded-full border border-border-subtle object-cover bg-bg-secondary shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-text-primary truncate max-w-[120px]">{student.name}</span>
                              <span className="text-[9px] text-text-muted mt-0.5">Inactive {student.daysInactive} days</span>
                            </div>
                          </div>

                          <span className={cn(
                            "text-[8px] font-black uppercase px-2 py-0.5 rounded border shrink-0",
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
            </>
          )}
        </div>
      )}

      {activeTab === 'roster' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search student by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg-secondary border border-border-subtle focus:border-accent-primary rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted outline-none transition-all"
            />
          </div>

          {rosterLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-bg-card rounded-xl"></div>
              ))}
            </div>
          ) : rosterError ? (
            <div className="p-6 bg-status-danger/10 border border-status-danger/25 text-status-danger rounded-xl text-center text-xs">
              {rosterError}
            </div>
          ) : roster.length === 0 ? (
            <div className="p-16 text-center border border-dashed border-border-subtle rounded-2xl">
              <Users className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <h4 className="text-xs font-bold text-text-primary">No Matching Students Found</h4>
              <p className="text-[10px] text-text-secondary mt-1">Try relaxing your search terms or filter constraints.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roster.map((student) => (
                <Card key={student._id} className="p-4 bg-bg-card/40 flex flex-col justify-between h-44 hover:border-accent-primary/20 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3 min-w-0">
                      <img
                        src={student.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${student.username}`}
                        alt={student.name}
                        className="w-11 h-11 rounded-lg bg-bg-secondary border border-border-subtle object-cover shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-xs text-text-primary truncate block">{student.name}</span>
                        <span className="text-[10px] text-text-muted truncate">@{student.username}</span>
                        <span className="text-[9px] text-text-secondary mt-1 truncate">
                          {student.batch || 'Unassigned Batch'} • {student.department || 'Unassigned Dept'}
                        </span>
                      </div>
                    </div>

                    <span className={cn(
                      "text-[8px] font-black uppercase px-2 py-0.5 rounded border shrink-0",
                      student.severity === 'CRITICAL' && "bg-status-danger/10 text-status-danger border-status-danger/20",
                      student.severity === 'STAGNATED' && "bg-status-warning/10 text-status-warning border-status-warning/20",
                      student.severity === 'SLOW' && "bg-neutral-800 text-text-secondary border-neutral-700",
                      student.severity === 'ACTIVE' && "bg-status-success/10 text-status-success border-status-success/20"
                    )}>
                      {student.severity}
                    </span>
                  </div>

                  {/* Student Stats Summary */}
                  <div className="grid grid-cols-3 gap-2 border-t border-b border-border-subtle/50 py-2.5 my-3 text-[10px]">
                    <div className="flex flex-col text-center">
                      <span className="text-text-muted font-bold uppercase text-[8px] tracking-wider">Academic Level</span>
                      <span className="font-black text-text-primary mt-0.5">Lv. {student.level} ({student.xp} XP)</span>
                    </div>
                    <div className="flex flex-col text-center border-l border-r border-border-subtle/30">
                      <span className="text-text-muted font-bold uppercase text-[8px] tracking-wider">Skills Unlocked</span>
                      <span className="font-black text-text-primary mt-0.5">{student.verifiedSkillsCount} verified / {student.skillsCount}</span>
                    </div>
                    <div className="flex flex-col text-center">
                      <span className="text-text-muted font-bold uppercase text-[8px] tracking-wider">Portfolio</span>
                      <span className="font-black text-text-primary mt-0.5">{student.completedProjectsCount} / {student.projectsCount} done</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-text-muted">
                      Created: {new Date(student.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => navigate(`/profile/${student._id}`)}
                      className="text-[10px] font-black text-accent-primary hover:text-accent-hover flex items-center gap-0.5 cursor-pointer bg-transparent border-0 p-0"
                    >
                      View Student Profile <ArrowUpRight size={12} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {analyticsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-bg-card rounded-2xl"></div>
              ))}
            </div>
          ) : analyticsError || !analytics ? (
            <div className="p-6 bg-status-danger/10 border border-status-danger/25 text-status-danger rounded-xl text-center text-xs">
              {analyticsError || 'Cohort analytics data not loaded.'}
            </div>
          ) : (
            <>
              {/* Analytics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-5 text-center bg-bg-card/30">
                  <span className="text-[9px] font-black uppercase text-text-muted tracking-wider block">Cohort Size</span>
                  <span className="text-3xl font-black text-text-primary mt-2 block">{analytics.totalStudents}</span>
                  <span className="text-[10px] text-text-secondary mt-1 block">Active students in current filters</span>
                </Card>
                <Card className="p-5 text-center bg-bg-card/30">
                  <span className="text-[9px] font-black uppercase text-text-muted tracking-wider block">Average Cohort Level</span>
                  <span className="text-3xl font-black text-accent-primary mt-2 block">Lv. {analytics.avgCohortLevel}</span>
                  <span className="text-[10px] text-text-secondary mt-1 block">Mean level of filtered students</span>
                </Card>
                <Card className="p-5 text-center bg-bg-card/30">
                  <span className="text-[9px] font-black uppercase text-text-muted tracking-wider block">Project Completion Rate</span>
                  <span className="text-3xl font-black text-status-success mt-2 block">
                    {analytics.projectStatusBreakdown.length > 0 && (() => {
                      const completed = analytics.projectStatusBreakdown.find((p) => p.status === 'COMPLETED')?.count || 0;
                      const total = analytics.projectStatusBreakdown.reduce((sum, p) => sum + p.count, 0);
                      return total > 0 ? Math.round((completed / total) * 100) : 0;
                    })()}%
                  </span>
                  <span className="text-[10px] text-text-secondary mt-1 block">Percentage of completed projects</span>
                </Card>
              </div>

              {/* Main Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Level Distribution */}
                <Card className="p-5 bg-bg-card/30">
                  <h3 className="text-xs font-black text-text-primary uppercase tracking-wider mb-4">Level Distribution</h3>
                  <div className="space-y-3.5">
                    {analytics.levelDistribution.map((band) => {
                      const total = analytics.levelDistribution.reduce((sum, b) => sum + b.count, 0);
                      const pct = total > 0 ? Math.round((band.count / total) * 100) : 0;
                      return (
                        <div key={band.label} className="text-xs space-y-1.5">
                          <div className="flex justify-between font-semibold">
                            <span className="text-text-primary">{band.label}</span>
                            <span className="text-text-muted">{band.count} students ({pct}%)</span>
                          </div>
                          <div className="w-full bg-bg-elevated h-2.5 rounded-full overflow-hidden border border-border-subtle/30">
                            <div
                              className="h-full bg-accent-primary rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* 2. Skill Tier Distribution */}
                <Card className="p-5 bg-bg-card/30">
                  <h3 className="text-xs font-black text-text-primary uppercase tracking-wider mb-4">Verified Skill Tiers</h3>
                  <div className="space-y-3.5">
                    {analytics.tierDistribution.map((tierData) => {
                      const total = analytics.tierDistribution.reduce((sum, t) => sum + t.count, 0);
                      const pct = total > 0 ? Math.round((tierData.count / total) * 100) : 0;
                      const colors = {
                        UNVERIFIED: 'bg-text-muted',
                        BASIC: 'bg-status-success',
                        INTERMEDIATE: 'bg-accent-primary',
                        MASTER: 'bg-status-warning',
                      };
                      return (
                        <div key={tierData.tier} className="text-xs space-y-1.5">
                          <div className="flex justify-between font-semibold">
                            <span className="text-text-primary uppercase">{tierData.tier}</span>
                            <span className="text-text-muted">{tierData.count} times ({pct}%)</span>
                          </div>
                          <div className="w-full bg-bg-elevated h-2.5 rounded-full overflow-hidden border border-border-subtle/30">
                            <div
                              className={cn("h-full rounded-full transition-all duration-500", colors[tierData.tier] || 'bg-accent-primary')}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* 3. Top Technologies */}
                <Card className="p-5 bg-bg-card/30">
                  <h3 className="text-xs font-black text-text-primary uppercase tracking-wider mb-4">Top Cohort Technologies</h3>
                  {analytics.topTechnologies.length === 0 ? (
                    <div className="text-center text-xs text-text-muted py-12">No technologies registered yet.</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {analytics.topTechnologies.map((tech) => (
                        <div key={tech.name} className="p-3 bg-bg-card/50 border border-border-subtle/40 rounded-xl flex items-center justify-between text-xs">
                          <span className="font-extrabold text-text-primary">{tech.name}</span>
                          <span className="text-[10px] font-bold text-accent-primary bg-accent-primary/5 border border-accent-primary/15 px-2 py-0.5 rounded">
                            {tech.count} users
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* 4. Average AI Scores */}
                <Card className="p-5 bg-bg-card/30">
                  <h3 className="text-xs font-black text-text-primary uppercase tracking-wider mb-4">Average Milestone AI Scores</h3>
                  <div className="space-y-3.5">
                    {analytics.milestoneScoresByIndex.map((m) => (
                      <div key={m.milestone} className="text-xs space-y-1.5">
                        <div className="flex justify-between font-semibold">
                          <span className="text-text-primary">{m.milestone} (Milestone {m.milestone.replace('M','')})</span>
                          <span className="text-text-muted">Avg Score: {m.avgScore} / 100 ({m.count} graded)</span>
                        </div>
                        <div className="w-full bg-bg-elevated h-2.5 rounded-full overflow-hidden border border-border-subtle/30">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              m.avgScore >= 80 ? 'bg-status-success' : m.avgScore >= 50 ? 'bg-status-warning' : 'bg-status-danger'
                            )}
                            style={{ width: `${m.avgScore}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      )}
      {activeTab === 'projects' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {selectedProj ? (
            /* PROJECT PORTFOLIO CASE TIMELINE VIEW */
            <div className="space-y-6">
              {/* Back navigation and header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-card/25 backdrop-blur-md p-4 rounded-2xl border border-border-subtle/50 shadow-sm">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedProj(null)} 
                  className="text-xs flex items-center gap-1.5 border border-border-subtle/80 cursor-pointer bg-bg-secondary hover:bg-bg-elevated px-4 py-1.8 rounded-xl font-bold transition-all"
                >
                  <ArrowLeft size={14} /> Back to Projects Grid
                </Button>
                <div className="flex items-center gap-3">
                  <img
                    src={selectedProj.student?.avatar || 'https://api.dicebear.com/7.x/shapes/svg?seed=Cosmic'}
                    alt={selectedProj.student?.name}
                    className="w-7 h-7 rounded-full border border-border-subtle object-cover bg-bg-secondary"
                  />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-text-primary">Student Portfolio</span>
                    <span className="text-[9px] text-text-muted">@{selectedProj.student?.name}</span>
                  </div>
                </div>
              </div>

              {/* Case Study Header Card */}
              <Card className="p-6 relative overflow-hidden bg-bg-card/50">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-accent-primary" />
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-black text-text-primary tracking-tight">{selectedProj.title}</h2>
                    <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">{selectedProj.description}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap shrink-0">
                    {selectedProj.githubUrl && (
                      <a href={selectedProj.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary border border-border-subtle rounded-xl text-[10px] text-text-primary hover:text-accent-primary transition-all font-bold">
                        <GithubIcon className="w-3.5 h-3.5" /> Code Repo
                      </a>
                    )}
                    {selectedProj.liveUrl && (
                      <a href={selectedProj.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary border border-border-subtle rounded-xl text-[10px] text-text-primary hover:text-accent-primary transition-all font-bold">
                        <Globe className="w-3.5 h-3.5" /> Live Link
                      </a>
                    )}
                  </div>
                </div>

                {selectedProj.techStack && selectedProj.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-border-subtle/30">
                    {selectedProj.techStack.map((tech, idx) => (
                      <span key={idx} className="text-[9px] font-semibold text-text-muted bg-bg-elevated/50 px-2 py-0.5 rounded border border-border-subtle/30">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </Card>

              {/* Screenshots Carousel */}
              {selectedProj.screenshots && selectedProj.screenshots.length > 0 && (
                <Card className="p-6 bg-bg-card/40">
                  <h3 className="text-xs font-black text-text-primary uppercase tracking-wider mb-4">Screenshots Gallery</h3>
                  <div className="flex flex-col space-y-4">
                    <div className="relative aspect-[16/9] w-full max-h-[420px] bg-black rounded-2xl border border-border-subtle overflow-hidden flex items-center justify-center group shadow-2xl">
                      <div 
                        className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-110 pointer-events-none select-none transition-all duration-700 ease-in-out"
                        style={{ backgroundImage: `url(${selectedProj.screenshots[activeScreenshotIdx]?.fileData})` }}
                      />
                      <img
                        src={selectedProj.screenshots[activeScreenshotIdx]?.fileData}
                        alt={selectedProj.screenshots[activeScreenshotIdx]?.fileName}
                        className="relative z-10 max-w-full max-h-[420px] object-contain select-none"
                      />
                      {selectedProj.screenshots.length > 1 && (
                        <>
                          <button
                            onClick={() => setActiveScreenshotIdx((prev) => (prev === 0 ? selectedProj.screenshots.length - 1 : prev - 1))}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/75 border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 transition-all cursor-pointer z-20"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setActiveScreenshotIdx((prev) => (prev === selectedProj.screenshots.length - 1 ? 0 : prev + 1))}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/75 border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 transition-all cursor-pointer z-20"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 flex items-center justify-between text-xs text-text-primary">
                        <span className="font-semibold truncate max-w-[250px]">{selectedProj.screenshots[activeScreenshotIdx]?.fileName}</span>
                        <span className="text-[9px] text-white/50">
                          Image {activeScreenshotIdx + 1} of {selectedProj.screenshots.length}
                        </span>
                      </div>
                    </div>
                    {selectedProj.screenshots.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1.5 pt-1.5 scrollbar-thin select-none justify-center">
                        {selectedProj.screenshots.map((s, idx) => (
                          <button
                            key={s._id}
                            onClick={() => setActiveScreenshotIdx(idx)}
                            className={`h-14 w-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-black/20 hover:brightness-110 cursor-pointer ${
                              activeScreenshotIdx === idx ? 'border-accent-primary scale-[1.03]' : 'border-border-subtle opacity-70'
                            }`}
                          >
                            <img src={s.fileData} alt="" className="w-full h-full object-cover rounded-lg" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Milestones and Comments Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Milestones timeline column */}
                <div className="lg:col-span-2 flex flex-col space-y-4">
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Milestones Pipeline</h3>
                  
                  <div className="flex flex-col space-y-4">
                    {selectedProjMilestones.map((m) => {
                      const isActive = m.status === 'ACTIVE';
                      const isCompleted = m.status === 'COMPLETED';
                      const isRejected = m.status === 'REJECTED';
                      const isSubmitted = m.status === 'SUBMITTED';
                      const isLocked = m.status === 'LOCKED';

                      return (
                        <Card
                          key={m._id}
                          className={cn(
                            "border-l-4 p-4 flex flex-col space-y-4 transition-all duration-300",
                            isCompleted && "border-l-status-success bg-status-success/[0.01]",
                            isActive && "border-l-accent-primary bg-accent-primary/[0.01]",
                            isRejected && "border-l-status-danger bg-status-danger/[0.01]",
                            isSubmitted && "border-l-status-info bg-status-info/[0.01]",
                            isLocked && "border-l-transparent opacity-60"
                          )}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "p-2 rounded-xl border mt-0.5",
                                isCompleted && "bg-status-success/10 text-status-success border-status-success/20",
                                isActive && "bg-accent-primary/10 text-accent-primary border-accent-primary/20",
                                isRejected && "bg-status-danger/10 text-status-danger border-status-danger/20",
                                isSubmitted && "bg-status-info/10 text-status-info border-status-info/20",
                                isLocked && "bg-bg-elevated text-text-muted border-border-subtle"
                              )}>
                                {isCompleted ? <CheckCircle className="w-4 h-4" /> : isLocked ? <Lock className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-text-muted">MILESTONE {m.index}/5</span>
                                <h4 className="text-sm font-bold text-text-primary mt-0.5">{m.title}</h4>
                                <p className="text-xs text-text-secondary mt-1 leading-relaxed">{m.description}</p>
                              </div>
                            </div>

                            <span className={cn(
                              "text-[9px] font-black uppercase px-2.5 py-0.5 rounded border shrink-0",
                              isCompleted && "bg-status-success/10 text-status-success border-status-success/20",
                              isSubmitted && "bg-status-info/10 text-status-info border-status-info/20",
                              isRejected && "bg-status-danger/10 text-status-danger border-status-danger/20",
                              isActive && "bg-accent-primary/10 text-accent-primary border-accent-primary/20",
                              isLocked && "bg-bg-card text-text-secondary border-border-subtle"
                            )}>
                              {m.status}
                            </span>
                          </div>

                          {/* Submitted Evidence Details */}
                          {m.evidence && (
                            <div className="p-3.5 bg-bg-secondary/40 border border-border-subtle/50 rounded-xl space-y-2.5 text-xs">
                              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Submitted Evidence</span>
                              {m.evidence.url && (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-text-muted">Live Link:</span>
                                  <a href={m.evidence.url} target="_blank" rel="noreferrer" className="text-accent-primary font-bold hover:underline flex items-center gap-1">
                                    {m.evidence.url} <ArrowUpRight className="w-3 h-3" />
                                  </a>
                                </div>
                              )}
                              {m.evidence.files && m.evidence.files.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1.5">
                                  {m.evidence.files.map((file, fIdx) => (
                                    <a
                                      key={fIdx}
                                      href={file.fileData}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[9px] text-accent-primary bg-bg-secondary/70 border border-border-subtle hover:border-accent-primary/30 px-2 py-1 rounded-lg font-bold flex items-center gap-1"
                                    >
                                      <FileText className="w-3 h-3" /> {file.fileName || `File ${fIdx + 1}`}
                                    </a>
                                  ))}
                                </div>
                              )}
                              {m.evidence.text && (
                                <div className="p-3 bg-bg-elevated/20 border border-border-subtle/40 rounded-lg text-text-secondary leading-relaxed font-mono whitespace-pre-wrap text-[10px]">
                                  {m.evidence.text}
                                </div>
                              )}
                            </div>
                          )}

                          {/* AI Feedback Panel */}
                          {(m.aiFeedback && (isCompleted || isRejected || isSubmitted)) && (
                            <div className="p-3.5 bg-accent-primary/5 border border-accent-primary/15 rounded-xl space-y-1.5 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-accent-primary uppercase tracking-wider">AI Analysis Feedback</span>
                                <span className="font-black text-[10px] text-accent-primary bg-accent-primary/10 border border-accent-primary/20 px-2 py-0.5 rounded">
                                  Score: {m.aiScore !== null ? `${m.aiScore}/100` : 'Grading...'}
                                </span>
                              </div>
                              <p className="text-[11px] text-text-secondary italic">"{m.aiFeedback}"</p>
                            </div>
                          )}

                          {/* Inline Instructor Review Panel */}
                          {isSubmitted && (
                            <div className="p-4 bg-bg-secondary/40 border border-border-subtle rounded-xl space-y-3.5">
                              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Instructor Evaluation Review</span>
                              <textarea
                                placeholder="Write manual assessment notes or feedback to the student..."
                                rows={2}
                                className="w-full bg-bg-secondary border border-border-subtle focus:border-accent-primary rounded-lg p-2.5 text-xs text-text-primary placeholder:text-text-muted outline-none resize-none transition-colors"
                                id={`feedback-${m._id}`}
                              />
                              <div className="flex gap-2 justify-end mt-3">
                                <Button
                                  variant="ghost"
                                  onClick={() => {
                                    const fb = document.getElementById(`feedback-${m._id}`).value;
                                    handlePortfolioReviewAction(m._id, 'REJECT', fb);
                                  }}
                                  className="bg-status-danger/10 hover:bg-status-danger/20 text-status-danger border border-status-danger/25 text-xs py-1.5 px-4 font-bold rounded-xl cursor-pointer"
                                >
                                  Reject Milestone
                                </Button>
                                <Button
                                  onClick={() => {
                                    const fb = document.getElementById(`feedback-${m._id}`).value;
                                    handlePortfolioReviewAction(m._id, 'APPROVE', fb);
                                  }}
                                  className="bg-accent-primary hover:bg-accent-hover text-bg-primary text-xs py-1.5 px-4 font-bold rounded-xl cursor-pointer shadow shadow-accent-primary/5"
                                >
                                  Approve & Credit XP
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Discussion Thread column */}
                <div className="flex flex-col space-y-4">
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Project Discussion</h3>
                  <Card className="flex flex-col h-[550px] p-5 bg-bg-card/30 backdrop-blur-sm border border-border-subtle shadow-lg">
                    {/* Add Comment input */}
                    <div className="flex gap-2 items-center pb-4 border-b border-border-subtle">
                      <input
                        type="text"
                        placeholder="Add remark or question..."
                        value={newProjCommentText}
                        onChange={(e) => setNewProjCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handlePostProjComment();
                          }
                        }}
                        className="flex-1 px-4 py-2 text-xs bg-bg-secondary border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
                      />
                      <button
                        onClick={() => handlePostProjComment()}
                        disabled={!newProjCommentText.trim()}
                        className="p-2 bg-accent-primary text-bg-primary hover:bg-accent-hover disabled:opacity-50 rounded-xl cursor-pointer transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto pr-1 mt-4 space-y-5 scrollbar-thin">
                      {(() => {
                        const rootComments = selectedProjComments.filter(c => !c.parent);
                        const repliesByParent = {};
                        selectedProjComments.forEach(c => {
                          if (c.parent) {
                            const parentId = typeof c.parent === 'object' ? c.parent._id : c.parent;
                            if (!repliesByParent[parentId]) {
                              repliesByParent[parentId] = [];
                            }
                            repliesByParent[parentId].push(c);
                          }
                        });

                        if (rootComments.length === 0) {
                          return (
                            <div className="h-full flex items-center justify-center text-xs text-text-muted text-center p-6">
                              No discussion threads yet.
                            </div>
                          );
                        }

                        return rootComments.map((root) => {
                          const isRootAuthorStaff = root.author?.role === 'STAFF';
                          const threadReplies = repliesByParent[root._id] || [];

                          return (
                            <div key={root._id} className="flex flex-col space-y-3 p-3.5 rounded-xl border border-border-subtle bg-bg-secondary/10 animate-fade-in">
                              <div className="space-y-1">
                                <div className="flex justify-between items-center gap-4 text-[9px] text-text-muted">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-text-secondary">{root.author?.name}</span>
                                    {isRootAuthorStaff && (
                                      <span className="text-[7px] font-black text-status-info bg-status-info/10 border border-status-info/20 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                                        Instructor
                                      </span>
                                    )}
                                  </div>
                                  <span>{formatDateTime(root.createdAt)}</span>
                                </div>
                                <p className="text-xs text-text-primary leading-relaxed font-semibold mt-1.5">{root.text}</p>
                              </div>

                              {/* Nested Replies */}
                              {threadReplies.length > 0 && (
                                <div className="pl-3 border-l border-border-subtle flex flex-col space-y-2 mt-2">
                                  {threadReplies.map((reply) => {
                                    const isReplyAuthorStaff = reply.author?.role === 'STAFF';
                                    return (
                                      <div key={reply._id} className="p-2 rounded-lg bg-bg-secondary/40 border border-border-subtle/50 text-[10px] leading-relaxed">
                                        <div className="flex justify-between items-center gap-4 text-[8px] text-text-muted">
                                          <span className="font-bold text-text-secondary">{reply.author?.name}</span>
                                          <span>{formatDateTime(reply.createdAt)}</span>
                                        </div>
                                        <p className="text-text-primary mt-1">{reply.text}</p>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Reply Input Form */}
                              <div className="flex gap-2 items-center mt-2 pl-3">
                                <input
                                  type="text"
                                  placeholder="Write a reply..."
                                  value={selectedProjReplyTexts[root._id] || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedProjReplyTexts(prev => ({ ...prev, [root._id]: val }));
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const text = selectedProjReplyTexts[root._id] || '';
                                      if (text.trim()) {
                                        handlePostProjComment(root._id, text);
                                        setSelectedProjReplyTexts(prev => ({ ...prev, [root._id]: '' }));
                                      }
                                    }
                                  }}
                                  className="flex-1 px-2.5 py-1 text-[10px] bg-bg-secondary border border-border-subtle/70 focus:border-accent-primary rounded-lg text-text-primary placeholder:text-text-muted outline-none"
                                />
                                <button
                                  onClick={() => {
                                    const text = selectedProjReplyTexts[root._id] || '';
                                    if (text.trim()) {
                                      handlePostProjComment(root._id, text);
                                      setSelectedProjReplyTexts(prev => ({ ...prev, [root._id]: '' }));
                                    }
                                  }}
                                  className="p-1.5 bg-accent-primary/10 text-accent-primary border border-accent-primary/20 rounded-lg cursor-pointer hover:bg-accent-primary/20 transition-all"
                                >
                                  <Send className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            /* PROJECT PORTFOLIO GRID VIEW */
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search projects by title or student name..."
                    value={projectsSearch}
                    onChange={(e) => setProjectsSearch(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-subtle focus:border-accent-primary rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold text-text-secondary uppercase">Filter Status</span>
                  <select
                    value={projectsFilterStatus}
                    onChange={(e) => setProjectsFilterStatus(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-bg-secondary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer w-40"
                  >
                    <option value="All Statuses">All Statuses</option>
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="SUBMITTED">Submitted / Pending</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              {projectsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-44 bg-bg-card rounded-2xl"></div>
                  ))}
                </div>
              ) : projectsError ? (
                <div className="p-6 bg-status-danger/10 border border-status-danger/25 text-status-danger rounded-xl text-center text-xs">
                  {projectsError}
                </div>
              ) : (() => {
                const filtered = projectsList.filter(proj => {
                  const matchSearch = proj.title?.toLowerCase().includes(projectsSearch.toLowerCase()) || 
                                      proj.student?.name?.toLowerCase().includes(projectsSearch.toLowerCase());
                  return matchSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-16 text-center border border-dashed border-border-subtle rounded-2xl">
                      <ClipboardList className="w-10 h-10 text-text-muted mx-auto mb-3" />
                      <h4 className="text-xs font-bold text-text-primary">No Matching Projects Found</h4>
                      <p className="text-[10px] text-text-secondary mt-1">Try relaxing your search terms or filters.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((proj) => (
                      <Card key={proj._id} className="p-5 bg-bg-card/40 flex flex-col justify-between h-48 hover:border-accent-primary/20 transition-all">
                        <div className="space-y-2 min-w-0">
                          <div className="flex justify-between items-start gap-3">
                            <span className={cn(
                              "text-[8px] font-black uppercase px-2 py-0.5 rounded border shrink-0",
                              proj.status === 'COMPLETED' && "bg-status-success/10 text-status-success border-status-success/20",
                              proj.status === 'SUBMITTED' && "bg-status-info/10 text-status-info border-status-info/20 animate-pulse",
                              proj.status === 'IN_PROGRESS' && "bg-status-warning/10 text-status-warning border-status-warning/20",
                              proj.status === 'PLANNING' && "bg-neutral-800 text-text-secondary border-neutral-700"
                            )}>
                              {proj.status || 'PLANNING'}
                            </span>
                            <span className="text-[9px] text-text-muted">{formatDateTime(proj.updatedAt)}</span>
                          </div>

                          <h4 className="text-sm font-extrabold text-text-primary tracking-tight truncate" title={proj.title}>
                            {proj.title}
                          </h4>
                          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                            {proj.description}
                          </p>
                        </div>

                        <div className="border-t border-border-subtle/30 pt-3 flex items-center justify-between gap-4 mt-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={proj.student?.avatar || 'https://api.dicebear.com/7.x/shapes/svg?seed=Cosmic'}
                              alt={proj.student?.name}
                              className="w-6 h-6 rounded-full border border-border-subtle object-cover bg-bg-secondary shrink-0"
                            />
                            <span className="font-semibold text-[11px] text-text-primary truncate">{proj.student?.name}</span>
                          </div>

                          <button
                            onClick={() => handleSelectProject(proj._id)}
                            className="text-[10px] font-black text-accent-primary hover:text-accent-hover flex items-center gap-0.5 cursor-pointer bg-transparent border-0 p-0"
                          >
                            View Case Study <ChevronRight size={12} />
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
      {activeTab === 'leaderboard' && (
        <div className="animate-in fade-in duration-200">
          <Leaderboard />
        </div>
      )}
    </div>
  );
};
