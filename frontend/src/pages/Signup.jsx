import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui';
import { Trophy, Flame, BarChart3, GraduationCap } from 'lucide-react';

export const Signup = () => {
  const { user, loginWithProvider } = useAuth();
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
        {/* Subtle dark overlay for content legibility without washing out colors */}
        <div className="absolute inset-0 bg-black/15 z-0" />

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
          <h2 className="text-4xl font-extrabold tracking-tight leading-[1.15] text-text-primary drop-shadow-md">
            Start Your <span className="text-accent-primary">Gamified</span> Learning Journey Today
          </h2>
          <p className="text-text-secondary leading-relaxed text-xs max-w-sm drop-shadow-sm">
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10 bg-bg-secondary/10">
        
        {/* Style injection for rich custom animations */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float-slow {
            0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
            50% { transform: translateY(-20px) translateX(12px) rotate(6deg); }
          }
          @keyframes float-reverse {
            0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
            50% { transform: translateY(15px) translateX(-12px) rotate(-8deg); }
          }
          @keyframes draw-path {
            0% { stroke-dashoffset: 1000; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes morph-orb {
            0%, 100% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
            50% { border-radius: 70% 30% 52% 48% / 60% 40% 60% 40%; }
          }
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-float-slow {
            animation: float-slow 10s ease-in-out infinite;
          }
          .animate-float-reverse {
            animation: float-reverse 13s ease-in-out infinite;
          }
          .animate-draw {
            stroke-dasharray: 1000;
            animation: draw-path 45s linear infinite;
          }
          .animate-morph {
            animation: morph-orb 15s ease-in-out infinite;
          }
          .animate-spin-slow {
            animation: spin-slow 25s linear infinite;
          }
        `}} />

        {/* Abstract Geometrical Graphics & Animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          
          {/* Animated Morphing Ambient Orbs */}
          <div className="absolute top-[10%] right-[-10%] w-[350px] h-[350px] bg-accent-primary/10 dark:bg-accent-primary/5 blur-3xl rounded-full animate-morph" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-accent-hover/8 dark:bg-accent-hover/4 blur-3xl rounded-full animate-morph" style={{ animationDelay: '-5s' }} />

          {/* Circular Outlines */}
          <div className="absolute top-[20%] left-[10%] w-32 h-32 border border-accent-primary/15 rounded-full animate-float-slow" />
          <div className="absolute bottom-[20%] right-[10%] w-48 h-48 border border-accent-primary/10 rounded-full animate-float-reverse" />
          
          {/* Concentric spinning rings */}
          <div className="absolute top-[45%] right-[15%] w-40 h-40 border border-dashed border-accent-primary/10 rounded-full animate-spin-slow" />
          <div className="absolute top-[47%] right-[17%] w-32 h-32 border border-dotted border-accent-primary/15 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '35s' }} />

          {/* Diagonal hatch pattern circle */}
          <div 
            className="absolute top-[35%] left-[-5%] w-28 h-28 rounded-full opacity-[0.08] dark:opacity-[0.04] animate-float-slow"
            style={{ 
              backgroundImage: 'repeating-linear-gradient(45deg, var(--color-accent-primary) 0px, var(--color-accent-primary) 1px, transparent 0px, transparent 10px)',
              animationDelay: '-2s'
            }} 
          />

          {/* Floating Coding Glyphs */}
          <div className="absolute top-[15%] right-[20%] text-[13px] font-black font-mono text-accent-primary/20 dark:text-accent-primary/10 select-none animate-float-slow">
            &lt;code /&gt;
          </div>
          <div className="absolute bottom-[25%] left-[18%] text-[15px] font-black font-mono text-accent-primary/25 dark:text-accent-primary/12 select-none animate-float-reverse">
            &#123; stats &#125;
          </div>
          <div className="absolute top-[48%] left-[8%] text-xs font-black font-mono text-accent-primary/15 dark:text-accent-primary/8 select-none animate-float-slow" style={{ animationDelay: '-3s' }}>
            git commit
          </div>
          <div className="absolute bottom-[10%] right-[25%] text-lg font-black font-mono text-accent-primary/20 dark:text-accent-primary/10 select-none animate-float-reverse">
            ++XP
          </div>

          {/* Dots Grids */}
          <div className="absolute top-[10%] right-[8%] w-16 h-16 opacity-25 dark:opacity-10 grid grid-cols-4 gap-2">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
            ))}
          </div>
          <div className="absolute bottom-[12%] left-[8%] w-16 h-16 opacity-25 dark:opacity-10 grid grid-cols-4 gap-2">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
            ))}
          </div>

          {/* Abstract wavy contours with path drawing animation */}
          <svg className="absolute right-[-10%] top-[-10%] w-[60%] h-[60%] text-accent-primary/8 dark:text-accent-primary/3 shrink-0" viewBox="0 0 200 200" fill="none">
            <path d="M50 0C80 20 120 10 150 40C180 70 190 120 170 160C150 200 100 190 60 170C20 150 10 100 0 60C-10 20 20 -20 50 0Z" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" className="animate-draw" />
          </svg>
          <svg className="absolute left-[-15%] bottom-[-15%] w-[70%] h-[70%] text-accent-primary/6 dark:text-accent-primary/2 shrink-0" viewBox="0 0 200 200" fill="none">
            <path d="M40 20C70 -10 110 0 140 20C170 40 180 90 160 130C140 170 90 180 50 160C10 140 0 90 10 50C20 10 10 50 40 20Z" stroke="currentColor" strokeWidth="1.5" className="animate-draw" style={{ animationDirection: 'reverse', animationDuration: '60s' }} />
          </svg>
        </div>

        <div className="w-full max-w-[420px] flex flex-col space-y-7 bg-bg-card p-10 rounded-[32px] border border-border-subtle shadow-2xl relative z-10">
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
          </div>

          <div className="text-center text-[10px] text-text-muted leading-relaxed pt-2 border-t border-border-subtle">
            Note: Only student registration is allowed. Instructor profiles are provisioned directly by system administrators.
          </div>

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
