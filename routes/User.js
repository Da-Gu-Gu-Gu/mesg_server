const express=require('express')
const router=express.Router()
const User=require('../models/User')
const bcrypt=require('bcryptjs')
const AccessToken=require('../models/AccessToken')
const jwt=require('jsonwebtoken')
const auth=require('../middleware/Auth')

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
        }
            res.status(200).json({message:"Account Created Successfully, Please verify your account"})
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
        let userCheck=await User.findById(req.params.id)
        if(!userCheck) return res.status(200).json({message:"Invalid User"})

        let tokenCheck=await AccessToken.findOne({token:req.params.token})
        if(!tokenCheck) return res.status(200).json({message:"Invalid Token"})

        await User.findByIdAndUpdate(req.params.id,{
            isVerify:true
        },{
            new:true
        })
        await AccessToken.findByIdAndDelete(tokenCheck._id)

        res.status(200).json("Account Verified Successfully")
    }
    catch(err){
        console.log(err)
    }
})


//forgetpassword
router.post('/forgotpassword',async(req,res)=>{
    try{
        let emailCheck=await User.findOne({email:req.body.email})
        if(!emailCheck || !emailCheck.isGoogle) return res.status(200).json({message:"Invalid Email"})

        let token=new AccessToken({
            email:emailCheck.email,
            token:`fadsf13v90${Math.random()*1000}${emailCheck._id}f2hgnvk`
        })
        token.save()
        .then(()=>{
            //domain
            // const message=`http://localhost:3001/resetpassword/${emailCheck._id}/${token.token}`
            //  sendEmail(emailCheck.email,"Password Reset",message)
            res.status(200).json({msg:"Email sent your account"})
        })
        

    }
    catch(err){
        console.log(err)
    }
})

//resetpassword
router.put('/resetpassword/:id/:token',async(req,res)=>{
    try{
        let userCheck=await User.findById(req.params.id)
        if(!userCheck) return res.status(200).json("Invalid User")

        let tokenCheck=await AccessToken.findOne({token:req.params.token})
        if(!tokenCheck) return res.status(200).json("Invalid Token")

        const {password,confirmpassword}=req.body

        if(password!==confirmpassword) return res.status(200).json("Password Doesn't match")
     
        let passwordUpdate=await User.findByIdAndUpdate(req.params.id,{
            password:await bcrypt.hashSync(password,10)
        },{
            new:true
        })

        await AccessToken.findByIdAndDelete(tokenCheck._id)
        res.status(200).json({msg:"Password Reset Successfully"})
    }
    catch(err){
        console.log(err)
    }
})

module.exports=router