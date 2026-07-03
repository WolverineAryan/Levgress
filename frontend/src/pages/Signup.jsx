import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui';
import { Trophy, Flame, BarChart3, GraduationCap, ArrowRight, Mail, User } from 'lucide-react';

export const Signup = () => {
  const { user, loginWithProvider, register } = useAuth();
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

  // Email form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithProvider('google', 'STUDENT');
    } catch (err) {
      setError(err.message || 'Google sign-up failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithProvider('github', 'STUDENT');
    } catch (err) {
      setError(err.message || 'GitHub sign-up failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!showEmailForm) {
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      setError('');
      setShowEmailForm(true);
      return;
    }

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await register(name, email, password, 'STUDENT');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-stretch relative overflow-hidden select-none">
      {/* Ambient backgrounds */}
      <div className="ambient-glow -top-20 -left-20" />
      <div className="ambient-glow -bottom-20 -right-20" />

      {/* Left Column: Branding / Aesthetics */}
      <div 
        className="hidden lg:flex lg:w-1/2 border-r border-border-subtle flex-col justify-between p-16 relative z-10 overflow-hidden"
        style={{
          backgroundImage: 'url(/auth-bg-2.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Glass overlay for content legibility */}
        <div className="absolute inset-0 bg-bg-secondary/40 backdrop-blur-[1px] z-0" />

        <div className="flex items-center gap-2 relative z-10">
          <img src="/logo.png" alt="Levgress Mascot" className="w-7 h-7 object-contain" />
          <span className="text-lg font-black tracking-wider text-text-primary">
            LEVGRESS
          </span>
        </div>

        <div className="max-w-md flex flex-col space-y-5 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-accent-primary/10 text-accent-primary px-3.5 py-1.5 rounded-full text-[11px] font-bold w-fit border border-accent-primary/20">
            <GraduationCap className="w-3.5 h-3.5" />
            Student Portal Registration
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight leading-[1.15] text-text-primary">
            Start Your <span className="text-accent-primary">Gamified</span> Learning Journey Today
          </h2>
          <p className="text-text-secondary leading-relaxed text-xs max-w-sm">
            Create an account to manage your deliverables, level up skills, track active streaks, and connect directly with instructors.
          </p>
        </div>

        <div className="flex flex-col space-y-6 relative z-10">
          <div className="flex gap-4 items-center bg-bg-card/45 backdrop-blur-md p-4 rounded-2xl border border-border-subtle w-fit shadow-lg">
            <div className="flex flex-col items-center text-center px-2">
              <div className="w-9 h-9 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary mb-1.5">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold text-text-secondary tracking-wide">Track Progress</span>
            </div>
            <div className="h-8 w-px bg-border-subtle" />
            <div className="flex flex-col items-center text-center px-2">
              <div className="w-9 h-9 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary mb-1.5">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold text-text-secondary tracking-wide">Earn Rewards</span>
            </div>
            <div className="h-8 w-px bg-border-subtle" />
            <div className="flex flex-col items-center text-center px-2">
              <div className="w-9 h-9 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary mb-1.5">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold text-text-secondary tracking-wide">Level Up Skills</span>
            </div>
          </div>
          <div className="text-[10px] text-text-muted">
            © {new Date().getFullYear()} Levgress. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Column: Sign Up Portal */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        {/* Animated Geometrical Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
          <div className="absolute top-[10%] left-[20%] w-24 h-24 border border-accent-primary/20 rounded-full animate-float" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[15%] right-[25%] w-36 h-36 border border-accent-primary/15 rotate-45 animate-float" style={{ animationDuration: '12s', animationDelay: '2s' }} />
          <div className="absolute top-[60%] left-[10%] w-16 h-16 border-2 border-dashed border-accent-primary/10 rounded-lg animate-spin" style={{ animationDuration: '20s' }} />
          <div className="absolute top-[30%] right-[15%] w-20 h-20 bg-accent-primary/5 rounded-xl animate-float" style={{ animationDuration: '10s', animationDelay: '1s' }} />
          <div className="absolute bottom-[40%] left-[30%] w-8 h-8 bg-accent-hover/5 rounded-full animate-pulse" />
          
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(192,133,82,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(192,133,82,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <form onSubmit={handleEmailSubmit} className="w-full max-w-[420px] flex flex-col space-y-7 bg-bg-card p-10 rounded-[32px] border border-border-subtle shadow-2xl relative z-10">
          <div>
            <div className="w-12 h-12 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center mx-auto mb-3 shadow-sm border border-accent-primary/20">
              <GraduationCap className="w-5.5 h-5.5" />
            </div>
            <h2 className="text-xl font-extrabold text-text-primary text-center">Create an account</h2>
            <p className="text-xs text-text-secondary text-center mt-1">Register your student account using single sign-on.</p>
          </div>

          <div className="flex justify-center my-1">
            <div className="w-2 h-2 rotate-45 bg-accent-primary/40 rounded-sm" />
          </div>

          {error && (
            <div className="p-3 text-xs bg-status-danger/10 border border-status-danger/25 text-status-danger rounded-xl">
              {error}
            </div>
          )}

          <div className="flex flex-col space-y-3.5">
            <Button
              type="button"
              variant="secondary"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-border-subtle bg-bg-primary hover:bg-bg-secondary transition-all py-3 rounded-2xl text-xs font-bold text-text-primary shadow-sm hover:shadow-md cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>Sign up with Google</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={handleGithubSignUp}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-border-subtle bg-bg-primary hover:bg-bg-secondary transition-all py-3 rounded-2xl text-xs font-bold text-text-primary shadow-sm hover:shadow-md cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              <span>Sign up with GitHub</span>
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border-subtle" />
            <span className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase">OR</span>
            <div className="h-px flex-1 bg-border-subtle" />
          </div>

          <div className="flex flex-col space-y-3">
            <div className="flex items-center bg-bg-primary border border-border-subtle rounded-2xl px-4 py-3 focus-within:border-accent-primary transition-all">
              <Mail className="w-4 h-4 text-text-muted shrink-0 mr-3" />
              <input
                type="email"
                placeholder="Enter your student email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-transparent text-xs text-text-primary outline-none"
                required
              />
            </div>

            {showEmailForm && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center bg-bg-primary border border-border-subtle rounded-2xl px-4 py-3 focus-within:border-accent-primary transition-all">
                  <User className="w-4 h-4 text-text-muted shrink-0 mr-3" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="w-full bg-transparent text-xs text-text-primary outline-none"
                    required
                  />
                </div>
                <div className="flex items-center bg-bg-primary border border-border-subtle rounded-2xl px-4 py-3 focus-within:border-accent-primary transition-all">
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full bg-transparent text-xs text-text-primary outline-none"
                    required
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full bg-accent-primary hover:bg-accent-hover text-bg-primary font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-accent-primary/10 transition-all"
            >
              <span>{showEmailForm ? 'Create Account' : 'Continue with Email'}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Button>
          </div>

          <div className="text-center text-[10px] text-text-muted leading-relaxed">
            Note: Only student registration is allowed. Instructor profiles are provisioned directly by system administrators.
          </div>

          <p className="text-center text-xs text-text-secondary pt-2 border-t border-border-subtle">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
