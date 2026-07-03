import { useState, useEffect, useRef } from 'react';
import { Bell, LogOut, Check, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import * as notificationsApi from '../../api/notifications';
import { timeAgo } from '../../utils/date';
import { cn } from '../../utils/classnames';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsApi.getNotifications(1, 5);
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [
        notification,
        ...(Array.isArray(prev) ? prev : []).slice(0, 4)
      ]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="h-16 border-b border-border-subtle bg-bg-secondary/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      <div className="flex items-center gap-2.5">
        <img src="/logo.png" alt="Levgress Mascot Logo" className="w-7 h-7 object-contain" />
        <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-accent-primary to-accent-hover bg-clip-text text-transparent">
          LEVGRESS
        </h1>
        <span className="text-[10px] font-bold border border-border-primary/50 text-accent-primary px-1.5 py-0.5 rounded">
          v2.0
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-bg-elevated transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Notifications Bell */}
        {user?.role === 'STUDENT' && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-bg-elevated transition-colors cursor-pointer relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-accent-primary text-[9px] font-black text-bg-primary rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-bg-card border border-border-primary rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-border-subtle flex justify-between items-center bg-bg-secondary">
                  <span className="text-xs font-bold text-text-primary">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-accent-primary hover:underline font-semibold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-text-muted">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={cn(
                          "p-3 border-b border-border-subtle flex justify-between items-start gap-2 transition-colors",
                          !n.isRead ? "bg-accent-primary/[0.02] hover:bg-accent-primary/[0.04]" : "hover:bg-bg-elevated"
                        )}
                      >
                        <div className="flex flex-col space-y-1">
                          <p className={cn("text-xs text-text-primary leading-relaxed", !n.isRead && "font-semibold")}>
                            {n.message}
                          </p>
                          <span className="text-[9px] text-text-muted">{timeAgo(n.createdAt)}</span>
                        </div>
                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(n._id)}
                            className="p-1 text-text-muted hover:text-accent-primary rounded hover:bg-bg-elevated transition-colors cursor-pointer"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
