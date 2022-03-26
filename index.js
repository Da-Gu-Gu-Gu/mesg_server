const express=require('express')
const app=express()
const dotenv=require('dotenv').config()
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose=require('mongoose')
const cors=require('cors')



app.use(cors())
app.use(express.json())

//router
const userRoute=require('./routes/User')
app.use('/api/user/',userRoute)

const httpServer = createServer(app);

mongoose.connect(process.env.MONGODB)
.then(()=>console.log('good'))
.catch((err)=>console.log(err.message))


const io = new Server(httpServer, { /* options */ });
httpServer.listen(5000,()=>console.log('Server is running on 5000'))