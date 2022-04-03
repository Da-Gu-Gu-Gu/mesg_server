const mongoose=require('mongoose')
const ObjectId=mongoose.Schema.Types.ObjectId

const RoomSchema=new mongoose.Schema({
    isGroup:{
        type:Boolean,
        default:false
    },
    member:[
        {
        type:ObjectId,
        ref:'user'
        }
    ]
},{
    timestamps:true
})

const Room=mongoose.model("room",RoomSchema)
module.exports=Room