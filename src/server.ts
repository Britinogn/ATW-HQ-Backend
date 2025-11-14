import dotenv from 'dotenv';
dotenv.config();

import express , { Request, Response }   from 'express';
import connectDB from './config/db'
import { connectRedis } from './config/redisClient';
//import cors from 'cors'
//import { connect } from 'http2';

const   PORT = process.env.PORT || 5000;
const app = express();


app.use(express.json())
//app.use(cors())


//Import routes


//use routes


app.get('/', (_,  res: Response) => {
    res.send('ATW HQ Application running...')
})

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API is running!' });
});


const startServer = async () =>{
    await connectDB()
    await connectRedis();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    })
}

startServer()