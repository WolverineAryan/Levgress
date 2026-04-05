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
  const [analytics, setAnalytics] = useState(null);

  /* =========================
     OVERVIEW ANALYTICS
  ========================== */
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/analytics/overview");
        setAnalytics(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAnalytics();
  }, []);

  /* =========================
     ALERTS
  ========================== */
  const fetchAlerts = async () => {
    try {
      const res = await api.get("/alerts/stagnation");
      setAlerts(res.data);
    } catch (err) {
      console.error("Alert fetch error", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAlerts();
  }, []);

  /* =========================
     BATCH ANALYTICS
  ========================== */
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

  /* =========================
     DEPARTMENT ANALYTICS
  ========================== */
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

  /* =========================
     STUDENT ANALYTICS
  ========================== */
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 space-y-10">
      <h1 className="text-3xl font-semibold">Staff Dashboard</h1>

      {/* =========================
         OVERVIEW SECTION
      ========================== */}
      {analytics && (
        <Section title="Platform Overview">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Students" value={analytics.totalStudents} />
            <StatCard title="Average Level" value={analytics.avgLevel} />
            <StatCard
              title="Completed Projects"
              value={analytics.projectStatus?.completed}
            />
          </div>

          {analytics.levelDistribution && (
            <LevelChart data={analytics.levelDistribution} />
          )}
        </Section>
      )}

      {/* =========================
         STAGNATION ALERTS
      ========================== */}
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

      {/* =========================
         BATCH ANALYTICS
      ========================== */}
      <Section title="Batch Analytics">
        <InputLoader
          value={batch}
          setValue={setBatch}
          placeholder="Enter batch (e.g. 2023-2027)"
          onClick={fetchBatchAnalytics}
        />

        {batchAnalytics && (
          <>
            <AnalyticsCard data={batchAnalytics} />
            {batchAnalytics.levelDistribution && (
              <LevelChart data={batchAnalytics.levelDistribution} />
            )}
          </>
        )}
      </Section>

      {/* =========================
         DEPARTMENT ANALYTICS
      ========================== */}
      <Section title="Department Analytics">
        <InputLoader
          value={department}
          setValue={setDepartment}
          placeholder="Enter department (e.g. CSE)"
          onClick={fetchDeptAnalytics}
        />

        {deptAnalytics && (
          <>
            <AnalyticsCard data={deptAnalytics} />
            {deptAnalytics.levelDistribution && (
              <LevelChart data={deptAnalytics.levelDistribution} />
            )}
          </>
        )}
      </Section>

      {/* =========================
         STUDENT ANALYTICS
      ========================== */}
      <Section title="Student Analytics">
        <InputLoader
          value={selectedStudent}
          setValue={setSelectedStudent}
          placeholder="Enter student ID"
          onClick={fetchStudentAnalytics}
        />

        {studentAnalytics && (
          <AnalyticsCard data={studentAnalytics} />
        )}
      </Section>

      {loading && (
        <p className="text-zinc-400">Loading...</p>
      )}
    </div>
  );
}

/* =========================
   REUSABLE COMPONENTS
========================= */

function Section({ title, children }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h2 className="text-xl font-medium mb-6">{title}</h2>
      {children}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-zinc-800 p-6 rounded-xl">
      <p className="text-sm text-zinc-400">{title}</p>
      <p className="text-2xl font-semibold mt-2">{value}</p>
    </div>
  );
}

function InputLoader({ value, setValue, placeholder, onClick }) {
  return (
    <div className="flex gap-4 mb-4">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 flex-1"
      />
      <button
        onClick={onClick}
        className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg"
      >
        Load
      </button>
    </div>
  );
}

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
            {typeof value === "object"
              ? JSON.stringify(value)
              : String(value)}
          </p>
        </div>
      ))}
    </div>
  );
}
