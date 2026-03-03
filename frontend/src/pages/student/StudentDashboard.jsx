import { useEffect, useState } from "react";
import api from "../../api/axios";
import socket from "../../socket/socket";

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

  const fetchData = async () => {
    try {
      const statsRes = await api.get("/stats/me");
      const activityRes = await api.get("/activity/feed");
      const xpRes = await api.get("/xp/me");

      setStats(statsRes.data);
      setActivity(activityRes.data);
      setXpHistory(xpRes.data);
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

    return () => {
      socket.off("activity-update");
      socket.off("level-up");
      socket.off("badge-earned");
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
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <h1 className="text-2xl font-semibold mb-6">Student Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card title="Level">{stats.level}</Card>
        <Card title="XP">{stats.currentXP}</Card>
        <Card title="Skills Learned">{stats.learnedSkillsCount}</Card>
        <Card title="Projects Completed">
          {stats.completedProjectsCount}
        </Card>
      </div>

      {/* XP Progress Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">XP Progress</h2>

        <div className="w-full bg-zinc-800 h-4 rounded-full">
          <div
            className="bg-indigo-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${xpProgress}%` }}
          />
        </div>

        <p className="text-sm mt-3 text-zinc-400">
          {xpProgress} XP toward next level
        </p>
      </div>

      {/* XP Growth Chart */}
      {xpHistory.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-medium mb-4">
            XP Growth Over Time
          </h2>

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
        </div>
      )}

      {/* Activity Feed */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-medium mb-4">
          Recent Activity
        </h2>

        <div className="space-y-3 max-h-80 overflow-y-auto">
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
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-zinc-800 p-4 rounded-xl">
      <p className="text-sm text-zinc-400">{title}</p>
      <p className="text-2xl font-semibold mt-2">{children}</p>
    </div>
  );
}