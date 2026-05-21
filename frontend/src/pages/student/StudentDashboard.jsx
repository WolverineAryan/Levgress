import { useEffect, useState } from "react";
import api from "../../api/axios";
import socket from "../../socket/socket";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// SVG Icons
const LevelIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
    <path d="M2 17l10 5 10-5"></path>
    <path d="M2 12l10 5 10-5"></path>
  </svg>
);

const XPIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 8v8"></path>
    <path d="M8 12h8"></path>
  </svg>
);

const StreakIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
  </svg>
);

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
    <path d="M4 22h16"></path>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>
  </svg>
);

const ActivityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// Background Icons for animation
const CpuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
    <rect x="9" y="9" width="6" height="6"></rect>
    <line x1="9" y1="1" x2="9" y2="4"></line>
    <line x1="15" y1="1" x2="15" y2="4"></line>
    <line x1="9" y1="20" x2="9" y2="23"></line>
    <line x1="15" y1="20" x2="15" y2="23"></line>
    <line x1="20" y1="9" x2="23" y2="9"></line>
    <line x1="20" y1="14" x2="23" y2="14"></line>
    <line x1="1" y1="9" x2="4" y2="9"></line>
    <line x1="1" y1="14" x2="4" y2="14"></line>
  </svg>
);

const DatabaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);

const CodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);

const AllIcons = [CpuIcon, DatabaseIcon, CodeIcon];

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [xpHistory, setXpHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  const fetchData = async () => {
    try {
      const statsRes = await api.get("/stats/me");
      const activityRes = await api.get("/activity/feed");
      const xpRes = await api.get("/xp/me");

      setStats(statsRes.data);
      setActivity(activityRes.data);
      setXpHistory(xpRes.data);

      setCurrentStreak(statsRes.data.currentStreak || 0);
      setLongestStreak(statsRes.data.longestStreak || 0);
    } catch (err) {
      console.error("Dashboard error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    socket.on("activity-update", fetchData);
    socket.on("level-up", fetchData);
    socket.on("badge-earned", fetchData);

    socket.on("streak-update", (data) => {
      setCurrentStreak(data.currentStreak);
      setLongestStreak(data.longestStreak);
    });

    return () => {
      socket.off("activity-update");
      socket.off("level-up");
      socket.off("badge-earned");
      socket.off("streak-update");
    };
  }, []);

  if (loading || !stats) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#FFF8F0] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#C08552]/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8C5A3C]/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-10 h-10 border-3 border-[#C08552] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8C5A3C]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const xpProgress = stats.currentXP % 100;
  const userName = stats.user?.name || "Student";

  const getEngagementColor = (risk) => {
    if (risk === "CRITICAL") return "text-red-500 bg-red-500/10 border-red-500/20";
    if (risk === "STAGNATED") return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-green-500 bg-green-500/10 border-green-500/20";
  };

  return (
    <div className="relative min-h-screen bg-[#FFF8F0] overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#C08552]/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8C5A3C]/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-[#4B2E2B]/5 rounded-full blur-3xl animate-pulse-slow" />
        
        {/* Floating Icons */}
        {[...Array(30)].map((_, i) => {
          const IconComponent = AllIcons[i % AllIcons.length];
          const size = 12 + Math.random() * 24;
          return (
            <div
              key={`icon-${i}`}
              className="absolute animate-float-gentle text-[#C08552]"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${12 + Math.random() * 20}s`,
                animationDelay: `${Math.random() * 6}s`,
                opacity: 0.06 + Math.random() * 0.1,
              }}
            >
              <div style={{ width: size, height: size }}>
                <IconComponent />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-6 max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#C08552] to-[#4B2E2B] rounded-xl flex items-center justify-center shadow-md">
              <UserIcon />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#4B2E2B]">
                Welcome back, {userName.split(' ')[0]}!
              </h1>
              <p className="text-sm text-[#8C5A3C]">
                Track your progress and keep growing every day.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid - 5 cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard 
            title="Level" 
            value={stats.level} 
            icon={<LevelIcon />}
            color="from-[#C08552] to-[#8C5A3C]"
          />
          <StatCard 
            title="Total XP" 
            value={stats.currentXP} 
            icon={<XPIcon />}
            color="from-[#8C5A3C] to-[#4B2E2B]"
          />
          <StatCard 
            title="Current Streak" 
            value={`${currentStreak} days`} 
            icon={<StreakIcon />}
            color="from-[#C08552] to-[#8C5A3C]"
            highlight="text-[#C08552]"
          />
          <StatCard 
            title="Best Streak" 
            value={`${longestStreak} days`} 
            icon={<TrophyIcon />}
            color="from-[#8C5A3C] to-[#4B2E2B]"
            highlight="text-[#C08552]"
          />
          <StatCard 
            title="Engagement" 
            value={stats.engagementRisk} 
            icon={<ActivityIcon />}
            color="from-[#C08552] to-[#8C5A3C]"
            highlightClass={getEngagementColor(stats.engagementRisk)}
          />
        </div>

        {/* XP Progress Section */}
        <SectionCard title="XP Progress" icon={<XPIcon />}>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#4B2E2B]">Progress to Level {stats.level + 1}</span>
              <span className="text-[#C08552] font-medium">{xpProgress}%</span>
            </div>
            <div className="w-full bg-[#E8DCD0] rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#C08552] to-[#8C5A3C] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <p className="text-xs text-[#8C5A3C]">
              {100 - xpProgress} XP needed for next level
            </p>
          </div>
        </SectionCard>

        {/* XP Growth Chart */}
        {xpHistory.length > 0 && (
          <SectionCard title="XP Growth" icon={<ChartIcon />}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={xpHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DCD0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#8C5A3C" 
                  tick={{ fill: '#8C5A3C', fontSize: 11 }}
                />
                <YAxis 
                  stroke="#8C5A3C" 
                  tick={{ fill: '#8C5A3C', fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #C08552/30',
                    borderRadius: '8px',
                    color: '#4B2E2B'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="xp"
                  stroke="#C08552"
                  strokeWidth={3}
                  dot={{ fill: '#C08552', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#8C5A3C' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </SectionCard>
        )}

        {/* Recent Activity */}
        <SectionCard title="Recent Activity" icon={<ActivityIcon />}>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
            {activity.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#8C5A3C] text-sm">No recent activity yet</p>
                <p className="text-xs text-[#8C5A3C]/50 mt-1">Complete tasks to see your activity here</p>
              </div>
            ) : (
              activity.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="bg-white/50 backdrop-blur-sm border border-[#C08552]/20 rounded-lg p-3 text-sm text-[#4B2E2B] hover:bg-white/70 transition-all"
                >
                  <span className="text-[#C08552] font-medium">
                    {item.userId?.name || "You"}
                  </span>
                  <span className="mx-1">•</span>
                  <span>{item.message}</span>
                  <span className="text-xs text-[#8C5A3C]/50 ml-2">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(25px, -25px); }
          66% { transform: translate(-15px, 15px); }
        }
        
        @keyframes float-gentle {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.06; }
          50% { transform: translate(12px, -12px) rotate(8deg); opacity: 0.15; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.08); }
        }
        
        .animate-float-slow {
          animation: float-slow 18s ease-in-out infinite;
        }
        
        .animate-float-gentle {
          animation: float-gentle 14s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 7s ease-in-out infinite;
        }
        
        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #E8DCD0;
          border-radius: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #C08552;
          border-radius: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #8C5A3C;
        }
      `}</style>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, highlight, highlightClass }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-[#C08552]/20 rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="w-6 h-6 text-[#C08552]">
          {icon}
        </div>
        <span className="text-[10px] font-medium text-[#8C5A3C]/70 uppercase tracking-wider">
          {title}
        </span>
      </div>
      <p className={`text-xl font-bold ${highlightClass || highlight || "text-[#4B2E2B]"}`}>
        {value}
      </p>
    </div>
  );
}

// Section Card Component
function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-[#C08552]/20 rounded-xl p-5 mb-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-2 mb-5 pb-2 border-b border-[#C08552]/10">
        <div className="w-5 h-5 text-[#C08552]">
          {icon}
        </div>
        <h2 className="text-base font-semibold text-[#4B2E2B]">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}