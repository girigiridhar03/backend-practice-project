import dotenv from 'dotenv'
dotenv.config();
import connectToDB from './db/index.js';
import app from './app.js';

const port = process.env.PORT || 2345
connectToDB()
.then(()=>app.listen(port,()=>console.log(`Server is connected to ${port}`)))
.catch((e)=>{
     console.log("connect failed ", e);
     process.exit(1)
})