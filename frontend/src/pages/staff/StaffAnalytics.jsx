import { useEffect, useState } from "react";
import api from "../../api/axios";
import LevelChart from "../../components/analytics/LevelChart";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#ef4444"];

export default function StaffAnalytics() {
  const [overview, setOverview] = useState(null);
  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");
  const [batchData, setBatchData] = useState(null);
  const [deptData, setDeptData] = useState(null);
  const [loading, setLoading] = useState(false);

  /* =========================
     FETCH OVERVIEW
  ========================== */
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get("/analytics/overview");
        setOverview(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOverview();
  }, []);

  /* =========================
     FETCH BATCH
  ========================== */
  const loadBatch = async () => {
    if (!batch) return;
    setLoading(true);
    try {
      const res = await api.get(`/analytics/batch/${batch}`);
      setBatchData(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  /* =========================
     FETCH DEPARTMENT
  ========================== */
  const loadDept = async () => {
    if (!department) return;
    setLoading(true);
    try {
      const res = await api.get(`/analytics/department/${department}`);
      setDeptData(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 space-y-10">
      <h1 className="text-3xl font-semibold">Analytics Dashboard</h1>

      {/* =========================
         OVERVIEW SECTION
      ========================== */}
      {overview && (
        <>
          <div className="grid md:grid-cols-4 gap-6">
            <StatCard title="Total Students" value={overview.totalStudents} />
            <StatCard title="Average Level" value={overview.avgLevel} />
            <StatCard
              title="Completed Projects"
              value={overview.projectStatus.completed}
            />
            <StatCard
              title="Pending Projects"
              value={overview.projectStatus.pending}
            />
          </div>

          {/* Level Distribution */}
          <Section title="Level Distribution">
            <LevelChart data={overview.levelDistribution} />
          </Section>

          {/* Project Status Pie */}
          <Section title="Project Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    {
                      name: "Completed",
                      value: overview.projectStatus.completed,
                    },
                    {
                      name: "Pending",
                      value: overview.projectStatus.pending,
                    },
                    {
                      name: "Rejected",
                      value: overview.projectStatus.rejected,
                    },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                >
                  {COLORS.map((color, index) => (
                    <Cell key={index} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Section>
        </>
      )}

      {/* =========================
         BATCH ANALYTICS
      ========================== */}
      <Section title="Batch Analytics">
        <InputLoader
          value={batch}
          setValue={setBatch}
          placeholder="Enter batch (e.g. 2023-2027)"
          onClick={loadBatch}
        />

        {batchData && (
          <>
            <AnalyticsCard data={batchData} />
            {batchData.levelDistribution && (
              <LevelChart data={batchData.levelDistribution} />
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
          onClick={loadDept}
        />

        {deptData && (
          <>
            <AnalyticsCard data={deptData} />
            {deptData.levelDistribution && (
              <LevelChart data={deptData.levelDistribution} />
            )}
          </>
        )}
      </Section>

      {loading && <p className="text-zinc-400">Loading...</p>}
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
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
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
          <p className="text-sm text-zinc-400 capitalize">{key}</p>
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
