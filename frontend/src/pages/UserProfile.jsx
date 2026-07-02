import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import * as studentsApi from '../api/students';
import * as projectsApi from '../api/projects';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '../components/ui';
import { LevelRing } from '../components/ui/LevelRing';
import { 
  Rocket, 
  Target, 
  Flame, 
  Zap, 
  Star, 
  Award, 
  Book, 
  Shield, 
  Server, 
  Layout, 
  BookOpen, 
  Code, 
  Globe, 
  FileText,
  ArrowLeft,
  Briefcase,
  ChevronRight,
  ExternalLink,
  X,
  Upload,
  AlertTriangle,
  CheckCircle, 
  CheckCircle2, 
  PlusCircle, 
  ChevronLeft
} from 'lucide-react';

const Github = ({ className = '', size = 16, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const Linkedin = ({ className = '', size = 16, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const BADGE_ICONS = {
  rocket: Rocket,
  target: Target,
  flame: Flame,
  zap: Zap,
  star: Star,
  award: Award,
  book: Book,
  shield: Shield,
  server: Server,
  layout: Layout,
  'book-open': BookOpen,
};

const PRESET_AVATARS = [
  { name: 'Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix' },
  { name: 'Developer', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack' },
  { name: 'Designer', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Amy' },
  { name: 'Hacker', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Neo' },
  { name: 'Architect', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Architect' },
  { name: 'Scientist', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Scientist' },
];

const getTierBadgeStyles = (tier) => {
  switch (tier) {
    case 'BASIC':
      return 'border-status-success/30 text-status-success bg-status-success/5';
    case 'INTERMEDIATE':
      return 'border-accent-primary/30 text-accent-primary bg-accent-primary/5';
    case 'MASTER':
      return 'border-status-warning/40 text-status-warning bg-status-warning/5';
    case 'UNVERIFIED':
    default:
      return 'border-border-subtle text-text-muted bg-bg-card';
  }
};

const getProjectStatusStyles = (status) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-status-success/10 text-status-success border border-status-success/20';
    case 'SUBMITTED':
      return 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20';
    case 'IN_PROGRESS':
      return 'bg-status-warning/10 text-status-warning border border-status-warning/20';
    case 'PLANNING':
    default:
      return 'bg-bg-card text-text-secondary border border-border-subtle';
  }
};

export const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: loggedInUser, updateLocalUser } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit Profile Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editPortfolio, setEditPortfolio] = useState('');
  const [editResumeUrl, setEditResumeUrl] = useState('');
  const [editBatch, setEditBatch] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
   const [editResumeFile, setEditResumeFile] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editBadgeTitle, setEditBadgeTitle] = useState('');

  // Project creation/edit modal states
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectGithubUrl, setProjectGithubUrl] = useState('');
  const [projectLiveUrl, setProjectLiveUrl] = useState('');
  const [projectTechStack, setProjectTechStack] = useState('');
  const [projectLoading, setProjectLoading] = useState(false);

  const handleStartCreateProject = () => {
    setEditingProject(null);
    setProjectTitle('');
    setProjectDescription('');
    setProjectGithubUrl('');
    setProjectLiveUrl('');
    setProjectTechStack('');
    setIsProjectModalOpen(true);
  };

  const handleStartEditProject = (p, e) => {
    if (e) e.stopPropagation();
    setEditingProject(p);
    setProjectTitle(p.title || '');
    setProjectDescription(p.description || '');
    setProjectGithubUrl(p.githubUrl || '');
    setProjectLiveUrl(p.liveUrl || '');
    setProjectTechStack(p.techStack ? p.techStack.join(', ') : '');
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!projectTitle.trim() || !projectDescription.trim()) return;
    setProjectLoading(true);

    try {
      const parsedTech = projectTechStack
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = {
        title: projectTitle,
        description: projectDescription,
        githubUrl: projectGithubUrl,
        liveUrl: projectLiveUrl,
        techStack: parsedTech,
      };

      if (editingProject) {
        await projectsApi.updateProject(editingProject._id, payload);
      } else {
        await projectsApi.createProject(payload);
      }

      setIsProjectModalOpen(false);
      await fetchProfile();
    } catch (err) {
      console.error(err);
      alert('Failed to save project: ' + (err.response?.data?.message || err.message));
    } finally {
      setProjectLoading(false);
    }
  };

  const handleDeleteProject = async (projectId, e) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project? This will permanently delete all associated milestones.')) {
      return;
    }

    try {
      await projectsApi.deleteProject(projectId);
      await fetchProfile();
    } catch (err) {
      console.error(err);
      alert('Failed to delete project: ' + (err.response?.data?.message || err.message));
    }
  };

  // Lightbox Viewport State
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await studentsApi.getStudentProfile(id);
      setData(res.data.data);
      
      // Load initial form values
      const p = res.data.data.profile;
      if (p) {
        setEditName(p.name || '');
        setEditBio(p.bio || '');
        setEditGithub(p.githubUrl || '');
        setEditLinkedin(p.linkedinUrl || '');
        setEditPortfolio(p.portfolioUrl || '');
        setEditResumeUrl(p.resumeUrl || '');
        setEditBatch(p.batch || '');
        setEditDept(p.department || '');
        setEditPhoneNumber(p.phoneNumber || '');
        setEditAvatar(p.avatar || '');
        setEditResumeFile(p.resumeFile || null);
        setEditBadgeTitle(p.customBadgeTitle || '');
      }
    } catch (err) {
      setError('Failed to retrieve student profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col space-y-8 animate-pulse p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-bg-card"></div>
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-bg-card w-1/4 rounded"></div>
            <div className="h-4 bg-bg-card w-1/6 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 h-96 bg-bg-card rounded-2xl"></div>
          <div className="lg:col-span-2 h-96 bg-bg-card rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-status-danger" />
        <h3 className="text-lg font-bold text-text-primary">Profile Unavailable</h3>
        <p className="text-xs text-text-secondary">{error || 'User details could not be found.'}</p>
        <Button onClick={() => navigate(-1)} className="text-xs cursor-pointer">
          Go Back
        </Button>
      </div>
    );
  }

  const { profile, stats, badges, projects } = data;
  const isOwnProfile = loggedInUser && loggedInUser._id === profile._id;

  const handleViewResume = () => {
    if (profile.resumeFile?.fileData) {
      const dataUrl = profile.resumeFile.fileData;
      try {
        const newTab = window.open();
        newTab.document.write(
          `<iframe src="${dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
        );
      } catch (err) {
        console.error(err);
        window.open(dataUrl, '_blank');
      }
    } else if (profile.resumeUrl) {
      window.open(profile.resumeUrl, '_blank');
    }
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert('File size exceeds the 2MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleResumeFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert('File size exceeds the 5MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditResumeFile({
        fileName: file.name,
        fileData: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const payload = {
        name: editName,
        bio: editBio,
        githubUrl: editGithub,
        linkedinUrl: editLinkedin,
        portfolioUrl: editPortfolio,
        resumeUrl: editResumeUrl,
        resumeFile: editResumeFile,
        avatar: editAvatar,
        customBadgeTitle: editBadgeTitle,
      };

      if (profile.role === 'STAFF') {
        payload.phoneNumber = editPhoneNumber;
      } else {
        payload.batch = editBatch;
        payload.department = editDept;
      }

      const res = await api.put('/auth/update-profile', payload);
      updateLocalUser(res.data.data.user);
      
      // Re-fetch
      await fetchProfile();
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const hasResume = !!(profile.resumeUrl || profile.resumeFile?.fileData);

  return (
    <div className="flex flex-col space-y-6 select-none p-6 relative bg-gradient-to-b from-bg-secondary/30 via-bg-primary to-bg-primary min-h-screen">
      {/* Optimized Header Row to eliminate empty space */}
      <div className="flex justify-between items-center bg-bg-card/25 backdrop-blur-md p-4 rounded-2xl border border-border-subtle/50 shadow-sm">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="text-xs flex items-center gap-1.5 border border-border-subtle/80 cursor-pointer bg-bg-secondary hover:bg-bg-elevated px-4 py-1.8 rounded-xl font-bold transition-all"
        >
          <ArrowLeft size={14} /> Back to Hub
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Developer Portfolio View</span>
          <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
        </div>
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Socials, Tags, Bio, Level */}
        <div className="lg:col-span-1 space-y-6">
          {/* Main Card */}
          <Card className="p-6 flex flex-col items-center text-center relative overflow-hidden">
            {/* Background Gradient Accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-accent-primary" />
            
            {/* Ambient Background Gradient for Header */}
            <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-br from-accent-primary/10 via-accent-hover/5 to-transparent border-b border-border-subtle/30" />
            
            <img
              src={profile.avatar || 'https://api.dicebear.com/7.x/shapes/svg?seed=Cosmic'}
              alt={profile.name}
              className="w-24 h-24 rounded-2xl border-2 border-border-primary/25 shadow-xl object-cover bg-bg-elevated mt-12 relative z-10 hover:scale-[1.03] transition-transform duration-300"
            />
            
            <h2 className="text-lg font-black text-text-primary mt-5 relative z-10 tracking-tight">{profile.name}</h2>
            
            {profile.customBadgeTitle && (
              <div className="mt-1.5 relative z-10 inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/30 rounded-lg shadow-sm">
                <span className="text-[8px] font-black text-amber-500 tracking-wider uppercase flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-amber-500" /> {profile.customBadgeTitle}
                </span>
              </div>
            )}

            <span className="text-xs text-text-muted relative z-10 mt-1">@{profile.username}</span>
            
            {(profile.batch || profile.department) && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-primary/5 border border-accent-primary/10 rounded-full mt-2.5 relative z-10">
                <span className="text-[9px] text-accent-primary font-extrabold uppercase tracking-widest">
                  {profile.batch || 'Unassigned Batch'} • {profile.department || 'Unassigned Dept'}
                </span>
              </div>
            )}

            {/* Quick Share / Edit Ratios */}
            <div className="flex gap-2 mt-4 relative z-10 w-full justify-center">
              {isOwnProfile ? (
                <Button onClick={() => setIsEditModalOpen(true)} className="text-xs flex items-center gap-1.5 cursor-pointer px-4 py-1.8 bg-accent-primary hover:bg-accent-hover text-bg-primary rounded-xl font-bold transition-all shadow-md shadow-accent-primary/10 hover:scale-[1.02]">
                  Edit Profile
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Profile link copied to clipboard!');
                  }}
                  className="text-xs flex items-center gap-1.5 cursor-pointer px-4 py-1.8 bg-bg-secondary hover:bg-bg-elevated text-text-primary border border-border-subtle rounded-xl font-bold transition-all"
                >
                  Share Profile
                </Button>
              )}
            </div>
 
            {/* Dynamic Tags */}
            {profile.tags && profile.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center mt-5 w-full">
                {profile.tags.map((t, idx) => (
                  <span key={idx} className="text-[9px] font-black tracking-wider uppercase bg-bg-secondary text-text-secondary border border-border-subtle/80 px-2.5 py-1 rounded-lg">
                    {t}
                  </span>
                ))}
              </div>
            )}
 
            {profile.bio && (
              <p className="text-xs text-text-secondary mt-5 leading-relaxed bg-bg-card/20 p-4 rounded-xl border border-border-subtle/40 w-full italic relative">
                <span className="absolute top-2 left-2 text-2xl text-accent-primary/10 font-serif leading-none">“</span>
                {profile.bio}
              </p>
            )}
 
            {/* Social Links */}
            <div className="flex items-center justify-center gap-3.5 mt-6 w-full">
              {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-text-muted hover:text-text-primary hover:border-text-secondary transition-all hover:scale-[1.05]" title="GitHub Repository">
                  <Github size={16} />
                </a>
              )}
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-text-muted hover:text-text-primary hover:border-text-secondary transition-all hover:scale-[1.05]" title="LinkedIn Profile">
                  <Linkedin size={16} />
                </a>
              )}
              {profile.portfolioUrl && (
                <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-text-muted hover:text-text-primary hover:border-text-secondary transition-all hover:scale-[1.05]" title="Personal Website">
                  <Globe size={16} />
                </a>
              )}
            </div>
 
            {/* Resume Button */}
            {hasResume && (
              <Button onClick={handleViewResume} variant="outline" className="w-full mt-5 text-xs flex items-center justify-center gap-1.5 border-accent-primary/20 text-accent-primary hover:bg-accent-primary/5 cursor-pointer py-2 rounded-xl transition-all font-bold">
                <FileText size={14} /> View Professional Resume
              </Button>
            )}
          </Card>
 
          {/* Gamification Stats */}
          {stats && (
            <Card className="p-6 space-y-6">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">Academics & Streak</h3>
              
              <div className="flex items-center gap-6">
                <LevelRing
                  level={stats.level}
                  xp={stats.xp}
                  xpNeeded={stats.xpNeeded || (stats.level * 100)}
                  size={90}
                />
                
                <div className="flex-1 space-y-1.5">
                  <span className="text-[10px] font-bold text-text-muted block uppercase tracking-wider">XP Level Progress</span>
                  <div className="flex justify-between text-xs font-black text-text-primary">
                    <span>{stats.xp} XP</span>
                    <span className="text-text-muted">/ {stats.xpNeeded || (stats.level * 100)} XP</span>
                  </div>
                  <div className="w-full bg-bg-elevated h-1 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-primary rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (stats.xp / (stats.xpNeeded || (stats.level * 100))) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
 
              {/* Streak info */}
              <div className="pt-4 border-t border-border-subtle/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-status-danger/10 text-status-danger">
                    <Flame className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-text-primary">Active Coding Streak</span>
                </div>
                <span className="text-sm font-black text-text-primary">{stats.streak} Days</span>
              </div>
            </Card>
          )}

          {/* Badges Showcase (Compact Grid) */}
          <Card className="p-5 space-y-4">
            <h3 className="text-xs font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Award className="text-accent-primary w-4 h-4" /> Badges Showcase ({badges?.length || 0})
            </h3>
            
            {badges && badges.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {badges.map((b) => {
                  const Icon = BADGE_ICONS[b.icon] || Award;
                  const isFeatured = profile.customBadgeTitle === b.name;

                  return (
                    <div 
                      key={b._id} 
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all hover:scale-[1.02] duration-200 ${
                        isFeatured 
                          ? 'bg-gradient-to-r from-amber-500/15 via-yellow-500/5 to-transparent border-amber-500/35 shadow-sm shadow-amber-500/5' 
                          : 'bg-bg-secondary/20 border-border-subtle/50 hover:bg-bg-secondary/50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg border shrink-0 ${
                        isFeatured 
                          ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' 
                          : 'bg-accent-primary/10 border-accent-primary/15 text-accent-primary'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-text-primary truncate block" title={b.name}>{b.name}</span>
                        <span className="text-[8px] text-text-muted truncate block" title={b.description}>{b.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-4 text-text-muted text-[10px] bg-bg-secondary/10 border border-dashed border-border-subtle/50 rounded-xl">
                No achievements unlocked yet.
              </div>
            )}
          </Card>
        </div>
 
        {/* Right Column: Skills, Badges, Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills Portfolio */}
          {stats && stats.skills && stats.skills.length > 0 && (() => {
            const technologies = stats.skills.filter(s => s.type !== 'SKILL');
            const methodologies = stats.skills.filter(s => s.type === 'SKILL');
 
            return (
              <Card className="p-6 space-y-6">
                {technologies.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-text-primary uppercase tracking-wider mb-3">Technologies & Frameworks</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {technologies.map((s, idx) => (
                        <div key={idx} className="p-3 bg-bg-card/40 border border-border-subtle/60 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Code size={14} className="text-accent-primary" />
                            <div>
                              <span className="text-xs font-bold text-text-primary block">{s.name}</span>
                              <span className="text-[9px] text-text-muted block">{s.category}</span>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getTierBadgeStyles(s.tier)}`}>
                            {s.tier || 'UNVERIFIED'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
 
                {methodologies.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-text-primary uppercase tracking-wider mb-3">Engineering Skills & Concepts</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {methodologies.map((s, idx) => (
                        <div key={idx} className="p-3 bg-bg-card/40 border border-border-subtle/60 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Code size={14} className="text-accent-primary" />
                            <div>
                              <span className="text-xs font-bold text-text-primary block">{s.name}</span>
                              <span className="text-[9px] text-text-muted block">{s.category}</span>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getTierBadgeStyles(s.tier)}`}>
                            {s.tier || 'UNVERIFIED'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })()}
 
          {/* Projects Portfolio */}
          <Card className="p-6 bg-bg-card/30 backdrop-blur-sm shadow-xl border border-border-subtle">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Code className="text-accent-primary w-4.5 h-4.5" /> Developer Case Studies ({projects?.length || 0})
              </h3>
              {isOwnProfile && (
                <Button 
                  onClick={handleStartCreateProject}
                  className="text-[10px] flex items-center gap-1 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary border border-accent-primary/20 rounded-xl px-2.5 py-1.2 font-extrabold cursor-pointer animate-fade-in"
                >
                  <PlusCircle size={12} /> Add Project
                </Button>
              )}
            </div>
            
            {projects && projects.length > 0 ? (
              <div className="grid grid-cols-1 gap-5">
                {projects.map((p) => (
                  <div key={p._id} className="p-5 bg-bg-secondary/20 hover:bg-bg-secondary/40 border border-border-subtle/40 rounded-2xl flex flex-col justify-between space-y-5 transition-all duration-200">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-text-primary tracking-tight">{p.title}</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">{p.description}</p>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border shrink-0 ${getProjectStatusStyles(p.status)}`}>
                        {p.status || 'PLANNING'}
                      </span>
                    </div>

                    {/* Tech Stack Links & Custom Action Buttons */}
                    <div className="flex justify-between items-center gap-4 flex-wrap pt-2 border-t border-border-subtle/30 text-xs">
                      <div className="flex gap-3 flex-wrap">
                        {p.githubUrl && (
                          <a href={p.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary border border-border-subtle rounded-xl text-[10px] text-text-primary hover:text-accent-primary transition-colors font-bold">
                            <Github size={11} /> Repository
                          </a>
                        )}
                        {p.liveUrl && (
                          <a href={p.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary border border-border-subtle rounded-xl text-[10px] text-text-primary hover:text-accent-primary transition-colors font-bold">
                            <Globe size={11} /> Live Demo
                          </a>
                        )}
                        <RouterLink 
                          to={`/project/${p._id}`} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-primary/10 border border-accent-primary/20 rounded-xl text-[10px] text-accent-primary hover:bg-accent-primary/20 transition-all font-bold"
                        >
                          <Briefcase size={11} /> Case Timeline
                        </RouterLink>
                      </div>

                      {/* CRUD Actions if Own Profile */}
                      {isOwnProfile && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleStartEditProject(p, e)}
                            className="p-1.5 rounded-lg border border-border-subtle hover:border-accent-primary hover:bg-accent-primary/5 text-text-secondary hover:text-accent-primary transition-colors cursor-pointer"
                            title="Edit Project"
                          >
                            <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteProject(p._id, e)}
                            className="p-1.5 rounded-lg border border-border-subtle hover:border-status-danger hover:bg-status-danger/5 text-text-secondary hover:text-status-danger transition-colors cursor-pointer"
                            title="Delete Project"
                          >
                            <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Screenshots Horizontal Gallery */}
                    {p.screenshots && p.screenshots.length > 0 && (
                      <div className="mt-3">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-1">Screenshots Showcase</span>
                        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                          {p.screenshots.map((s, sIdx) => (
                            <img
                              key={sIdx}
                              src={s.fileData}
                              alt={s.fileName || `Screenshot ${sIdx + 1}`}
                              onClick={() => {
                                setLightboxImages(p.screenshots.map(img => img.fileData));
                                setLightboxIndex(sIdx);
                              }}
                              className="h-14 w-24 object-cover rounded-lg border border-border-subtle hover:border-accent-primary cursor-pointer transition-all hover:scale-105 shrink-0 bg-black/30"
                            />
                          ))}
                        </div>
                      </div>
                    )}
 
                    {/* Tech stack tags */}
                    {p.techStack && p.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border-subtle/30">
                        {p.techStack.map((tech, tIdx) => (
                          <span key={tIdx} className="text-[9px] font-semibold text-text-muted bg-bg-elevated/50 px-2 py-0.5 rounded border border-border-subtle/30">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 text-text-muted text-xs bg-bg-secondary/10 border border-dashed border-border-subtle/50 rounded-2xl">
                No projects assigned to this portfolio.
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal Drawer */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-primary rounded-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold tracking-tight text-text-primary mb-1">Edit Profile Details</h2>
            <p className="text-xs text-text-secondary mb-6">Customize display avatar, resume file, bio and professional link details.</p>

            <form onSubmit={handleSaveProfile} className="flex flex-col space-y-5">
              
              {/* Avatar section */}
              {profile.role !== 'STAFF' && (
                <div className="p-4 bg-bg-secondary rounded-xl border border-border-subtle">
                  <span className="block text-xs font-bold text-text-secondary uppercase mb-2">Configure Profile Avatar</span>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <img
                      src={editAvatar || 'https://api.dicebear.com/7.x/shapes/svg?seed=Cosmic'}
                      alt="Avatar Preview"
                      className="w-14 h-14 rounded-xl border border-accent-primary/20 object-cover bg-bg-elevated"
                    />
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-elevated border border-border-subtle hover:border-text-secondary rounded-lg text-xs font-semibold cursor-pointer">
                      <Upload className="w-3.5 h-3.5" /> Upload Image
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} />
                    </label>
                  </div>

                  <span className="text-[10px] text-text-muted block mb-2">Or select a pre-designed illustration:</span>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_AVATARS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditAvatar(p.url)}
                        className={`p-1 border rounded-lg bg-bg-elevated hover:scale-105 transition-all ${editAvatar === p.url ? 'border-accent-primary scale-105' : 'border-border-subtle'}`}
                      >
                        <img src={p.url} alt={p.name} className="w-8 h-8 mx-auto" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Display Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
                <Input
                  label="Custom Badge Title / Flair"
                  placeholder="e.g. Master Hacker, Core Contributor"
                  value={editBadgeTitle}
                  onChange={(e) => setEditBadgeTitle(e.target.value)}
                />
              </div>

              {profile.role === 'STAFF' ? (
                <Input
                  label="Contact Phone Number"
                  value={editPhoneNumber}
                  onChange={(e) => setEditPhoneNumber(e.target.value)}
                  required
                />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Batch (e.g. Batch 2026)"
                    value={editBatch}
                    onChange={(e) => setEditBatch(e.target.value)}
                  />
                  <Input
                    label="Department (e.g. Computer Science)"
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                  />
                </div>
              )}

              {profile.role !== 'STAFF' && (
                <>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-medium text-text-secondary">Short developer bio</label>
                    <textarea
                      className="w-full px-4 py-2 text-xs bg-bg-secondary border border-border-subtle rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors h-16 resize-none"
                      placeholder="Share a short summary about your developer interests or specialization..."
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="GitHub profile link"
                      placeholder="https://github.com/..."
                      value={editGithub}
                      onChange={(e) => setEditGithub(e.target.value)}
                    />
                    <Input
                      label="LinkedIn profile link"
                      placeholder="https://linkedin.com/in/..."
                      value={editLinkedin}
                      onChange={(e) => setEditLinkedin(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Portfolio website link"
                      placeholder="https://..."
                      value={editPortfolio}
                      onChange={(e) => setEditPortfolio(e.target.value)}
                    />
                    <Input
                      label="Resume link URL"
                      placeholder="https://drive.google.com/..."
                      value={editResumeUrl}
                      onChange={(e) => setEditResumeUrl(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5 p-3 bg-bg-secondary rounded-lg border border-border-subtle">
                    <label className="text-xs font-bold text-text-secondary">Or upload a PDF Resume file</label>
                    <input type="file" accept=".pdf" className="text-xs mt-1" onChange={handleResumeFileChange} />
                    {editResumeFile && (
                      <span className="text-[10px] text-status-success font-semibold mt-1">
                        Attached PDF file: {editResumeFile.fileName}
                      </span>
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={saveLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={saveLoading}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox full-size viewer overlay */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          <div className="relative max-w-5xl max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <img src={lightboxImage} alt="Enlarged screenshot view" className="max-w-full max-h-[85vh] object-contain rounded-xl border border-border-primary/20 shadow-2xl" />
            <button onClick={() => setLightboxImage(null)} className="absolute top-4 right-4 bg-black/60 hover:bg-black text-text-primary px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Lightbox full-size slideshow viewer overlay */}
      {lightboxImages.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none animate-fade-in"
          onClick={() => setLightboxImages([])}
        >
          {/* Close button top right */}
          <button 
            onClick={() => setLightboxImages([])} 
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
          >
            Close
          </button>

          <div className="relative max-w-5xl w-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {/* Slide Navigation Overlay Arrows */}
            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={() => setLightboxIndex((prev) => (prev === 0 ? lightboxImages.length - 1 : prev - 1))}
                  className="absolute left-0 sm:left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setLightboxIndex((prev) => (prev === lightboxImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-0 sm:right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Active Image */}
            <img 
              src={lightboxImages[lightboxIndex]} 
              alt="Enlarged view" 
              className="max-w-full max-h-[75vh] object-contain rounded-2xl border border-white/10 shadow-2xl" 
            />
          </div>

          {/* Indicators / Caption */}
          <div className="mt-4 text-center">
            <span className="text-xs text-white/60 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              Image {lightboxIndex + 1} of {lightboxImages.length}
            </span>
          </div>
        </div>
      )}

      {/* Create / Edit Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-primary rounded-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsProjectModalOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold tracking-tight text-text-primary mb-1">
              {editingProject ? 'Modify Project Details' : 'Scaffold New Project'}
            </h2>
            <p className="text-xs text-text-secondary mb-5">
              {editingProject ? 'Update case study details and repositories.' : 'Launch a new developer milestone portfolio project.'}
            </p>

            <form onSubmit={handleSaveProject} className="flex flex-col space-y-4">
              <Input
                label="Project Title"
                placeholder="e.g. Levgress Platform"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                required
              />

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">Project Description</label>
                <textarea
                  className="w-full px-4 py-2 text-xs bg-bg-secondary border border-border-subtle rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors h-20 resize-none"
                  placeholder="Summarize the core functionality and scope..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  required
                />
              </div>

              <Input
                label="GitHub Repository Link"
                placeholder="https://github.com/..."
                value={projectGithubUrl}
                onChange={(e) => setProjectGithubUrl(e.target.value)}
              />

              <Input
                label="Live Demo Link"
                placeholder="https://..."
                value={projectLiveUrl}
                onChange={(e) => setProjectLiveUrl(e.target.value)}
              />

              <Input
                label="Technologies (comma-separated)"
                placeholder="React, TailwindCSS, Express"
                value={projectTechStack}
                onChange={(e) => setProjectTechStack(e.target.value)}
              />

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsProjectModalOpen(false)}
                  disabled={projectLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={projectLoading}>
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
