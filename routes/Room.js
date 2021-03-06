const express=require('express')
const router=express.Router()
const Room=require('../models/Room')
const auth=require('../middleware/Auth')
const mongoose=require('mongoose')



router.post('/',auth,async(req,res)=>{
    try {
        let all=await Room.find({isGroup:false})
     
        let check=all.filter(y=>{
        return  y.member.toString()===req.body.member.toString() || y.member.toString()===req.body.member.toString().split(',').reverse().toString()
        }
        )
        console.log(check)
        if(check.length>0){
            res.status(200).json({message:"Room Already Exist.",room:check})
        }else{
           let newroom= await new Room(
                req.body
            ).save()
            res.status(200).json({message:"Room Created",room:newroom})
        }
  
    } catch (error) {
        console.log(error)
    }
})
 

router.put('/:id/addmember',auth,async(req,res)=>{
    try {
        if( !mongoose.Types.ObjectId.isValid(req.params.id) ){
            return res.status(200).json({err:"Invalid Room"})
        }
        let roomCheck=await Room.findById(req.params.id)
        if(!roomCheck || !roomCheck.isGroup) return res.status(200).json({err:"Can't add member"})

        await Room.findByIdAndUpdate(req.params.id,{
            member:[...roomCheck.member,...req.body.member],
        },{
            new:true
        })

        res.status(200).json({message:"Added Successfully"})
    } catch (error) {
        console.log(error)
    }
})

//get all my room
router.get('/me',auth,async(req,res)=>{
    try {
        let myroom=[]
        let rooms=await Room.find().populate('member')
        rooms.map(y=>{
            y.member.map(x=>{
                x._id.toString()===req.user._id.toString()?myroom.push(y):null
            })
        })
        res.status(200).json(myroom)
    } catch (error) {
       console.log(error) 
    }
})


module.exports=router