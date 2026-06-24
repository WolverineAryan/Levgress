import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as projectsApi from '../api/projects';
import * as milestonesApi from '../api/milestones';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, CardDescription, GithubIcon } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { ChevronRight, CheckCircle2, AlertCircle, Lock, ArrowLeft, Send, Loader2, Book, FileText, Link, Upload } from 'lucide-react';
import { formatDateTime } from '../utils/date';
import { cn } from '../utils/classnames';

const getMilestoneConfig = (index) => {
  switch (index) {
    case 1:
      return {
        allowedTypes: ['PDF'],
        instruction: 'Upload a PDF planning document, wireframe, or database schema plan.',
      };
    case 2:
      return {
        allowedTypes: ['PDF', 'IMAGE'],
        instruction: 'Upload a PDF architecture design or an Image screenshot of backend test/APIs.',
      };
    case 3:
      return {
        allowedTypes: ['IMAGE'],
        instruction: 'Upload an Image screenshot showing frontend UI layout or scaffolding.',
      };
    case 4:
      return {
        allowedTypes: ['IMAGE', 'PDF'],
        instruction: 'Upload an Image screenshot or PDF showing API integration & features.',
      };
    case 5:
      return {
        allowedTypes: ['LINK'],
        instruction: 'Provide a live deployment URL link to verify your project online.',
      };
    default:
      return {
        allowedTypes: ['TEXT'],
        instruction: 'Provide textual explanation of your progress.',
      };
  }
};

export const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();

  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Evidence Submit State
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [evidenceText, setEvidenceText] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceType, setEvidenceType] = useState('TEXT');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (selectedMilestone) {
      const config = getMilestoneConfig(selectedMilestone.index);
      setEvidenceType(config.allowedTypes[0] || 'TEXT');
      setEvidenceText('');
      setEvidenceUrl('');
      setFileName('');
      setFileData('');
    }
  }, [selectedMilestone]);

  const fetchDetails = async () => {
    try {
      const res = await projectsApi.getProjectById(id);
      setProject(res.data.data.project);
      setMilestones(res.data.data.milestones);

      const commentsRes = await projectsApi.getComments(id);
      setComments(commentsRes.data.data.comments);
    } catch (err) {
      setError('Failed to fetch project details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;

    // Listen for live comments on this project
    const handleNewComment = (comment) => {
      setComments((prev) => [...prev, comment]);
    };

    socket.on(`comment-project-${id}`, handleNewComment);

    return () => {
      socket.off(`comment-project-${id}`, handleNewComment);
    };
  }, [socket, id]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);

    try {
      await projectsApi.addComment(id, newComment);
      setNewComment('');
    } catch (err) {
      console.error(err);
      alert('Failed to post comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (e.g. 5MB maximum for safety)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert('File size exceeds the 5MB limit.');
      e.target.value = ''; // Reset input
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileData(reader.result); // This is the Base64 string!
    };
    reader.onerror = () => {
      alert('Error reading file');
    };
    reader.readAsDataURL(file); // Reads file as Base64 Data URL
  };

  const handleEvidenceSubmit = async (e) => {
    e.preventDefault();
    if (!evidenceText) return;

    // Type validation
    if (evidenceType === 'LINK' && !evidenceUrl) {
      alert('Please provide a live deployment link.');
      return;
    }
    if ((evidenceType === 'PDF' || evidenceType === 'IMAGE') && !fileData) {
      alert('Please upload the required file.');
      return;
    }

    setSubmitLoading(true);

    try {
      const res = await milestonesApi.submitEvidence(selectedMilestone._id, {
        type: evidenceType,
        text: evidenceText,
        url: evidenceUrl,
        fileName,
        fileData,
      });
      
      // Update local milestone state
      setMilestones((prev) =>
        prev.map((m) => (m._id === selectedMilestone._id ? res.data.data.milestone : m))
      );
      
      setSelectedMilestone(null);
      setEvidenceText('');
      setEvidenceUrl('');
      setFileName('');
      setFileData('');
      
      // Refresh details to get potential status/XP changes
      fetchDetails();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Evidence submission failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col space-y-4 animate-pulse">
        <div className="h-10 bg-bg-card w-1/4 rounded"></div>
        <div className="h-64 bg-bg-card rounded-2xl"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6 bg-status-danger/10 border border-status-danger/25 text-status-danger rounded-xl text-center">
        {error || 'Project not found.'}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8 select-none">
      {/* Back Button & Header */}
      <div className="flex flex-col space-y-4">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary w-fit cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to projects
        </button>

        <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 border-b border-border-subtle pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-text-primary">{project.title}</h1>
              <Badge variant={project.status === 'COMPLETED' ? 'success' : 'primary'}>
                {project.status}
              </Badge>
            </div>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed max-w-xl">
              {project.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-elevated border border-border-subtle hover:border-text-secondary rounded-lg text-xs font-semibold"
              >
                <GithubIcon className="w-3.5 h-3.5" /> Code Repo
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Milestones timeline on Left, Comments on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Milestones Timeline */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <h2 className="text-lg font-bold text-text-primary">Milestones Pipeline</h2>

          <div className="flex flex-col space-y-4">
            {milestones.map((m) => {
              const isActive = m.status === 'ACTIVE';
              const isCompleted = m.status === 'COMPLETED';
              const isRejected = m.status === 'REJECTED';
              const isSubmitted = m.status === 'SUBMITTED';
              const isLocked = m.status === 'LOCKED';

              return (
                <Card
                  key={m._id}
                  className={cn(
                    "border-l-4 transition-all duration-300",
                    isCompleted && "border-l-status-success bg-status-success/[0.01]",
                    isActive && "border-l-accent-primary bg-accent-primary/[0.01] shadow-[0_0_15px_rgba(192,133,82,0.02)]",
                    isRejected && "border-l-status-danger bg-status-danger/[0.01]",
                    isSubmitted && "border-l-status-info bg-status-info/[0.01]",
                    isLocked && "border-l-transparent opacity-60"
                  )}
                >
                  <div className="flex justify-between items-start flex-col sm:flex-row gap-4">
                    <div className="flex items-start gap-3">
                      {/* Left Icon status indicator */}
                      <div className={cn(
                        "p-2 rounded-xl border mt-0.5",
                        isCompleted && "bg-status-success/10 text-status-success border-status-success/20",
                        isActive && "bg-accent-primary/10 text-accent-primary border-accent-primary/20 animate-pulse",
                        isRejected && "bg-status-danger/10 text-status-danger border-status-danger/20",
                        isSubmitted && "bg-status-info/10 text-status-info border-status-info/20",
                        isLocked && "bg-bg-elevated text-text-muted border-border-subtle"
                      )}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : isLocked ? <Lock className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-text-muted">MILESTONE {m.index}/5</span>
                        <h3 className="text-sm font-bold text-text-primary mt-0.5">{m.title}</h3>
                        <p className="text-xs text-text-secondary mt-1 max-w-md leading-relaxed">{m.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                      {isCompleted && (
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold text-status-success border border-status-success/20 bg-status-success/5 px-2 py-0.5 rounded-full">
                            VERIFIED (Score: {m.aiScore}/100)
                          </span>
                          <span className="text-[9px] text-text-muted mt-1">Done {formatDateTime(m.completedAt)}</span>
                        </div>
                      )}
                      
                      {isSubmitted && (
                        <span className="text-[10px] font-bold text-status-info border border-status-info/20 bg-status-info/5 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Pending AI...
                        </span>
                      )}

                      {isRejected && (
                        <span className="text-[10px] font-bold text-status-danger border border-status-danger/20 bg-status-danger/5 px-2 py-0.5 rounded-full">
                          REJECTED (Score: {m.aiScore}/100)
                        </span>
                      )}

                      {isActive && user?.role === 'STUDENT' && (
                        <Button
                          onClick={() => setSelectedMilestone(m)}
                          className="text-xs px-3 py-1.5"
                        >
                          Submit Evidence
                        </Button>
                      )}

                      {isRejected && user?.role === 'STUDENT' && (
                        <Button
                          onClick={() => setSelectedMilestone(m)}
                          variant="danger"
                          className="text-xs px-3 py-1.5"
                        >
                          Resubmit
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* AI Feedback Drawer display */}
                  {(m.aiFeedback && (isCompleted || isRejected)) && (
                    <div className="mt-4 p-3 bg-bg-secondary/40 border border-border-subtle rounded-lg text-xs leading-relaxed text-text-secondary">
                      <span className="font-bold text-text-primary block mb-1">AI Mentor Feedback:</span>
                      {m.aiFeedback}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Column: Comments section */}
        <div className="flex flex-col space-y-6">
          <h2 className="text-lg font-bold text-text-primary">Project Discussion</h2>

          <Card className="flex flex-col h-[500px]">
            {/* Comments Scrollable Body */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col space-y-4">
              {comments.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-xs text-text-muted text-center p-6">
                  No discussion threads yet. Post a question or update above.
                </div>
              ) : (
                comments.map((c) => {
                  const isAuthorSelf = c.author._id === user?._id;
                  const isAuthorStaff = c.author.role === 'STAFF';

                  return (
                    <div
                      key={c._id}
                      className={cn(
                        "flex flex-col space-y-1 p-3 rounded-lg text-xs max-w-[85%] w-fit",
                        isAuthorSelf
                          ? "bg-accent-primary/10 border border-accent-primary/20 self-end"
                          : isAuthorStaff
                          ? "bg-status-info/10 border border-status-info/20 self-start"
                          : "bg-bg-elevated border border-border-subtle self-start"
                      )}
                    >
                      <div className="flex justify-between items-center gap-4 text-[10px]">
                        <span className="font-bold text-text-primary">{c.author.name}</span>
                        {isAuthorStaff && <span className="text-[9px] font-bold text-status-info uppercase">Instructor</span>}
                      </div>
                      <p className="text-text-primary mt-1 leading-relaxed break-words">{c.text}</p>
                      <span className="text-[9px] text-text-muted mt-1 self-end">{formatDateTime(c.createdAt)}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment Form Input */}
            <form onSubmit={handlePostComment} className="flex gap-2 items-center mt-4 pt-4 border-t border-border-subtle">
              <input
                type="text"
                placeholder="Type your message..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={commentLoading}
                className="flex-1 px-4 py-2 text-xs bg-bg-secondary border border-border-subtle rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
              />
              <button
                type="submit"
                disabled={commentLoading || !newComment.trim()}
                className="p-2 bg-accent-primary text-bg-primary hover:bg-accent-hover disabled:opacity-50 rounded-lg cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </Card>
        </div>
      </div>

      {/* Evidence Submission Slide-in Modal Drawer */}
      {selectedMilestone && (() => {
        const config = getMilestoneConfig(selectedMilestone.index);
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-bg-card border border-border-primary rounded-2xl w-full max-w-md p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <h2 className="text-lg font-bold tracking-tight text-text-primary">Submit Milestone {selectedMilestone.index}</h2>
              <p className="text-xs text-text-secondary mt-1">{selectedMilestone.title}</p>
              
              <p className="text-[10px] text-text-muted mt-3 mb-4 leading-normal bg-bg-secondary/40 p-2.5 rounded-lg border border-border-subtle/50">
                <strong>Format Requirement:</strong> {config.instruction}
              </p>

              <form onSubmit={handleEvidenceSubmit} className="flex flex-col space-y-4">
                {/* Evidence Type tabs if multiple options are allowed */}
                {config.allowedTypes.length > 1 && (
                  <div className="flex gap-2 bg-bg-secondary p-1 rounded-lg border border-border-subtle">
                    {config.allowedTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setEvidenceType(type);
                          setFileName('');
                          setFileData('');
                        }}
                        className={cn(
                          "flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer",
                          evidenceType === type
                            ? "bg-accent-primary text-bg-primary shadow"
                            : "text-text-secondary hover:text-text-primary"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}

                {/* Conditional Inputs based on selected evidence type */}
                {evidenceType === 'PDF' && (
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary">Upload PDF Document</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border-subtle rounded-xl cursor-pointer bg-bg-secondary hover:bg-bg-elevated transition-colors relative">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Book className="w-8 h-8 text-accent-primary mb-2" />
                          <p className="text-[11px] text-text-secondary">
                            <span className="font-bold text-accent-primary">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-[10px] text-text-muted mt-1">PDF document (Max 5MB)</p>
                        </div>
                        <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} required={!fileData} />
                        {fileName && (
                          <div className="absolute inset-0 bg-bg-card flex flex-col items-center justify-center p-4 border border-accent-primary/20 rounded-xl">
                            <FileText className="w-8 h-8 text-accent-primary mb-1" />
                            <span className="text-xs font-bold text-text-primary max-w-xs truncate text-center px-2">{fileName}</span>
                            <span className="text-[10px] text-status-success font-semibold mt-1">Ready for Analysis</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setFileName('');
                                setFileData('');
                              }}
                              className="mt-2 text-[10px] text-status-danger font-bold hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                {evidenceType === 'IMAGE' && (
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary">Upload Screenshot Image</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border-subtle rounded-xl cursor-pointer bg-bg-secondary hover:bg-bg-elevated transition-colors relative overflow-hidden">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-accent-primary mb-2" />
                          <p className="text-[11px] text-text-secondary">
                            <span className="font-bold text-accent-primary">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-[10px] text-text-muted mt-1">Image file (PNG, JPG, max 5MB)</p>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} required={!fileData} />
                        {fileData && (
                          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-2 rounded-xl">
                            <img src={fileData} alt="Preview" className="h-16 object-contain rounded border border-border-subtle" />
                            <span className="text-[10px] font-bold text-text-primary max-w-xs truncate mt-1.5">{fileName}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setFileName('');
                                setFileData('');
                              }}
                              className="text-[10px] text-status-danger font-bold hover:underline mt-1 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                {evidenceType === 'LINK' && (
                  <Input
                    label="Live Deployment Link URL"
                    placeholder="https://my-project.vercel.app"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    required
                  />
                )}

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary">Implementation Description</label>
                  <textarea
                    className="w-full px-4 py-2 text-xs bg-bg-secondary border border-border-subtle rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors h-20 resize-none"
                    placeholder="Describe your implementation details, verify functionalities completed, or outline testing details..."
                    value={evidenceText}
                    onChange={(e) => setEvidenceText(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSelectedMilestone(null)}
                    disabled={submitLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={submitLoading}>
                    Submit to AI Mentor
                  </Button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
