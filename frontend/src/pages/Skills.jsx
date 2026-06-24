import { useState, useEffect } from 'react';
import * as studentsApi from '../api/students';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../components/ui';
import { RadarChart } from '../components/charts';
import { Code, Plus, Database, Cpu, Layout, Server, X } from 'lucide-react';

const CATEGORY_ICONS = {
  Frontend: Layout,
  Backend: Server,
  Database: Database,
  DevOps: Cpu,
};

const MASTER_SKILLS_OPTIONS = [
  { name: 'React', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Frontend' },
  { name: 'HTML & CSS', category: 'Frontend' },
  { name: 'TypeScript', category: 'Frontend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Express', category: 'Backend' },
  { name: 'Python', category: 'Backend' },
  { name: 'Go', category: 'Backend' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'Redis', category: 'Database' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'Git', category: 'DevOps' },
  { name: 'AWS', category: 'DevOps' },
  { name: 'CI/CD Pipelines', category: 'DevOps' },
];

export const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Skill Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSkillIdx, setSelectedSkillIdx] = useState(0);
  const [addLoading, setAddLoading] = useState(false);

  const fetchSkills = async () => {
    try {
      const res = await studentsApi.getMySkills();
      setSkills(res.data.data.skills);
    } catch (err) {
      setError('Failed to fetch skills inventory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setAddLoading(true);

    try {
      const skillOption = MASTER_SKILLS_OPTIONS[selectedSkillIdx];
      const res = await studentsApi.addSkill(skillOption.name, skillOption.category);
      setSkills(res.data.data.skills);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to add skill');
    } finally {
      setAddLoading(false);
    }
  };

  // Group user skills by category
  const skillsByCategory = {};
  skills.forEach((s) => {
    if (!skillsByCategory[s.category]) {
      skillsByCategory[s.category] = [];
    }
    skillsByCategory[s.category].push(s);
  });

  const getUnownedSkills = () => {
    const ownedNames = new Set(skills.map((s) => s.name.toLowerCase()));
    return MASTER_SKILLS_OPTIONS.filter((s) => !ownedNames.has(s.name.toLowerCase()));
  };

  const unowned = getUnownedSkills();

  if (loading) {
    return (
      <div className="flex flex-col space-y-4 animate-pulse">
        <div className="h-10 bg-bg-card w-1/4 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-bg-card rounded-2xl"></div>
          <div className="h-80 bg-bg-card rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8 select-none">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Code className="text-accent-primary" /> Skills Portfolio
          </h1>
          <p className="text-xs text-text-secondary mt-1">Track and build your capabilities metrics</p>
        </div>
        
        {unowned.length > 0 && (
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" /> Learn Skill
          </Button>
        )}
      </div>

      {skills.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-border-subtle rounded-2xl flex flex-col items-center justify-center">
          <Code className="w-12 h-12 text-text-muted mb-4" />
          <h3 className="text-sm font-bold text-text-primary">Skills Inventory Empty</h3>
          <p className="text-xs text-text-secondary max-w-xs mt-1">Select a skill to track. Complete project milestones to award skill XP.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Radar Chart */}
          <Card className="lg:col-span-1 p-6 flex flex-col items-center">
            <h3 className="text-sm font-bold text-text-primary self-start mb-4">Skills Radar Metrics</h3>
            <RadarChart data={skills} />
          </Card>

          {/* Right Column: Grouped skills list */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            {Object.keys(skillsByCategory).map((category) => {
              const Icon = CATEGORY_ICONS[category] || Code;
              const catSkills = skillsByCategory[category];

              return (
                <div key={category} className="flex flex-col space-y-3">
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <Icon className="w-4.5 h-4.5 text-accent-primary" /> {category}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {catSkills.map((s) => (
                      <Card key={s._id} className="p-4 hover:border-accent-primary/20">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-semibold text-text-primary">{s.name}</span>
                          <span className="text-[10px] font-black text-accent-primary bg-accent-primary/5 px-2 py-0.5 rounded border border-accent-primary/10">
                            LEVEL {s.level}
                          </span>
                        </div>
                        
                        <div className="mt-4 flex flex-col space-y-1">
                          <div className="flex justify-between items-center text-[9px] text-text-muted">
                            <span>Progress to Next Level</span>
                            <span>{s.xp} / {s.level * 100} XP</span>
                          </div>
                          {/* Mini Progress Bar */}
                          <div className="w-full bg-bg-elevated h-1 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent-primary rounded-full transition-all duration-300"
                              style={{ width: `${(s.xp / (s.level * 100)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-primary rounded-2xl w-full max-w-md p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold tracking-tight text-text-primary mb-1">Track New Skill</h2>
            <p className="text-xs text-text-secondary mb-6">Select a skill to display on your radar and gain experience points.</p>

            <form onSubmit={handleAddSkill} className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">Select Skill</label>
                <select
                  value={selectedSkillIdx}
                  onChange={(e) => setSelectedSkillIdx(parseInt(e.target.value))}
                  className="w-full px-4 py-2 text-sm bg-bg-secondary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary transition-colors cursor-pointer"
                >
                  {unowned.map((s, idx) => (
                    <option key={idx} value={MASTER_SKILLS_OPTIONS.indexOf(s)}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  disabled={addLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={addLoading}>
                  Add to Portfolio
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
