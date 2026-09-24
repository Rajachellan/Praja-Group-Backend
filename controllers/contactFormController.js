const contactModel=require('../models/contactFormModel')

async function addContactUsers(req,res) {
    const {name,email,message,phNo,directorRole,file,propertyLocation}=req.body
    try{
        if(!name || !email || !message || !phNo){
            return res.status(400).json({
                success:false,
                message:"All required fields (Name, Email, Phone Number, Message) are required."
            })
        }

        const newLead=new contactModel({
            name,
            email,
            message,
            phNo,
            directorRole,
            file,
            propertyLocation: propertyLocation || "N/A"
        })
        await newLead.save()
        res.status(200).json({
            success:true,
            message:"Contacted Successfully, Our Team Will Connect You Shortly"
        })
    }
    catch(err){
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "An enquiry with this email address has already been submitted."
            })
        }
        res.status(500).json({
            success:false,
            message: err.message || "Failed to submit enquiry. Please try again."
        })
    }
}

module.exports={addContactUsers}