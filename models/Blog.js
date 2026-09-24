const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Blog slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  excerpt: {
    type: String,
    default: '',
    trim: true
  },
  featuredImage: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    alt: { type: String, default: '' }
  },
  coverImage: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    alt: { type: String, default: '' }
  },
  mainImage: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    alt: { type: String, default: '' }
  },
  content: {
    type: Object,
    required: [true, 'Blog content is required']
  },
  category: {
    type: String,
    default: 'General',
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    name: {
      type: String,
      default: 'Prajha Executive Team'
    },
    id: { type: String, default: '' }
  },
  faqs: [{
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }],
  seo: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: [{ type: String }],
    canonicalUrl: { type: String, default: '' },
    ogTitle: { type: String, default: '' },
    ogDescription: { type: String, default: '' },
    ogImage: { type: String, default: '' }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'scheduled'],
    default: 'draft',
    index: true
  },
  publishedAt: { type: Date },
  scheduledAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Blog', blogSchema);
