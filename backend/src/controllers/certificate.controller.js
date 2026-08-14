const certificateService = require('../services/certificate.service');
const asyncHandler = require('../middleware/asyncHandler');

const createCertificate = asyncHandler(async (req, res) => {
  const certificate = await certificateService.createCertificate(req.user._id, req.body);
  res.status(201).json({
    status: 'success',
    data: { certificate },
  });
});

const getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await certificateService.getStudentCertificates(req.user._id);
  res.status(200).json({
    status: 'success',
    results: certificates.length,
    data: { certificates },
  });
});

const getCertificateById = asyncHandler(async (req, res) => {
  const certificate = await certificateService.getCertificateById(
    req.params.id,
    req.user._id,
    req.user.role
  );
  res.status(200).json({
    status: 'success',
    data: { certificate },
  });
});

const updateCertificate = asyncHandler(async (req, res) => {
  const certificate = await certificateService.updateCertificate(
    req.params.id,
    req.user._id,
    req.body
  );
  res.status(200).json({
    status: 'success',
    data: { certificate },
  });
});

const deleteCertificate = asyncHandler(async (req, res) => {
  await certificateService.deleteCertificate(req.params.id, req.user._id, req.user.role);
  res.status(200).json({
    status: 'success',
    message: 'Certificate successfully deleted',
  });
});

const getAllCertificates = asyncHandler(async (req, res) => {
  const certificates = await certificateService.getAllCertificates(req.query);
  res.status(200).json({
    status: 'success',
    results: certificates.length,
    data: { certificates },
  });
});

const reviewCertificate = asyncHandler(async (req, res) => {
  const { status, feedback } = req.body;
  const certificate = await certificateService.reviewCertificate(
    req.params.id,
    req.user._id,
    status,
    feedback
  );
  res.status(200).json({
    status: 'success',
    data: { certificate },
  });
});

module.exports = {
  createCertificate,
  getMyCertificates,
  getCertificateById,
  updateCertificate,
  deleteCertificate,
  getAllCertificates,
  reviewCertificate,
};
