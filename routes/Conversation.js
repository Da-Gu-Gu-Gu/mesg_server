const express=require('express')
const router=express.Router()
const Conversation=require('../models/Conversation')
const Room=require('../models/Room')
const auth=require('../middleware/Auth')
const mongoose=require('mongoose')


router.post('/:id',auth,async(req,res)=>{
    try {
        if( !mongoose.Types.ObjectId.isValid(req.params.id) ){
            return res.status(200).json({err:"Invalid Room"})
        }

        let roomCheck=await Room.findById(req.params.id)
        if(!roomCheck) return res.status(200).json({err:"Invalid Room"})

        if (!roomCheck.member.includes(req.body.sender)){
            return res.status(200).json({err:"You are not member"})
        }
        req.body.RoomID=req.params.id
        const send=new Conversation(req.body)
        await send.save()

        res.status(200).json({message:"Send"})

    } catch (error) {
        console.log(error)
    }
})

//message 
router.get('/:id',auth,async(req,res)=>{
    try {
        if( !mongoose.Types.ObjectId.isValid(req.params.id) ){
            return res.status(200).json({err:"Invalid Room"})
        }

        let roomCheck=await Room.findById(req.params.id)
        if(!roomCheck) return res.status(200).json({err:"Invalid Room"})

        if (!roomCheck.member.includes(req.body.me)){
            return res.status(200).json({err:"You are not member"})
        }

        const mesg=await Conversation.find({"RoomID":req.params.id},)

        res.status(200).json(mesg)

    } catch (error) {
        console.log(error)
    }
})


module.exports=router