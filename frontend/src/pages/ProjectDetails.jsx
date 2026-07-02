import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import * as projectsApi from '../api/projects';
import * as milestonesApi from '../api/milestones';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, CardDescription, GithubIcon } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Lock, ArrowLeft, Send, Loader2, Book, FileText, Link, Upload, Trash2, X, Image } from 'lucide-react';
import { formatDateTime } from '../utils/date';
import { cn } from '../utils/classnames';



export const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();

  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [comments, setComments] = useState([]);
  const [replyTexts, setReplyTexts] = useState({});

  const handleReplyTextChange = (commentId, val) => {
    setReplyTexts(prev => ({
      ...prev,
      [commentId]: val
    }));
  };

  const submitReply = async (commentId) => {
    const text = replyTexts[commentId] || '';
    if (!text.trim()) return;
    await handlePostComment(null, text, commentId);
    setReplyTexts(prev => ({
      ...prev,
      [commentId]: ''
    }));
  };
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
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [activeScreenshotIdx, setActiveScreenshotIdx] = useState(0);

  // Project Specifications edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editGithubUrl, setEditGithubUrl] = useState('');
  const [editLiveUrl, setEditLiveUrl] = useState('');
  const [editTechStack, setEditTechStack] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setEditTitle(project.title || '');
      setEditDescription(project.description || '');
      setEditGithubUrl(project.githubUrl || '');
      setEditLiveUrl(project.liveUrl || '');
      setEditTechStack(project.techStack ? project.techStack.join(', ') : '');
    }
  }, [project]);

  const handleUpdateProjectDetails = async (e) => {
    e.preventDefault();
    if (!editTitle || !editDescription) return;
    setUpdateLoading(true);

    try {
      const parsedTech = editTechStack
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await projectsApi.updateProject(project._id, {
        title: editTitle,
        description: editDescription,
        githubUrl: editGithubUrl,
        liveUrl: editLiveUrl,
        techStack: parsedTech,
      });

      // Update state with modified project
      setProject(res.data.data.project);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Error updating project: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    if (project?.screenshots && activeScreenshotIdx >= project.screenshots.length) {
      setActiveScreenshotIdx(Math.max(0, project.screenshots.length - 1));
    }
  }, [project?.screenshots, activeScreenshotIdx]);

  useEffect(() => {
    if (selectedMilestone) {
      setEvidenceType('LINK');
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

  const isOwnProject = user && project && (project.student === user._id || project.student._id === user._id);

  const handleProjectScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSizeBytes = 3 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert('File size exceeds the 3MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result;
        const newScreenshot = { fileName: file.name, fileData: base64Data };
        const updatedScreenshots = [...(project.screenshots || []), newScreenshot];

        const res = await projectsApi.updateProject(project._id, {
          screenshots: updatedScreenshots
        });
        
        setProject((prev) => ({
          ...prev,
          screenshots: res.data.data.project.screenshots
        }));
      } catch (err) {
        console.error(err);
        alert('Failed to upload screenshot');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProjectScreenshotDelete = async (screenshotId) => {
    if (!confirm('Are you sure you want to remove this screenshot?')) return;
    try {
      const updatedScreenshots = (project.screenshots || []).filter(s => s._id !== screenshotId);
      const res = await projectsApi.updateProject(project._id, {
        screenshots: updatedScreenshots
      });

      setProject((prev) => ({
        ...prev,
        screenshots: res.data.data.project.screenshots
      }));
    } catch (err) {
      console.error(err);
      alert('Failed to delete screenshot');
    }
  };

  useEffect(() => {
    if (!id || !socket) return;

    // Listen for live comments on this project
    const handleNewComment = (comment) => {
      setComments((prev) => {
        if (prev.some(c => c._id === comment._id)) return prev;
        return [...prev, comment];
      });
    };

    socket.on(`comment-project-${id}`, handleNewComment);

    return () => {
      socket.off(`comment-project-${id}`, handleNewComment);
    };
  }, [socket, id]);

  const handlePostComment = async (e, textValue = newComment, parentId = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const text = textValue.trim();
    if (!text) return;
    setCommentLoading(true);

    try {
      await projectsApi.addComment(id, text, parentId);
      if (!parentId) {
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to post comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const openEvidenceModal = (m) => {
    setSelectedMilestone(m);
    setEvidenceType('TEXT');
    setEvidenceText('');
    setEvidenceUrl('');
    setFileName('');
    setFileData('');
    setUploadedFiles([]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check size limit (e.g. 5MB maximum for safety) for each file
    const maxSizeBytes = 5 * 1024 * 1024;
    for (const file of files) {
      if (file.size > maxSizeBytes) {
        alert(`File "${file.name}" exceeds the 5MB limit.`);
        e.target.value = ''; // Reset input
        return;
      }
    }

    const readers = [];
    const newFiles = [];

    files.forEach((file) => {
      const reader = new FileReader();
      const promise = new Promise((resolve) => {
        reader.onloadend = () => {
          newFiles.push({
            fileName: file.name,
            fileData: reader.result, // Base64
          });
          resolve();
        };
        reader.onerror = () => {
          alert(`Error reading file "${file.name}"`);
          resolve();
        };
        reader.readAsDataURL(file);
      });
      readers.push(promise);
    });

    Promise.all(readers).then(() => {
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      // Also set the first one as main fileName/fileData for backwards-compatibility
      if (newFiles.length > 0) {
        setFileName(newFiles[0].fileName);
        setFileData(newFiles[0].fileData);
      }
    });
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEvidenceSubmit = async (e) => {
    e.preventDefault();
    if (!evidenceText) return;

    // Type validation
    if (!evidenceUrl) {
      alert('Please provide a live link URL.');
      return;
    }

    setSubmitLoading(true);

    try {
      const payload = {
        type: 'LINK',
        text: evidenceText,
        url: evidenceUrl,
        fileName: uploadedFiles.length > 0 ? uploadedFiles[0].fileName : '',
        fileData: uploadedFiles.length > 0 ? uploadedFiles[0].fileData : '',
        files: uploadedFiles,
      };

      const res = await milestonesApi.submitEvidence(selectedMilestone._id, payload);
      
      // Update local milestone state
      setMilestones((prev) =>
        prev.map((m) => (m._id === selectedMilestone._id ? res.data.data.milestone : m))
      );
      
      setSelectedMilestone(null);
      setEvidenceText('');
      setEvidenceUrl('');
      setFileName('');
      setFileData('');
      setUploadedFiles([]);
      
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
            {isOwnProject && (
              <Button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5"
              >
                Edit Details
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Project Screenshots Section */}
      <Card className="p-6 flex flex-col space-y-5 bg-bg-card/30 backdrop-blur-sm border border-border-subtle shadow-lg">
        <div className="flex justify-between items-center sm:flex-row flex-col gap-3">
          <div>
            <h3 className="text-sm font-bold text-text-primary tracking-tight">UI Screenshots & Design Gallery</h3>
            <p className="text-[10px] text-text-secondary mt-0.5">Showcase your project UI layouts, diagrams, and visual milestones</p>
          </div>
          {isOwnProject && (
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary border border-accent-primary/25 rounded-xl text-xs font-black cursor-pointer shadow-md shadow-accent-primary/5 hover:scale-[1.02] active:scale-[0.98] transition-all tracking-tight">
              <Upload className="w-4 h-4 shrink-0" />
              <span>Upload Screenshot</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleProjectScreenshotUpload} />
            </label>
          )}
        </div>

        {project.screenshots && project.screenshots.length > 0 ? (
          <div className="flex flex-col space-y-4">
            {/* Main Active Slide Display */}
            <div className="relative aspect-[16/9] w-full max-h-[420px] bg-black rounded-2xl border border-border-subtle overflow-hidden flex items-center justify-center group shadow-2xl">
              {/* Ambient Blurred Background to eliminate grey pillarboxes */}
              <div 
                className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-110 pointer-events-none select-none transition-all duration-700 ease-in-out"
                style={{ backgroundImage: `url(${project.screenshots[activeScreenshotIdx]?.fileData})` }}
              />

              <img
                src={project.screenshots[activeScreenshotIdx]?.fileData}
                alt={project.screenshots[activeScreenshotIdx]?.fileName}
                onClick={() => setLightboxImage(project.screenshots[activeScreenshotIdx]?.fileData)}
                className="relative z-10 max-w-full max-h-[420px] object-contain cursor-zoom-in hover:scale-[1.01] transition-transform duration-300 select-none"
              />

              {/* Slide Navigation Overlay Arrows */}
              {project.screenshots.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveScreenshotIdx((prev) => (prev === 0 ? project.screenshots.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/75 border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 transition-all cursor-pointer z-20"
                    title="Previous Slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveScreenshotIdx((prev) => (prev === project.screenshots.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/75 border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 transition-all cursor-pointer z-20"
                    title="Next Slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Bottom Caption & Delete Overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 flex items-center justify-between text-xs text-text-primary">
                <div className="flex flex-col">
                  <span className="font-semibold truncate max-w-[250px]">{project.screenshots[activeScreenshotIdx]?.fileName}</span>
                  <span className="text-[9px] text-white/50 mt-0.5">
                    Image {activeScreenshotIdx + 1} of {project.screenshots.length}
                  </span>
                </div>
                
                {isOwnProject && (
                  <button
                    onClick={() => handleProjectScreenshotDelete(project.screenshots[activeScreenshotIdx]?._id)}
                    className="p-2 bg-status-danger/10 hover:bg-status-danger/20 text-status-danger border border-status-danger/30 rounded-xl cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-1.5 font-bold text-[10px]"
                    title="Delete screenshot"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
              </div>
            </div>

            {/* Thumbnails list navigation bar */}
            {project.screenshots.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1.5 pt-1.5 scrollbar-thin select-none justify-center">
                {project.screenshots.map((s, idx) => (
                  <button
                    key={s._id}
                    onClick={() => setActiveScreenshotIdx(idx)}
                    className={`h-14 w-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-black/20 hover:brightness-110 cursor-pointer ${
                      activeScreenshotIdx === idx
                        ? 'border-accent-primary scale-[1.03] shadow-md shadow-accent-primary/10'
                        : 'border-border-subtle opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={s.fileData} alt="" className="w-full h-full object-cover rounded-lg" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-text-muted text-xs border border-dashed border-border-subtle rounded-2xl bg-bg-secondary/10">
            No UI screenshots uploaded yet. Use the upload button to add screenshots and wireframes of your project!
          </div>
        )}
      </Card>

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
                        {m.evidence && (m.evidence.fileData || (m.evidence.files && m.evidence.files.length > 0)) && (
                          <div className="flex flex-wrap gap-2 mt-2.5">
                            {m.evidence.files && m.evidence.files.length > 0 ? (
                              m.evidence.files.map((file, idx) => (
                                <a
                                  key={idx}
                                  href={file.fileData}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-accent-primary hover:underline flex items-center gap-1 font-bold bg-bg-secondary/50 border border-border-subtle/50 px-2.5 py-1 rounded-lg hover:border-accent-primary/30 transition-all animate-in fade-in duration-200"
                                >
                                  {m.evidence.type === 'IMAGE' ? <Image className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                  {file.fileName || `File ${idx + 1}`}
                                </a>
                              ))
                            ) : (
                              <a
                                href={m.evidence.fileData}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-accent-primary hover:underline flex items-center gap-1 font-bold bg-bg-secondary/50 border border-border-subtle/50 px-2.5 py-1 rounded-lg hover:border-accent-primary/30 transition-all"
                              >
                                {m.evidence.type === 'IMAGE' ? <Image className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                View Submitted File
                              </a>
                            )}
                          </div>
                        )}
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
                          onClick={() => openEvidenceModal(m)}
                          className="text-xs px-3 py-1.5"
                        >
                          Submit Evidence
                        </Button>
                      )}

                      {isRejected && user?.role === 'STUDENT' && (
                        <Button
                          onClick={() => openEvidenceModal(m)}
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

        {/* Right Column: Q&A Project Discussion section */}
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-extrabold text-text-primary uppercase tracking-wider">Project Discussion (Q&A)</h2>
          </div>

          <Card className="flex flex-col h-[550px] p-5 bg-bg-card/30 backdrop-blur-sm border border-border-subtle shadow-lg">
            {/* Post Root Comment / Question form - Instructors Only */}
            {user?.role === 'STAFF' ? (
              <form onSubmit={handlePostComment} className="flex gap-2 items-center pb-4 border-b border-border-subtle">
                <input
                  type="text"
                  placeholder="Add instructor remark or question..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={commentLoading}
                  className="flex-1 px-4 py-2 text-xs bg-bg-secondary border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
                />
                <button
                  type="submit"
                  disabled={commentLoading || !newComment.trim()}
                  className="p-2 bg-accent-primary text-bg-primary hover:bg-accent-hover disabled:opacity-50 rounded-xl cursor-pointer transition-all"
                  title="Post comment"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="pb-4 border-b border-border-subtle text-[10px] text-text-muted text-center italic">
                Only instructors can post new remarks. You can submit replies to existing questions below.
              </div>
            )}

            {/* Q&A Threads List */}
            <div className="flex-1 overflow-y-auto pr-1 mt-4 space-y-5 scrollbar-thin">
              {(() => {
                const rootComments = comments.filter(c => !c.parent);
                const repliesByParent = {};
                comments.forEach(c => {
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
                      No instructor remarks or student questions yet. Post a query or remark above to start the discussion!
                    </div>
                  );
                }

                return rootComments.map((root) => {
                  const isRootAuthorStaff = root.author?.role === 'STAFF';
                  const threadReplies = repliesByParent[root._id] || [];

                  return (
                    <div key={root._id} className="flex flex-col space-y-3 p-4 rounded-xl border border-border-subtle bg-bg-secondary/10">
                      {/* Root Question/Remark card */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center gap-4 text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <RouterLink to={`/profile/${root.author?._id}`} className="font-extrabold text-text-primary hover:text-accent-primary transition-colors">
                              {root.author?.name}
                            </RouterLink>
                            {isRootAuthorStaff && (
                              <span className="text-[8px] font-black text-status-info bg-status-info/10 border border-status-info/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                Instructor
                              </span>
                            )}
                          </div>
                          <span className="text-text-muted">{formatDateTime(root.createdAt)}</span>
                        </div>
                        <p className="text-xs text-text-primary leading-relaxed font-semibold mt-1.5">{root.text}</p>
                      </div>

                      {/* Nested Replies list */}
                      {threadReplies.length > 0 && (
                        <div className="pl-4 border-l border-border-subtle flex flex-col space-y-2 mt-2">
                          {threadReplies.map((reply) => {
                            const isReplyAuthorStaff = reply.author?.role === 'STAFF';
                            return (
                              <div key={reply._id} className="p-2.5 rounded-lg bg-bg-secondary/40 border border-border-subtle/50 text-[11px] leading-relaxed">
                                <div className="flex justify-between items-center gap-4 text-[9px] text-text-muted">
                                  <RouterLink to={`/profile/${reply.author?._id}`} className="font-bold text-text-secondary hover:text-accent-primary transition-colors">
                                    {reply.author?.name}
                                  </RouterLink>
                                  <span>{formatDateTime(reply.createdAt)}</span>
                                </div>
                                <p className="text-text-primary mt-1">{reply.text}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Reply Input Form */}
                      <div className="flex gap-2 items-center mt-2 pl-4">
                        <input
                          type="text"
                          placeholder="Write a reply..."
                          value={replyTexts[root._id] || ''}
                          onChange={(e) => handleReplyTextChange(root._id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              submitReply(root._id);
                            }
                          }}
                          className="flex-1 px-3 py-1.5 text-[11px] bg-bg-secondary border border-border-subtle/70 focus:border-accent-primary rounded-lg text-text-primary placeholder:text-text-muted outline-none transition-colors"
                        />
                        <button
                          onClick={() => submitReply(root._id)}
                          disabled={!replyTexts[root._id]?.trim()}
                          className="p-1.8 bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 disabled:opacity-50 rounded-lg cursor-pointer transition-colors"
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

      {/* Evidence Submission Slide-in Modal Drawer */}
      {selectedMilestone && (() => {
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-bg-card border border-border-primary rounded-2xl w-full max-w-md p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <h2 className="text-lg font-bold tracking-tight text-text-primary">Submit Milestone {selectedMilestone.index}</h2>
              <p className="text-xs text-text-secondary mt-1">{selectedMilestone.title}</p>
              
              <p className="text-[10px] text-text-muted mt-3 mb-4 leading-normal bg-bg-secondary/40 p-2.5 rounded-lg border border-border-subtle/50">
                <strong>Requirement:</strong> Please provide a working live link and implementation description. You can optionally attach supporting files (screenshots, README, deployment report, etc.).
              </p>

              <form onSubmit={handleEvidenceSubmit} className="flex flex-col space-y-4">
                <Input
                  label="Live Link URL (Compulsory)"
                  placeholder="e.g. https://my-deployment.vercel.app"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  required
                />

                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-text-secondary">Attach Supporting Files (Optional)</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border-subtle rounded-xl cursor-pointer bg-bg-secondary hover:bg-bg-elevated transition-colors relative overflow-hidden">
                      <div className="flex flex-col items-center justify-center pt-4 pb-5">
                        <Upload className="w-6 h-6 text-accent-primary mb-1.5" />
                        <p className="text-[11px] text-text-secondary">
                          <span className="font-bold text-accent-primary">Click to attach files</span> (multiple allowed)
                        </p>
                        <p className="text-[9px] text-text-muted mt-0.5">Images, PDFs, Markdown, Text (Max 5MB per file)</p>
                      </div>
                      <input type="file" accept="image/*,.pdf,.md,.txt" className="hidden" onChange={handleFileChange} multiple />
                    </label>
                  </div>
                  {uploadedFiles.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2 max-h-32 overflow-y-auto pr-1">
                      {uploadedFiles.map((file, idx) => {
                        const isImage = file.fileData && file.fileData.startsWith('data:image/');
                        return (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-border-subtle bg-bg-secondary h-16 flex items-center justify-center animate-in fade-in duration-200">
                            {isImage ? (
                              <img src={file.fileData} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center justify-center p-1 text-center">
                                <FileText className="w-5 h-5 text-accent-primary mb-1" />
                                <span className="text-[8px] font-bold text-text-secondary truncate max-w-[80px] px-1">{file.fileName}</span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemoveFile(idx);
                              }}
                              className="absolute top-1 right-1 bg-black/75 text-status-danger p-0.5 rounded-full hover:bg-black transition-colors cursor-pointer"
                              title="Remove file"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            {isImage && (
                              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-text-primary px-1 truncate text-center font-medium">
                                {file.fileName}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary">Implementation Description (Compulsory)</label>
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

      {/* Edit Project Details Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-primary rounded-2xl w-full max-w-md p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary cursor-pointer bg-transparent border-0"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold tracking-tight text-text-primary mb-1">Edit Project Specifications</h2>
            <p className="text-xs text-text-secondary mb-6">Modify your code repository, live link, tech stack, or description.</p>

            <form onSubmit={handleUpdateProjectDetails} className="flex flex-col space-y-4">
              <Input
                label="Project Title"
                placeholder="e.g. Levgress Rebuild"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">Project Description</label>
                <textarea
                  className="w-full px-4 py-2 text-sm bg-bg-secondary border border-border-subtle rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors h-20 resize-none"
                  placeholder="Summarize the core functionality and goals of the application..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="GitHub Repository Link"
                  placeholder="https://github.com/..."
                  value={editGithubUrl}
                  onChange={(e) => setEditGithubUrl(e.target.value)}
                />
                <Input
                  label="Deployment Link"
                  placeholder="https://..."
                  value={editLiveUrl}
                  onChange={(e) => setEditLiveUrl(e.target.value)}
                />
              </div>

              <Input
                label="Tech Stack (comma-separated)"
                placeholder="React, Node.js, MongoDB"
                value={editTechStack}
                onChange={(e) => setEditTechStack(e.target.value)}
              />

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={updateLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={updateLoading}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
