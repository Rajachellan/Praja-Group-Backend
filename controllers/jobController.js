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
    const {name,email,phNo,about,CareerId}=req.body
    try{
        if(!name || !email || !phNo || !about || !CareerId){
            return res.status(401).json({
                success:false,
                message:"All Fields Are Required"
            })
        }

        const enquiry=new model({name,email,phNo,about,CareerId})

        await enquiry.save()
        res.status(201).json({
            success:true,
            message:"Applied Successfully, Our Team Will Connect You Shortly"
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