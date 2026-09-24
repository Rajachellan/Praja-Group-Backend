const Blog = require('../models/Blog');
const slugify = require('../utils/slugify');

// Create Blog
async function createBlog(req, res) {
  try {
    const { title, slug, excerpt, featuredImage, coverImage, mainImage, content, category, tags, author, faqs, seo, status, scheduledAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: Title and Content are required.'
      });
    }

    const finalSlug = slugify(slug || title);

    // Check for duplicate slug
    const existingBlog = await Blog.findOne({ slug: finalSlug });
    if (existingBlog) {
      return res.status(400).json({
        success: false,
        message: `A blog with the slug "${finalSlug}" already exists.`
      });
    }

    const blogStatus = status || 'draft';
    const publishedAt = blogStatus === 'published' ? new Date() : null;

    const cover = coverImage || featuredImage || { url: '' };
    const main = mainImage || featuredImage || { url: '' };

    const newBlog = new Blog({
      title,
      slug: finalSlug,
      excerpt: excerpt || '',
      featuredImage: cover,
      coverImage: cover,
      mainImage: main,
      content,
      category: category || 'General',
      tags: tags || [],
      author: author || { name: 'Prajha Executive Team' },
      faqs: faqs || [],
      seo: seo || {},
      status: blogStatus,
      publishedAt,
      scheduledAt: blogStatus === 'scheduled' ? scheduledAt : null
    });

    await newBlog.save();

    return res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: newBlog
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error creating blog post'
    });
  }
}

// Get All Blogs (With search and filtering)
async function getBlogs(req, res) {
  try {
    const { search, category, status } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (category && category !== 'all') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    const blogs = await Blog.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error fetching blogs'
    });
  }
}

// Get Blog by ID
async function getBlogById(req, res) {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    return res.status(200).json({
      success: true,
      data: blog
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error fetching blog'
    });
  }
}

// Get Published Blog by Slug (Public Route)
async function getBlogBySlug(req, res) {
  try {
    const slug = slugify(req.params.slug);
    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Only allow public access if published or scheduled and date has passed
    const isPublic = blog.status === 'published' || 
      (blog.status === 'scheduled' && blog.scheduledAt && new Date(blog.scheduledAt) <= new Date());

    if (!isPublic) {
      return res.status(403).json({
        success: false,
        message: 'This blog post is not yet published.'
      });
    }

    return res.status(200).json({
      success: true,
      data: blog
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error fetching blog by slug'
    });
  }
}

// Update Blog
async function updateBlog(req, res) {
  try {
    const { id } = req.params;
    const { title, slug, excerpt, featuredImage, coverImage, mainImage, content, category, tags, author, faqs, seo, status, scheduledAt } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Slug check if slug updated
    let finalSlug = blog.slug;
    if (slug || title) {
      const candidateSlug = slugify(slug || title);
      if (candidateSlug !== blog.slug) {
        const existing = await Blog.findOne({ slug: candidateSlug, _id: { $ne: id } });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: `A blog with the slug "${candidateSlug}" already exists.`
          });
        }
        finalSlug = candidateSlug;
      }
    }

    if (title) blog.title = title;
    blog.slug = finalSlug;
    blog.excerpt = excerpt || blog.excerpt || '';
    if (coverImage) {
      blog.coverImage = coverImage;
      blog.featuredImage = coverImage;
    } else if (featuredImage) {
      blog.featuredImage = featuredImage;
      blog.coverImage = featuredImage;
    }
    if (mainImage) blog.mainImage = mainImage;
    if (content) blog.content = content;
    if (category) blog.category = category;
    if (tags) blog.tags = tags;
    if (author) blog.author = author;
    if (faqs) blog.faqs = faqs;
    if (seo) blog.seo = seo;

    if (status) {
      blog.status = status;
      if (status === 'published' && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
      if (status === 'scheduled') {
        blog.scheduledAt = scheduledAt || blog.scheduledAt;
      }
    }

    await blog.save();

    return res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: blog
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error updating blog'
    });
  }
}

// Delete Blog
async function deleteBlog(req, res) {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error deleting blog'
    });
  }
}

// Publish Blog
async function publishBlog(req, res) {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    blog.status = 'published';
    if (!blog.publishedAt) {
      blog.publishedAt = new Date();
    }
    await blog.save();

    return res.status(200).json({
      success: true,
      message: 'Blog published successfully',
      data: blog
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// Save Draft
async function draftBlog(req, res) {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    blog.status = 'draft';
    await blog.save();

    return res.status(200).json({
      success: true,
      message: 'Blog saved as draft',
      data: blog
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// Schedule Blog
async function scheduleBlog(req, res) {
  try {
    const { scheduledAt } = req.body;
    if (!scheduledAt) {
      return res.status(400).json({ success: false, message: 'Scheduled date is required' });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    blog.status = 'scheduled';
    blog.scheduledAt = new Date(scheduledAt);
    await blog.save();

    return res.status(200).json({
      success: true,
      message: `Blog scheduled for ${blog.scheduledAt.toLocaleString()}`,
      data: blog
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  createBlog,
  getBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  publishBlog,
  draftBlog,
  scheduleBlog
};
