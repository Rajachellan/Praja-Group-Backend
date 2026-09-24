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

// REST API Endpoints for Blogs
router.post('/blogs', createBlog);
router.get('/blogs', getBlogs);
router.get('/blogs/slug/:slug', getBlogBySlug);
router.get('/blogs/:id', getBlogById);
router.put('/blogs/:id', updateBlog);
router.delete('/blogs/:id', deleteBlog);

// Action Endpoints
router.patch('/blogs/:id/publish', publishBlog);
router.patch('/blogs/:id/draft', draftBlog);
router.patch('/blogs/:id/schedule', scheduleBlog);

module.exports = router;
