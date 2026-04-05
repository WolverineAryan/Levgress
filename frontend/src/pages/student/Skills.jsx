import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [masterSkills, setMasterSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [level, setLevel] = useState("BEGINNER");
  const [loading, setLoading] = useState(false);

  const fetchSkills = useCallback(async () => {
    try {
      const res = await api.get("/skills/me");
      setSkills(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchMasterSkills = useCallback(async () => {
    try {
      const res = await api.get("/skills/master");
      setMasterSkills(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const addSkill = async () => {
    if (!selectedSkill) return;

    setLoading(true);
    try {
      await api.post("/skills", {
        skillId: selectedSkill,
        level,
      });

      fetchSkills();
      setSelectedSkill("");
      setLevel("BEGINNER");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const updateSkill = async (id, data) => {
    try {
      await api.put(`/skills/${id}`, data);
      fetchSkills();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchSkills();
    void fetchMasterSkills();
  }, [fetchMasterSkills, fetchSkills]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Skills</h1>

      {/* ADD SKILL */}
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

      {/* SKILLS GRID */}
      <div className="grid md:grid-cols-3 gap-6">
        {skills.map((skill) => (
          <SkillCard
            key={skill._id}
            skill={skill}
            updateSkill={updateSkill}
          />
        ))}
      </div>
    </div>
  );
}

/* ===============================
   EDITABLE SKILL CARD
================================ */

function SkillCard({ skill, updateSkill }) {
  const [editing, setEditing] = useState(false);
  const [level, setLevel] = useState(skill.level);

  const saveLevel = async () => {
    await updateSkill(skill._id, { level });
    setEditing(false);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
      
      {/* Skill Name */}
      <h3 className="text-lg font-semibold mb-3">
        {skill.skillId?.name}
      </h3>

      {/* Level */}
      {!editing ? (
        <p
          onClick={() => setEditing(true)}
          className="text-zinc-400 cursor-pointer"
        >
          Level: {skill.level}
        </p>
      ) : (
        <div className="flex gap-2">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 px-3 py-1 rounded"
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>

          <button
            onClick={saveLevel}
            className="bg-indigo-600 px-3 py-1 rounded text-sm"
          >
            Save
          </button>
        </div>
      )}

    </div>
  );
}
