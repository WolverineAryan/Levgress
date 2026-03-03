import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get("/leaderboard");
        setLeaders(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <h1 className="text-2xl font-semibold mb-6">Leaderboard</h1>

      <div className="space-y-4">
        {leaders.map((student, index) => (
          <div
            key={student._id}
            className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center"
          >
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold w-6">
                {index + 1}
              </span>
              <div>
                <p className="font-medium">{student.name}</p>
                <p className="text-sm text-zinc-400">
                  Level {student.level}
                </p>
              </div>
            </div>

            <div className="text-indigo-400 font-semibold">
              {student.xp} XP
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}