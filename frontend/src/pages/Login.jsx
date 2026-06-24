import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input, Button } from '../components/ui';
import { ArrowRight, Lock, Mail } from 'lucide-react';

export const Login = () => {
  const { user, login, loginWithGoogle } = useAuth();
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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please fill in all fields');
    }
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (!loggedUser.onboarded) {
        navigate('/onboarding');
      } else if (loggedUser.role === 'STAFF') {
        navigate('/staff-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle('STUDENT');
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
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

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-sm flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Sign In</h1>
            <p className="text-xs text-text-secondary">Enter your email below to log in to your account</p>
          </div>

          {error && (
            <div className="p-3 text-xs bg-status-danger/10 border border-status-danger/25 text-status-danger rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              icon={Mail}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              icon={Lock}
              required
            />

            <Button type="submit" loading={loading} className="w-full mt-2" icon={ArrowRight} iconPosition="right">
              Sign In
            </Button>
          </form>

          <div className="relative flex items-center justify-center my-1 text-xs">
            <span className="absolute px-2 bg-bg-primary text-text-muted text-[10px] uppercase font-bold tracking-wider">or continue with</span>
            <div className="w-full border-t border-border-subtle" />
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full"
          >
            Google Authenticate
          </Button>

          <p className="text-center text-xs text-text-secondary">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
