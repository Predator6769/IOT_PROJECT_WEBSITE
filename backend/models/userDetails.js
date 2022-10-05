//User data mongoose model
const mongoose=require('mongoose');
const {Schema}=mongoose;
const authschema= new Schema({
   
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    feedTime:{
        type:Array,
        required:true 
    },
    verified:{
        type:Boolean
    },
    breed:{
        type:String
    }
});
const user=mongoose.model('userDetails',authschema);

module.exports=user;