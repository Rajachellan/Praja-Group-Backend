const express=require('express')

const router=express.Router()

const {addContactUsers,getDatas}=require('../controllers/contactFormController')

router.post('/add/contact',addContactUsers)
router.get('/get/data',getDatas)

module.exports=router