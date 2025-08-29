const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer for image uploads only
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    const uploadDir = 'uploads/images/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type. Only images (jpeg, jpg, png, gif, webp) are allowed.'));
};

// Configure multer for multiple image uploads
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per image
    files: 10 // Maximum 10 images per upload
  },
  fileFilter: fileFilter
}).array('images', 10); // Accept up to 10 images with field name 'images'

// Middleware to handle multer errors
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: false,
        message: 'File too large. Maximum size is 10MB per image.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: false,
        message: 'Too many files. Maximum 10 images allowed per upload.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: false,
        message: 'Unexpected field. Please use "images" as the field name.'
      });
    }
  }
  
  if (err.message === 'Invalid file type. Only images (jpeg, jpg, png, gif, webp) are allowed.') {
    return res.status(400).json({
      status: false,
      message: err.message
    });
  }

  return res.status(500).json({
    status: false,
    message: 'File upload error',
    error: err.message
  });
};

// Upload multiple images
exports.uploadImages = [
  upload,
  handleUploadErrors,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          status: false,
          message: 'No images were uploaded.'
        });
      }

      // Generate file URLs
      const uploadedFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: `/uploads/images/${file.filename}`,
        path: file.path
      }));

      res.status(200).json({
        status: true,
        message: 'Images uploaded successfully',
        count: uploadedFiles.length,
        files: uploadedFiles
      });

    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({
        status: false,
        message: 'Server error during image upload',
        error: error.message
      });
    }
  }
];

// Get all uploaded images (for testing/admin purposes)
exports.getUploadedImages = async (req, res) => {
  try {
    const imagesDir = 'uploads/images/';
    
    // Check if directory exists
    if (!fs.existsSync(imagesDir)) {
      return res.status(200).json({
        status: true,
        message: 'No images uploaded yet',
        images: []
      });
    }

    // Read directory and get image files
    const files = fs.readdirSync(imagesDir);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    const images = imageFiles.map(file => ({
      filename: file,
      url: `/uploads/images/${file}`,
      path: path.join(imagesDir, file)
    }));

    res.status(200).json({
      status: true,
      count: images.length,
      images
    });

  } catch (error) {
    console.error('Get uploaded images error:', error);
    res.status(500).json({
      status: false,
      message: 'Server error while fetching uploaded images',
      error: error.message
    });
  }
};

// Delete specific uploaded image
exports.deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join('uploads/images/', filename);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        status: false,
        message: 'Image not found'
      });
    }

    // Delete the file
    fs.unlinkSync(imagePath);

    res.status(200).json({
      status: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      status: false,
      message: 'Server error while deleting image',
      error: error.message
    });
  }
};

// Clean up all uploaded images (for testing/admin purposes)
exports.cleanupImages = async (req, res) => {
  try {
    const imagesDir = 'uploads/images/';
    
    // Check if directory exists
    if (!fs.existsSync(imagesDir)) {
      return res.status(200).json({
        status: true,
        message: 'No images to clean up',
        deletedCount: 0
      });
    }

    // Read directory and get all files
    const files = fs.readdirSync(imagesDir);
    let deletedCount = 0;

    files.forEach(file => {
      const filePath = path.join(imagesDir, file);
      fs.unlinkSync(filePath);
      deletedCount++;
    });

    res.status(200).json({
      status: true,
      message: 'Images cleaned up successfully',
      deletedCount
    });

  } catch (error) {
    console.error('Cleanup images error:', error);
    res.status(500).json({
      status: false,
      message: 'Server error while cleaning up images',
      error: error.message
    });
  }
};
