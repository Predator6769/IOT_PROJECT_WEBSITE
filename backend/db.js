const mongoose=require('mongoose');
const mongourl="mongodb://localhost:27017/IOT_PROJECT_DB?readPreference=primary&appname=MongoDB%20Compass&ssl=false";
const connecttomongo=()=>{
    mongoose.connect(mongourl);
}
module.exports=connecttomongo;