import { useEffect, useState } from "react";
import api from "../../api/axios";
import ProjectComments from "../../components/projects/ProjectComments";

export default function ProjectReview() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [rejectModal, setRejectModal] = useState({
    open: false,
    projectId: null,
  });
  const [rejectReason, setRejectReason] = useState("");

  // Fetch projects of selected student
  const fetchProjects = async (studentId) => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/student/${studentId}`);
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const approveProject = async (id) => {
    try {
      await api.post(`/projects/${id}/complete`);
      fetchProjects(selectedStudent._id);
    } catch (err) {
      console.error(err);
    }
  };

  const submitReject = async () => {
    if (!rejectReason) return;

    try {
      await api.post(`/projects/${rejectModal.projectId}/reject`, {
        reason: rejectReason,
      });

      setRejectModal({ open: false, projectId: null });
      setRejectReason("");
      fetchProjects(selectedStudent._id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const res = await api.get("/users/students");
        setStudents(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    void loadStudents();
  }, []);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Project Approval</h1>

      {/* Student Search */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-8">
        <input
          type="text"
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-lg mb-4"
        />

        <div className="max-h-48 overflow-y-auto space-y-2">
          {filteredStudents.map((student) => (
            <div
              key={student._id}
              onClick={() => {
                setSelectedStudent(student);
                fetchProjects(student._id);
              }}
              className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer"
            >
              <p className="font-medium">{student.name}</p>
              <p className="text-xs text-zinc-400">
                {student.batch} • {student.department}
              </p>
            </div>
          ))}
        </div>
      </div>

      {selectedStudent && (
        <div className="mb-4 text-zinc-400">
          Viewing projects for{" "}
          <span className="text-white font-medium">
            {selectedStudent.name}
          </span>
        </div>
      )}

      {loading && <p>Loading...</p>}

      {/* Projects */}
      <div className="space-y-6">
        {projects.map((project) => (
          <div
            key={project._id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
          >
            {/* Header */}
            <div className="flex justify-between mb-3">
              <h3 className="text-lg font-semibold">
                {project.title}
              </h3>

              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  project.status === "COMPLETED"
                    ? "bg-green-500/20 text-green-400"
                    : project.status === "REJECTED"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {project.status}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-400 mb-4">
              {project.description}
            </p>

            {/* Rejection Reason */}
            {project.rejectionReason && (
              <div className="mb-4 text-red-400 text-sm">
                Reason: {project.rejectionReason}
              </div>
            )}

            {/* Actions */}
            {project.status !== "COMPLETED" && (
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => approveProject(project._id)}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
                >
                  Approve
                </button>

                <button
                  onClick={() =>
                    setRejectModal({
                      open: true,
                      projectId: project._id,
                    })
                  }
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                >
                  Reject
                </button>
              </div>
            )}

            {/* Comments */}
            <div className="mt-6 border-t border-zinc-800 pt-4">
              <ProjectComments projectId={project._id} />
            </div>
          </div>
        ))}
      </div>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-2xl w-96">
            <h2 className="text-lg font-semibold mb-4">
              Reject Project
            </h2>

            <textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-lg mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setRejectModal({ open: false, projectId: null })
                }
                className="px-4 py-2 bg-zinc-700 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={submitReject}
                className="px-4 py-2 bg-red-600 rounded-lg"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
