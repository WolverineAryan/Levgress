import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [inputs, setInputs] = useState({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    liveUrl: "",
    githubUrl: "",
  });

  const [loading, setLoading] = useState(false);

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

      res.data.forEach((p) => {
        fetchMilestones(p._id);
      });
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
      await fetchProjects();
      setEditingId(null);
      setForm({
        title: "",
        description: "",
        liveUrl: "",
        githubUrl: "",
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const startEdit = (project) => {
    setEditingId(project._id);

    setForm({
      title: project.title,
      description: project.description,
      liveUrl: project.liveUrl || "",
      githubUrl: project.githubUrl || "",
    });
  };

  /* ---------------- UPLOAD EVIDENCE ---------------- */

  const uploadEvidence = async (milestoneId, projectId) => {
  try {
    const formData = new FormData();

    if (inputs[milestoneId]?.file) {
      formData.append("file", inputs[milestoneId].file);
    } else if (inputs[milestoneId]) {
      formData.append("evidenceUrl", inputs[milestoneId].url);
    } else {
      return alert("Please provide evidence");
    }

    await api.put(
      `/milestones/${milestoneId}/evidence`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    alert("✅ Uploaded!");

    fetchMilestones(projectId);

  } catch (err) {
    console.error(err);

    alert(
      err.response?.data?.message ||
      err.response?.data?.feedback?.join("\n") ||
      "Upload failed"
    );
  }
};

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Projects</h1>

      {/* CREATE / EDIT PROJECT */}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">
          {editingId ? "Edit Project" : "Create New Project"}
        </h2>

        <input
          type="text"
          placeholder="Project Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-lg mb-4"
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-lg mb-4"
        />

        <input
          placeholder="Live Project URL"
          value={form.liveUrl}
          onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
          className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-lg mb-4"
        />

        <input
          placeholder="GitHub Repository URL"
          value={form.githubUrl}
          onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
          className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-lg mb-4"
        />

        {editingId ? (
          <button
            onClick={updateProject}
            disabled={loading}
            className="bg-green-600 px-4 py-2 rounded-lg"
          >
            {loading ? "Updating..." : "Update Project"}
          </button>
        ) : (
          <button
            onClick={createProject}
            disabled={loading}
            className="bg-indigo-600 px-4 py-2 rounded-lg"
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
        )}
      </div>

      {/* PROJECT LIST */}

      <div className="space-y-6">
        {projects.map((project) => {
          const projectMilestones = milestones[project._id] || [];

          const completed = projectMilestones.filter(
            (m) => m.status === "COMPLETED",
          ).length;

          const progress =
            projectMilestones.length > 0
              ? Math.round((completed / projectMilestones.length) * 100)
              : 0;

          return (
            <div
              key={project._id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
            >
              {/* TITLE */}

              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">{project.title}</h3>

                <button
                  onClick={() => startEdit(project)}
                  className="text-xs bg-zinc-800 px-3 py-1 rounded"
                >
                  Edit
                </button>
              </div>

              <p className="text-sm text-zinc-400 mb-4">
                {project.description}
              </p>

              {/* LINKS */}

              <div className="flex gap-4 mb-4 text-sm">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400"
                  >
                    Live Project
                  </a>
                )}

                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-green-400"
                  >
                    GitHub Repo
                  </a>
                )}
              </div>

              {/* PROGRESS BAR */}

              <div className="mb-4">
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>

                <div className="w-full bg-zinc-700 h-2 rounded">
                  <div
                    className="bg-indigo-600 h-2 rounded"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* VIEW PROJECT */}

              <div className="mb-4">
                <Link
                  to={`/project/${project._id}`}
                  className="text-indigo-400 text-sm"
                >
                  View Project →
                </Link>
              </div>

              {/* MILESTONES */}

              <div>
                <h4 className="text-sm font-semibold mb-3">Milestones</h4>

                {projectMilestones.map((m) => (
                  <div key={m._id} className="bg-zinc-800 p-4 rounded-lg mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span>{m.title}</span>

                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          m.status === "COMPLETED"
                            ? "bg-green-600"
                            : "bg-yellow-600"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    {!m.isValidated && (
                      <div className="flex flex-col gap-2">
                        {/* URL INPUT */}
                        <input
                          type="text"
                          placeholder="Paste URL (GitHub / Live)..."
                          value={inputs[m._id]?.url || ""}
                          onChange={(e) =>
                            setInputs({
                              ...inputs,
                              [m._id]: {
                                ...inputs[m._id],
                                url: e.target.value,
                              },
                            })
                          }
                          className="bg-zinc-700 px-3 py-2 rounded text-sm"
                        />

                        {/* FILE INPUT */}
                        <input
                          type="file"
                          onChange={(e) =>
                            setInputs({
                              ...inputs,
                              [m._id]: {
                                ...inputs[m._id],
                                file: e.target.files[0],
                              },
                            })
                          }
                          className="text-sm"
                        />

                        <button
                          onClick={async () => {
                            try {
                              const formData = new FormData();

                              if (inputs[m._id]?.file) {
                                formData.append("file", inputs[m._id].file);
                              } else {
                                formData.append(
                                  "evidence",
                                  JSON.stringify({
                                    type: "url",
                                    value: inputs[m._id]?.url,
                                  }),
                                );
                              }

                              await api.put(
                                `/milestones/${m._id}/evidence`,
                                formData,
                                {
                                  headers: {
                                    "Content-Type": "multipart/form-data",
                                  },
                                },
                              );

                              alert("✅ Uploaded!");

                              fetchMilestones(project._id);
                            } catch (err) {
                              alert("❌ Upload failed");
                            }
                          }}
                          className="bg-indigo-600 px-3 py-2 rounded text-sm"
                        >
                          Upload Evidence
                        </button>
                      </div>
                    )}

                    {m.isValidated && (
                      <p className="text-green-400 text-xs mt-2">
                        ✅ Completed via AI
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}