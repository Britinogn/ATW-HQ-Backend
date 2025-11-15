import dotenv from 'dotenv';
dotenv.config();

import express , { Request, Response }   from 'express';
import connectDB from './config/db'
import { connectRedis } from './config/redisClient';
//import cors from 'cors'
//import { connect } from 'http2';

// const   PORT = process.env.PORT || 5000;
const PORT = Number(process.env.PORT) || 5000;
const app = express();


app.use(express.json())
//app.use(cors())


//Import routes
import authRoutes from './routes/authRoutes'
import propertyRoutes from './routes/propertyRoutes'
import carRoutes from './routes/carsRoutes'
import paymentRoutes from './routes/paymentRoutes';

//use routes
app.use('/api/auth', authRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/cars', carRoutes);
app.use('/api/payments', paymentRoutes);


// offline
app.get('/', (_,  res: Response) => {
    res.send('ATW HQ Application running...')
})

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API is running!' });
});

// Add this BEFORE your other routes
app.get("/api/health", (req, res) => {
    res.json({ 
        status: "ok",
        timestamp: new Date().toISOString(),
        mongodb: "connected",
        redis: "connected"
    });
});

const startServer = async () => {
    await connectDB();
    await connectRedis().catch(() => {
        console.log('📦 Server starting without Redis cache');
    });
    
    // ✅ MUST listen on 0.0.0.0 for Docker
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
        console.log(`💳 Paystack payment routes: /api/payments`);
    });
};

startServer();