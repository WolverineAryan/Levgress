import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui';
import { ShieldAlert } from 'lucide-react';

export const Login = () => {
  const { user, loginWithProvider, complete2FA } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (!user.onboarded) {
        navigate('/onboarding', { replace: true });
      } else if (user.role === 'STAFF') {
        navigate('/staff-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2FA verification states
  const [showTfaVerification, setShowTfaVerification] = useState(false);
  const [tfaUser, setTfaUser] = useState(null);
  const [tfaCode, setTfaCode] = useState('');
  const [tfaError, setTfaError] = useState('');
  const [tfaLoading, setTfaLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await loginWithProvider('google', 'STUDENT');
      if (res && res.twoFactorRequired) {
        setTfaUser(res);
        setShowTfaVerification(true);
      }
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await loginWithProvider('github', 'STUDENT');
      if (res && res.twoFactorRequired) {
        setTfaUser(res);
        setShowTfaVerification(true);
      }
    } catch (err) {
      setError(err.message || 'GitHub sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FACode = async (e) => {
    e.preventDefault();
    if (tfaCode.length !== 6) {
      setTfaError('Authentication code must be 6 digits.');
      return;
    }

    setTfaLoading(true);
    setTfaError('');

    try {
      await complete2FA(tfaCode);
    } catch (err) {
      console.error(err);
      setTfaError(err.response?.data?.message || 'Invalid authenticator code. Please try again.');
    } finally {
      setTfaLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-stretch relative overflow-hidden select-none">
      {/* Ambient backgrounds */}
      <div className="ambient-glow -top-20 -left-20" />
      <div className="ambient-glow -bottom-20 -right-20" />

      {/* Left Column: Branding / Aesthetics */}
      <div className="hidden lg:flex lg:w-1/2 bg-bg-secondary border-r border-border-subtle flex-col justify-between p-16 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-wider bg-gradient-to-r from-accent-primary to-accent-hover bg-clip-text text-transparent">
            LEVGRESS
          </span>
        </div>

        <div className="max-w-md flex flex-col space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-accent-primary/10 text-accent-primary px-3 py-1 rounded-full text-xs font-bold w-fit border border-accent-primary/20">
            Secure Developer Access
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-text-primary">
            Unlock Your Potential with Gamified Monitoring
          </h2>
          <p className="text-text-secondary leading-relaxed text-sm">
            Track milestones, earn experience points, unlock badges, and receive real-time AI feedback on your engineering projects.
          </p>
        </div>

        <div className="text-xs text-text-muted">
          © {new Date().getFullYear()} Levgress. All rights reserved.
        </div>
      </div>

      {/* Right Column: Sign In Portal */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-sm flex flex-col space-y-7 bg-bg-card/40 p-8 rounded-2xl border border-border-subtle backdrop-blur-sm shadow-xl">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Sign In</h1>
            <p className="text-xs text-text-secondary">Access the Student or Instructor dashboard using single sign-on.</p>
          </div>

          {error && (
            <div className="p-3 text-xs bg-status-danger/10 border border-status-danger/25 text-status-danger rounded-lg">
              {error}
            </div>
          )}

          <div className="flex flex-col space-y-3.5">
            <Button
              type="button"
              variant="secondary"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-border-subtle hover:bg-bg-secondary transition-all py-2.5 rounded-xl text-xs font-semibold"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={handleGithubSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-border-subtle hover:bg-bg-secondary transition-all py-2.5 rounded-xl text-xs font-semibold"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              <span>Continue with GitHub</span>
            </Button>
          </div>


          <div className="text-center text-[10px] text-text-muted leading-relaxed">
            Note: Instructor accounts must be manually provisioned by the administrator. Self-registered accounts are initialized with Student access permissions.
          </div>

          <p className="text-center text-xs text-text-secondary pt-2 border-t border-border-subtle">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent-primary font-semibold hover:underline">
              Create student account
            </Link>
          </p>
        </div>
        {/* Two-Factor Authentication Verification Modal */}
        {showTfaVerification && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-bg-card border border-border-primary rounded-2xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in-95 duration-200 shadow-2xl space-y-4">
              <div className="flex flex-col space-y-1">
                <h3 className="text-sm font-black text-text-primary tracking-tight uppercase flex items-center gap-2">
                  <ShieldAlert className="text-accent-primary w-4.5 h-4.5" /> Two-Factor Verification
                </h3>
                <p className="text-[11px] text-text-secondary leading-normal">
                  Please enter the 6-digit verification code from your mobile authenticator application to log in.
                </p>
              </div>

              {tfaError && (
                <div className="p-3 text-[10px] bg-status-danger/10 border border-status-danger/25 text-status-danger rounded-xl font-bold animate-fade-in">
                  {tfaError}
                </div>
              )}

              <form onSubmit={handleVerify2FACode} className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Authenticator Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={tfaCode}
                    onChange={(e) => setTfaCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-bg-secondary border border-border-subtle focus:border-accent-primary rounded-xl px-4 py-2.5 text-center text-lg font-black tracking-widest text-text-primary outline-none transition-all"
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    onClick={() => {
                      setShowTfaVerification(false);
                      setTfaCode('');
                      setTfaError('');
                      localStorage.removeItem('token');
                    }}
                    disabled={tfaLoading}
                    variant="ghost"
                    className="text-xs px-4 py-2 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={tfaLoading}
                    className="text-xs px-4 py-2 bg-accent-primary hover:bg-accent-hover text-bg-primary rounded-xl font-bold cursor-pointer transition-all shadow-md shadow-accent-primary/5"
                  >
                    Verify Code
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
