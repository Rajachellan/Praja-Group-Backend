require('dotenv').config()

const express=require('express')
const cors=require('cors')

const app=express()

app.use(express.json())
app.use(cors())

const port=process.env.PORT || 8000

// Db Connect
const dbConnect=require('./config/db')
dbConnect()

// Contact Form Routes
const contactFormRoute=require('./routes/contactFormRoute')
app.use('/api',contactFormRoute)

app.listen(port,()=>{
    console.log(`Server Running Successfully On ${port}`);
})