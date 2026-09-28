const express=require('express')

const router=express.Router()

const {addJobEnquiry, getJobEnquiries}=require('../controllers/jobController')

router.get('/get/job/enquiries', getJobEnquiries)
router.post('/add/job/enquiry',addJobEnquiry)

module.exports=router