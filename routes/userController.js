const express=require('express')

const router=express.Router()

const {addUsers,loginFun}=require('../controllers/userController')

router.post('/user/register',addUsers)
router.post('/user/login',loginFun)

module.exports=router