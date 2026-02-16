import { useEffect, useState } from "react";
import api from "../../api/axios";
import socket from "../../socket/socket";

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const statsRes = await api.get("/stats/me");
      const activityRes = await api.get("/activity/feed");

      setStats(statsRes.data);
      setActivity(activityRes.data);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <h1 className="text-2xl font-semibold mb-6">Student Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">

        <Card title="Level">
          {stats.level}
        </Card>

        <Card title="XP">
          {stats.currentXP}
        </Card>

        <Card title="Skills Learned">
          {stats.learnedSkillsCount}
        </Card>

        <Card title="Projects Completed">
          {stats.completedProjectsCount}
        </Card>

      </div>

      {/* Activity Feed */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-medium mb-4">Recent Activity</h2>

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
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <p className="text-zinc-400 text-sm">{title}</p>
      <p className="text-2xl font-semibold mt-2">{children}</p>
    </div>
  );
}
