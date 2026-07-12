import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import * as postsApi from '../api/posts';
import * as projectsApi from '../api/projects';
import * as studentsApi from '../api/students';
import { Card, Button, GithubIcon } from '../components/ui';
import { 
  Heart, 
  MessageSquare, 
  ExternalLink, 
  Send, 
  Loader2, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  FolderOpen,
  Trash2,
  Share2
} from 'lucide-react';
import { formatDateTime } from '../utils/date';

export const ProjectsShowcase = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Feed states
  const [posts, setProjects] = useState([]); // keep name similar to preserve structure
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create Post states
  const [postText, setPostText] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [myProjects, setMyProjects] = useState([]);
  const [postSubmitting, setPostSubmitting] = useState(false);

  // Expanded comments section state for each post: { [postId]: boolean }
  const [expandedComments, setExpandedComments] = useState({});
  // Form input texts for new comments: { [postId]: string }
  const [newComments, setNewComments] = useState({});
  // Loading status for comment posting: { [postId]: boolean }
  const [commentSubmitting, setCommentSubmitting] = useState({});

  const handleMentionClick = async (username) => {
    try {
      const res = await studentsApi.getStudentByUsername(username);
      const { userId } = res.data.data;
      navigate(`/profile/${userId}`);
    } catch (err) {
      console.error('Failed to resolve mention:', err);
      alert(`Could not find profile for @${username}`);
    }
  };

  const renderTextWithMentions = (text) => {
    if (!text) return '';
    const parts = text.split(/(@[a-zA-Z0-9_-]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.slice(1);
        return (
          <span
            key={index}
            onClick={() => handleMentionClick(username)}
            className="text-accent-primary font-bold hover:underline cursor-pointer transition-colors"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await postsApi.getAllPosts();
      setProjects(res.data.data.posts || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load engineering showcase feed.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProjects = async () => {
    if (user && user.role === 'STUDENT') {
      try {
        const res = await projectsApi.getMyProjects();
        setMyProjects(res.data.data.projects || []);
      } catch (err) {
        console.error('Failed to load user projects:', err);
      }
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchMyProjects();
  }, [user]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postText.trim()) return;

    setPostSubmitting(true);
    try {
      const res = await postsApi.createPost(postText, selectedProjectId || null);
      
      // Prepend new post to the feed list
      setProjects((prev) => [res.data.data.post, ...prev]);
      
      // Clear forms
      setPostText('');
      setSelectedProjectId('');
    } catch (err) {
      console.error('Failed to create post:', err);
      alert('Failed to publish post: ' + (err.response?.data?.message || err.message));
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await postsApi.likePost(postId);
      const updatedPost = res.data.data.post;
      
      // Update local posts state
      setProjects((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes: updatedPost.likes } : p))
      );
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await postsApi.deletePost(postId);
      setProjects((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Failed to delete post.');
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handlePostComment = async (e, postId) => {
    e.preventDefault();
    const commentText = (newComments[postId] || '').trim();
    if (!commentText) return;

    setCommentSubmitting((prev) => ({ ...prev, [postId]: true }));
    try {
      const res = await postsApi.addComment(postId, commentText);
      const updatedPost = res.data.data.post;

      // Update comments list locally
      setProjects((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, comments: updatedPost.comments } : p))
      );

      // Clear input
      setNewComments((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Failed to post comment:', err);
      alert('Failed to post comment.');
    } finally {
      setCommentSubmitting((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const getTrendingTechnologies = () => {
    const counts = {};
    posts.forEach(post => {
      if (post.project && post.project.techStack) {
        post.project.techStack.forEach(tech => {
          counts[tech] = (counts[tech] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 select-none max-w-6xl mx-auto">
      {/* Left Main Stream: LinkedIn Feed */}
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Sparkles className="text-accent-primary w-7 h-7" /> Engineering Feed
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Share learning updates, link your milestones, and discuss with peer developers.
          </p>
        </div>

        {/* Create Post Card */}
        {user && (
          <Card className="p-5 border border-border-subtle bg-bg-card shadow-sm flex flex-col space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-full border border-border-primary bg-bg-secondary flex items-center justify-center font-bold text-text-primary shadow-sm overflow-hidden shrink-0 mt-1">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="Share a project update, ask a technical question, or post a win..."
                  className="w-full bg-transparent border-0 focus:outline-none text-xs text-text-primary placeholder:text-text-muted resize-none min-h-[70px] py-1"
                />
              </div>
            </div>

            {/* Attach Project Section */}
            {user.role === 'STUDENT' && myProjects.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between border-t border-border-subtle/50 pt-3">
                <div className="flex items-center gap-2 text-xs text-text-secondary w-full sm:w-auto">
                  <FolderOpen className="w-4 h-4 text-accent-primary shrink-0" />
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="bg-bg-secondary border border-border-subtle text-text-primary rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-accent-primary text-xs w-full sm:max-w-[240px]"
                  >
                    <option value="">Attach Project (Optional)</option>
                    {myProjects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.title} ({p.status})
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleCreatePost}
                  disabled={postSubmitting || !postText.trim()}
                  loading={postSubmitting}
                  className="text-xs font-bold px-4 py-2 w-full sm:w-auto mt-2 sm:mt-0 flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Post Update</span>
                </Button>
              </div>
            )}
            
            {user.role !== 'STUDENT' && (
              <div className="flex justify-end border-t border-border-subtle/50 pt-3">
                <Button
                  onClick={handleCreatePost}
                  disabled={postSubmitting || !postText.trim()}
                  loading={postSubmitting}
                  className="text-xs font-bold px-4 py-2"
                >
                  Post Update
                </Button>
              </div>
            )}
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
          </div>
        ) : error ? (
          <div className="p-4 text-xs bg-status-danger/10 border border-status-danger/25 text-status-danger rounded-xl">
            {error}
          </div>
        ) : posts.length === 0 ? null : (
          <div className="space-y-6">
            {posts.map((post) => {
              const hasLiked = user && (post.likes || []).includes(user._id);
              const likeCount = (post.likes || []).length;
              const commentsCount = (post.comments || []).length;
              const userInitial = post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'U';
              const isAuthor = user && post.author?._id === user._id;

              return (
                <Card key={post._id} className="p-6 border border-border-subtle hover:border-border-primary/50 shadow-md transition-all flex flex-col space-y-4">
                  {/* Post Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-border-primary bg-bg-secondary flex items-center justify-center font-bold text-text-primary shadow-sm overflow-hidden shrink-0">
                        {post.author?.avatar ? (
                          <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{userInitial}</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-text-primary hover:underline cursor-pointer animate-in fade-in" onClick={() => navigate(`/profile/${post.author?._id}`)}>
                          {post.author?.name || 'Anonymous User'}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${
                            post.author?.role === 'STAFF'
                              ? 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary'
                              : 'bg-bg-secondary border-border-subtle text-text-secondary'
                          }`}>
                            {post.author?.role === 'STAFF' ? 'Instructor' : 'Student'}
                          </span>
                          <span className="text-[9px] text-text-muted">
                            • {formatDateTime(post.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {(isAuthor || (user && user.role === 'STAFF')) && (
                      <button 
                        onClick={() => handleDeletePost(post._id)}
                        className="text-text-muted hover:text-status-danger transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-status-danger/10 border-0 bg-transparent"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Post Text Body */}
                  <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {renderTextWithMentions(post.text)}
                  </p>

                  {/* Linked Project Attachment Block */}
                  {post.project && (
                    <Card className="p-4 border border-border-subtle bg-bg-secondary/25 hover:bg-bg-secondary/45 transition-colors flex flex-col space-y-3.5">
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-accent-primary uppercase tracking-widest block">Linked Deliverable</span>
                          <h4 
                            onClick={() => navigate(`/project/${post.project._id}`)} 
                            className="text-xs font-extrabold text-text-primary hover:text-accent-primary hover:underline cursor-pointer transition-colors"
                          >
                            {post.project.title}
                          </h4>
                          <p className="text-[11px] text-text-secondary line-clamp-2 pr-2 leading-relaxed">
                            {post.project.description}
                          </p>
                        </div>

                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          post.project.status === 'COMPLETED'
                            ? 'bg-status-success/5 border-status-success/20 text-status-success'
                            : 'bg-status-info/5 border-status-info/20 text-status-info'
                        }`}>
                          {post.project.status}
                        </span>
                      </div>

                      {/* Tech Stack of Linked Project */}
                      {post.project.techStack && post.project.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.project.techStack.map((tech, idx) => (
                            <span key={idx} className="text-[9px] font-medium bg-bg-secondary/90 text-text-secondary px-2 py-0.5 rounded-md border border-border-subtle/50">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Screenshots of Linked Project */}
                      {post.project.screenshots && post.project.screenshots.length > 0 && (
                        <div className="rounded-lg overflow-hidden border border-border-subtle max-h-52 flex items-center justify-center bg-black/5 relative group">
                          <img 
                            src={post.project.screenshots[0].fileData} 
                            alt="Attached Project screenshot" 
                            className="max-h-52 w-full object-cover" 
                          />
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-1 border-t border-border-subtle/30">
                        <div className="flex gap-2">
                          {post.project.githubUrl && (
                            <a 
                              href={post.project.githubUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-1 rounded border border-border-subtle hover:border-border-primary text-text-primary bg-bg-primary hover:bg-bg-secondary transition-all"
                            >
                              <GithubIcon className="w-3 h-3" />
                            </a>
                          )}
                          {post.project.liveUrl && (
                            <a 
                              href={post.project.liveUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-1 rounded border border-border-subtle hover:border-border-primary text-text-primary bg-bg-primary hover:bg-bg-secondary transition-all"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <Button
                          onClick={() => navigate(`/project/${post.project._id}`)}
                          variant="ghost"
                          className="text-[9px] font-bold py-1 px-2.5 h-6 border border-border-subtle/80 flex items-center gap-1 hover:bg-bg-secondary"
                        >
                          Inspect Code <ArrowRight size={8} />
                        </Button>
                      </div>
                    </Card>
                  )}

                  {/* Divider */}
                  <div className="h-px bg-border-subtle/50 my-1" />

                  {/* Interaction buttons */}
                  <div className="flex items-center justify-between text-xs text-text-secondary pt-0.5">
                    <div className="flex gap-4">
                      {/* Like button */}
                      <button 
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center gap-1.5 font-bold hover:text-accent-primary transition-colors cursor-pointer bg-transparent border-0 p-0 ${
                          hasLiked ? 'text-accent-primary' : 'text-text-secondary'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${hasLiked ? 'fill-accent-primary' : ''}`} />
                        <span>{likeCount > 0 ? `${likeCount} Likes` : 'Like'}</span>
                      </button>

                      {/* Comments expand toggle */}
                      <button 
                        onClick={() => toggleComments(post._id)}
                        className="flex items-center gap-1.5 font-bold hover:text-accent-primary transition-colors cursor-pointer bg-transparent border-0 p-0"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Comment{commentsCount > 0 ? ` (${commentsCount})` : ''}</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Comments Section */}
                  {expandedComments[post._id] && (
                    <div className="pt-4 border-t border-border-subtle/40 space-y-4 animate-in slide-in-from-top-4 duration-250">
                      <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                        {(!post.comments || post.comments.length === 0) ? (
                          <div className="text-center py-4 text-[10px] text-text-muted">
                            No comments yet. Start the conversation!
                          </div>
                        ) : (
                          post.comments.map((comment) => {
                            const initial = comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : 'U';
                            return (
                              <div key={comment._id} className="flex gap-2.5 items-start text-xs">
                                <div className="w-7 h-7 rounded-full border border-border-primary bg-bg-secondary flex items-center justify-center font-bold text-text-primary shadow-sm shrink-0 overflow-hidden mt-0.5">
                                  {comment.author?.avatar ? (
                                    <img src={comment.author.avatar} alt={comment.author.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span>{initial}</span>
                                  )}
                                </div>
                                <div className="flex-1 bg-bg-secondary/45 border border-border-subtle/50 p-2.5 rounded-xl space-y-1">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-extrabold text-text-primary text-[11px]">
                                        {comment.author?.name || 'User'}
                                      </span>
                                      <span className={`text-[7px] font-bold px-1 rounded uppercase tracking-wider scale-90 ${
                                        comment.author?.role === 'STAFF'
                                          ? 'bg-accent-primary/10 border border-accent-primary/20 text-accent-primary'
                                          : 'bg-bg-primary border border-border-subtle text-text-secondary'
                                      }`}>
                                        {comment.author?.role === 'STAFF' ? 'Instructor' : 'Student'}
                                      </span>
                                    </div>
                                    <span className="text-[8px] text-text-muted">
                                      {formatDateTime(comment.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-text-secondary text-[11px] leading-relaxed">
                                    {renderTextWithMentions(comment.text)}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* New comment form */}
                      <form onSubmit={(e) => handlePostComment(e, post._id)} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Add a technical comment or review note..."
                          value={newComments[post._id] || ''}
                          onChange={(e) => setNewComments(prev => ({ ...prev, [post._id]: e.target.value }))}
                          className="flex-1 px-3 py-2 text-xs bg-bg-secondary border border-border-subtle focus:border-accent-primary rounded-xl text-text-primary placeholder:text-text-muted outline-none transition-colors"
                        />
                        <button
                          type="submit"
                          disabled={commentSubmitting[post._id] || !(newComments[post._id] || '').trim()}
                          className="p-2 bg-accent-primary hover:bg-accent-hover text-bg-primary disabled:bg-bg-secondary disabled:text-text-muted rounded-xl transition-all cursor-pointer shadow-sm border-0 flex items-center justify-center shrink-0"
                        >
                          {commentSubmitting[post._id] ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </form>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Sidebar Widgets */}
      <div className="w-full lg:w-72 space-y-6 shrink-0">
        {/* Trending Tech Stack Widget */}
        <Card className="p-5 border border-border-subtle bg-bg-card/35 backdrop-blur-md">
          <h3 className="text-xs font-black text-text-primary tracking-wider uppercase flex items-center gap-1.5 mb-4">
            <TrendingUp size={14} className="text-accent-primary" /> Trending Tech Stack
          </h3>
          <div className="space-y-2.5">
            {posts.length > 0 ? (
              getTrendingTechnologies().map((tech, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="font-bold text-text-secondary">{tech}</span>
                  <span className="text-[10px] text-accent-primary font-black bg-accent-primary/10 border border-accent-primary/20 px-2 py-0.5 rounded">
                    #{idx + 1} Tech
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-text-muted">No technologies recorded yet.</p>
            )}
          </div>
        </Card>

        {/* Community Guidelines Widget */}
        <Card className="p-5 border border-border-subtle bg-bg-card/35 backdrop-blur-md text-xs leading-relaxed text-text-secondary space-y-3">
          <h3 className="text-xs font-black text-text-primary tracking-wider uppercase block">
            Guidelines
          </h3>
          <p>
            Welcome to the Levgress Engineering Feed! Share code repos, inspect peer screenshots, and engage in constructiveness:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-text-muted text-[11px]">
            <li>Provide constructive code assessments.</li>
            <li>Tag correct frameworks and tools in stacks.</li>
            <li>Report broken links or empty repositories.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
