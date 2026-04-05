import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState({});
  const [editingId, setEditingId] = useState(null);

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
        void fetchMilestones(p._id);
      });
    } catch (err) {
      console.error(err);
    }
  }, [fetchMilestones]);

  /* ---------------- ADD MILESTONE ---------------- */

  const addMilestone = async (projectId, title) => {
    if (!title) return;

    try {
      await api.post(`/milestones/${projectId}`, { title });

      fetchMilestones(projectId);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- COMPLETE MILESTONE ---------------- */

  const completeMilestone = async (milestoneId, projectId) => {
    try {
      const res = await api.put(`/milestones/${milestoneId}/complete`);

      fetchMilestones(projectId);

      /* Badge notification */

      if (res.data.badge) {
        alert(`🏆 Badge Unlocked: ${res.data.badge.title}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  /* ---------------- UPDATE PROGRESS ---------------- */

  const updateProgress = async (id, progress) => {
    try {
      await api.put(`/projects/${id}/progress`, {
        progress: Number(progress),
      });

      setProjects((prev) =>
        prev.map((p) => (p._id === id ? { ...p, progress } : p)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchProjects();
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
        {projects.map((project) => (
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

            <p className="text-sm text-zinc-400 mb-4">{project.description}</p>

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

            {/* PROGRESS */}

            <div className="mb-4">
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Progress</span>
                <span>{project.progress || 0}%</span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={project.progress || 0}
                onChange={(e) => updateProgress(project._id, e.target.value)}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* MILESTONES */}

            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Milestones</h4>

              {(milestones[project._id] || []).map((m) => (
                <div
                  key={m._id}
                  className="flex justify-between items-center text-sm bg-zinc-800 p-2 rounded mb-2"
                >
                  <span>{m.title}</span>

                  {m.status !== "COMPLETED" ? (
                    <button
                      onClick={() => completeMilestone(m._id, project._id)}
                      className="bg-green-600 text-xs px-2 py-1 rounded"
                    >
                      Complete
                    </button>
                  ) : (
                    <span className="text-xs text-green-400">Completed</span>
                  )}
                </div>
              ))}

              {/* ADD MILESTONE */}

              <input
                placeholder="Add milestone..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addMilestone(project._id, e.target.value);
                    e.target.value = "";
                  }
                }}
                className="bg-zinc-800 px-3 py-2 rounded w-full mt-2"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
