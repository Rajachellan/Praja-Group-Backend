const express = require('express');
const router = express.Router();
const {
  createBlog,
  getBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  publishBlog,
  draftBlog,
  scheduleBlog
} = require('../controllers/blogController');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, 'blog-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }
});

// REST API Endpoints for Blogs
router.post('/blogs', upload.single('image'), createBlog);
router.get('/blogs', getBlogs);
router.get('/blogs/slug/:slug', getBlogBySlug);
router.get('/blogs/:id', getBlogById);
router.put('/blogs/:id', upload.single('image'), updateBlog);
router.delete('/blogs/:id', deleteBlog);


// Action Endpoints
router.patch('/blogs/:id/publish', publishBlog);
router.patch('/blogs/:id/draft', draftBlog);
router.patch('/blogs/:id/schedule', scheduleBlog);

module.exports = router;
