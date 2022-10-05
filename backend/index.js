const express=require('express');
const connecttodb=require('./db');
const cors = require('cors');

connecttodb();

const app=express();
const port=5000;

app.use(cors({
    origin:'http://localhost:3000'
}));

app.use(express.json());
//all authentication related apis here
app.use('/auth',require('./routes/authentication'));
app.use('/changedata',require('./routes/timedatacrud'));

app.listen(port,()=>{
    // localStorage.setItem('authtoken','');
    console.log(`listening on port ${port}`)
});
