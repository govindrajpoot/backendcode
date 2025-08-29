const express = require('express');
const router = express.Router();
const imageUploadController = require('../controllers/imageUploadController');
const verifyToken = require('../middleware/authMiddleware');

// Image upload routes
router.post('/upload', verifyToken, imageUploadController.uploadImages);
router.get('/images', verifyToken, imageUploadController.getUploadedImages);
router.delete('/images/:filename', verifyToken, imageUploadController.deleteImage);
router.delete('/cleanup', verifyToken, imageUploadController.cleanupImages);

module.exports = router;
