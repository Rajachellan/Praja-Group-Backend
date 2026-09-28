const model=require('../models/careerModel')

async function addCareer(req,res) {
    const {jobName,jobRole,experience,responsibilities,qualifications,location}=req.body
    try{

        if(!jobName || !jobRole || !experience ||!responsibilities || !qualifications || !location){
            return res.status(401).json({
                success:false,
                message:"All Fields Are Required"
            })
        }

        const newJob=new model({jobName,jobRole,experience,responsibilities,qualifications,location})
        await newJob.save()
        res.status(201).json({
            success:true,
            message:"Job Added Successfully"
        })

    }
    catch(err){
        res.status(500).json({
            success:false,
            message:`ErrorName:${err.name} ErrorMessage:${err.message}`
        })
    }
}

async function getCareers(req, res) {
    try {
        const jobs = await model.find({}).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            jobs
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: `ErrorName:${err.name} ErrorMessage:${err.message}`
        });
    }
}

async function deleteCareer(req, res) {
    try {
        const { id } = req.params;
        await model.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "Job deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: `ErrorName:${err.name} ErrorMessage:${err.message}`
        });
    }
}

module.exports = { addCareer, getCareers, deleteCareer }