import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    liveUrl: "",
    githubUrl: "",
  });

  /* ---------------- FETCH MILESTONES ---------------- */

  const fetchMilestones = useCallback(async (projectId) => {
    try {
      const res = await api.get(`/milestones/${projectId}`);

      setMilestones((prev) => ({
        ...prev,
        [projectId]: res.data,
      }));
    } catch (err) {
      console.error(err);
    }
  }, []);

  /* ---------------- FETCH PROJECTS ---------------- */

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get("/projects/me");
      setProjects(res.data);

      res.data.forEach((p) => fetchMilestones(p._id));
    } catch (err) {
      console.error(err);
    }
  }, [fetchMilestones]);

  /* ---------------- CREATE PROJECT ---------------- */

  const createProject = async () => {
    if (!form.title) return;

    setLoading(true);

    try {
      await api.post("/projects", form);

      setForm({
        title: "",
        description: "",
        liveUrl: "",
        githubUrl: "",
      });

      fetchProjects();
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  /* ---------------- UPDATE PROJECT ---------------- */

  const updateProject = async () => {
    if (!editingId) return;

    setLoading(true);

    try {
      await api.put(`/projects/${editingId}`, form);
      fetchProjects();
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  /* ---------------- UPLOAD EVIDENCE (FIXED) ---------------- */

  const uploadEvidence = async (milestoneId, projectId) => {
    try {
      const formData = new FormData();
      const input = inputs[milestoneId];

      if (input?.file) {
        formData.append("file", input.file);
      } else if (input?.url) {
        formData.append("evidenceUrl", input.url);
      } else {
        return alert("Provide file or URL");
      }

      await api.put(`/milestones/${milestoneId}/evidence`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Milestone completed");

      fetchMilestones(projectId);

      // clear input
      setInputs((prev) => ({
        ...prev,
        [milestoneId]: {},
      }));

    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    }
  };

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Projects</h1>

      {/* CREATE / EDIT */}

      <div className="bg-zinc-900 p-6 rounded-2xl mb-8">
        <h2 className="mb-4">
          {editingId ? "Edit Project" : "Create Project"}
        </h2>

        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          className="w-full mb-3 p-2 bg-zinc-800 rounded"
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className="w-full mb-3 p-2 bg-zinc-800 rounded"
        />

        <input
          placeholder="Live URL"
          value={form.liveUrl}
          onChange={(e) =>
            setForm({ ...form, liveUrl: e.target.value })
          }
          className="w-full mb-3 p-2 bg-zinc-800 rounded"
        />

        <input
          placeholder="GitHub URL"
          value={form.githubUrl}
          onChange={(e) =>
            setForm({ ...form, githubUrl: e.target.value })
          }
          className="w-full mb-3 p-2 bg-zinc-800 rounded"
        />

        <button
          onClick={editingId ? updateProject : createProject}
          className="bg-indigo-600 px-4 py-2 rounded"
        >
          {loading ? "Loading..." : editingId ? "Update" : "Create"}
        </button>
      </div>

      {/* PROJECTS */}

      {projects.map((project) => {
        const projectMilestones = milestones[project._id] || [];

        const progress = Math.round(
          (projectMilestones.filter((m) => m.status === "COMPLETED").length /
            5) *
            100
        );

        return (
          <div key={project._id} className="bg-zinc-900 p-6 rounded mb-6">
            <h3 className="text-lg">{project.title}</h3>

            {/* PROGRESS */}
            <div className="mb-4 text-sm">{progress}% complete</div>

            {/* MILESTONES */}

            {projectMilestones.map((m) => (
              <div key={m._id} className="bg-zinc-800 p-4 mb-3 rounded">
                <div className="flex justify-between">
                  <span>{m.title}</span>
                  <span>
                    {m.status === "COMPLETED" ? "✅" : "⏳"}
                  </span>
                </div>

                {!m.isValidated && (
                  <div className="mt-2 space-y-2">
                    <input
                      placeholder="URL"
                      value={inputs[m._id]?.url || ""}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          [m._id]: {
                            ...prev[m._id],
                            url: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-2 bg-zinc-700 rounded"
                    />

                    <input
                      type="file"
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          [m._id]: {
                            ...prev[m._id],
                            file: e.target.files[0],
                          },
                        }))
                      }
                    />

                    <button
                      onClick={() =>
                        uploadEvidence(m._id, project._id)
                      }
                      className="bg-indigo-600 px-3 py-2 rounded w-full"
                    >
                      Upload Evidence
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}