# ATW HQ Backend Server

Express.js + TypeScript backend server with MongoDB integration.

## Quick Start

### Prerequisites
- Node.js v20+
- MongoDB connection string

### Setup
```bash
npm install
```


### Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run dev` - Start dev server with hot-reload

### Docker
```bash
docker-compose up --build
```

## Project Structure
```
src/
├── server.ts          # Main entry point
├── config/db.ts       # MongoDB connection
├── controller/        # Route handlers
├── middleware/        # Middleware functions
├── models/            # Database schemas
└── routes/            # API routes
```

## Features
- Express.js web framework
- TypeScript for type safety
- Mongoose ODM
- Environment configuration with dotenv
- Docker support
- JWT & bcryptjs ready
- Cloudinary integration

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Auth**: JWT, bcryptjs
- **File Upload**: Multer + Cloudinary
- **Dev Tools**: Nodemon, ts-node



feat: Initialize ATW HQ Backend Server with Express.js, TypeScript, and MongoDB integration

- Add README.md for project setup and structure
- Create docker-compose.yml for MongoDB and Express app services
- Implement Cloudinary configuration for image uploads
- Set up MongoDB connection with error handling
- Add Redis client configuration for caching
- Create user authentication middleware with JWT support
- Define models for Cars, Properties, and Users with validation
- Implement routes for authentication, cars, and properties
- Add cache service for Redis operations
- Define enums for user roles, property statuses, and car conditions
- Extend Express Request interface to include user information