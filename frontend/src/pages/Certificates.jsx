import { useState, useEffect } from 'react';
import * as certificatesApi from '../api/certificates';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '../components/ui';
import { 
  Award, 
  Plus, 
  Upload, 
  Calendar, 
  Building2, 
  ExternalLink, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText, 
  X, 
  Loader2, 
  Tag, 
  ShieldCheck, 
  AlertCircle,
  Eye
} from 'lucide-react';
import { formatDateTime } from '../utils/date';
import { cn } from '../utils/classnames';

export const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Detail/Preview Modal State
  const [selectedCert, setSelectedCert] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    issuingOrganization: '',
    issueDate: '',
    expirationDate: '',
    credentialId: '',
    credentialUrl: '',
    description: '',
    skills: '',
    fileName: '',
    fileData: '',
  });

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await certificatesApi.getMyCertificates();
      setCertificates(res.data.data.certificates || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load certificates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleOpenModal = (cert = null) => {
    if (cert) {
      setEditingCert(cert);
      setFormData({
        title: cert.title || '',
        issuingOrganization: cert.issuingOrganization || '',
        issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : '',
        expirationDate: cert.expirationDate ? new Date(cert.expirationDate).toISOString().split('T')[0] : '',
        credentialId: cert.credentialId || '',
        credentialUrl: cert.credentialUrl || '',
        description: cert.description || '',
        skills: Array.isArray(cert.skills) ? cert.skills.join(', ') : '',
        fileName: cert.file?.fileName || '',
        fileData: cert.file?.fileData || '',
      });
    } else {
      setEditingCert(null);
      setFormData({
        title: '',
        issuingOrganization: '',
        issueDate: '',
        expirationDate: '',
        credentialId: '',
        credentialUrl: '',
        description: '',
        skills: '',
        fileName: '',
        fileData: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCert(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        fileName: file.name,
        fileData: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.issuingOrganization || !formData.issueDate) {
      alert('Please fill in required fields: Title, Issuing Organization, and Issue Date.');
      return;
    }

    try {
      setModalLoading(true);
      const payload = {
        title: formData.title,
        issuingOrganization: formData.issuingOrganization,
        issueDate: formData.issueDate,
        expirationDate: formData.expirationDate || null,
        credentialId: formData.credentialId,
        credentialUrl: formData.credentialUrl,
        description: formData.description,
        skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        file: formData.fileData
          ? { fileName: formData.fileName, fileData: formData.fileData }
          : undefined,
      };

      if (editingCert) {
        await certificatesApi.updateCertificate(editingCert._id, payload);
      } else {
        await certificatesApi.createCertificate(payload);
      }

      handleCloseModal();
      fetchCertificates();
    } catch (err) {
      console.error(err);
      alert('Failed to save certificate: ' + (err.response?.data?.message || err.message));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    try {
      await certificatesApi.deleteCertificate(id);
      if (selectedCert && selectedCert._id === id) {
        setSelectedCert(null);
      }
      fetchCertificates();
    } catch (err) {
      console.error(err);
      alert('Failed to delete certificate: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Award className="w-7 h-7 text-accent-primary" />
            Certifications & Certificates
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Upload your verified achievements, industry credentials, and course completion certificates.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Certificate
        </Button>
      </div>

      {/* Main Content */}
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
          <CardContent className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">No certificates added yet</h3>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              Showcase your credentials to instructors and recruiters by uploading your first certificate.
            </p>
            <Button onClick={() => handleOpenModal()} variant="secondary" className="inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Upload Now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <Card 
              key={cert._id} 
              className="flex flex-col justify-between hover:border-accent-primary/50 transition-all duration-200 group"
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-lg bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  {getStatusBadge(cert.status)}
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-text-primary group-hover:text-accent-primary transition-colors line-clamp-2">
                    {cert.title}
                  </CardTitle>
                  <p className="text-xs font-medium text-text-secondary flex items-center gap-1.5 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-accent-primary/70 shrink-0" />
                    {cert.issuingOrganization}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Meta details */}
                <div className="space-y-1.5 text-xs text-text-secondary border-t border-border-subtle pt-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Issued:
                    </span>
                    <span className="font-semibold text-text-primary">
                      {new Date(cert.issueDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {cert.expirationDate && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Expires:
                      </span>
                      <span className="font-semibold text-text-primary">
                        {new Date(cert.expirationDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {cert.credentialId && (
                    <div className="flex items-center justify-between truncate">
                      <span>Credential ID:</span>
                      <span className="font-mono text-[11px] text-text-primary truncate max-w-[150px]">
                        {cert.credentialId}
                      </span>
                    </div>
                  )}
                </div>

                {/* Skills tags */}
                {cert.skills && cert.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cert.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-bg-elevated text-text-secondary border border-border-subtle"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Staff Feedback Alert if Rejected */}
                {cert.status === 'REJECTED' && cert.staffFeedback && (
                  <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
                    <span className="font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Staff Feedback:
                    </span>
                    <p className="line-clamp-2">{cert.staffFeedback}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="text-xs font-semibold text-accent-primary hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Details
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(cert)}
                      className="p-1.5 text-text-secondary hover:text-text-primary transition-colors rounded hover:bg-bg-elevated"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cert._id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 transition-colors rounded hover:bg-rose-500/10"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Certificate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/70 backdrop-blur-sm">
          <div className="bg-bg-secondary border border-border-subtle rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
            {/* Header (Pinned) */}
            <div className="flex items-center justify-between border-b border-border-subtle p-5 shrink-0 bg-bg-secondary">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Award className="w-5 h-5 text-accent-primary" />
                {editingCert ? 'Edit Certificate' : 'Upload Certificate'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-bg-elevated transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Form (Scrollable) */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">
                  Certificate Title <span className="text-rose-400">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. AWS Certified Solutions Architect"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">
                    Issuing Organization <span className="text-rose-400">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Amazon Web Services, Coursera"
                    value={formData.issuingOrganization}
                    onChange={(e) => setFormData({ ...formData, issuingOrganization: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">
                    Issue Date <span className="text-rose-400">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Expiration Date (Optional)</label>
                  <Input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Credential ID (Optional)</label>
                  <Input
                    type="text"
                    placeholder="e.g. ABC-12345-XYZ"
                    value={formData.credentialId}
                    onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Credential Verification Link (Optional)</label>
                <Input
                  type="url"
                  placeholder="https://coursera.org/verify/..."
                  value={formData.credentialUrl}
                  onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Skills Covered (Comma Separated)</label>
                <Input
                  type="text"
                  placeholder="e.g. Cloud Computing, AWS, Docker, DevOps"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Description (Optional)</label>
                <textarea
                  className="w-full px-3 py-2 text-sm bg-bg-elevated border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary min-h-[70px]"
                  placeholder="Brief description of what was learned or verified..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Upload File */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Certificate File (PDF or Image, max 2MB)</label>
                <div className="border-2 border-dashed border-border-subtle hover:border-accent-primary/50 rounded-xl p-4 text-center cursor-pointer transition-colors bg-bg-elevated/40">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="cert-file-input"
                  />
                  <label htmlFor="cert-file-input" className="cursor-pointer space-y-1 block">
                    <Upload className="w-6 h-6 text-accent-primary mx-auto" />
                    <p className="text-xs text-text-primary font-medium">
                      {formData.fileName ? formData.fileName : 'Click to select PDF or image file'}
                    </p>
                    <p className="text-[11px] text-text-secondary">Supports PDF, PNG, JPG, JPEG</p>
                  </label>
                </div>
              </div>

              {/* Footer (Pinned) */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle shrink-0">
                <Button type="button" variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={modalLoading}>
                  {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingCert ? 'Update Certificate' : 'Upload Certificate'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Detail Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-bg-secondary border border-border-subtle rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
            {/* Header (Pinned) */}
            <div className="flex items-center justify-between border-b border-border-subtle p-5 shrink-0 bg-bg-secondary">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">{selectedCert.title}</h3>
                  <p className="text-xs text-text-secondary">{selectedCert.issuingOrganization}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-bg-elevated transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Status Header */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated border border-border-subtle">
                <span className="text-xs font-semibold text-text-secondary">Verification Status:</span>
                {getStatusBadge(selectedCert.status)}
              </div>

              {/* Staff Feedback */}
              {selectedCert.staffFeedback && (
                <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-amber-400" /> Staff Note:
                  </span>
                  <p>{selectedCert.staffFeedback}</p>
                </div>
              )}

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs text-text-secondary">
                <div>
                  <span className="block font-semibold text-text-primary mb-0.5">Issue Date</span>
                  {new Date(selectedCert.issueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </div>
                {selectedCert.expirationDate && (
                  <div>
                    <span className="block font-semibold text-text-primary mb-0.5">Expiration Date</span>
                    {new Date(selectedCert.expirationDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </div>
                )}
                {selectedCert.credentialId && (
                  <div>
                    <span className="block font-semibold text-text-primary mb-0.5">Credential ID</span>
                    <span className="font-mono text-text-primary">{selectedCert.credentialId}</span>
                  </div>
                )}
                {selectedCert.credentialUrl && (
                  <div>
                    <span className="block font-semibold text-text-primary mb-0.5">Verification URL</span>
                    <a
                      href={selectedCert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-primary hover:underline inline-flex items-center gap-1 truncate max-w-full"
                    >
                      Verify Link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedCert.description && (
                <div>
                  <span className="block text-xs font-semibold text-text-primary mb-1">Description</span>
                  <p className="text-xs text-text-secondary bg-bg-elevated p-3 rounded-lg border border-border-subtle whitespace-pre-wrap">
                    {selectedCert.description}
                  </p>
                </div>
              )}

              {/* Skills */}
              {selectedCert.skills && selectedCert.skills.length > 0 && (
                <div>
                  <span className="block text-xs font-semibold text-text-primary mb-1.5 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Associated Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCert.skills.map((s, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs rounded bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* File Viewer */}
              {selectedCert.file && selectedCert.file.fileData && (
                <div className="space-y-2 pt-2 border-t border-border-subtle">
                  <span className="block text-xs font-semibold text-text-primary flex items-center gap-1">
                    <FileText className="w-4 h-4 text-accent-primary" /> Certificate Document
                  </span>
                  {selectedCert.file.fileData.includes('pdf') || selectedCert.file.fileName?.endsWith('.pdf') ? (
                    <div className="space-y-2">
                      <iframe
                        src={selectedCert.file.fileData}
                        title="Certificate PDF"
                        className="w-full h-72 border border-border-subtle rounded-lg bg-white"
                      />
                      <a
                        href={selectedCert.file.fileData}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-accent-primary hover:underline font-semibold"
                      >
                        Open Full PDF in New Tab <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <img
                        src={selectedCert.file.fileData}
                        alt={selectedCert.title}
                        className="w-full max-h-80 object-contain rounded-lg border border-border-subtle bg-bg-elevated"
                      />
                      <a
                        href={selectedCert.file.fileData}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-accent-primary hover:underline font-semibold"
                      >
                        Open Full Image <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer (Pinned) */}
            <div className="flex justify-end p-5 border-t border-border-subtle shrink-0 bg-bg-secondary">
              <Button variant="secondary" onClick={() => setSelectedCert(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
