const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const verifyToken = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    if (file.fieldname === 'images') {
      uploadPath += 'shipment-images/';
    } else if (file.fieldname === 'videos') {
      uploadPath += 'shipment-videos/';
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'images') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for images'), false);
    }
  } else if (file.fieldname === 'videos') {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed for videos'), false);
    }
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Shipment routes
router.post('/', verifyToken, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 3 }
]), shipmentController.createShipment);

router.get('/', verifyToken, shipmentController.getAllShipments);
router.get('/courier-services', verifyToken, shipmentController.getCourierServices);
router.get('/:id', verifyToken, shipmentController.getShipmentById);
router.put('/:id', verifyToken, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 3 }
]), shipmentController.updateShipment);
router.delete('/:id', verifyToken, shipmentController.deleteShipment);

module.exports = router;
