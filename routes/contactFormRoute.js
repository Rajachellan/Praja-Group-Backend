const express=require('express')

const router=express.Router()

const {addContactUsers}=require('../controllers/contactFormController')

router.post('/add/contact',addContactUsers)

module.exports=router