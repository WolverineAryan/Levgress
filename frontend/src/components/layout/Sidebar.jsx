import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Trophy, 
  Award, 
  Code, 
  Brain, 
  ClipboardList,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Globe
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/classnames';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/skills', label: 'Skills', icon: Code },
    { to: '/badges', label: 'Badges', icon: Award },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/ai-insights', label: 'AI Insights', icon: Brain },
    { to: '/showcase', label: 'Showcase Feed', icon: Globe },
  ];

  const staffLinks = [
    { to: '/staff-dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/project-review', label: 'Projects Portfolio', icon: ClipboardList },
    { to: '/showcase', label: 'Showcase Feed', icon: Globe },
  ];

  const activeStyle = 'bg-accent-primary/10 text-accent-primary border-l-2 border-accent-primary';
  const inactiveStyle = 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50 border-l-2 border-transparent';

  const links = user?.role === 'STAFF' ? staffLinks : studentLinks;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside className="w-64 border-r border-border-subtle bg-bg-secondary flex flex-col h-[calc(100vh-4rem)] sticky top-16 z-30 select-none">
      <div className="flex-1 py-6 flex flex-col space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-6 py-3 text-sm font-semibold transition-all duration-200',
                  isActive ? activeStyle : inactiveStyle
                )
              }
            >
              <Icon className="w-4.5 h-4.5" />
              {link.label}
            </NavLink>
          );
        })}
      </div>

      {/* Sidebar Footer with Profile Context Menu */}
      <div className="p-4 border-t border-border-subtle bg-bg-primary/20 relative" ref={menuRef}>
        
        {/* Context Menu Popup Window */}
        {isMenuOpen && (
          <div className="absolute bottom-16 left-4 right-4 bg-bg-card/95 backdrop-blur-xl border border-border-primary/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 flex flex-col space-y-0.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* User Details Header inside Popover */}
            <div className="px-3.5 py-2.5 border-b border-border-subtle/40 mb-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Logged in as</span>
              <span className="text-xs font-black text-text-primary block truncate mt-0.5">{user?.name}</span>
              <span className="text-[9px] text-accent-primary font-medium block truncate">
                {user?.role === 'STAFF' ? 'Instructor Account' : 'Student Account'}
              </span>
            </div>

            <button
              onClick={() => {
                setIsMenuOpen(false);
                navigate(user?.role === 'STAFF' ? `/staff-dashboard` : `/profile/${user._id}`);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-text-secondary hover:text-accent-primary hover:bg-accent-primary/5 rounded-xl transition-all cursor-pointer text-left"
            >
              <User className="w-4 h-4 text-text-secondary" />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => {
                setIsMenuOpen(false);
                navigate('/settings');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-text-secondary hover:text-accent-primary hover:bg-accent-primary/5 rounded-xl transition-all cursor-pointer text-left"
            >
              <Settings className="w-4 h-4 text-text-secondary" />
              <span>Account Settings</span>
            </button>

            <button
              onClick={() => {
                setIsMenuOpen(false);
                alert('Support Desk: Contact WolverineAryan/Levgress system administrators at support@levgress.com');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-text-secondary hover:text-accent-primary hover:bg-accent-primary/5 rounded-xl transition-all cursor-pointer text-left"
            >
              <HelpCircle className="w-4 h-4 text-text-secondary" />
              <span>Help & Support</span>
            </button>

            <div className="h-px bg-border-subtle/40 my-1.5" />

            <button
              onClick={() => {
                setIsMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-status-danger hover:bg-status-danger/10 rounded-xl transition-all cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 text-status-danger" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Footer trigger button */}
        <div 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-bg-secondary/60 cursor-pointer transition-colors"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-9 h-9 rounded-lg border border-accent-primary/20 object-cover bg-bg-elevated shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center font-bold text-xs text-accent-primary shrink-0">
              {user?.name?.charAt(0)}
            </div>
          )}
          
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-black text-text-primary truncate leading-none">{user?.name}</span>
            <span className="text-[9px] text-text-muted mt-1 truncate">
              {user?.username ? `@${user.username}` : user?.email}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
