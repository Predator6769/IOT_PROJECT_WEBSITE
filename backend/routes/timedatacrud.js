const express = require("express");
const UD = require('../models/userDetails');
const router = express.Router();
const fetchuserdets = require('../middlewares/fetchuserdets');

router.post('/writetimedata',fetchuserdets,async (req,res)=>{
   await UD.findByIdAndUpdate(req.id,req.body);
   res.status(200).json({message:"update success"});
});

module.exports = router;