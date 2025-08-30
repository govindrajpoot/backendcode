const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer for image and video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine upload directory based on file type
    let uploadDir;
    if (file.fieldname === 'images') {
      uploadDir = 'uploads/images/';
    } else if (file.fieldname === 'videos') {
      uploadDir = 'uploads/videos/';
    }
    
    // Create upload directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = file.fieldname === 'images' ? 'image-' : 'video-';
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images and videos
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'images') {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedImageTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid image type. Only images (jpeg, jpg, png, gif, webp) are allowed.'));
  } else if (file.fieldname === 'videos') {
    const allowedVideoTypes = /mp4|mov|avi|wmv|webm/;
    const extname = allowedVideoTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedVideoTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid video type. Only videos (mp4, mov, avi, wmv, webm) are allowed.'));
  } else {
    cb(new Error('Unexpected field name'));
  }
};

// Configure multer for multiple file uploads (images and videos)
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit per file
    files: 11 // Maximum 11 files total per upload (10 images + 1 video)
  },
  fileFilter: fileFilter
}).fields([
  { name: 'images', maxCount: 10 }, // Max 10 images
  { name: 'videos', maxCount: 1 }   // Max 1 video
]);

// Middleware to handle multer errors
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: false,
        message: 'File too large. Maximum size is 100MB per file.'
      });
    }
    if (极
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: false,
        message: 'Too many files. Maximum 10 images and 1 video allowed per upload.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: false,
        message: 'Unexpected field. Please use "images" for images and "videos" for videos.'
      });
    }
  }
  
  if (err.message.includes('Invalid image type') || err.message.includes('Invalid video type')) {
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

// Upload multiple images and videos
exports.uploadMedia = [
  upload,
  handleUploadErrors,
  async (req, res) => {
    try {
      if ((!req.files || Object.keys(req.files).length === 0) || 
          (!req.files.images && !req.files.videos)) {
        return res.status(400).json({
          status: false,
          message: 'No files were uploaded. Please upload images or videos.'
        });
      }

      const uploadedFiles = {
        images: [],
        videos: []
      };

      // Process uploaded images
      if (req.files.images) {
        uploadedFiles.images = req.files.images.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          url: `/uploads/images/${file.filename}`,
          path: file.path,
          type: 'image'
        }));
      }

      // Process uploaded videos
      if (req.files.videos) {
        uploadedFiles.videos = req.files.videos.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          url: `/uploads/videos/${file.filename}`,
          path: file.path,
          type: 'video'
        }));
      }

      const totalCount = uploadedFiles.images.length + uploadedFiles.videos.length;

      res.status(200).json({
        status: true,
        message: 'Files uploaded successfully',
        count: totalCount,
        files: uploadedFiles
      });

    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({
        status: false,
        message: 'Server error during file upload',
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

// Get all uploaded videos (for testing/admin purposes)
exports.getUploadedVideos = async (req, res) => {
  try {
    const videosDir = 'uploads/videos/';
    
    // Check if directory exists
    if (!fs.existsSync(videosDir)) {
      return res.status(200).json({
        status: true,
        message: 'No videos uploaded yet',
        videos: []
      });
    }

    // Read directory and get video files
    const files = fs.readdirSync(videosDir);
    const videoFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp4', '.mov', '.avi', '.wmv', '.webm'].includes(ext);
    });

    const videos = videoFiles.map(file => ({
      filename: file,
      url: `/uploads/videos/${file}`,
      path: path.join(videosDir, file)
    }));

    res.status(200).json({
      status: true,
      count: videos.length,
      videos
    });

  } catch (error) {
    console.error('Get uploaded videos error:', error);
    res.status(500).json({
      status: false,
      message: 'Server error while fetching uploaded videos',
      error: error.message
    });
  }
};

// Delete specific uploaded file
exports.deleteFile = async (req, res) => {
  try {
    const { filename, type } = req.params;
    let filePath;
    
    if (type === 'image') {
      filePath = path.join('uploads/images/', filename);
    } else if (type === 'video') {
      filePath = path.join('uploads/videos/', filename);
    } else {
      return res.status(400).json({
        status: false,
        message: 'Invalid file type. Use "image" or "video".'
      });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: false,
        message: 'File not found'
      });
    }

    // Delete the file
    fs.unlinkSync(filePath);

    res.status(200).json({
      status: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      status: false,
      message: 'Server error while deleting file',
      error: error.message
    });
  }
};

// Clean up all uploaded files (for testing/admin purposes)
exports.cleanupFiles = async (req, res) => {
  try {
    const imagesDir = 'uploads/images/';
    const videosDir = 'uploads/videos/';
    let deletedCount = 0;

    // Clean up images
    if (fs.existsSync(imagesDir)) {
      const imageFiles = fs.readdirSync(imagesDir);
      imageFiles.forEach(file => {
        const filePath = path.join(imagesDir, file);
        fs.unlinkSync(filePath);
        deletedCount++;
      });
    }

    // Clean up videos
    if (fs.existsSync(videosDir)) {
      const videoFiles = fs.readdirSync(videosDir);
      videoFiles.forEach(file => {
        const filePath = path.join(videosDir, file);
        fs.unlinkSync(filePath);
        deletedCount++;
      });
    }

    res.status(200).json({
      status: true,
      message: 'Files cleaned up successfully',
      deletedCount
    });

  } catch (error) {
    console.error('Cleanup files error:', error);
    res.status(500).json({
      status: false,
      message: 'Server error while cleaning up files',
      error: error.message
    });
  }
};
