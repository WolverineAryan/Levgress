import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as projectsApi from '../api/projects';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge, CardDescription, GithubIcon } from '../components/ui';
import { FolderGit, Globe, Plus, Trash2, X, Edit3 } from 'lucide-react';
import { formatDate } from '../utils/date';

export const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal Wizard State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [techStack, setTechStack] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const fetchProjects = async () => {
    try {
      const res = await projectsApi.getMyProjects();
      setProjects(res.data.data.projects);
    } catch (err) {
      setError('Failed to fetch projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!title || !description) return;
    setCreateLoading(true);

    try {
      const parsedTech = techStack
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = {
        title,
        description,
        githubUrl,
        liveUrl,
        techStack: parsedTech,
      };

      if (editingProject) {
        await projectsApi.updateProject(editingProject._id, payload);
      } else {
        await projectsApi.createProject(payload);
      }

      // Reset
      setTitle('');
      setDescription('');
      setGithubUrl('');
      setLiveUrl('');
      setTechStack('');
      setEditingProject(null);
      setIsModalOpen(false);
      
      // Refresh
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert(`Error ${editingProject ? 'updating' : 'creating'} project: ` + (err.response?.data?.message || err.message));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStartEditProject = (project, e) => {
    e.stopPropagation();
    setEditingProject(project);
    setTitle(project.title || '');
    setDescription(project.description || '');
    setGithubUrl(project.githubUrl || '');
    setLiveUrl(project.liveUrl || '');
    setTechStack(project.techStack ? project.techStack.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setTitle('');
    setDescription('');
    setGithubUrl('');
    setLiveUrl('');
    setTechStack('');
    setEditingProject(null);
    setIsModalOpen(false);
  };

  const handleDeleteProject = async (id, e) => {
    e.stopPropagation(); // Prevent card navigate click
    if (!confirm('Are you sure you want to delete this project? This will permanently delete all associated milestones.')) {
      return;
    }

    try {
      await projectsApi.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col space-y-4 animate-pulse">
        <div className="h-10 bg-bg-card rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-bg-card rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8 select-none relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <FolderGit className="text-accent-primary" /> My Projects
          </h1>
          <p className="text-xs text-text-secondary mt-1">Manage and track your developer portfolios</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Launch Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-border-subtle rounded-2xl flex flex-col items-center justify-center">
          <FolderGit className="w-12 h-12 text-text-muted mb-4" />
          <h3 className="text-sm font-bold text-text-primary">No Projects Launched</h3>
          <p className="text-xs text-text-secondary max-w-xs mt-1">Scaffold a project to start completing milestones and earning XP rewards.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project._id}
              onClick={() => navigate(`/project/${project._id}`)}
              className="cursor-pointer group flex flex-col justify-between hover:border-accent-primary/50 relative"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <Badge variant={project.status === 'COMPLETED' ? 'success' : 'primary'}>
                    {project.status}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleStartEditProject(project, e)}
                      className="p-1 text-text-muted hover:text-accent-primary rounded transition-colors cursor-pointer"
                      title="Edit project"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteProject(project._id, e)}
                      className="p-1 text-text-muted hover:text-status-danger rounded transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <CardTitle className="group-hover:text-accent-primary transition-colors text-base truncate">
                  {project.title}
                </CardTitle>
                <CardDescription className="text-xs text-text-secondary mt-2 line-clamp-3 leading-relaxed">
                  {project.description}
                </CardDescription>
              </div>

              <div className="mt-6 pt-4 border-t border-border-subtle flex flex-col space-y-4">
                {/* Tech Stack Tags */}
                {project.techStack && project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.techStack.map((tech, idx) => (
                      <span key={idx} className="text-[9px] bg-bg-elevated text-text-secondary px-2 py-0.5 rounded font-medium border border-border-subtle">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center text-[10px] text-text-muted">
                  <span>Created {formatDate(project.createdAt)}</span>
                  <div className="flex items-center gap-2">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-text-primary"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-text-primary"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Creation Modal Wizard */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-primary rounded-2xl w-full max-w-md p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary cursor-pointer bg-transparent border-0"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold tracking-tight text-text-primary mb-1">
              {editingProject ? 'Edit Project Details' : 'Launch New Project'}
            </h2>
            <p className="text-xs text-text-secondary mb-6">
              {editingProject ? 'Modify your project repository, live link, tech stack, or description.' : 'Initialize tracking. This creates 5 milestones automatically.'}
            </p>

            <form onSubmit={handleSaveProject} className="flex flex-col space-y-4">
              <Input
                label="Project Title"
                placeholder="e.g. Levgress Rebuild"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">Project Description</label>
                <textarea
                  className="w-full px-4 py-2 text-sm bg-bg-secondary border border-border-subtle rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors h-20 resize-none"
                  placeholder="Summarize the core functionality and goals of the application..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="GitHub Repository Link"
                  placeholder="https://github.com/..."
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
                <Input
                  label="Deployment Link"
                  placeholder="https://..."
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                />
              </div>

              <Input
                label="Tech Stack (comma-separated)"
                placeholder="React, Node.js, MongoDB"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
              />

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCloseModal}
                  disabled={createLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={createLoading}>
                  {editingProject ? 'Save Changes' : 'Scaffold Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
