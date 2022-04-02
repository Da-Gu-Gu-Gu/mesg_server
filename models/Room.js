const mongoose=require('mongoose')

const RoomSchema=new mongoose.Schema({
    isGroup:{
        type:Boolean,
        default:false
    },
    member:{
        type:Array,
    }
},{
    timestamps:true
})

const Room=mongoose.model("room",RoomSchema)
module.exports=Room