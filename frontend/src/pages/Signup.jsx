import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input, Button, Card } from '../components/ui';
import { User, Shield, ArrowRight } from 'lucide-react';
import { cn } from '../utils/classnames';

export const Signup = () => {
  const { user, register, loginWithGoogle } = useAuth();
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

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT'); // STUDENT or STAFF
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return setError('Please fill in all fields');
    }
    setError('');
    setLoading(true);

    try {
      const registeredUser = await register(name, email, password, role);
      if (!registeredUser.onboarded) {
        navigate('/onboarding');
      } else if (registeredUser.role === 'STAFF') {
        navigate('/staff-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(role);
    } catch (err) {
      setError(err.message || 'Google sign-up failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-stretch relative overflow-hidden select-none">
      {/* ambient glows */}
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
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-text-primary">
            Start Your Gamified Learning Journey Today
          </h2>
          <p className="text-text-secondary leading-relaxed text-sm">
            Create an account to manage your deliverables, level up skills, track active streaks, and connect directly with instructors.
          </p>
        </div>

        <div className="text-xs text-text-muted">
          © {new Date().getFullYear()} Levgress. All rights reserved.
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-sm flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Create an account</h1>
            <p className="text-xs text-text-secondary">Enter your details below to get started</p>
          </div>

          {error && (
            <div className="p-3 text-xs bg-status-danger/10 border border-status-danger/25 text-status-danger rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Pranav Thormise"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />

            {/* Role Selection Grid */}
            <div className="flex flex-col space-y-2">
              <span className="text-xs font-medium text-text-secondary">Register As</span>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => !loading && setRole('STUDENT')}
                  className={cn(
                    "p-3 rounded-lg border flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 bg-bg-secondary",
                    role === 'STUDENT'
                      ? "border-accent-primary bg-accent-primary/[0.03] shadow-[0_0_10px_var(--color-accent-glow)]"
                      : "border-border-subtle hover:border-text-muted"
                  )}
                >
                  <User className={cn("w-5 h-5", role === 'STUDENT' ? "text-accent-primary" : "text-text-muted")} />
                  <span className="text-xs font-semibold text-text-primary">Student</span>
                </div>

                <div
                  onClick={() => !loading && setRole('STAFF')}
                  className={cn(
                    "p-3 rounded-lg border flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 bg-bg-secondary",
                    role === 'STAFF'
                      ? "border-accent-primary bg-accent-primary/[0.03] shadow-[0_0_10px_var(--color-accent-glow)]"
                      : "border-border-subtle hover:border-text-muted"
                  )}
                >
                  <Shield className={cn("w-5 h-5", role === 'STAFF' ? "text-accent-primary" : "text-text-muted")} />
                  <span className="text-xs font-semibold text-text-primary">Instructor</span>
                </div>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2" icon={ArrowRight} iconPosition="right">
              Sign Up
            </Button>
          </form>

          <div className="relative flex items-center justify-center my-1 text-xs">
            <span className="absolute px-2 bg-bg-primary text-text-muted text-[10px] uppercase font-bold tracking-wider">or continue with</span>
            <div className="w-full border-t border-border-subtle" />
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full"
          >
            Google Authenticate
          </Button>

          <p className="text-center text-xs text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
