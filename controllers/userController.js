const model=require('../models/userModel')

const bcrypt=require('bcrypt')

async function addUsers(req,res) {
    const {name,email,password}=req.body
    try{
        
        if(!name || !email || !password){
            return res.status(401).json({
                success:false,
                message:"All Fields Are Required"
            })
        }

        const genSalt=await bcrypt.genSalt(10)
        const hashPassword=await bcrypt.hash(password,genSalt)

        const newUser=new model({name,email,password:hashPassword})
        await newUser.save()
        res.status(201).json({
            success:true,
            message:"User Added Successfully"
        })

    }
    catch(err){
        res.status(500).json({
            success:false,
            message:`ErrorName:${err.name} ErrorMessage:${err.message}`
        })
    }
}


async function loginFun(req,res) {
    const {email,password}=req.body
    try{
        if(!email || !password){
            return res.status(401).json({
                success:false,
                message:"All Fields Are Required"
            })
        }

        const findUser=await model.findOne({email})

        if(!findUser){
            return res.status(401).json({
                success:false,
                message:"User Not Found"
            })
        }

        const comparePassWord=await bcrypt.compare(password,findUser.password)

        if(!comparePassWord){
            return res.status(401).json({
                success:false,
                message:"Invalid Password"
            })
        }

        res.status(201).json({
            success:true,
            message:"Logined Successfully",
            name:findUser.name,
            email:findUser.email
        })
    }
    catch(err){
         res.status(500).json({
            success:false,
            message:`ErrorName:${err.name} ErrorMessage:${err.message}`
        })
    }
}

module.exports={addUsers,loginFun}