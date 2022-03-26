const mongoose=require('mongoose')


const TokenSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    token:{
        type:String,
        required:true,
    }
})


const AccessToken=new mongoose.model('accesstoken',TokenSchema)

module.exports=AccessToken