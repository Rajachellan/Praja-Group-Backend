const mongoose=require('mongoose')

const schema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Please Provide Valid Email Address"]
    },
    phNo:{
        type:String,
        required:true
    },
    about:{
        type:String,
        required:true
    },
    CareerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Careers",
        required:true
    }
    },
    {
        timestamps:true
    })

const model=mongoose.model("JobEnquiry",schema)

module.exports=model