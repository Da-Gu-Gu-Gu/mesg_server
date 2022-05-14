const express=require('express')

const serverless = require("serverless-http");

const app=express()
const cors=require('cors')
app.use(cors({
    origin: '*'
}));    
const dotenv=require('dotenv').config()
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose=require('mongoose')





app.use(express.json())

//router
const userRoute=require('../routes/User')
app.use('/api/user/',userRoute)

const conversationRoute=require('../routes/Conversation')
app.use('/api/conversation/',conversationRoute)

const roomRoute=require('../routes/Room')
app.use('/api/room/',roomRoute)

const httpServer = createServer(app);

mongoose.connect(process.env.MONGODB)
.then(()=>console.log('good'))
.catch((err)=>console.log(err.message))

const io = new Server(httpServer, { 
    cors: {
        origin: process.env.CLIENT_URL,
        // origin:'*',
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
})

let sockeUser=[]

let rooms=[]

const addUser=(userId,socketId)=>{
   !sockeUser.some(user=>user.userId === userId) &&
   sockeUser.push({userId,socketId})
}


const removeUser=(socketId)=>{
    sockeUser=sockeUser.filter(x=>x.socketId!==socketId)
}

const addRoom=(roomId,socketId)=>{
    !rooms.some(x=>x.roomId === roomId ) &&
    rooms.push({roomId,socketId})
}

const removeRoom=(socketId)=>{
    rooms=rooms.filter(x=>x.socketId!==socketId)
}

const getRoom=(roomId)=>{
    return rooms.find(x=>x.roomId===roomId)
}

const getUser=(userId)=>{
    console.log(userId)
    console.log(sockeUser)
    return sockeUser.find(user=>user.userId===userId)
}

io.on('connection', (socket) => {
    console.log('a user connected');


    // socket.on('create', function(roomId) {
    //     socket.join(roomId);
    //   });
 

    socket.on("addUser",(userId)=>{
        addUser(userId,socket.id)
        io.emit("getUsers",sockeUser)
    })

    socket.on("addRoom",(roomId)=>{
        addRoom(roomId,socket.id)
        io.emit("getRooms",rooms)
    })

    socket.on("sendMessage",({roomid,sender,text})=>{
        const room=getRoom(roomid)
        console.log(roomid)
        
        console.log(room)
        if(room){
            io.emit(`getMessage${room.roomId}`,{
                sender,
                text,
                roomid
            })
            console.log('work')
        }
        else{
           let newroom= addRoom(roomid,socket.id)
           console.log(rooms)
           let nr=getRoom(roomid)
           console.log(nr)
           io.emit(`getMessage${nr.roomId}`,{
            sender,
            text,   
            roomid
        })
        console.log(' work 2')

        }
    })
  



    socket.on('disconnect', () => {
        console.log('user disconnected');
        removeUser(socket.id)
        removeRoom(socket.id)

        io.emit("getRooms",rooms)
      });


  });

  module.exports = app;
  module.exports.handler = serverless(app);

httpServer.listen(5000,()=>console.log('Server is running on 5000'))