const express=require('express')

const router=express.Router()

const multer = require('multer');
const path = require('path');
const {addJobEnquiry, getJobEnquiries}=require('../controllers/jobController')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, 'resume-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }
});

router.get('/get/job/enquiries', getJobEnquiries)
router.post('/add/job/enquiry', (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, addJobEnquiry)

module.exports=router