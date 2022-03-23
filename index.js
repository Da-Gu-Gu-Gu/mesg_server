const express=require('express')
const app=express()
const mongoose=require('mongoose')
const cors=require('cors')
const dotenv=require('dotenv').config()

app.use(cors())

mongoose.connect(process.env.MONGODB)
.then(()=>console.log('good'))
.catch((err)=>console.log(err.message))

app.listen(5000,()=>console.log('Server is running on 5000'))