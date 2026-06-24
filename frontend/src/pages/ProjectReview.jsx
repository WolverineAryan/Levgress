import { useState, useEffect } from 'react';
import * as projectsApi from '../api/projects';
import * as milestonesApi from '../api/milestones';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, CardDescription } from '../components/ui';
import { ClipboardList, Check, X as RejectIcon, User, Calendar, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';
import { formatDate } from '../utils/date';
import { cn } from '../utils/classnames';

export const ProjectReview = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected project drill-down details
  const [selectedProject, setSelectedProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Review validation form state
  const [activeReviewMilestone, setActiveReviewMilestone] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await projectsApi.getAllProjects();
      setProjects(res.data.data.projects);
    } catch (err) {
      setError('Failed to fetch project listings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSelectProject = async (p) => {
    setSelectedProject(p);
    setDetailsLoading(true);
    setActiveReviewMilestone(null);
    setFeedbackText('');

    try {
      const res = await projectsApi.getProjectById(p._id);
      setMilestones(res.data.data.milestones);
    } catch (err) {
      console.error(err);
      alert('Failed to load project details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleValidationAction = async (milestoneId, action) => {
    setSubmitLoading(true);
    try {
      let res;
      if (action === 'APPROVE') {
        res = await milestonesApi.staffApproveMilestone(milestoneId, feedbackText);
      } else {
        res = await milestonesApi.staffRejectMilestone(milestoneId, feedbackText);
      }

      // Update local milestones state
      setMilestones((prev) =>
        prev.map((m) => (m._id === milestoneId ? res.data.data.milestone : m))
      );

      setActiveReviewMilestone(null);
      setFeedbackText('');
      
      // Refresh project list to update status
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert('Failed to complete review decision: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col space-y-4 animate-pulse">
        <div className="h-10 bg-bg-card w-1/4 rounded"></div>
        <div className="h-96 bg-bg-card rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8 select-none">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <ClipboardList className="text-accent-primary" /> Project Review Center
        </h1>
        <p className="text-xs text-text-secondary mt-1">Review active student pipelines and override AI validations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns: Projects listings table */}
        <div className="lg:col-span-1 flex flex-col space-y-4">
          <h2 className="text-lg font-bold text-text-primary">Cohort Projects</h2>

          {projects.length === 0 ? (
            <Card className="p-8 text-center text-xs text-text-muted">No student portfolios submitted.</Card>
          ) : (
            <div className="flex flex-col space-y-3">
              {projects.map((p) => (
                <Card
                  key={p._id}
                  onClick={() => handleSelectProject(p)}
                  className={cn(
                    "cursor-pointer p-4 transition-all duration-200 border-l-2",
                    selectedProject?._id === p._id
                      ? "border-l-accent-primary bg-accent-primary/[0.02]"
                      : "border-l-transparent hover:border-l-border-primary"
                  )}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-text-muted flex items-center gap-1">
                        <User className="w-3 h-3" /> {p.student?.name}
                      </span>
                      <h4 className="text-xs font-bold text-text-primary mt-1 truncate max-w-[150px]">{p.title}</h4>
                    </div>
                    <Badge variant={p.status === 'COMPLETED' ? 'success' : 'primary'}>
                      {p.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Project details drill down and review sheet */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <h2 className="text-lg font-bold text-text-primary">Pipeline Review Details</h2>

          {!selectedProject ? (
            <Card className="p-16 text-center border-dashed flex flex-col items-center justify-center">
              <ClipboardList className="w-12 h-12 text-text-muted mb-4 animate-float" />
              <h3 className="text-sm font-bold text-text-primary">No Project Selected</h3>
              <p className="text-xs text-text-secondary max-w-xs mt-1">Select a project on the left to examine milestones, reviews, and comments.</p>
            </Card>
          ) : detailsLoading ? (
            <Card className="p-16 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
            </Card>
          ) : (
            <div className="flex flex-col space-y-6">
              {/* Project Card summary */}
              <Card className="p-6">
                <CardHeader className="p-0 mb-4 flex justify-between flex-row items-center">
                  <div>
                    <span className="text-[9px] font-bold text-accent-primary tracking-widest uppercase">PROJECT INFO</span>
                    <CardTitle className="text-base mt-1">{selectedProject.title}</CardTitle>
                  </div>
                  <Badge variant={selectedProject.status === 'COMPLETED' ? 'success' : 'primary'}>
                    {selectedProject.status}
                  </Badge>
                </CardHeader>
                <CardContent className="p-0 text-xs text-text-secondary leading-relaxed">
                  <p>{selectedProject.description}</p>

                  <div className="mt-4 pt-4 border-t border-border-subtle flex justify-between items-center text-[10px] text-text-muted">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Started {formatDate(selectedProject.createdAt)}</span>
                    {selectedProject.githubUrl && (
                      <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-text-primary">
                        <ExternalLink className="w-3 h-3" /> GitHub Repo
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Milestones timeline for evaluation */}
              <h3 className="text-sm font-bold text-text-primary">Milestones Pipeline</h3>
              <div className="flex flex-col space-y-4">
                {milestones.map((m) => {
                  const isSubmitted = m.status === 'SUBMITTED';
                  const isCompleted = m.status === 'COMPLETED';
                  const isRejected = m.status === 'REJECTED';
                  const isActive = m.status === 'ACTIVE';

                  return (
                    <Card
                      key={m._id}
                      className={cn(
                        "p-5 border-l-4 transition-colors",
                        isSubmitted && "border-l-status-info bg-status-info/[0.01]",
                        isCompleted && "border-l-status-success bg-status-success/[0.01]",
                        isRejected && "border-l-status-danger bg-status-danger/[0.01]",
                        isActive && "border-l-accent-primary",
                        m.status === 'LOCKED' && "border-l-transparent opacity-60"
                      )}
                    >
                      <div className="flex justify-between items-start flex-col sm:flex-row gap-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-text-muted">MILESTONE {m.index}/5</span>
                          <h4 className="text-xs font-bold text-text-primary mt-1">{m.title}</h4>
                          <p className="text-[11px] text-text-secondary mt-1 max-w-md leading-relaxed">{m.description}</p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                          <Badge variant={
                            isCompleted ? 'success' : isSubmitted ? 'info' : isRejected ? 'danger' : 'neutral'
                          }>
                            {m.status}
                          </Badge>
                          {m.aiScore !== null && (
                            <span className="text-[9px] font-semibold text-text-muted">AI Score: {m.aiScore}/100</span>
                          )}
                        </div>
                      </div>

                      {/* Display Evidence if Submitted, Completed or Rejected */}
                      {m.evidence && m.evidence.text && (
                        <div className="mt-4 p-4 bg-bg-secondary/40 border border-border-subtle rounded-lg text-xs leading-relaxed text-text-secondary">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-text-primary">Submitted Evidence:</span>
                            {m.evidence.url && (
                              <a
                                href={m.evidence.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-accent-primary hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" /> Commit Link
                              </a>
                            )}
                          </div>
                          <p className="whitespace-pre-wrap">{m.evidence.text}</p>
                          {m.aiFeedback && (
                            <div className="mt-3 pt-3 border-t border-border-subtle/40">
                              <span className="font-bold text-text-primary block mb-1">AI Assessor Comments:</span>
                              {m.aiFeedback}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Review Actions Panel */}
                      {isSubmitted && activeReviewMilestone?._id !== m._id && (
                        <div className="mt-4 flex justify-end">
                          <Button
                            onClick={() => {
                              setActiveReviewMilestone(m);
                              setFeedbackText('');
                            }}
                            className="text-xs px-3 py-1.5"
                          >
                            Review Submission
                          </Button>
                        </div>
                      )}

                      {/* Active Review Form */}
                      {activeReviewMilestone?._id === m._id && (
                        <div className="mt-4 p-4 border border-border-primary rounded-lg bg-bg-secondary/50 flex flex-col space-y-4">
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-bold text-text-secondary uppercase">Instructor Feedback</label>
                            <textarea
                              placeholder="Write review comments or feedback for the student..."
                              value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary h-16 resize-none"
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              onClick={() => setActiveReviewMilestone(null)}
                              className="text-xs px-2.5 py-1.5"
                            >
                              Cancel
                            </Button>
                            
                            <Button
                              variant="danger"
                              onClick={() => handleValidationAction(m._id, 'REJECT')}
                              loading={submitLoading}
                              className="text-xs px-3 py-1.5 flex items-center gap-1.5"
                              icon={RejectIcon}
                            >
                              Reject
                            </Button>

                            <Button
                              variant="success"
                              onClick={() => handleValidationAction(m._id, 'APPROVE')}
                              loading={submitLoading}
                              className="text-xs px-3 py-1.5 flex items-center gap-1.5"
                              icon={Check}
                            >
                              Approve
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
