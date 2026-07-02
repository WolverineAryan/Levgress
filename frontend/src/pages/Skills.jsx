import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as studentsApi from '../api/students';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../components/ui';
import { RadarChart } from '../components/charts';
import { Code, Plus, Database, Cpu, Layout, Server, X, ArrowRight, ShieldCheck, Search, CheckCircle2, Info, Trash2 } from 'lucide-react';

const getTierBadgeStyles = (tier) => {
  switch (tier) {
    case 'BASIC':
      return 'border-status-success/30 text-status-success bg-status-success/5';
    case 'INTERMEDIATE':
      return 'border-accent-primary/30 text-accent-primary bg-accent-primary/5';
    case 'MASTER':
      return 'border-status-warning/40 text-status-warning bg-status-warning/5';
    case 'UNVERIFIED':
    default:
      return 'border-border-subtle text-text-muted bg-bg-card';
  }
};

const CATEGORY_ICONS = {
  Frontend: Layout,
  Backend: Server,
  Database: Database,
  DevOps: Cpu,
};



export const Skills = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [masterSkills, setMasterSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Skill Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('TECHNOLOGY'); // 'TECHNOLOGY' or 'SKILL'
  const [addLoading, setAddLoading] = useState(false);

  // Search & Filter within Modal
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItemName, setSelectedItemName] = useState('');

  const fetchSkills = async () => {
    try {
      const [skillsRes, masterRes] = await Promise.all([
        studentsApi.getMySkills(),
        studentsApi.getMasterSkills(),
      ]);
      setSkills(skillsRes.data.data.skills);
      setMasterSkills(masterRes.data.data.skills);
    } catch (err) {
      setError('Failed to fetch skills portfolio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const openModal = (type) => {
    setModalType(type);
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedItemName('');
    setIsModalOpen(true);
  };

  const getUnownedOptions = () => {
    const ownedNames = new Set(skills.map((s) => s.name.toLowerCase()));
    return masterSkills.filter(
      (s) => s.type === modalType && !ownedNames.has(s.name.toLowerCase())
    );
  };

  const getFilteredUnownedOptions = () => {
    const unowned = getUnownedOptions();
    return unowned.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!selectedItemName) return;

    setAddLoading(true);
    try {
      const options = getUnownedOptions();
      const selectedItem = options.find((o) => o.name === selectedItemName);
      if (!selectedItem) return;

      const res = await studentsApi.addSkill(selectedItem.name, selectedItem.category);
      setSkills(res.data.data.skills);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to add skill');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteSkill = async (name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from your portfolio?`)) {
      return;
    }

    try {
      const res = await studentsApi.deleteSkill(name);
      setSkills(res.data.data.skills);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete skill');
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

  const technologies = skills.filter(s => s.type !== 'SKILL');
  const methodologies = skills.filter(s => s.type === 'SKILL');

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
        
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/tester')} variant="outline" className="flex items-center gap-1.5 text-xs border-accent-primary/30 text-accent-primary hover:bg-accent-primary/5">
            Skill Tester
          </Button>
          <Button onClick={() => openModal('TECHNOLOGY')} className="flex items-center gap-1.5 text-xs bg-accent-primary hover:bg-accent-hover text-bg-primary font-bold">
            <Plus className="w-3.5 h-3.5" /> Add Tech Stack
          </Button>
          <Button onClick={() => openModal('SKILL')} className="flex items-center gap-1.5 text-xs bg-bg-elevated hover:bg-neutral-800 border border-border-subtle text-text-primary font-bold">
            <Plus className="w-3.5 h-3.5" /> Add Skill
          </Button>
        </div>
      </div>

      {skills.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-border-subtle rounded-2xl flex flex-col items-center justify-center">
          <Code className="w-12 h-12 text-text-muted mb-4" />
          <h3 className="text-sm font-bold text-text-primary">Skills Inventory Empty</h3>
          <p className="text-xs text-text-secondary max-w-xs mt-1">Select a skill to track. Complete project milestones to award skill XP.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Radar Charts */}
          <div className="lg:col-span-1 flex flex-col space-y-6">
            <Card className="p-6 flex flex-col items-center">
              <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider self-start mb-1">Technologies Radar</h3>
              <p className="text-[10px] text-text-secondary self-start mb-4">Visual breakdown of your tech stack capability</p>
              <RadarChart data={technologies} />
            </Card>

            <Card className="p-6 flex flex-col items-center">
              <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider self-start mb-1">Engineering Radar</h3>
              <p className="text-[10px] text-text-secondary self-start mb-4">Core software engineering concepts performance</p>
              <RadarChart data={methodologies} />
            </Card>
          </div>

          {/* Right Column: Grouped technologies & skills list */}
          <div className="lg:col-span-2 flex flex-col space-y-8">
            
            {/* 1. Technologies & Languages Section */}
            {technologies.length > 0 && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-border-subtle">
                  <h2 className="text-sm font-extrabold text-text-primary uppercase tracking-wider">Technologies & Frameworks</h2>
                  <p className="text-[10px] text-text-muted mt-0.5">Verified syntax and usage of coding tools and languages</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {technologies.map((s) => {
                    const nextTierMap = {
                      UNVERIFIED: 'BASIC',
                      BASIC: 'INTERMEDIATE',
                      INTERMEDIATE: 'MASTER',
                    };
                    const nextTier = nextTierMap[s.tier];

                    return (
                      <Card key={s._id} className="p-4 hover:border-accent-primary/20 flex flex-col justify-between h-28">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-semibold text-text-primary block">{s.name}</span>
                            <span className="text-[9px] text-text-muted mt-0.5 block">{s.category}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border h-fit ${getTierBadgeStyles(s.tier)}`}>
                              {s.tier || 'UNVERIFIED'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteSkill(s.name)}
                              className="text-text-muted hover:text-status-danger transition-colors cursor-pointer p-0.5 rounded bg-transparent hover:bg-bg-secondary"
                              title="Delete tech stack"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-auto flex justify-between items-center pt-2">
                          {nextTier ? (
                            <button
                              onClick={() => navigate(`/tester?skill=${encodeURIComponent(s.name)}&tier=${nextTier}`)}
                              className="text-[10px] font-bold text-accent-primary hover:text-accent-hover flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-0 p-0"
                            >
                              Take {nextTier} Test <ArrowRight size={12} />
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-status-warning flex items-center gap-1">
                              <ShieldCheck size={12} /> Max Tier Unlocked
                            </span>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Software Engineering Skills Section */}
            {methodologies.length > 0 && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-border-subtle">
                  <h2 className="text-sm font-extrabold text-text-primary uppercase tracking-wider">Engineering Concepts & Skills</h2>
                  <p className="text-[10px] text-text-muted mt-0.5">Verified execution of software architecture and engineering principles</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {methodologies.map((s) => {
                    const nextTierMap = {
                      UNVERIFIED: 'BASIC',
                      BASIC: 'INTERMEDIATE',
                      INTERMEDIATE: 'MASTER',
                    };
                    const nextTier = nextTierMap[s.tier];

                    return (
                      <Card key={s._id} className="p-4 hover:border-accent-primary/20 flex flex-col justify-between h-28">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-semibold text-text-primary block">{s.name}</span>
                            <span className="text-[9px] text-text-muted mt-0.5 block">{s.category}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border h-fit ${getTierBadgeStyles(s.tier)}`}>
                              {s.tier || 'UNVERIFIED'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteSkill(s.name)}
                              className="text-text-muted hover:text-status-danger transition-colors cursor-pointer p-0.5 rounded bg-transparent hover:bg-bg-secondary"
                              title="Delete skill"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-auto flex justify-between items-center pt-2">
                          {nextTier ? (
                            <button
                              onClick={() => navigate(`/tester?skill=${encodeURIComponent(s.name)}&tier=${nextTier}`)}
                              className="text-[10px] font-bold text-accent-primary hover:text-accent-hover flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-0 p-0"
                            >
                              Take {nextTier} Test <ArrowRight size={12} />
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-status-warning flex items-center gap-1">
                              <ShieldCheck size={12} /> Max Tier Unlocked
                            </span>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Add Skill / Tech Stack Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-primary rounded-2xl w-full max-w-xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold tracking-tight text-text-primary mb-1">
              {modalType === 'TECHNOLOGY' ? 'Add Tech Stack' : 'Track Engineering Skill'}
            </h2>
            <p className="text-xs text-text-secondary mb-5">
              {modalType === 'TECHNOLOGY' 
                ? 'Select a framework, language, or tool to add to your tech stack portfolio.' 
                : 'Select an engineering methodology or concept to track.'}
            </p>

            {getUnownedOptions().length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-text-secondary">All available {modalType === 'TECHNOLOGY' ? 'technologies' : 'skills'} have already been added to your portfolio!</p>
                <Button onClick={() => setIsModalOpen(false)} className="mt-6 text-xs">
                  Close Window
                </Button>
              </div>
            ) : (
              <form onSubmit={handleAddSkill} className="flex flex-col space-y-4 overflow-hidden">
                {/* Search and Category filters */}
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setSelectedItemName(''); // Clear selection when typing
                      }}
                      placeholder={modalType === 'TECHNOLOGY' ? "Search technologies (e.g. React, Docker, Vite)..." : "Search skills (e.g. REST API, Caching)..."}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-bg-secondary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                    />
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
                    {['All', 'Frontend', 'Backend', 'Database', 'DevOps'].map((cat) => {
                      const CatIcon = CATEGORY_ICONS[cat] || Code;
                      const isActive = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat);
                            setSelectedItemName(''); // Clear selection when category changes
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all duration-200 border cursor-pointer select-none whitespace-nowrap ${
                            isActive
                              ? 'bg-accent-primary/10 border-accent-primary text-accent-primary'
                              : 'bg-bg-secondary border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-primary'
                          }`}
                        >
                          <CatIcon className="w-3 h-3" />
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grid checklist container */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {getFilteredUnownedOptions().map((s) => {
                    const isSelected = selectedItemName === s.name;
                    const CatIcon = CATEGORY_ICONS[s.category] || Code;
                    return (
                      <div
                        key={s.name}
                        onClick={() => setSelectedItemName(s.name)}
                        className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between h-20 relative select-none overflow-hidden ${
                          isSelected
                            ? 'bg-accent-primary/5 border-accent-primary shadow-[0_0_12px_rgba(192,133,82,0.15)]'
                            : 'bg-bg-secondary border-border-subtle hover:border-border-primary hover:bg-bg-elevated'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-1.5">
                            <div className={`p-1 rounded-md ${isSelected ? 'bg-accent-primary/10 text-accent-primary' : 'bg-bg-card text-text-secondary'}`}>
                              <CatIcon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[11px] font-bold text-text-primary tracking-tight leading-tight line-clamp-1">{s.name}</span>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary shrink-0 animate-in zoom-in-50" />
                          )}
                        </div>
                        
                        <div className="text-[9px] font-medium text-text-muted mt-auto self-start bg-bg-card border border-border-subtle/50 px-2 py-0.5 rounded-full">
                          {s.category}
                        </div>
                      </div>
                    );
                  })}
                  {getFilteredUnownedOptions().length === 0 && (
                    <div className="col-span-full text-center py-8 text-text-muted text-xs border border-dashed border-border-subtle rounded-xl">
                      No matches found for search filters.
                    </div>
                  )}
                </div>

                {/* Selected Description details panel */}
                {getUnownedOptions().find((o) => o.name === selectedItemName) && (
                  <div className="p-3 bg-bg-secondary/40 border border-border-subtle/60 rounded-xl flex gap-2 animate-in slide-in-from-bottom-2 duration-200">
                    <Info className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">What you will learn:</h4>
                      <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
                        {getUnownedOptions().find((o) => o.name === selectedItemName).description || 'No description available for this item.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Modal footer actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                    disabled={addLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={addLoading} disabled={!selectedItemName}>
                    Add to Portfolio
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
