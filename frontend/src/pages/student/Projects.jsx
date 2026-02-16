import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    title: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects/me");
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createProject = async () => {
    if (!newProject.title) return;

    setLoading(true);
    try {
      await api.post("/projects", newProject);
      setNewProject({ title: "", description: "" });
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const updateProgress = async (id, progress) => {
    try {
      await api.put(`/projects/${id}/progress`, { progress });
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Projects</h1>

      {/* CREATE PROJECT */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">Create New Project</h2>

        <input
          type="text"
          placeholder="Project Title"
          value={newProject.title}
          onChange={(e) =>
            setNewProject({ ...newProject, title: e.target.value })
          }
          className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-lg mb-4"
        />

        <textarea
          placeholder="Description"
          value={newProject.description}
          onChange={(e) =>
            setNewProject({ ...newProject, description: e.target.value })
          }
          className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-lg mb-4"
        />

        <button
          onClick={createProject}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg"
        >
          {loading ? "Creating..." : "Create Project"}
        </button>
      </div>

      {/* PROJECT LIST */}
      <div className="space-y-6">
        {projects.map((project) => (
          <div
            key={project._id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">
                {project.title}
              </h3>

              <span
                className={`px-3 py-1 rounded-full text-xs ${
                  project.status === "COMPLETED"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {project.status}
              </span>
            </div>

            <p className="text-sm text-zinc-400 mb-4">
              {project.description}
            </p>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-2 bg-zinc-800 rounded-full">
                <div
                  className="h-2 bg-indigo-600 rounded-full transition-all"
                  style={{ width: `${project.progress || 0}%` }}
                />
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {project.progress || 0}% Complete
              </p>
            </div>

            {/* Progress Controls */}
            {project.status !== "COMPLETED" && (
              <div className="flex gap-3">
                {[25, 50, 75, 100].map((value) => (
                  <button
                    key={value}
                    onClick={() =>
                      updateProgress(project._id, value)
                    }
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs"
                  >
                    {value}%
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
