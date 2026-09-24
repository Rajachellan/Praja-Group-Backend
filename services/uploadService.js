const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Upload service wrapper. Easily pluggable with Cloudflare R2, S3, or Cloudinary.
 * Currently stores files locally in /uploads directory and returns absolute/relative URLs.
 */
async function processImageUpload(file, req) {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  const protocol = req.protocol || 'http';
  const host = req.get('host') || 'localhost:8000';
  const fileUrl = `${protocol}://${host}/uploads/${file.filename}`;

  return {
    success: true,
    url: fileUrl,
    publicId: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size
  };
}

module.exports = {
  processImageUpload
};
