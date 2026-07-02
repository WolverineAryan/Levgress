import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

// Inline premium custom SVG icons to avoid version/missing export issues in dependency libraries
const GithubIcon = ({ className = '', size = 16, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon = ({ className = '', size = 16, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GlobeIcon = ({ className = '', size = 16, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const CheckCircleIcon = ({ className = '', size = 16, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const XCircleIcon = ({ className = '', size = 16, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const SparklesIcon = ({ className = '', size = 16, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
  </svg>
);

const CompassIcon = ({ className = '', size = 16, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const BriefcaseIcon = ({ className = '', size = 16, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const GraduationCapIcon = ({ className = '', size = 16, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
);

const FileTextIcon = ({ className = '', size = 16, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const SpinnerIcon = ({ className = '', size = 16, ...props }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const ChevronRightIcon = ({ className = '', size = 16, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronLeftIcon = ({ className = '', size = 16, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const PRESET_AVATARS = [
  { name: 'Cosmic', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=Cosmic' },
  { name: 'Nebula', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=Nebula' },
  { name: 'Aura', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=Aura' },
  { name: 'Galaxy', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=Galaxy' },
  { name: 'Quantum', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=Quantum' },
];

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 500 : -500,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    x: direction < 0 ? 500 : -500,
    opacity: 0
  })
};

const BATCH_OPTIONS = ['Batch 2024', 'Batch 2025', 'Batch 2026', 'Batch 2027'];
const DEPARTMENT_OPTIONS = [
  'Computer Science',
  'Information Technology',
  'Software Engineering',
  'Data Science & AI',
  'Electronics & Communication'
];

export const Onboarding = () => {
  const { user, updateLocalUser } = useAuth();
  const navigate = useNavigate();

  // Step state
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = Forward, -1 = Backward

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState(user?.role || 'STUDENT');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [batch, setBatch] = useState(BATCH_OPTIONS[2]); // Default Batch 2026
  const [department, setDepartment] = useState(DEPARTMENT_OPTIONS[0]); // Default Computer Science
  const [avatar, setAvatar] = useState(user?.avatar || PRESET_AVATARS[0].url);
  const [showCustomAvatarInput, setShowCustomAvatarInput] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Social Links (Student only)
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [bio, setBio] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('PDF file size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setResumeFile({
        fileName: file.name,
        fileData: reader.result
      });
    };
    reader.onerror = () => {
      setError('Error reading file');
    };
    reader.readAsDataURL(file);
  };

  // Statuses
  const [usernameStatus, setUsernameStatus] = useState('idle'); // 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  const [usernameError, setUsernameError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auto-fill Google avatar and sync role if available
  useEffect(() => {
    if (user) {
      if (user.avatar) {
        setAvatar(user.avatar);
      }
      if (user.role) {
        setRole(user.role);
      }
    }
  }, [user]);

  const handleSkipOnboarding = async () => {
    setError('');
    setSubmitting(true);
    try {
      const finalName = name.trim() || user?.name || user?.email?.split('@')[0] || 'User';
      let finalUsername = username.trim();
      if (!finalUsername) {
        const prefix = (user?.email || 'user').split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '');
        finalUsername = `${prefix}_${Math.floor(100 + Math.random() * 900)}`;
      }

      const payload = {
        name: finalName,
        username: finalUsername,
        role: user?.role || 'STUDENT',
      };

      if (payload.role === 'STAFF') {
        payload.phoneNumber = phoneNumber.trim() || '000-000-0000';
      }

      const res = await api.put('/auth/onboard', payload);
      const updatedUser = res.data.data.user;
      updateLocalUser(updatedUser);

      if (updatedUser.role === 'STAFF') {
        navigate('/staff-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to skip onboarding.');
    } finally {
      setSubmitting(false);
    }
  };

  // Live Username Checker
  useEffect(() => {
    if (!username) {
      setUsernameStatus('idle');
      setUsernameError('');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(cleanUsername)) {
      setUsernameStatus('invalid');
      setUsernameError('3-20 chars: alphanumeric, _ or -');
      return;
    }

    setUsernameStatus('checking');
    setUsernameError('');

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await api.get(`/auth/check-username/${cleanUsername}`);
        if (res.data.data.available) {
          setUsernameStatus('available');
        } else {
          setUsernameStatus('taken');
          setUsernameError('Username is already taken');
        }
      } catch (err) {
        setUsernameStatus('taken');
        setUsernameError(err.response?.data?.message || 'Error checking username');
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [username]);

  const handleCustomAvatarSubmit = (e) => {
    e.preventDefault();
    if (customAvatarUrl.trim()) {
      setAvatar(customAvatarUrl.trim());
      setShowCustomAvatarInput(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (usernameStatus !== 'available') {
        setError(usernameError || 'Please select a valid and available username');
        return;
      }
    }
    setError('');
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (usernameStatus !== 'available') {
      setError(usernameError || 'Please choose a valid and available username');
      return;
    }

    if (role === 'STAFF' && !phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        username: username.trim(),
        role,
      };

      if (role === 'STAFF') {
        payload.phoneNumber = phoneNumber.trim();
      } else {
        payload.avatar = avatar;
        payload.githubUrl = githubUrl.trim();
        payload.linkedinUrl = linkedinUrl.trim();
        payload.portfolioUrl = portfolioUrl.trim();
        payload.bio = bio.trim();
        payload.resumeUrl = resumeUrl.trim();
        payload.resumeFile = resumeFile;
        payload.batch = batch;
        payload.department = department;
      }

      const res = await api.put('/auth/onboard', payload);

      const updatedUser = res.data.data.user;
      updateLocalUser(updatedUser);

      // Redirect based on role
      if (updatedUser.role === 'STAFF') {
        navigate('/staff-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong during onboarding.');
    } finally {
      setSubmitting(false);
    }
  };

  const stepsArray = role === 'STAFF' ? [1, 2] : [1, 2, 3];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center p-6 relative overflow-x-hidden select-none">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-glow/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl bg-bg-secondary/70 border border-border-primary rounded-2xl p-8 backdrop-blur-md shadow-2xl relative z-10">
        
        {/* Onboarding Header with Skip Button */}
        <div className="flex items-center justify-between mb-6 px-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-text-muted">Profile Onboarding</h2>
          {step > 1 && (
            <button
              type="button"
              onClick={handleSkipOnboarding}
              disabled={submitting}
              className="text-[10px] font-bold text-accent-primary hover:text-accent-hover uppercase tracking-wider cursor-pointer border border-accent-primary/20 hover:border-accent-primary bg-accent-primary/5 px-2.5 py-1 rounded-lg transition-all"
            >
              Skip Setup
            </button>
          )}
        </div>
        
        {/* Step Progress Tracker */}
        <div className="flex items-center justify-between mb-8 px-4">
          {stepsArray.map((s, idx) => (
            <div key={s} className="flex items-center flex-1 last:flex-initial">
              <div
                className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs transition-all duration-300 ${
                  step === s
                    ? 'bg-accent-primary text-bg-primary scale-110 shadow-lg shadow-accent-primary/20'
                    : step > s
                    ? 'bg-status-success/20 text-status-success border border-status-success/40'
                    : 'bg-bg-card border border-border-subtle text-text-muted'
                }`}
              >
                {step > s ? <CheckCircleIcon size={14} /> : s}
              </div>
              {idx < stepsArray.length - 1 && (
                <div
                  className={`h-0.5 mx-4 flex-1 rounded transition-all duration-300 ${
                    step > s ? 'bg-status-success/50' : 'bg-border-subtle'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs rounded-xl flex items-center gap-2">
            <XCircleIcon className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="overflow-hidden relative min-h-[360px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-accent-primary/10 text-accent-primary px-3 py-1 rounded-full text-xs font-semibold mb-2 border border-accent-primary/20">
                    <SparklesIcon className="w-3.5 h-3.5" />
                    Step 1: Your Identity
                  </div>
                  <h3 className="text-xl font-extrabold text-text-primary">Configure Profile Handles</h3>
                  <p className="text-xs text-text-muted mt-1">Set up your display name, username, and workspace role.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-bg-card border border-border-subtle focus:border-accent-primary rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Claim Username</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-muted font-semibold">@</span>
                      <input
                        type="text"
                        required
                        placeholder="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                        className="w-full bg-bg-card border border-border-subtle focus:border-accent-primary rounded-xl pl-8 pr-10 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all"
                      />
                      
                      {/* Live Check Icon */}
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
                        {usernameStatus === 'checking' && (
                          <SpinnerIcon className="w-4 h-4 text-accent-primary" />
                        )}
                        {usernameStatus === 'available' && (
                          <CheckCircleIcon className="w-4 h-4 text-status-success" />
                        )}
                        {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                          <XCircleIcon className="w-4 h-4 text-status-danger" />
                        )}
                      </div>
                    </div>
                    {usernameError && (
                      <span className="text-[10px] text-status-danger font-medium mt-1.5 block pl-1">
                        {usernameError}
                      </span>
                    )}
                    {usernameStatus === 'available' && (
                      <span className="text-[10px] text-status-success font-medium mt-1.5 block pl-1">
                        Username is available!
                      </span>
                    )}
                  </div>

                  {/* Academic Batch & Department (Student only) */}
                  {role === 'STUDENT' && (
                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-150">
                      <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Class / Batch</label>
                        <select
                          value={batch}
                          onChange={(e) => setBatch(e.target.value)}
                          className="w-full bg-bg-card border border-border-subtle focus:border-accent-primary rounded-xl px-3 py-2 text-xs text-text-primary outline-none transition-all cursor-pointer"
                        >
                          {BATCH_OPTIONS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Department</label>
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full bg-bg-card border border-border-subtle focus:border-accent-primary rounded-xl px-3 py-2 text-xs text-text-primary outline-none transition-all cursor-pointer"
                        >
                          {DEPARTMENT_OPTIONS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!name.trim() || usernameStatus !== 'available'}
                    className="w-full h-11 bg-accent-primary hover:bg-accent-hover disabled:bg-accent-primary/30 disabled:text-text-muted text-bg-primary font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer text-sm"
                  >
                    Continue
                    <ChevronRightIcon size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-accent-primary/10 text-accent-primary px-3 py-1 rounded-full text-xs font-semibold mb-2 border border-accent-primary/20">
                    <SparklesIcon className="w-3.5 h-3.5" />
                    Step 2: {role === 'STAFF' ? 'Contact Details' : 'Presence Customization'}
                  </div>
                  <h3 className="text-xl font-extrabold text-text-primary">
                    {role === 'STAFF' ? 'Verify Instructor Details' : 'Customize Your Presence'}
                  </h3>
                  <p className="text-xs text-text-muted mt-1">
                    {role === 'STAFF' 
                      ? 'Please provide your contact phone number to complete instructor profile setup.' 
                      : 'Select your personal avatar for dashboard displays.'}
                  </p>
                </div>

                <div className="space-y-5">
                  {role === 'STAFF' ? (
                    <div>
                      <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +1 (555) 019-2834"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-bg-card border border-border-subtle focus:border-accent-primary rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all"
                      />
                      <p className="text-[10px] text-text-muted mt-1.5 leading-snug pl-1">
                        Only valid phone formats. Required for instructor verification.
                      </p>
                    </div>
                  ) : (
                    /* Avatar Selector */
                    <div>
                      <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Avatar Style</label>
                      <div className="flex flex-wrap items-center gap-4 bg-bg-card/30 p-3 border border-border-subtle rounded-xl">
                        {/* Active Preview */}
                        <div className="relative group shrink-0">
                          <img
                            src={avatar}
                            alt="Profile Preview"
                            className="w-14 h-14 rounded-xl border border-accent-primary/40 object-cover bg-bg-elevated"
                            onError={(e) => {
                              e.target.src = PRESET_AVATARS[0].url;
                            }}
                          />
                        </div>

                        {/* Avatar presets */}
                        <div className="flex flex-1 items-center gap-2 overflow-x-auto py-1">
                          {user?.avatar && user.avatar !== avatar && (
                            <button
                              type="button"
                              onClick={() => {
                                setAvatar(user.avatar);
                                setShowCustomAvatarInput(false);
                              }}
                              className="w-9 h-9 rounded-lg overflow-hidden border border-border-subtle hover:border-accent-primary transition-all shrink-0 bg-bg-card"
                              title="Google Profile Photo"
                            >
                              <img src={user.avatar} alt="Google" className="w-full h-full object-cover" />
                            </button>
                          )}

                          {PRESET_AVATARS.map((p) => (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => {
                                setAvatar(p.url);
                                setShowCustomAvatarInput(false);
                              }}
                              className={`w-9 h-9 rounded-lg overflow-hidden border transition-all shrink-0 p-0.5 bg-bg-card ${
                                avatar === p.url ? 'border-accent-primary scale-105' : 'border-border-subtle hover:border-text-secondary'
                              }`}
                              title={p.name}
                            >
                              <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                            </button>
                          ))}

                          <button
                            type="button"
                            onClick={() => setShowCustomAvatarInput(!showCustomAvatarInput)}
                            className={`px-2.5 py-2 rounded-lg border text-[10px] font-bold transition-all flex items-center shrink-0 ${
                              showCustomAvatarInput 
                                ? 'border-accent-primary bg-accent-primary/10 text-accent-primary' 
                                : 'border-border-subtle text-text-secondary hover:text-text-primary bg-bg-card'
                            }`}
                          >
                            Custom URL
                          </button>
                        </div>
                      </div>

                      {/* Custom URL Form */}
                      {showCustomAvatarInput && (
                        <div className="mt-2 p-2 bg-bg-card/40 border border-border-subtle rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2 duration-150">
                          <input
                            type="url"
                            placeholder="https://example.com/avatar.jpg"
                            value={customAvatarUrl}
                            onChange={(e) => setCustomAvatarUrl(e.target.value)}
                            className="flex-1 bg-bg-card border border-border-subtle focus:border-accent-primary rounded-lg px-3 py-1.5 text-xs outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={handleCustomAvatarSubmit}
                            className="bg-accent-primary hover:bg-accent-hover text-bg-primary text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={submitting}
                    className="h-11 border border-border-subtle hover:bg-bg-card text-text-secondary disabled:opacity-50 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-sm"
                  >
                    <ChevronLeftIcon size={16} />
                    Back
                  </button>
                  {role === 'STAFF' ? (
                    <button
                      type="submit"
                      disabled={submitting || !phoneNumber.trim()}
                      className="h-11 bg-accent-primary hover:bg-accent-hover disabled:bg-accent-primary/50 text-bg-primary font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-accent-primary/10 text-sm"
                    >
                      {submitting ? (
                        <>
                          <SpinnerIcon size={14} />
                          Unlocking...
                        </>
                      ) : (
                        <>
                          <CompassIcon size={14} />
                          Unlock Dashboard
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="h-11 bg-accent-primary hover:bg-accent-hover text-bg-primary font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-sm"
                    >
                      Continue
                      <ChevronRightIcon size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {step === 3 && role === 'STUDENT' && (
              <motion.div
                key="step3"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-accent-primary/10 text-accent-primary px-3 py-1 rounded-full text-xs font-semibold mb-2 border border-accent-primary/20">
                    <SparklesIcon className="w-3.5 h-3.5" />
                    Step 3: Socials & Bio
                  </div>
                  <h3 className="text-xl font-extrabold text-text-primary">Connect Your Portfolios</h3>
                  <p className="text-xs text-text-muted mt-1">Add optional web presences and a short profile description.</p>
                </div>

                <div className="space-y-4">
                  {/* Social links */}
                  <div className="grid grid-cols-1 gap-2.5">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                        <GithubIcon size={14} />
                      </div>
                      <input
                        type="url"
                        placeholder="GitHub profile link"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="w-full bg-bg-card border border-border-subtle focus:border-accent-primary rounded-xl pl-10 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted outline-none transition-all"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                        <LinkedinIcon size={14} />
                      </div>
                      <input
                        type="url"
                        placeholder="LinkedIn profile link"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        className="w-full bg-bg-card border border-border-subtle focus:border-accent-primary rounded-xl pl-10 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted outline-none transition-all"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                        <GlobeIcon size={14} />
                      </div>
                      <input
                        type="url"
                        placeholder="Portfolio website"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        className="w-full bg-bg-card border border-border-subtle focus:border-accent-primary rounded-xl pl-10 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted outline-none transition-all"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                        <FileTextIcon size={14} />
                      </div>
                      <input
                        type="url"
                        placeholder="Resume Link URL (Optional)"
                        value={resumeUrl}
                        onChange={(e) => setResumeUrl(e.target.value)}
                        className="w-full bg-bg-card border border-border-subtle focus:border-accent-primary rounded-xl pl-10 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted outline-none transition-all"
                      />
                    </div>

                    <div className="relative bg-bg-card border border-border-subtle rounded-xl p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-text-secondary">Upload Resume PDF (Optional)</span>
                        {resumeFile && (
                          <span className="text-[10px] text-status-success font-medium max-w-[200px] truncate">
                            {resumeFile.fileName}
                          </span>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="text-[11px] text-text-muted file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-accent-primary/10 file:text-accent-primary hover:file:bg-accent-primary/20 file:cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Short Biography</label>
                    <textarea
                      rows="3"
                      placeholder="Write a brief intro..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-bg-card border border-border-subtle focus:border-accent-primary rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted outline-none transition-all resize-none"
                      maxLength="300"
                    />
                    <div className="text-right text-[10px] text-text-muted mt-1">
                      {bio.length}/300 characters
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={submitting}
                    className="h-11 border border-border-subtle hover:bg-bg-card text-text-secondary disabled:opacity-50 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-sm"
                  >
                    <ChevronLeftIcon size={16} />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-11 bg-accent-primary hover:bg-accent-hover disabled:bg-accent-primary/50 text-bg-primary font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-accent-primary/10 text-sm"
                  >
                    {submitting ? (
                      <>
                        <SpinnerIcon size={14} />
                        Unlocking...
                      </>
                    ) : (
                      <>
                        <CompassIcon size={14} />
                        Unlock Dashboard
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
};
