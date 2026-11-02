const Blog = require('../models/Blog');
const slugify = require('../utils/slugify');
const { processFileUpload } = require('../services/uploadService');

// Create Blog
async function createBlog(req, res) {
  try {
    const {
      title,
      slug,
      excerpt,
      featuredImage,
      coverImage,
      mainImage,
      content,
      category,
      author,
      faqs,
      seo,
      status,
      scheduledAt,
      metaTitle,
      metaDesc
    } = req.body;

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
    const publishedAt = (blogStatus === 'published' || blogStatus === 'publish') ? new Date() : null;

    // Normalizing arrays from FormData
    const rawTags = req.body.tags || req.body['tags[]'] || [];
    const tags = Array.isArray(rawTags) ? rawTags : [rawTags].filter(Boolean);

    const rawKeywords = req.body.keywords || req.body['keywords[]'] || [];
    const keywords = Array.isArray(rawKeywords) ? rawKeywords : [rawKeywords].filter(Boolean);

    const rawFocusKeyword = req.body.focusKeyword || req.body['focusKeyword[]'] || [];
    const focusKeyword = Array.isArray(rawFocusKeyword) ? rawFocusKeyword : [rawFocusKeyword].filter(Boolean);

    let imageUrl = req.body.images || '';
    if (req.file) {
      try {
        const uploadResult = await processFileUpload(req.file, req, 'images');
        imageUrl = uploadResult.url || '';
      } catch (uploadErr) {
        console.error('File upload error in createBlog:', uploadErr);
      }
    }

    const cover = imageUrl ? { url: imageUrl } : (coverImage || featuredImage || { url: '' });
    const main = imageUrl ? { url: imageUrl } : (mainImage || featuredImage || { url: '' });
    const finalMetaTitle = metaTitle || (seo && seo.title) || title;
    const finalMetaDesc = metaDesc || (seo && seo.description) || excerpt || '';

    const newBlog = new Blog({
      title,
      slug: finalSlug,
      excerpt: excerpt || finalMetaDesc,
      featuredImage: cover,
      coverImage: cover,
      mainImage: main,
      images: imageUrl || cover.url || '',
      metaTitle: finalMetaTitle,
      metaDesc: finalMetaDesc,
      keywords,
      focusKeyword,
      content,
      category: category || 'General',
      tags,
      author: author || { name: 'Prajha Executive Team' },
      faqs: faqs || [],
      seo: {
        title: finalMetaTitle,
        description: finalMetaDesc,
        keywords: [...new Set([...keywords, ...focusKeyword, ...tags])],
        ...(seo || {})
      },
      status: blogStatus,
      publishedAt,
      scheduledAt: blogStatus === 'scheduled' ? scheduledAt : null
    });

    await newBlog.save();

    return res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      blog: newBlog,
      data: newBlog
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error creating blog post'
    });
  }
}

// Get All Blogs (With search, filtering, and pagination)
async function getBlogs(req, res) {
  try {
    const { search, category, status } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      if (status === 'publish') {
        filter.$or = [{ status: 'publish' }, { status: 'published' }];
      } else {
        filter.status = status;
      }
    }

    if (category && category !== 'all') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') },
        { metaTitle: new RegExp(search, 'i') }
      ];
    }

function formatBlogResponse(b) {
  if (!b) return null;
  const obj = b.toObject ? b.toObject() : { ...b };
  const imgUrl = obj.images || obj.coverImage?.url || obj.featuredImage?.url || obj.mainImage?.url || (typeof obj.coverImage === 'string' ? obj.coverImage : '') || (typeof obj.featuredImage === 'string' ? obj.featuredImage : '') || '';
  obj.images = imgUrl;
  obj.coverImage = { url: imgUrl, publicId: obj.coverImage?.publicId || '', alt: obj.coverImage?.alt || obj.title || '' };
  obj.featuredImage = { url: imgUrl, publicId: obj.featuredImage?.publicId || '', alt: obj.featuredImage?.alt || obj.title || '' };
  obj.mainImage = { url: imgUrl, publicId: obj.mainImage?.publicId || '', alt: obj.mainImage?.alt || obj.title || '' };

  if (!obj.metaTitle) {
    obj.metaTitle = obj.seo?.title || obj.title || '';
  }
  if (!obj.metaDesc) {
    obj.metaDesc = obj.seo?.description || obj.excerpt || '';
  }
  return obj;
}

// Get All Blogs (With search, filtering, and pagination)
async function getBlogs(req, res) {
  try {
    const { search, category, status } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      if (status === 'publish') {
        filter.$or = [{ status: 'publish' }, { status: 'published' }];
      } else {
        filter.status = status;
      }
    }

    if (category && category !== 'all') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') },
        { metaTitle: new RegExp(search, 'i') }
      ];
    }

    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const totalBlogs = await Blog.countDocuments(filter);

    let query = Blog.find(filter).sort({ createdAt: -1 });
    if (page && limit) {
      query = query.skip((page - 1) * limit).limit(limit);
    }
    const rawBlogs = await query;
    const blogs = rawBlogs.map((b) => formatBlogResponse(b));

    const totalPages = limit ? Math.ceil(totalBlogs / limit) : 1;

    return res.status(200).json({
      success: true,
      count: totalBlogs,
      totalBlogs,
      totalPages,
      currentPage: page || 1,
      blogs,
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
    const rawBlog = await Blog.findById(req.params.id);
    if (!rawBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    const blog = formatBlogResponse(rawBlog);
    return res.status(200).json({
      success: true,
      blog,
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
    const rawBlog = await Blog.findOne({ slug });

    if (!rawBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Only allow public access if published or scheduled and date has passed
    const isPublic = rawBlog.status === 'published' || rawBlog.status === 'publish' ||
      (rawBlog.status === 'scheduled' && rawBlog.scheduledAt && new Date(rawBlog.scheduledAt) <= new Date());

    if (!isPublic) {
      return res.status(403).json({
        success: false,
        message: 'This blog post is not yet published.'
      });
    }

    const blog = formatBlogResponse(rawBlog);

    return res.status(200).json({
      success: true,
      blog,
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
    const {
      title,
      slug,
      excerpt,
      featuredImage,
      coverImage,
      mainImage,
      content,
      category,
      author,
      faqs,
      seo,
      status,
      scheduledAt,
      metaTitle,
      metaDesc
    } = req.body;

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

    let imageUrl = req.body.images || '';
    if (req.file) {
      try {
        const uploadResult = await processFileUpload(req.file, req, 'images');
        imageUrl = uploadResult.url || '';
      } catch (uploadErr) {
        console.error('File upload error in updateBlog:', uploadErr);
      }
    }

    if (title) blog.title = title;
    blog.slug = finalSlug;
    if (content) blog.content = content;
    if (category) blog.category = category;

    if (imageUrl) {
      blog.images = imageUrl;
      blog.coverImage = { url: imageUrl };
      blog.featuredImage = { url: imageUrl };
    } else if (coverImage) {
      blog.coverImage = coverImage;
      blog.featuredImage = coverImage;
      if (coverImage.url) blog.images = coverImage.url;
    } else if (featuredImage) {
      blog.featuredImage = featuredImage;
      blog.coverImage = featuredImage;
      if (featuredImage.url) blog.images = featuredImage.url;
    }

    if (mainImage) blog.mainImage = mainImage;

    const rawTags = req.body.tags || req.body['tags[]'];
    if (rawTags !== undefined) {
      blog.tags = Array.isArray(rawTags) ? rawTags : [rawTags].filter(Boolean);
    }

    const rawKeywords = req.body.keywords || req.body['keywords[]'];
    if (rawKeywords !== undefined) {
      blog.keywords = Array.isArray(rawKeywords) ? rawKeywords : [rawKeywords].filter(Boolean);
    }

    const rawFocusKeyword = req.body.focusKeyword || req.body['focusKeyword[]'];
    if (rawFocusKeyword !== undefined) {
      blog.focusKeyword = Array.isArray(rawFocusKeyword) ? rawFocusKeyword : [rawFocusKeyword].filter(Boolean);
    }

    if (metaTitle !== undefined) blog.metaTitle = metaTitle;
    if (metaDesc !== undefined) blog.metaDesc = metaDesc;
    if (excerpt !== undefined) blog.excerpt = excerpt || blog.metaDesc || '';

    if (author) blog.author = author;
    if (faqs) blog.faqs = faqs;
    if (seo) {
      blog.seo = seo;
    } else if (blog.metaTitle || blog.metaDesc) {
      blog.seo = {
        title: blog.metaTitle || blog.title,
        description: blog.metaDesc || blog.excerpt,
        keywords: blog.keywords || blog.tags || [],
        ...(blog.seo || {})
      };
    }

    if (status) {
      blog.status = status;
      if ((status === 'published' || status === 'publish') && !blog.publishedAt) {
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
      blog,
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
