import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as announcementsApi from '../api/announcements';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '../components/ui';
import { 
  Megaphone, 
  Plus, 
  ExternalLink, 
  Trash2, 
  Users, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  Loader2, 
  X, 
  Briefcase, 
  Sparkles,
  Clock
} from 'lucide-react';
import { formatDateTime, formatDate } from '../utils/date';
import { cn } from '../utils/classnames';

const BATCHES = ['All Batches', 'Batch 2024', 'Batch 2025', 'Batch 2026', 'Batch 2027'];
const DEPARTMENTS = [
  'All Departments',
  'Computer Science',
  'Information Technology',
  'Software Engineering',
  'Data Science & AI',
  'Electronics & Communication'
];

export const Announcements = () => {
  const { user } = useAuth();
  const isStaff = user?.role === 'STAFF';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    link: '',
    deadline: '',
    batch: 'All Batches',
    department: 'All Departments',
  });

  // Applicants Drawer / Modal state
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantsList, setApplicantsList] = useState([]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await announcementsApi.getAnnouncements();
      setAnnouncements(res.data.data.announcements);
    } catch (err) {
      console.error(err);
      setError('Failed to load placement announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      await announcementsApi.createAnnouncement(formData);
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        company: '',
        description: '',
        link: '',
        deadline: '',
        batch: 'All Batches',
        department: 'All Departments',
      });
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      alert('Failed to post announcement: ' + (err.response?.data?.message || err.message));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this placement announcement?')) return;
    try {
      await announcementsApi.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete announcement: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleApply = async (id) => {
    try {
      const res = await announcementsApi.toggleApplyAnnouncement(id);
      const updated = res.data.data.announcement;
      setAnnouncements((prev) => prev.map((a) => (a._id === id ? updated : a)));
    } catch (err) {
      console.error(err);
      alert('Failed to update application status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenApplicants = async (announcement) => {
    setSelectedAnnouncement(announcement);
    try {
      setApplicantsLoading(true);
      const res = await announcementsApi.getAnnouncementApplicants(announcement._id);
      setApplicantsList(res.data.data.applicants);
    } catch (err) {
      console.error(err);
      alert('Failed to load applicants list');
    } finally {
      setApplicantsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-8 select-none max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-subtle pb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Megaphone className="text-accent-primary w-7 h-7" /> Placement & Career Opportunities
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Official announcements, placement drives, internships, and student applications.
          </p>
        </div>

        {isStaff && (
          <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 shadow-lg">
            <Plus className="w-4 h-4" /> Post Opportunity
          </Button>
        )}
      </div>

      {/* Main List Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      ) : announcements.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-border-subtle bg-bg-card/50">
          <Briefcase className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <h3 className="text-base font-bold text-text-primary">No Active Announcements</h3>
          <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
            There are currently no placement drives or career opportunities posted for your batch/department.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {announcements.map((ann) => {
            const hasApplied = ann.applicants?.some(
              (app) => (app.student?._id || app.student) === user?._id
            );

            return (
              <Card key={ann._id} className="p-6 border border-border-subtle hover:border-border-primary/60 shadow-md flex flex-col justify-between space-y-5 bg-bg-card transition-all">
                <div className="space-y-3">
                  {/* Top Badge Info */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {ann.company && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-accent-primary/10 text-accent-primary border border-accent-primary/20 flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {ann.company}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-bg-secondary text-text-secondary border border-border-subtle">
                        {ann.batch}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-bg-secondary text-text-secondary border border-border-subtle">
                        {ann.department}
                      </span>
                    </div>

                    {isStaff && ann.author?._id === user?._id && (
                      <button
                        onClick={() => handleDelete(ann._id)}
                        className="text-text-muted hover:text-status-danger p-1 rounded hover:bg-status-danger/10 transition-colors"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-text-primary leading-snug">{ann.title}</h3>
                    <p className="text-xs text-text-secondary mt-2 leading-relaxed whitespace-pre-wrap">
                      {ann.description}
                    </p>
                  </div>

                  {/* Deadline & Meta */}
                  <div className="flex items-center gap-4 text-[11px] text-text-muted pt-2 border-t border-border-subtle">
                    {ann.deadline && (
                      <span className="flex items-center gap-1 text-status-warning font-medium">
                        <Clock className="w-3.5 h-3.5" /> Deadline: {formatDate(ann.deadline)}
                      </span>
                    )}
                    <span>Posted {formatDateTime(ann.createdAt)}</span>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border-subtle gap-3">
                  {ann.link ? (
                    <a
                      href={ann.link.startsWith('http') ? ann.link : `https://${ann.link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-primary hover:underline"
                    >
                      Apply / Open Link <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-text-muted italic">No direct link provided</span>
                  )}

                  {isStaff ? (
                    <Button
                      variant="secondary"
                      onClick={() => handleOpenApplicants(ann)}
                      className="text-xs flex items-center gap-1.5 px-3 py-1.5"
                    >
                      <Users className="w-3.5 h-3.5 text-accent-primary" />
                      Applicants ({ann.applicants?.length || 0})
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleToggleApply(ann._id)}
                      variant={hasApplied ? 'secondary' : 'primary'}
                      className={cn(
                        "text-xs px-4 py-1.5 flex items-center gap-1.5 transition-all",
                        hasApplied && "bg-status-success/15 text-status-success border-status-success/30 hover:bg-status-success/20"
                      )}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {hasApplied ? 'Applied' : 'Mark as Applied'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Announcement Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-bg-secondary border border-border-subtle rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-border-subtle p-5 shrink-0 bg-bg-secondary">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-accent-primary" /> Post Placement Announcement
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-bg-elevated"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">
                  Title <span className="text-rose-400">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Software Engineer Hiring Drive 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Company Name</label>
                  <Input
                    type="text"
                    placeholder="e.g. Google, Microsoft, Infosys"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Application Link (URL)</label>
                  <Input
                    type="url"
                    placeholder="https://careers.company.com/..."
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Deadline (Optional)</label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Target Batch</label>
                  <select
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-bg-elevated border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                  >
                    {BATCHES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Target Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-bg-elevated border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">
                  Description & Eligibility Details <span className="text-rose-400">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 text-xs bg-bg-elevated border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary min-h-[100px]"
                  placeholder="Describe eligibility criteria, CTC/package, job role details, interview stages..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle shrink-0">
                <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createLoading}>
                  {createLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Announcement'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applicants Roster Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-bg-secondary border border-border-subtle rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-border-subtle p-5 shrink-0 bg-bg-secondary">
              <div>
                <h3 className="text-base font-bold text-text-primary">{selectedAnnouncement.title}</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Applied Students Roster ({applicantsList.length} total)
                </p>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-bg-elevated"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 text-xs">
              {applicantsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-accent-primary" />
                </div>
              ) : applicantsList.length === 0 ? (
                <div className="text-center py-10 text-text-muted">
                  No students have registered/applied for this opportunity yet.
                </div>
              ) : (
                <div className="overflow-x-auto border border-border-subtle rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-bg-elevated/60 text-text-secondary uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-3 border-b border-border-subtle">Student Name</th>
                        <th className="p-3 border-b border-border-subtle">Email</th>
                        <th className="p-3 border-b border-border-subtle">Batch</th>
                        <th className="p-3 border-b border-border-subtle">Department</th>
                        <th className="p-3 border-b border-border-subtle">Applied Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle text-text-primary">
                      {applicantsList.map((app, idx) => (
                        <tr key={idx} className="hover:bg-bg-elevated/40">
                          <td className="p-3 font-bold flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-accent-primary/20 text-accent-primary font-black text-[10px] flex items-center justify-center">
                              {app.student?.name?.[0] || 'S'}
                            </div>
                            {app.student?.name}
                          </td>
                          <td className="p-3 text-text-secondary">{app.student?.email}</td>
                          <td className="p-3">{app.student?.batch || 'N/A'}</td>
                          <td className="p-3">{app.student?.department || 'N/A'}</td>
                          <td className="p-3 text-text-muted">{formatDate(app.appliedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end p-4 border-t border-border-subtle shrink-0 bg-bg-secondary">
              <Button variant="secondary" onClick={() => setSelectedAnnouncement(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
