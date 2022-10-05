//middleware used in api for fetching user data
const jwt=require('jsonwebtoken');
const secret="IOT_PROJECT";

const fetchuser=(req,res,next)=>{
    const token=req.header('auth-token');
    if(!token)
    return res.status(401).json({errors:"invalid token"});
    try{
    const data=jwt.verify(token,secret);
    req.id=data.id
    next();
    }
    catch(err){
        return res.status(401).json({errors:"invalid token"});
    }
}

module.exports=fetchuser;