const ALL_MODULES = [
  {
    id: 'overview',
    label: 'Dashboard Overview',
    description: 'Main dashboard overview, real-time metrics, and summary KPIs',
    path: '/dashboard',
  },
  {
    id: 'blogs',
    label: 'Create Blogs',
    description: 'Draft, format, and compose new blog articles',
    path: '/dashboard/blogs',
  },
  {
    id: 'uploaded-blogs',
    label: 'Uploaded Blogs',
    description: 'Manage, edit, publish, or remove existing blog posts',
    path: '/dashboard/blogs/manage',
  },
  {
    id: 'leads',
    label: 'Inquiries & Leads',
    description: 'Track contact inquiries, client leads, and messages',
    path: '/dashboard/leads',
  },
  {
    id: 'careers',
    label: 'Careers Management',
    description: 'Post and manage job openings and vacancies',
    path: '/dashboard/careers',
  },
  {
    id: 'jobEnquiry',
    label: 'Job Applications',
    description: 'Review applicant resumes, status, and job enquiries',
    path: '/dashboard/jobEnquiry',
  },
  {
    id: 'user-access',
    label: 'User Access & Permissions',
    description: 'Onboard administrators, assign section permissions, and manage roles',
    path: '/dashboard/user-access',
  },
];

const ALL_PERMISSION_KEYS = ALL_MODULES.map((m) => m.id);

module.exports = {
  ALL_MODULES,
  ALL_PERMISSION_KEYS,
};
