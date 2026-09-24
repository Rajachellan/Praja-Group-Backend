const mongoose=require('mongoose')

const schema=new mongoose.Schema({
    name:{
        type:String,
        require:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Please Provide Valid Email Address"]
    },
    password:{
        type:String,
        required:true
    }
})

const model=mongoose.model("Users",schema)

module.exports=model