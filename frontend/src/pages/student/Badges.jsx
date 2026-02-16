import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Badges() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBadges = async () => {
    try {
      const res = await api.get("/badges/me");
      setBadges(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  if (loading) {
    return <p className="text-zinc-400">Loading badges...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Badges</h1>

      {badges.length === 0 && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl text-zinc-400">
          No badges earned yet.
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {badges.map((badge) => (
          <div
            key={badge._id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {badge.badgeId?.name}
              </h3>

              <p className="text-sm text-zinc-400 mb-4">
                {badge.badgeId?.description}
              </p>
            </div>

            <div className="flex justify-between items-center text-xs text-zinc-500">
              <span className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full">
                {badge.badgeId?.category}
              </span>

              <span>
                {new Date(badge.earnedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
