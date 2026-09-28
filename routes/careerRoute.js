const express=require('express')

const router=express.Router()

const { addCareer, getCareers, deleteCareer } = require('../controllers/careerController')

router.post('/add/job', addCareer)
router.get('/get/jobs', getCareers)
router.delete('/update/job/:id', deleteCareer)

module.exports = router