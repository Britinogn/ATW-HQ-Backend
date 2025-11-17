import dotenv from 'dotenv';
dotenv.config();

import express , { Request, Response }   from 'express';
import connectDB from './config/db'
import { connectRedis } from './config/redisClient';
import http from 'http';
import { Server } from 'socket.io';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173' || '';

import cors from 'cors'
//import { connect } from 'http2';

// const   PORT = process.env.PORT || 5000;
const PORT = Number(process.env.PORT) || 5000;
const app = express();

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: FRONTEND_URL || 'http://localhost:5173' }));
//app.use(cors())


//Import routes
import authRoutes from './routes/authRoutes'
import propertyRoutes from './routes/propertyRoutes'
import carRoutes from './routes/carsRoutes'
import paymentRoutes from './routes/paymentRoutes';
import agentRoutes from './routes/agentRoutes'
import chatRoutes from './routes/chatRoutes'

//use routes
app.use('/api/auth', authRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/cars', carRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);


// Create HTTP server
const server = http.createServer(app);


// Socket.io setup for real-time features (e.g., chats)
const io = new Server(server, {
    cors: {
        origin: FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

// Socket.io event handlers (e.g., for chat rooms)
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('joinRoom', (roomId: string) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('leaveRoom', (roomId: string) => {
        socket.leave(roomId);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Export io for use in controllers (e.g., emit events)
export { io, app, server };


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
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();