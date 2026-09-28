const mongoose=require('mongoose')


const schema=new mongoose.Schema({
    jobName:{
        type:String,
        required:true,
        trim:true
    },
    // jobRole:{
    //     type:String,
    //     required:true,
    //     trim:true
    // },
    experience:{
        type:String,
        required:true,
        trim:true
    },
    location:{
        type:String,
        required:true
    },
    responsibilities:{
        type:[String],
        required:true
    },
    qualifications:{
        type:[String],
        required:true
    }
    },
    {
        timestamps:true
    }
    )

    const model=mongoose.model("Careers",schema)

    module.exports=model