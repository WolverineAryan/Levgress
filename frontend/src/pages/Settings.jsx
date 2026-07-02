import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import * as authApi from '../api/auth';
import { Card, Button, Input } from '../components/ui';
import { 
  Settings as SettingsIcon, 
  Lock, 
  Bell, 
  Moon, 
  Sun, 
  ArrowLeft,
  Check,
  ShieldAlert,
  HelpCircle,
  Bug,
  Trash2,
  Key,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const Settings = () => {
  const { user, updateLocalUser, logout } = useAuth();
  const navigate = useNavigate();

  // Active Tab configuration: 'security' | 'preferences' | 'support' | 'danger'
  const [activeTab, setActiveTab] = useState('security');

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.twoFactorEnabled || false);
  const [tfaLoading, setTfaLoading] = useState(false);
  const [tfaSuccess, setTfaSuccess] = useState('');
  const [tfaError, setTfaError] = useState('');
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [tfaSecret, setTfaSecret] = useState('');
  const [tfaQrCodeUrl, setTfaQrCodeUrl] = useState('');

  // Preference fields state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [aiAlerts, setAiAlerts] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [prefLoading, setPrefLoading] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState('');

  // Report Issue State
  const [reportCategory, setReportCategory] = useState('BUG');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');
  const [reportError, setReportError] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  // Delete Account State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState(null);

  // Sync theme toggle
  const handleThemeToggle = (selectedTheme) => {
    setTheme(selectedTheme);
    if (selectedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', selectedTheme);
  };

  // Handle Save Preferences (Theme & Alerts)
  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setPrefLoading(true);
    setPrefSuccess('');
    try {
      localStorage.setItem('emailAlerts', emailAlerts);
      localStorage.setItem('aiAlerts', aiAlerts);
      setPrefSuccess('Application preferences saved successfully!');
      setTimeout(() => setPrefSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setPrefLoading(false);
    }
  };

  // Handle Password Update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }

    setPwLoading(true);
    setPwSuccess('');
    setPwError('');

    try {
      await authApi.updatePassword({ currentPassword, newPassword });
      setPwSuccess('Password credentials updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setPwError(err.response?.data?.message || 'Failed to update credentials.');
    } finally {
      setPwLoading(false);
    }
  };

  // Handle Toggle 2FA
  const handleToggle2FA = async () => {
    setTfaLoading(true);
    setTfaSuccess('');
    setTfaError('');
    try {
      const res = await authApi.toggle2FA();
      const nextState = res.data.data.user.twoFactorEnabled;
      setIs2FAEnabled(nextState);
      updateLocalUser(res.data.data.user);
      
      if (nextState) {
        const secret = res.data.data.secret;
        setTfaSecret(secret);
        const otpauthUri = `otpauth://totp/Levgress:${user.email}?secret=${secret}&issuer=Levgress`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUri)}`;
        setTfaQrCodeUrl(qrUrl);
        setShow2FAModal(true);
        setTfaSuccess('Two-Factor Authentication activated successfully!');
      } else {
        setTfaSuccess('Two-Factor Authentication deactivated.');
        setTfaSecret('');
        setTfaQrCodeUrl('');
      }
      setTimeout(() => setTfaSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setTfaError(err.response?.data?.message || 'Failed to configure 2FA.');
    } finally {
      setTfaLoading(false);
    }
  };

  // Handle Issue Submission
  const handleReportIssue = async (e) => {
    e.preventDefault();
    if (!reportDescription.trim()) {
      setReportError('Description is required');
      return;
    }

    setReportLoading(true);
    setReportSuccess('');
    setReportError('');

    try {
      await authApi.reportIssue({ category: reportCategory, description: reportDescription });
      setReportSuccess('Issue report ticket created successfully! Our administrators will review it shortly.');
      setReportDescription('');
      setTimeout(() => setReportSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setReportError(err.response?.data?.message || 'Failed to submit report ticket.');
    } finally {
      setReportLoading(false);
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError("Please type 'DELETE' to confirm account erasure.");
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');

    try {
      await authApi.deleteAccount();
      logout();
      navigate('/');
    } catch (err) {
      console.error(err);
      setDeleteError(err.response?.data?.message || 'Failed to delete account.');
      setDeleteLoading(false);
    }
  };

  const faqs = [
    {
      q: 'How is my profile portfolio linked to my projects?',
      a: 'The Case Studies listed on your profile represent real-world work items you submit. Any projects created or edited in your workspace automatically populate this section.'
    },
    {
      q: 'How are XP, Levels, and Badges calculated?',
      a: 'Your Level and XP grow as you complete task milestones, submit projects, and respond to instructor Q&A remarks. Badges are unlocked automatically when you hit specific milestones.'
    },
    {
      q: 'How does the federated SSO authentication work?',
      a: 'Levgress uses Google and GitHub SSO exclusively to handle credentials securely. Passwords and multi-factor validation are safely delegated to your Google or GitHub account.'
    },
    {
      q: 'How do I link an external repository to my project?',
      a: 'While managing a project, you can update its details and input a GitHub repository URL or a Live Demo website link to render shortcut badges on your profile card.'
    }
  ];

  return (
    <div className="flex flex-col space-y-8 select-none p-4 max-w-5xl mx-auto pb-16">
      {/* Settings Navigation Header */}
      <div className="flex justify-between items-center bg-bg-card/25 backdrop-blur-md p-4 rounded-2xl border border-border-subtle/50 shadow-sm">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="text-xs flex items-center gap-1.5 border border-border-subtle/80 cursor-pointer bg-bg-secondary hover:bg-bg-elevated px-4 py-1.8 rounded-xl font-bold transition-all"
        >
          <ArrowLeft size={14} /> Back
        </Button>
        <h1 className="text-sm font-black tracking-tight text-text-primary flex items-center gap-2 uppercase">
          <SettingsIcon className="text-accent-primary w-4.5 h-4.5" /> Account Settings
        </h1>
      </div>

      {/* Main Settings Navigation Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* Left Column: Tab Menu Navigation */}
        <div className="flex flex-col space-y-2 md:col-span-1 bg-bg-card/20 border border-border-subtle/30 p-2.5 rounded-2xl backdrop-blur-sm">
          <span className="text-[9px] font-black text-text-muted uppercase tracking-wider px-3 py-1 block">Account Settings</span>
          
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-black rounded-xl border transition-all text-left cursor-pointer ${
              activeTab === 'security'
                ? 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary'
                : 'bg-transparent border-transparent text-text-secondary hover:bg-bg-secondary/40 hover:text-text-primary'
            }`}
          >
            <Lock size={14} />
            <span>Credentials & Security</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-black rounded-xl border transition-all text-left cursor-pointer ${
              activeTab === 'preferences'
                ? 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary'
                : 'bg-transparent border-transparent text-text-secondary hover:bg-bg-secondary/40 hover:text-text-primary'
            }`}
          >
            <Bell size={14} />
            <span>Preferences</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-black rounded-xl border transition-all text-left cursor-pointer ${
              activeTab === 'support'
                ? 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary'
                : 'bg-transparent border-transparent text-text-secondary hover:bg-bg-secondary/40 hover:text-text-primary'
            }`}
          >
            <HelpCircle size={14} />
            <span>Support & FAQ</span>
          </button>

          <div className="h-px bg-border-subtle/30 my-1" />

          <button
            type="button"
            onClick={() => setActiveTab('danger')}
            className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-black rounded-xl border transition-all text-left cursor-pointer ${
              activeTab === 'danger'
                ? 'bg-status-danger/10 border-status-danger/25 text-status-danger'
                : 'bg-transparent border-transparent text-text-secondary hover:bg-status-danger/10 hover:text-status-danger'
            }`}
          >
            <Trash2 size={14} />
            <span>Danger Zone</span>
          </button>
        </div>

        {/* Right Column: Tab Content */}
        <div className="md:col-span-3 space-y-6 min-w-0">
          
          {/* TAB: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
              
              {/* Credentials Form */}
              <Card className="p-6 space-y-6 bg-bg-card/30 backdrop-blur-sm border border-border-subtle shadow-xl">
                <div>
                  <h2 className="text-sm font-extrabold text-text-primary">Change Account Password</h2>
                  <p className="text-[11px] text-text-secondary mt-1">Set a local password to add backup credential login support.</p>
                </div>

                {pwSuccess && (
                  <div className="p-3 text-[10px] bg-status-success/10 border border-status-success/20 text-status-success rounded-xl flex items-center gap-2 animate-fade-in font-bold">
                    <Check size={12} /> {pwSuccess}
                  </div>
                )}

                {pwError && (
                  <div className="p-3 text-[10px] bg-status-danger/10 border border-status-danger/20 text-status-danger rounded-xl flex items-center gap-2 animate-fade-in font-bold">
                    {pwError}
                  </div>
                )}

                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />

                  <div className="flex justify-end pt-2">
                    <Button 
                      type="submit" 
                      loading={pwLoading}
                      className="text-xs px-4 py-2 bg-accent-primary hover:bg-accent-hover text-bg-primary rounded-xl font-bold transition-all shadow-md shadow-accent-primary/5 cursor-pointer"
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              </Card>

              {/* 2FA Form */}
              <Card className="p-6 space-y-4 bg-bg-card/30 backdrop-blur-sm border border-border-subtle shadow-xl">
                <div>
                  <h2 className="text-sm font-extrabold text-text-primary">Two-Factor Authentication (2FA)</h2>
                  <p className="text-[11px] text-text-secondary mt-1">Add mobile validation verification to prevent credential hijacking.</p>
                </div>

                {tfaSuccess && (
                  <div className="p-3 text-[10px] bg-status-success/10 border border-status-success/20 text-status-success rounded-xl flex items-center gap-2 animate-fade-in font-bold">
                    <Check size={12} /> {tfaSuccess}
                  </div>
                )}

                {tfaError && (
                  <div className="p-3 text-[10px] bg-status-danger/10 border border-status-danger/20 text-status-danger rounded-xl flex items-center gap-2 animate-fade-in font-bold">
                    {tfaError}
                  </div>
                )}

                <div className="space-y-4">
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    When active, signing in will request a validation code from your mobile authenticator app in addition to Google/GitHub authentication.
                  </p>

                  <div className="flex items-center justify-between bg-bg-secondary/20 p-4 rounded-xl border border-border-subtle/50">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-text-primary">MFA Protection</span>
                      <span className={`text-[9px] font-bold uppercase mt-1.5 px-2 py-0.5 rounded border w-fit ${
                        is2FAEnabled 
                          ? 'bg-status-success/10 border-status-success/20 text-status-success' 
                          : 'bg-text-muted/10 border-border-subtle text-text-muted'
                      }`}>
                        {is2FAEnabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <Button
                      onClick={handleToggle2FA}
                      loading={tfaLoading}
                      className={`text-xs px-4 py-2 font-black rounded-xl cursor-pointer border transition-all ${
                        is2FAEnabled
                          ? 'bg-bg-secondary border-border-subtle text-text-secondary hover:text-text-primary'
                          : 'bg-accent-primary hover:bg-accent-hover text-bg-primary border-transparent shadow-md shadow-accent-primary/5'
                      }`}
                    >
                      {is2FAEnabled ? 'Deactivate 2FA' : 'Activate 2FA'}
                    </Button>
                  </div>
                </div>
              </Card>

            </div>
          )}

          {/* TAB: PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
              
              <Card className="p-6 space-y-6 bg-bg-card/30 backdrop-blur-sm border border-border-subtle shadow-xl">
                <div>
                  <h2 className="text-sm font-extrabold text-text-primary">Theme & Alerts Preferences</h2>
                  <p className="text-[11px] text-text-secondary mt-1">Configure layout visual styles and automatic status update alarms.</p>
                </div>

                {prefSuccess && (
                  <div className="p-3 text-[10px] bg-status-success/10 border border-status-success/20 text-status-success rounded-xl flex items-center gap-2 animate-fade-in font-bold">
                    <Check size={12} /> {prefSuccess}
                  </div>
                )}

                <form onSubmit={handleSavePreferences} className="space-y-6">
                  
                  {/* Theme toggles */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-text-primary block">Active Visual Style</span>
                    <div className="flex gap-3 max-w-md">
                      <button
                        type="button"
                        onClick={() => handleThemeToggle('dark')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                          theme === 'dark'
                            ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/25 shadow-md shadow-accent-primary/5'
                            : 'bg-bg-secondary border-border-subtle text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <Moon size={14} /> Dark Theme
                      </button>
                      <button
                        type="button"
                        onClick={() => handleThemeToggle('light')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                          theme === 'light'
                            ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/25 shadow-md shadow-accent-primary/5'
                            : 'bg-bg-secondary border-border-subtle text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <Sun size={14} /> Light Theme
                      </button>
                    </div>
                  </div>

                  {/* Notification Checkboxes */}
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-text-primary block">Alert Configurations</span>
                    
                    <div className="flex items-center justify-between border-t border-border-subtle/30 pt-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-text-primary">Email Notifications</span>
                        <span className="text-[9px] text-text-muted mt-0.5 font-medium">Receive weekly academic summary updates.</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={emailAlerts} 
                        onChange={(e) => setEmailAlerts(e.target.checked)}
                        className="w-4 h-4 accent-accent-primary cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-border-subtle/30 pt-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-text-primary">AI Evaluation Summaries</span>
                        <span className="text-[9px] text-text-muted mt-0.5 font-medium">Receive real-time notifications on AI mentor score evaluations.</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={aiAlerts} 
                        onChange={(e) => setAiAlerts(e.target.checked)}
                        className="w-4 h-4 accent-accent-primary cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button 
                      type="submit" 
                      loading={prefLoading}
                      className="text-xs px-4 py-2 bg-accent-primary hover:bg-accent-hover text-bg-primary rounded-xl font-bold transition-all shadow-md shadow-accent-primary/5 cursor-pointer"
                    >
                      Save Configuration
                    </Button>
                  </div>
                </form>
              </Card>

            </div>
          )}

          {/* TAB: SUPPORT & FAQ */}
          {activeTab === 'support' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
              
              {/* FAQ Accordion */}
              <Card className="p-6 space-y-5 bg-bg-card/30 backdrop-blur-sm border border-border-subtle shadow-xl">
                <div>
                  <h2 className="text-sm font-extrabold text-text-primary">Knowledge Base & FAQ</h2>
                  <p className="text-[11px] text-text-secondary mt-1">Quick help references regarding workspace operations, milestone XP, and Badges.</p>
                </div>

                <div className="space-y-3">
                  {faqs.map((faq, idx) => {
                    const isOpen = activeFaq === idx;
                    return (
                      <div key={idx} className="border border-border-subtle/50 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setActiveFaq(isOpen ? null : idx)}
                          className="w-full flex justify-between items-center p-3.5 text-left bg-bg-secondary/15 hover:bg-bg-secondary/30 transition-all cursor-pointer"
                        >
                          <span className="text-xs font-extrabold text-text-primary leading-tight">{faq.q}</span>
                          {isOpen ? <ChevronUp size={14} className="text-text-secondary" /> : <ChevronDown size={14} className="text-text-secondary" />}
                        </button>
                        {isOpen && (
                          <div className="p-3.5 bg-bg-secondary/5 border-t border-border-subtle/30 text-[11px] text-text-secondary leading-relaxed">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Bug/Support Ticket Form */}
              <Card className="p-6 space-y-6 bg-bg-card/30 backdrop-blur-sm border border-border-subtle shadow-xl">
                <div>
                  <h2 className="text-sm font-extrabold text-text-primary">File a Support Ticket</h2>
                  <p className="text-[11px] text-text-secondary mt-1">Submit technical bugs or user experience issues directly to Levgress admins.</p>
                </div>

                {reportSuccess && (
                  <div className="p-3 text-[10px] bg-status-success/10 border border-status-success/20 text-status-success rounded-xl flex items-center gap-2 animate-fade-in font-bold">
                    <Check size={12} /> {reportSuccess}
                  </div>
                )}

                {reportError && (
                  <div className="p-3 text-[10px] bg-status-danger/10 border border-status-danger/20 text-status-danger rounded-xl flex items-center gap-2 animate-fade-in font-bold">
                    {reportError}
                  </div>
                )}

                <form onSubmit={handleReportIssue} className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary">Category</label>
                    <select
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value)}
                      className="w-full bg-bg-secondary border border-border-subtle focus:border-accent-primary rounded-xl px-3 py-2.5 text-xs text-text-primary outline-none transition-all cursor-pointer"
                    >
                      <option value="BUG">Report a Technical Bug</option>
                      <option value="FEEDBACK">Workspace Suggestions / Feedback</option>
                      <option value="SUPPORT">Academic/Instructor Support</option>
                      <option value="OTHER">Other Issues</option>
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary">Detailed Summary</label>
                    <textarea
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Please specify step-by-step notes on how to reproduce the issue..."
                      rows={4}
                      className="w-full bg-bg-secondary border border-border-subtle focus:border-accent-primary rounded-xl p-3 text-xs text-text-primary placeholder:text-text-muted outline-none resize-none transition-all"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      loading={reportLoading}
                      className="text-xs px-4 py-2 bg-accent-primary hover:bg-accent-hover text-bg-primary rounded-xl font-bold transition-all shadow-md shadow-accent-primary/5 cursor-pointer"
                    >
                      Submit Ticket
                    </Button>
                  </div>
                </form>
              </Card>

            </div>
          )}

          {/* TAB: DANGER ZONE */}
          {activeTab === 'danger' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
              
              <Card className="p-6 space-y-5 bg-status-danger/5 border border-status-danger/20 shadow-xl rounded-2xl">
                <div>
                  <h2 className="text-sm font-extrabold text-status-danger">Danger Zone: Irreversible Account Purge</h2>
                  <p className="text-[11px] text-text-secondary mt-1">Erase your profile user files, timelines, XP progress, and milestones from Levgress.</p>
                </div>

                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Warning: Deleting your account will clear all database entries linked to your user. Any projects you have assigned to student teams will be permanently orphaned.
                </p>

                <Button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full text-xs py-2.5 bg-status-danger hover:bg-status-danger/80 text-white rounded-xl font-black transition-all cursor-pointer shadow-lg shadow-status-danger/5"
                >
                  Permanently Delete Account
                </Button>
              </Card>

            </div>
          )}

        </div>
      </div>

      {/* 2FA Setup Confirmation Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-primary rounded-2xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
            <h3 className="text-sm font-black text-text-primary tracking-tight mb-2 uppercase flex items-center gap-2">
              <ShieldAlert className="text-amber-500 w-4 h-4" /> Authenticator Setup
            </h3>
            <p className="text-[11px] text-text-secondary leading-normal mb-5">
              Two-Factor authentication is active. Scan the QR code with Google Authenticator or copy the secret key.
            </p>

            <div className="flex flex-col items-center p-4 bg-white rounded-xl mb-4 border border-border-subtle">
              <img src={tfaQrCodeUrl} alt="2FA QR Code" className="w-48 h-48 object-contain" />
              <span className="text-[9px] text-black font-extrabold uppercase mt-3 select-all">Secret: {tfaSecret}</span>
            </div>

            <Button
              onClick={() => setShow2FAModal(false)}
              className="w-full text-xs py-2.5 bg-accent-primary hover:bg-accent-hover text-bg-primary font-bold rounded-xl cursor-pointer"
            >
              Done / Verification Complete
            </Button>
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-primary rounded-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200 shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-status-danger tracking-tight uppercase flex items-center gap-2">
              <AlertTriangle className="text-status-danger w-4.5 h-4.5" /> Permanent Account Deletion
            </h3>
            
            <p className="text-xs text-text-secondary leading-relaxed">
              Warning: Deleting your account will erase your user history from the system database. Instructors will no longer see your project progress dashboard.
            </p>

            {deleteError && (
              <div className="p-3 text-[10px] bg-status-danger/10 border border-status-danger/20 text-status-danger rounded-xl flex items-center gap-2 animate-fade-in font-bold">
                {deleteError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase">Type <span className="text-status-danger font-black">DELETE</span> to confirm</label>
              <input
                type="text"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full bg-bg-secondary border border-border-subtle focus:border-status-danger rounded-xl px-3 py-2 text-xs text-text-primary outline-none transition-all"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                  setDeleteError('');
                }}
                disabled={deleteLoading}
                variant="ghost"
                className="text-xs px-4 py-2 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                loading={deleteLoading}
                className="text-xs px-4 py-2 bg-status-danger hover:bg-status-danger/80 text-white rounded-xl font-bold cursor-pointer transition-all shadow-md shadow-status-danger/5"
              >
                Confirm Account Erasure
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
