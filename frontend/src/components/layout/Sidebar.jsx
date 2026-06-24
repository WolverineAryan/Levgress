import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Trophy, Award, Code, Brain, ClipboardList } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/classnames';

export const Sidebar = () => {
  const { user } = useAuth();

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/skills', label: 'Skills', icon: Code },
    { to: '/badges', label: 'Badges', icon: Award },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/ai-insights', label: 'AI Insights', icon: Brain },
  ];

  const staffLinks = [
    { to: '/staff-dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/project-review', label: 'Project Review', icon: ClipboardList },
  ];

  const activeStyle = 'bg-accent-primary/10 text-accent-primary border-l-2 border-accent-primary';
  const inactiveStyle = 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50 border-l-2 border-transparent';

  const links = user?.role === 'STAFF' ? staffLinks : studentLinks;

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

      {/* Sidebar Footer */}
      <div className="p-6 border-t border-border-subtle bg-bg-primary/20 flex items-center gap-3">
        {user?.avatar && (
          <img
            src={user.avatar}
            alt="Avatar"
            className="w-10 h-10 rounded-lg border border-accent-primary/20 object-cover bg-bg-elevated shrink-0"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-text-primary truncate">{user?.name}</span>
          {user?.username ? (
            <span className="text-[10px] text-accent-primary truncate">@{user.username}</span>
          ) : (
            <span className="text-[9px] text-text-muted truncate">{user?.email}</span>
          )}
        </div>
      </div>
    </aside>
  );
};
