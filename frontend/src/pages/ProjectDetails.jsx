import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const ProjectDetails = () => {
  const { projectId } = useParams();

  const [milestones, setMilestones] = useState([]);
  const [inputs, setInputs] = useState({});

  const token = localStorage.getItem("token");

  const fetchMilestones = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/milestones/${projectId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    setMilestones(res.data);
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  const handleChange = (id, value) => {
    setInputs({ ...inputs, [id]: value });
  };

  const uploadEvidence = async (milestoneId) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/milestones/${milestoneId}/evidence`,
        {
          evidenceUrl: inputs[milestoneId]
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("✅ Milestone completed!");

      fetchMilestones();

    } catch (err) {
      alert(
        err.response?.data?.feedback?.join("\n") ||
        "❌ Validation failed"
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Project Milestones</h1>

      {milestones.map((m) => (
        <div
          key={m._id}
          className="bg-white p-4 rounded-xl shadow"
        >
          <h2 className="font-semibold">{m.title}</h2>

          <p className="text-sm text-gray-500">
            Status:{" "}
            <span
              className={
                m.status === "COMPLETED"
                  ? "text-green-600"
                  : "text-yellow-600"
              }
            >
              {m.status}
            </span>
          </p>

          {!m.isValidated && (
            <div className="mt-3 space-y-2">
              <input
                type="text"
                placeholder="Paste evidence link..."
                className="border p-2 w-full rounded"
                value={inputs[m._id] || ""}
                onChange={(e) =>
                  handleChange(m._id, e.target.value)
                }
              />

              <button
                onClick={() => uploadEvidence(m._id)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Upload Evidence
              </button>
            </div>
          )}

          {m.isValidated && (
            <p className="text-green-600 mt-2">
              ✅ Completed via AI validation
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProjectDetails;