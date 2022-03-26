const jwt=require('jsonwebtoken')
const User=require('../models/User')

module.exports=(req,res,next)=>{
    const {authorization}=req.headers
    if(!authorization) return res.status(200).json({message:"invalid user"})
    const token=authorization.replace("Bearer ","")
    jwt.verify(token,process.env.JWTPASS,(err,payload)=>{
        if(err) return res.status(200).json({message:"invalid user"})

        let {userId}=payload
        User.findById(userId).then((user)=>{
            console.log(user)
            req.user=user
            next()
        })
    })

}