//User data mongoose model
const mongoose=require('mongoose');
const {Schema}=mongoose;
const authschema= new Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        required:true
    },
    expiredAt:{
        type:Date,
        required:true
    }
});
const user=mongoose.model('otps',authschema);

module.exports=user;