const Certificate = require('../models/Certificate');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const supabaseService = require('./supabase.service');
const { NotFoundError, ValidationError, ForbiddenError } = require('../utils/AppError');

/**
 * Create a new certificate for a student
 */
const createCertificate = async (studentId, data) => {
  const {
    title,
    issuingOrganization,
    issueDate,
    expirationDate,
    credentialId,
    credentialUrl,
    description,
    skills,
    file,
  } = data;

  if (!title || !issuingOrganization || !issueDate) {
    throw new ValidationError('Title, issuing organization, and issue date are required.');
  }

  let fileObj = { fileName: '', fileData: '' };

  if (file && file.fileData) {
    let finalUrl = file.fileData;
    if (file.fileData.startsWith('data:')) {
      const sanitizedTitle = (title || 'cert').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      finalUrl = await supabaseService.uploadBase64File(
        file.fileData,
        'levgress-assets',
        `certificates/${studentId}`,
        `cert_${sanitizedTitle}`
      );
    }
    fileObj = {
      fileName: file.fileName || 'certificate',
      fileData: finalUrl,
    };
  }

  const certificate = await Certificate.create({
    student: studentId,
    title: title.trim(),
    issuingOrganization: issuingOrganization.trim(),
    issueDate,
    expirationDate: expirationDate || null,
    credentialId: (credentialId || '').trim(),
    credentialUrl: (credentialUrl || '').trim(),
    description: (description || '').trim(),
    skills: Array.isArray(skills) ? skills.filter(Boolean) : [],
    file: fileObj,
    status: 'PENDING',
  });

  // Log Activity
  await ActivityLog.create({
    student: studentId,
    activityType: 'CERTIFICATE_UPLOADED',
    details: `Uploaded certificate: ${certificate.title}`,
  });

  return certificate;
};

/**
 * Get certificates for a specific student
 */
const getStudentCertificates = async (studentId) => {
  return await Certificate.find({ student: studentId })
    .populate('staffReviewedBy', 'name email avatar')
    .sort({ createdAt: -1 });
};

/**
 * Get certificate by ID
 */
const getCertificateById = async (certificateId, userId, userRole) => {
  const certificate = await Certificate.findById(certificateId)
    .populate('student', 'name email avatar batch department username')
    .populate('staffReviewedBy', 'name email avatar');

  if (!certificate) {
    throw new NotFoundError('Certificate not found.');
  }

  // Verification permission: student can see own cert, staff can see any cert
  if (userRole !== 'STAFF' && certificate.student._id.toString() !== userId.toString()) {
    throw new ForbiddenError('You are not authorized to view this certificate.');
  }

  return certificate;
};

/**
 * Update certificate (student owner only)
 */
const updateCertificate = async (certificateId, studentId, data) => {
  const certificate = await Certificate.findById(certificateId);
  if (!certificate) {
    throw new NotFoundError('Certificate not found.');
  }

  if (certificate.student.toString() !== studentId.toString()) {
    throw new ForbiddenError('You are not authorized to update this certificate.');
  }

  const {
    title,
    issuingOrganization,
    issueDate,
    expirationDate,
    credentialId,
    credentialUrl,
    description,
    skills,
    file,
  } = data;

  if (title) certificate.title = title.trim();
  if (issuingOrganization) certificate.issuingOrganization = issuingOrganization.trim();
  if (issueDate) certificate.issueDate = issueDate;
  if (expirationDate !== undefined) certificate.expirationDate = expirationDate || null;
  if (credentialId !== undefined) certificate.credentialId = credentialId.trim();
  if (credentialUrl !== undefined) certificate.credentialUrl = credentialUrl.trim();
  if (description !== undefined) certificate.description = description.trim();
  if (skills !== undefined && Array.isArray(skills)) certificate.skills = skills.filter(Boolean);

  if (file && file.fileData) {
    let finalUrl = file.fileData;
    if (file.fileData.startsWith('data:')) {
      const sanitizedTitle = (certificate.title || 'cert').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      finalUrl = await supabaseService.uploadBase64File(
        file.fileData,
        'levgress-assets',
        `certificates/${studentId}`,
        `cert_${sanitizedTitle}`
      );
    }
    certificate.file = {
      fileName: file.fileName || certificate.file.fileName || 'certificate',
      fileData: finalUrl,
    };
  }

  // Reset status to PENDING if student modified an existing cert
  certificate.status = 'PENDING';
  certificate.staffReviewedBy = null;
  certificate.staffFeedback = '';
  certificate.reviewedAt = null;

  await certificate.save();
  return certificate;
};

/**
 * Delete certificate (student owner or staff)
 */
const deleteCertificate = async (certificateId, userId, userRole) => {
  const certificate = await Certificate.findById(certificateId);
  if (!certificate) {
    throw new NotFoundError('Certificate not found.');
  }

  if (userRole !== 'STAFF' && certificate.student.toString() !== userId.toString()) {
    throw new ForbiddenError('You are not authorized to delete this certificate.');
  }

  await Certificate.findByIdAndDelete(certificateId);
  return { success: true };
};

/**
 * Get all certificates with filters (Staff feature)
 */
const getAllCertificates = async (filters = {}) => {
  const { status, batch, department, search, dateFrom, dateTo } = filters;

  const query = {};

  if (status && status !== 'ALL' && status !== 'All Statuses') {
    query.status = status.toUpperCase();
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  // If filtering by batch, department, or student name/title search, we need student IDs
  let studentIds = null;

  const userQuery = { role: 'STUDENT' };
  let needsUserFiltering = false;

  if (batch && batch !== 'All Batches') {
    userQuery.batch = batch;
    needsUserFiltering = true;
  }

  if (department && department !== 'All Departments') {
    userQuery.department = department;
    needsUserFiltering = true;
  }

  if (needsUserFiltering) {
    const matchingUsers = await User.find(userQuery).select('_id');
    studentIds = matchingUsers.map((u) => u._id);
    query.student = { $in: studentIds };
  }

  let certificates = await Certificate.find(query)
    .populate('student', 'name email avatar batch department username')
    .populate('staffReviewedBy', 'name email avatar')
    .sort({ createdAt: -1 });

  // Apply search query filter in memory for combined field search (student name, title, issuer)
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    certificates = certificates.filter((cert) => {
      const titleMatch = cert.title.toLowerCase().includes(q);
      const issuerMatch = cert.issuingOrganization.toLowerCase().includes(q);
      const studentNameMatch = cert.student && cert.student.name.toLowerCase().includes(q);
      const studentEmailMatch = cert.student && cert.student.email.toLowerCase().includes(q);
      return titleMatch || issuerMatch || studentNameMatch || studentEmailMatch;
    });
  }

  return certificates;
};

/**
 * Review certificate (Staff approves or rejects with optional feedback)
 */
const reviewCertificate = async (certificateId, staffId, status, feedback = '') => {
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw new ValidationError('Invalid review status. Must be APPROVED or REJECTED.');
  }

  const certificate = await Certificate.findById(certificateId).populate('student', 'name email');
  if (!certificate) {
    throw new NotFoundError('Certificate not found.');
  }

  certificate.status = status;
  certificate.staffReviewedBy = staffId;
  certificate.staffFeedback = feedback.trim();
  certificate.reviewedAt = new Date();

  await certificate.save();

  // Log activity
  await ActivityLog.create({
    student: certificate.student._id,
    activityType: 'CERTIFICATE_REVIEWED',
    details: `Certificate "${certificate.title}" was ${status.toLowerCase()} by staff.`,
  });

  return certificate;
};

module.exports = {
  createCertificate,
  getStudentCertificates,
  getCertificateById,
  updateCertificate,
  deleteCertificate,
  getAllCertificates,
  reviewCertificate,
};
