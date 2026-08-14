const express = require('express');
const certificateController = require('../controllers/certificate.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

// Student routes
router.post('/', restrictTo('STUDENT'), certificateController.createCertificate);
router.get('/my-certificates', restrictTo('STUDENT'), certificateController.getMyCertificates);
router.put('/:id', restrictTo('STUDENT'), certificateController.updateCertificate);

// Shared / Role-checked routes
router.get('/:id', certificateController.getCertificateById);
router.delete('/:id', certificateController.deleteCertificate);

// Staff routes
router.get('/', restrictTo('STAFF'), certificateController.getAllCertificates);
router.patch('/:id/review', restrictTo('STAFF'), certificateController.reviewCertificate);

module.exports = router;
