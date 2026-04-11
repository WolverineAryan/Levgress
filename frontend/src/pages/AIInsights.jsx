import { useEffect, useState } from "react";
import axios from "axios";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

const AIInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/ai-insights", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setData(res.data);
    } catch (err) {
      console.error("Error fetching insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) return <div className="p-6">Loading AI Insights...</div>;

  if (!data) return <div>Loading...</div>;

  {data.summary === "No activity yet" ? (
  <div className="p-6 text-gray-500">
    No activity yet. Complete some milestones to generate AI insights.
  </div>
) : (
  <>
    {/* show actual UI */}
  </>
)}

  return (
    <div className="p-6 space-y-6">
      {/* 🧠 Summary */}
      <div className="bg-white shadow rounded-2xl p-5">
        <h2 className="text-xl font-semibold mb-2">AI Summary</h2>
        <p className="text-gray-600">{data.summary}</p>
      </div>
      <div className="bg-white shadow rounded-2xl p-5">
        <h2 className="text-lg font-semibold mb-4">Skill Overview</h2>

        <ResponsiveContainer width="100%" height={250}>
          <RadarChart
            data={[
              { subject: "Frontend", value: 80 },
              { subject: "Backend", value: 60 },
              { subject: "UI", value: 50 },
              { subject: "Testing", value: 40 },
            ]}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <Radar dataKey="value" />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 💪 Strengths */}
      <div className="bg-green-50 shadow rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-green-700 mb-2">Strengths</h2>
        <ul className="list-disc ml-5 text-green-600">
          {data.strengths.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      {/* ⚠️ Weaknesses */}
      <div className="bg-red-50 shadow rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-red-700 mb-2">Weaknesses</h2>
        <ul className="list-disc ml-5 text-red-600">
          {data.weaknesses.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      </div>

      {/* 🎯 Suggestions */}
      <div className="bg-blue-50 shadow rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-blue-700 mb-2">
          Suggestions
        </h2>
        <ul className="list-disc ml-5 text-blue-600">
          {data.suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AIInsights;
