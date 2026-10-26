const model=require('../models/JobModel')

async function getJobEnquiries(req, res) {
    try {
        const enquiries = await model.find({})
            .populate('CareerId', 'jobName')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            enquiries
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `ErrorName:${err.name} ErrorMessage:${err.message}`
        });
    }
}

async function addJobEnquiry(req,res) {
    let {name,email,phNo,about,CareerId,resume}=req.body
    try{
        if(!name || !email || !phNo || !about || !CareerId){
            return res.status(400).json({
                success:false,
                message:"All Fields Are Required"
            })
        }

        // Support direct multipart file upload if attached
        const uploadedFile = req.file || (req.files && req.files[0]);
        if (uploadedFile) {
            const { processFileUpload } = require('../services/uploadService');
            const uploadResult = await processFileUpload(uploadedFile, req, 'resumes');
            resume = uploadResult.url;
        }

        const enquiry=new model({
            name,
            email,
            phNo,
            about,
            CareerId,
            resume: resume || ''
        })

        await enquiry.save()
        res.status(201).json({
            success:true,
            message:"Applied Successfully, Our Team Will Connect You Shortly",
            enquiry
        })
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:`ErrorName:${err.name} ErrorMessage:${err.message}`
        }) 
    }
}

module.exports={addJobEnquiry, getJobEnquiries}