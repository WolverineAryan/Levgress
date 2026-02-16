import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [masterSkills, setMasterSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [level, setLevel] = useState("BEGINNER");
  const [loading, setLoading] = useState(false);

  const fetchSkills = async () => {
    try {
      const res = await api.get("/skills/me");
      setSkills(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMasterSkills = async () => {
    try {
      const res = await api.get("/skills/master");
      setMasterSkills(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addSkill = async () => {
    if (!selectedSkill) return;

    setLoading(true);
    try {
      await api.post("/skills", {
        skillId: selectedSkill,
        level
      });

      fetchSkills();
      setSelectedSkill("");
      setLevel("BEGINNER");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const updateSkill = async (id, newLevel) => {
    try {
      await api.put(`/skills/${id}`, { level: newLevel });
      fetchSkills();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSkills();
    fetchMasterSkills();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Skills</h1>

      {/* ADD SKILL SECTION */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">Add Skill</h2>

        <div className="flex gap-4">
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-lg"
          >
            <option value="">Select Skill</option>
            {masterSkills.map((skill) => (
              <option key={skill._id} value={skill._id}>
                {skill.name}
              </option>
            ))}
          </select>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-lg"
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>

          <button
            onClick={addSkill}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>

      {/* SKILL LIST */}
      <div className="grid md:grid-cols-2 gap-6">
        {skills.map((skill) => (
          <div
            key={skill._id}
            className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl"
          >
            <h3 className="font-semibold text-lg mb-2">
              {skill.skillId?.name}
            </h3>

            <p className="text-sm text-zinc-400 mb-4">
              Current Level: {skill.level}
            </p>

            <div className="flex gap-3">
              {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => updateSkill(skill._id, lvl)}
                  className={`px-3 py-1 rounded-lg text-xs ${
                    skill.level === lvl
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
