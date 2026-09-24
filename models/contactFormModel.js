const mongoose=require('mongoose')

const schema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        minlength:2,
        maxlength:100
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Please Provide Valid Email Address"]
    },
    message:{
        type:String,
        required:true
    },
    phNo:{
        type:Number,
        required:true
    },
    propertyLocation:{
        type:String,
        default:"N/A"
    },
    directorRole:{
        type:String,
        enum:["Bussiness Development","Construction","Facility Management"]
    },
    file:{
        type:String
    }
    },  
        {
            timestamps:true
        }
    )

    const model=mongoose.model("Contacted-Users",schema)

    // Safely drop legacy unique index on email if present in MongoDB
    model.collection.dropIndex("email_1").catch(() => {});

    module.exports=model
