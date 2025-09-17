const fs = require('fs');
const path = require('path');

// File validation middleware
const validateFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const file = req.file;
  
  // Check file size
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 1024 * 1024 * 1024; // 1GB
  if (file.size > maxSize) {
    // Remove uploaded file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return res.status(400).json({ 
      message: `File size too large. Maximum size is ${maxSize / (1024 * 1024 * 1024)}GB.` 
    });
  }

  // Check file extension
  const allowedExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    // Remove uploaded file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return res.status(400).json({ 
      message: 'Invalid file type. Only video files are allowed.' 
    });
  }

  // Check for potentially malicious file names
  const maliciousPatterns = [
    /\.\./, // Directory traversal
    /[<>:"|?*]/, // Invalid characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Reserved names
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(file.originalname)) {
      // Remove uploaded file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({ 
        message: 'Invalid file name.' 
      });
    }
  }

  next();
};

// Image validation middleware
const validateImage = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  const file = req.file;
  
  // Check file size
  const maxSize = parseInt(process.env.MAX_IMAGE_SIZE) || 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    // Remove uploaded file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return res.status(400).json({ 
      message: `Image size too large. Maximum size is ${maxSize / (1024 * 1024)}MB.` 
    });
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    // Remove uploaded file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return res.status(400).json({ 
      message: 'Invalid image type. Only JPG, PNG, GIF, and WebP are allowed.' 
    });
  }

  // Check for potentially malicious file names
  const maliciousPatterns = [
    /\.\./, // Directory traversal
    /[<>:"|?*]/, // Invalid characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Reserved names
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(file.originalname)) {
      // Remove uploaded file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({ 
        message: 'Invalid file name.' 
      });
    }
  }

  next();
};

module.exports = {
  validateFile,
  validateImage
}; 