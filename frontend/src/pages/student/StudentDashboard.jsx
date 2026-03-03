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

      // ✅ Load streak from stats
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
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        Loading...
      </div>
    );
  }

  const xpProgress = stats.currentXP % 100;

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-8 py-6">

  {/* Page Header */}
  <div className="mb-8">
    <h1 className="text-3xl font-bold">Welcome Back 👋</h1>
    <p className="text-zinc-400 mt-1">
      Track your progress and keep growing every day.
    </p>
  </div>

  {/* Top Stats Grid */}
  <div className="grid md:grid-cols-4 gap-6 mb-10">
    <StatCard title="Level" value={stats.level} />
    <StatCard title="XP" value={stats.currentXP} />
    <StatCard title="🔥 Streak" value={`${currentStreak} days`} />
    <StatCard
      title="Engagement"
      value={stats.engagementRisk}
      highlight={
        stats.engagementRisk === "CRITICAL"
          ? "text-red-500"
          : stats.engagementRisk === "STAGNATED"
          ? "text-yellow-400"
          : "text-green-400"
      }
    />
  </div>

  {/* XP Progress Section */}
  <SectionCard title="XP Progress">
    <div className="w-full bg-zinc-800 h-4 rounded-full">
      <div
        className="bg-indigo-600 h-4 rounded-full transition-all duration-500"
        style={{ width: `${stats.currentXP % 100}%` }}
      />
    </div>
    <p className="text-sm text-zinc-400 mt-3">
      {stats.currentXP % 100} XP toward next level
    </p>
  </SectionCard>

  {/* XP Growth Chart */}
  {xpHistory.length > 0 && (
    <SectionCard title="XP Growth Over Time">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={xpHistory}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="xp"
            stroke="#6366f1"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </SectionCard>
  )}

  {/* Recent Activity */}
  <SectionCard title="Recent Activity">
    <div className="space-y-3 max-h-72 overflow-y-auto">
      {activity.map((item) => (
        <div
          key={item._id}
          className="bg-zinc-800 p-3 rounded-lg text-sm text-zinc-300"
        >
          <span className="text-indigo-400 font-medium">
            {item.userId?.name}
          </span>{" "}
          {item.message}
        </div>
      ))}
    </div>
  </SectionCard>

</div>
  );
}


function StatCard({ title, value, highlight }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
      <p className="text-sm text-zinc-400">{title}</p>
      <p className={`text-2xl font-bold mt-2 ${highlight || ""}`}>
        {value}
      </p>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-10">
      <h2 className="text-lg font-semibold mb-6">{title}</h2>
      {children}
    </div>
  );
}