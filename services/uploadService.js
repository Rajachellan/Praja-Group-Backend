const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Get or create S3Client for Cloudflare R2 using active environment variables
 */
function getR2Client() {
  // Reload .env dynamically so live process immediately picks up updated R2 credentials
  require('dotenv').config({ override: true });

  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const accountId = process.env.R2_ACCOUNT_ID;
  const endpoint = process.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : null);

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    return null;
  }

  return new S3Client({
    region: 'auto',
    endpoint: endpoint,
    credentials: {
      accessKeyId: accessKeyId.trim(),
      secretAccessKey: secretAccessKey.trim()
    }
  });
}


/**
 * Upload file to Cloudflare R2 (or fallback to local disk)
 * @param {Object} file - Multer file object
 * @param {Object} req - Express request object
 * @param {String} folder - Subfolder key in R2 bucket (e.g. 'associate-directors' or 'images')
 */
async function processFileUpload(file, req, folder = 'uploads') {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  const cleanOriginalName = file.originalname ? file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_') : 'file';
  const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const key = `${folder}/${uniquePrefix}-${cleanOriginalName}`;

  const r2Client = getR2Client();
  const bucketName = process.env.R2_BUCKET;

  if (r2Client && bucketName) {
    try {
      // Read file content buffer from disk or memory
      const fileBuffer = file.buffer || fs.readFileSync(file.path);
      
      const command = new PutObjectCommand({
        Bucket: bucketName.trim(),
        Key: key,
        Body: fileBuffer,
        ContentType: file.mimetype || 'application/octet-stream'
      });

      await r2Client.send(command);

      // Clean up local temp file if saved to disk by multer
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      const publicBase = process.env.R2_PUBLIC_URL ? process.env.R2_PUBLIC_URL.replace(/\/$/, '') : '';
      const r2Url = publicBase ? `${publicBase}/${key}` : key;

      console.log(`Successfully uploaded ${file.originalname} to Cloudflare R2: ${r2Url}`);

      return {
        success: true,
        url: r2Url,
        key: key,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storage: 'cloudflare-r2'
      };
    } catch (r2Err) {
      console.error('Cloudflare R2 Upload Failed!');
      console.error('Error Code:', r2Err.Code || r2Err.name || 'Unknown');
      console.error('Error Message:', r2Err.message);
      if (r2Err.Code === 'AccessDenied' || r2Err.name === 'AccessDenied' || r2Err.$metadata?.httpStatusCode === 403) {
        console.error('--> Cloudflare R2 rejected credentials (403 Access Denied). Check API Token permissions (Object Read & Write) in Cloudflare Dashboard.');
      }
      // Fall through to local static file serving if R2 fails
    }
  } else {
    console.warn('Cloudflare R2 client or R2_BUCKET not configured in env. Using local storage fallback.');
  }

  // Fallback local storage response if R2 is not configured or fails
  const protocol = req.protocol || 'http';
  const host = req.get('host') || 'localhost:8000';
  const fileUrl = `${protocol}://${host}/uploads/${file.filename || path.basename(file.path)}`;

  return {
    success: true,
    url: fileUrl,
    publicId: file.filename || path.basename(file.path),
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    storage: 'local'
  };
}

module.exports = {
  processFileUpload,
  processImageUpload: processFileUpload
};


