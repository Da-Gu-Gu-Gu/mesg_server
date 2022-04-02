const mongoose=require('mongoose')
const ObjectId=mongoose.Schema.Types.ObjectId

const ConversationSchema=new mongoose.Schema({
    message:{
        type:String,
        required:true,
    },
    sender:{
        type:ObjectId,
        ref:'user'
    },
    RoomID:{
        type:ObjectId,
        ref:'room'
    }
},{
    timestamps:true
})

const Conversation=mongoose.model('conversation',ConversationSchema)
module.exports=Conversation