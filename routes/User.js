const express=require('express')
const router=express.Router()
const User=require('../models/User')
const bcrypt=require('bcryptjs')
const AccessToken=require('../models/AccessToken')
const jwt=require('jsonwebtoken')
const auth=require('../middleware/Auth')
const mongoose=require('mongoose')
const sendEmail=require('../utils/email')

//sign up
router.post('/',async(req,res)=>{
    try{
        console.log(req.body)
        let emailCheck=await User.findOne({email:req.body.email})
        if(emailCheck) return res.status(200).json({message:"Email already exist"})
        bcrypt.hash(req.body.password,10)
        .then(async(hashedPassword)=>{
            req.body.password=hashedPassword
            let user=new User(
                req.body,
                )
            await user.save()

            if(!user.isGoogle){
            let token=new AccessToken({
                email:user.email,
                token:`hiqeounn;aduo[${Math.random()*1000}${user._id}dfaf2io`
            })
            await token.save()

            const message=`${process.env.CLIENT_URL}/verify/${user._id}/${token.token}`

            await sendEmail(user.email,"Please Verify your account",message)

            res.status(200).json({message:"Account Created Successfully, Please verify your account"})
        }else{
            res.status(200).json({message:"Account created Successfully"})
        }
  
        })
    }
    catch(err){
        console.log(err)
    }
})

//sign in
router.post('/signin',async(req,res)=>{
    try {
        console.log(req.body)
        await User.findOne({email:req.body.email})
        .then(savedUser=>{
            
            if(!savedUser) return res.status(201).json({message:"User Not Found"})

            if(!savedUser.isVerify)return res.status(201).json({message:"Plz verify your account first"})
                if(bcrypt.compareSync(req.body.password,savedUser.password)){
                    const token=jwt.sign({userId:savedUser._id},process.env.JWTPASS)
                    return res.status(200).json({token:token})
                }

                return res.status(200).json({message:"Invalid  password"})
        })
    } catch (err) {
        console.log(err)
    }
})

//getalluser
router.get('/',auth,async(req,res)=>{
    try {
        let allUsers=await User.find()
        res.status(200).json({message:allUsers})
    } catch (error) {
        console.log(error)
    }
})


//verfiy
router.put('/verify/:id/:token',async(req,res)=>{
    try{
        if( !mongoose.Types.ObjectId.isValid(req.params.id) ){
            return res.status(200).json({message:"Invalid User"})
        }
       await User.findById(req.params.id)
       .then(userCheck=>{
        if(!userCheck) return res.status(200).json({message:"Invalid User"})
       })


        let tokenCheck=await AccessToken.findOne({token:req.params.token})
        if(!tokenCheck) return res.status(200).json({message:"Invalid Token"})

        await User.findByIdAndUpdate(req.params.id,{
            isVerify:true
        },{
            new:true
        })
        await AccessToken.findByIdAndDelete(tokenCheck._id)

        res.status(200).json({message:"Account Verified Successfully"})
    }
    catch(err){
        console.log(err)
    }
})


//forgetpassword
router.post('/forgotpassword',async(req,res)=>{
    try{
        let emailCheck=await User.findOne({email:req.body.email})
        if(!emailCheck || emailCheck.isGoogle) return res.status(200).json({message:"Invalid Email"})

        let token=new AccessToken({
            email:emailCheck.email,
            token:`fadsf13v90${Math.random()*1000}${emailCheck._id}f2hgnvk`
        })
        token.save()
        .then(async()=>{
            const message=`${process.env.CLIENT_URL}/resetpassword/${emailCheck._id}/${token.token}`
            await sendEmail(emailCheck.email,"Password Reset ",message)
            res.status(200).json({message:"Email sent your account"})
        })
        

    }
    catch(err){
        console.log(err)
    }
})

//resetpassword
router.put('/resetpassword/:id/:token',async(req,res)=>{
    try{
        console.log(req.body)
        if( !mongoose.Types.ObjectId.isValid(req.params.id) ){
            return res.status(200).json({err:"Invalid User"})
        }

        let userCheck=await User.findById(req.params.id)
        if(!userCheck || userCheck.isGoogle) return res.status(200).json({err:"Invalid User"})

        let tokenCheck=await AccessToken.findOne({token:req.params.token})
        if(!tokenCheck) return res.status(200).json({err:"Invalid Token"})

        const {password,confirmpassword}=req.body

        if(password!==confirmpassword) {
        return res.status(200).json({message:"Password Doesn't match"})
        }else{
            console.log(bcrypt.hashSync(password,10))
        // bcrypt.hash(password,10)
        // .then(async(hashedPassword)=>{
            await User.findByIdAndUpdate(req.params.id,{
            password:bcrypt.hashSync(password,10)
        },{
            new:true
        })
    // })

        await AccessToken.findByIdAndDelete(tokenCheck._id)
        res.status(200).json({message:"Password Reset Successfully"})
}
    }
    catch(err){
        console.log(err)
    }
})

module.exports=router