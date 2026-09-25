const contactModel = require('../models/contactFormModel');

async function addContactUsers(req, res) {
    const { name, email, message, phNo, directorRole, file, propertyLocation } = req.body;
    try {
        if (!name || !email || !message || !phNo) {
            return res.status(400).json({
                success: false,
                message: "All required fields (Name, Email, Phone Number, Message) are required."
            });
        }

        const newLead = new contactModel({
            name,
            email,
            message,
            phNo,
            directorRole,
            file,
            propertyLocation: propertyLocation || "N/A"
        });
        await newLead.save();
        res.status(200).json({
            success: true,
            message: "Application submitted successfully. Our team will get back to you shortly.",
            data: newLead
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "An enquiry or application with this email address has already been submitted."
            });
        }
        res.status(500).json({
            success: false,
            message: err.message || "Failed to submit enquiry. Please try again."
        });
    }
}


async function getDatas(req,res) {
    try{
        const data=await contactModel.find()

        if(!data){
            return res.status(401).json({
                success:false,
                message:"Data Not Found"
            })
        }

        res.status(200).json({
            success:true,
            message:"Data Fetched Successfully",
            data:data
        })
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:`ErrorName:${err.name} ErrorMessage:${err.message}`
        })
    }
}

module.exports={addContactUsers,getDatas}
