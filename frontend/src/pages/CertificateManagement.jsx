import { useState, useEffect } from 'react';
import * as certificatesApi from '../api/certificates';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '../components/ui';
import { 
  Award, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Eye, 
  Check, 
  X, 
  Trash2, 
  ExternalLink, 
  FileText, 
  Loader2, 
  User, 
  Building2, 
  Calendar, 
  ShieldCheck, 
  AlertCircle,
  Tag
} from 'lucide-react';
import { formatDateTime } from '../utils/date';
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
const STATUSES = ['All Statuses', 'PENDING', 'APPROVED', 'REJECTED'];

export const CertificateManagement = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [batchFilter, setBatchFilter] = useState('All Batches');
  const [deptFilter, setDeptFilter] = useState('All Departments');

  // Selected Certificate for Review Modal
  const [selectedCert, setSelectedCert] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter !== 'All Statuses') params.status = statusFilter;
      if (batchFilter !== 'All Batches') params.batch = batchFilter;
      if (deptFilter !== 'All Departments') params.department = deptFilter;
      if (search.trim()) params.search = search.trim();

      const res = await certificatesApi.getAllCertificates(params);
      setCertificates(res.data.data.certificates || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch certificates list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [statusFilter, batchFilter, deptFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCertificates();
  };

  const handleReviewAction = async (certId, newStatus) => {
    try {
      setReviewLoading(true);
      await certificatesApi.reviewCertificate(certId, newStatus, feedback);
      setSelectedCert(null);
      setFeedback('');
      fetchCertificates();
    } catch (err) {
      console.error(err);
      alert('Failed to submit review decision: ' + (err.response?.data?.message || err.message));
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDelete = async (certId) => {
    if (!window.confirm('Are you sure you want to delete this student certificate?')) return;
    try {
      await certificatesApi.deleteCertificate(certId);
      if (selectedCert && selectedCert._id === certId) {
        setSelectedCert(null);
      }
      fetchCertificates();
    } catch (err) {
      console.error(err);
      alert('Failed to delete certificate: ' + (err.response?.data?.message || err.message));
    }
  };

  // Stats
  const totalCount = certificates.length;
  const pendingCount = certificates.filter((c) => c.status === 'PENDING').length;
  const approvedCount = certificates.filter((c) => c.status === 'APPROVED').length;
  const rejectedCount = certificates.filter((c) => c.status === 'REJECTED').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-border-subtle pb-5">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Award className="w-7 h-7 text-accent-primary" />
          Student Certificates Management
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Review, approve, or reject certificates submitted by students across cohorts.
        </p>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-text-secondary">Total Certificates</p>
            <p className="text-xl font-bold text-text-primary">{totalCount}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 border-amber-500/20 bg-amber-500/5">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-amber-300">Pending Review</p>
            <p className="text-xl font-bold text-amber-400">{pendingCount}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 border-emerald-500/20 bg-emerald-500/5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-emerald-300">Approved</p>
            <p className="text-xl font-bold text-emerald-400">{approvedCount}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 border-rose-500/20 bg-rose-500/5">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-rose-300">Rejected</p>
            <p className="text-xl font-bold text-rose-400">{rejectedCount}</p>
          </div>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by student name, title, or organization..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-bg-elevated border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-bg-elevated border border-border-subtle rounded-lg text-text-primary focus:outline-none"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-bg-elevated border border-border-subtle rounded-lg text-text-primary focus:outline-none"
            >
              {BATCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-bg-elevated border border-border-subtle rounded-lg text-text-primary focus:outline-none"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <Button type="submit" variant="secondary" className="text-xs px-3">
              Search
            </Button>
          </div>
        </form>
      </Card>

      {/* Main List Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      ) : certificates.length === 0 ? (
        <Card className="text-center py-16 px-4">
          <CardContent className="space-y-2">
            <Award className="w-10 h-10 text-text-secondary mx-auto mb-2" />
            <h3 className="text-base font-semibold text-text-primary">No certificates found</h3>
            <p className="text-xs text-text-secondary">Try adjusting your filters or search query.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-border-subtle rounded-xl overflow-hidden bg-bg-secondary shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-secondary">
              <thead className="bg-bg-elevated text-text-primary font-semibold border-b border-border-subtle uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Certificate Title</th>
                  <th className="px-4 py-3">Issuer</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {certificates.map((cert) => (
                  <tr key={cert._id} className="hover:bg-bg-elevated/50 transition-colors">
                    {/* Student */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent-primary/20 overflow-hidden shrink-0 flex items-center justify-center font-bold text-accent-primary text-xs">
                          {cert.student?.avatar ? (
                            <img src={cert.student.avatar} alt={cert.student.name} className="w-full h-full object-cover" />
                          ) : (
                            cert.student?.name?.[0] || 'S'
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary">{cert.student?.name || 'Unknown Student'}</p>
                          <p className="text-[11px] text-text-secondary">
                            {cert.student?.batch || ''} • {cert.student?.department || ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3.5 font-medium text-text-primary max-w-xs truncate">
                      {cert.title}
                    </td>

                    {/* Issuer */}
                    <td className="px-4 py-3.5">
                      {cert.issuingOrganization}
                    </td>

                    {/* Issue Date */}
                    <td className="px-4 py-3.5">
                      {new Date(cert.issueDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      {getStatusBadge(cert.status)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCert(cert);
                          setFeedback(cert.staffFeedback || '');
                        }}
                        className="p-1.5 rounded text-accent-primary hover:bg-accent-primary/10 transition-colors"
                        title="Review / View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cert._id)}
                        className="p-1.5 rounded text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Certificate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-bg-secondary border border-border-subtle rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
            {/* Modal Header (Pinned) */}
            <div className="flex items-center justify-between border-b border-border-subtle p-5 shrink-0 bg-bg-secondary">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center font-bold text-accent-primary text-xs shrink-0">
                  {selectedCert.student?.avatar ? (
                    <img src={selectedCert.student.avatar} alt={selectedCert.student.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    selectedCert.student?.name?.[0] || 'S'
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">{selectedCert.student?.name}</h3>
                  <p className="text-xs text-text-secondary">
                    {selectedCert.student?.email} • {selectedCert.student?.batch} ({selectedCert.student?.department})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-bg-elevated transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* Certificate Info */}
              <div className="p-3.5 rounded-lg bg-bg-elevated border border-border-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-text-primary">{selectedCert.title}</h4>
                  {getStatusBadge(selectedCert.status)}
                </div>
                <p className="text-text-secondary flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-accent-primary" /> {selectedCert.issuingOrganization}
                </p>
                <div className="grid grid-cols-2 gap-2 text-text-secondary pt-2 border-t border-border-subtle">
                  <span>
                    <strong>Issued:</strong> {new Date(selectedCert.issueDate).toLocaleDateString()}
                  </span>
                  {selectedCert.expirationDate && (
                    <span>
                      <strong>Expires:</strong> {new Date(selectedCert.expirationDate).toLocaleDateString()}
                    </span>
                  )}
                  {selectedCert.credentialId && (
                    <span>
                      <strong>Credential ID:</strong> <code className="text-text-primary">{selectedCert.credentialId}</code>
                    </span>
                  )}
                  {selectedCert.credentialUrl && (
                    <a
                      href={selectedCert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-primary hover:underline inline-flex items-center gap-1"
                    >
                      Verify URL <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Skills */}
              {selectedCert.skills && selectedCert.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedCert.skills.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* File Document */}
              {selectedCert.file && selectedCert.file.fileData && (
                <div className="space-y-2">
                  <span className="font-semibold text-text-primary flex items-center gap-1">
                    <FileText className="w-4 h-4 text-accent-primary" /> Certificate Document
                  </span>
                  {selectedCert.file.fileData.includes('pdf') || selectedCert.file.fileName?.endsWith('.pdf') ? (
                    <iframe
                      src={selectedCert.file.fileData}
                      title="PDF Preview"
                      className="w-full h-64 border border-border-subtle rounded-lg bg-white"
                    />
                  ) : (
                    <img
                      src={selectedCert.file.fileData}
                      alt={selectedCert.title}
                      className="w-full max-h-64 object-contain rounded-lg border border-border-subtle bg-bg-elevated"
                    />
                  )}
                </div>
              )}

              {/* Review Feedback Form */}
              <div className="space-y-2 pt-2 border-t border-border-subtle">
                <label className="font-semibold text-text-primary block">Staff Review Note / Feedback</label>
                <textarea
                  className="w-full px-3 py-2 text-xs bg-bg-elevated border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary min-h-[70px]"
                  placeholder="Add feedback for the student (required if rejecting)..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
            </div>

            {/* Modal Footer (Pinned) */}
            <div className="flex items-center justify-between p-5 border-t border-border-subtle shrink-0 bg-bg-secondary">
              <Button variant="secondary" onClick={() => setSelectedCert(null)}>
                Close
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleReviewAction(selectedCert._id, 'REJECTED')}
                  disabled={reviewLoading}
                  className="bg-rose-600 hover:bg-rose-500 text-white"
                >
                  <X className="w-4 h-4 mr-1" /> Reject
                </Button>
                <Button
                  onClick={() => handleReviewAction(selectedCert._id, 'APPROVED')}
                  disabled={reviewLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <Check className="w-4 h-4 mr-1" /> Approve
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
