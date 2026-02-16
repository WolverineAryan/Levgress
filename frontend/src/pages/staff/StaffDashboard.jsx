import { useEffect, useState } from "react";
import api from "../../api/axios";
import LevelChart from "../../components/analytics/LevelChart";

export default function StaffDashboard() {
  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");
  const [batchAnalytics, setBatchAnalytics] = useState(null);
  const [deptAnalytics, setDeptAnalytics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [studentAnalytics, setStudentAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      const res = await api.get("/alerts/stagnation");
      setAlerts(res.data);
    } catch (err) {
      console.error("Alert fetch error", err);
    }
  };

  const fetchBatchAnalytics = async () => {
    if (!batch) return;
    setLoading(true);
    try {
      const res = await api.get(`/analytics/batch/${batch}`);
      setBatchAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchDeptAnalytics = async () => {
    if (!department) return;
    setLoading(true);
    try {
      const res = await api.get(`/analytics/department/${department}`);
      setDeptAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchStudentAnalytics = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    try {
      const res = await api.get(`/analytics/student/${selectedStudent}`);
      setStudentAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };
  {batchAnalytics?.levelDistribution && (
    <LevelChart data={batchAnalytics.levelDistribution} />
)}

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-3xl font-semibold mb-8">Staff Dashboard</h1>

      {/* ALERT SECTION */}
      <Section title="Stagnation Alerts">
        <div className="space-y-3">
          {alerts.length === 0 && (
            <p className="text-zinc-500">No active alerts</p>
          )}

          {alerts.map((alert) => (
            <div
              key={alert._id}
              className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between"
            >
              <div>
                <p className="font-medium">
                  {alert.studentId?.name}
                </p>
                <p className="text-sm text-zinc-400">
                  {alert.level} - {alert.daysInactive} days inactive
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs ${
                  alert.level === "CRITICAL"
                    ? "bg-red-500/20 text-red-400"
                    : alert.level === "STAGNATED"
                    ? "bg-orange-500/20 text-orange-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {alert.level}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* BATCH ANALYTICS */}
      <Section title="Batch Analytics">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Enter batch (e.g. 2023-2027)"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
          />
          <button
            onClick={fetchBatchAnalytics}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg"
          >
            Load
          </button>
        </div>

        {batchAnalytics && (
          <AnalyticsCard data={batchAnalytics} />
        )}
      </Section>

      {/* DEPARTMENT ANALYTICS */}
      <Section title="Department Analytics">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Enter department (e.g. CSE)"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
          />
          <button
            onClick={fetchDeptAnalytics}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg"
          >
            Load
          </button>
        </div>

        {deptAnalytics && (
          <AnalyticsCard data={deptAnalytics} />
        )}
      </Section>

      {/* STUDENT ANALYTICS */}
      <Section title="Student Analytics">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Enter student ID"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
          />
          <button
            onClick={fetchStudentAnalytics}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg"
          >
            Load
          </button>
        </div>

        {studentAnalytics && (
          <AnalyticsCard data={studentAnalytics} />
        )}
      </Section>

      {loading && (
        <p className="text-zinc-400 mt-4">Loading...</p>
      )}
    </div>
  );
}

/* Reusable Section */
function Section({ title, children }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
      <h2 className="text-xl font-medium mb-4">{title}</h2>
      {children}
    </div>
  );
}

/* Analytics Card */
function AnalyticsCard({ data }) {
  return (
    <div className="grid md:grid-cols-3 gap-6 mt-4">
      {Object.entries(data).map(([key, value]) => (
        <div
          key={key}
          className="bg-zinc-800 p-4 rounded-xl"
        >
          <p className="text-sm text-zinc-400 capitalize">
            {key}
          </p>
          <p className="text-lg font-semibold mt-2">
            {String(value)}
          </p>
        </div>
      ))}
    </div>
  );
}