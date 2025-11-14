import multer, { StorageEngine } from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';
import type { Request } from 'express'; // Import Request type for params function

// Property image storage
const PropertyStorage: StorageEngine = new CloudinaryStorage({
    cloudinary,
    params: async (req: Request, file: Express.Multer.File) => ({
        folder: 'property_images',
        allowed_formats: 'jpg,jpeg,png,webp',
        transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
    })
});

// Car image storage
const CarStorage: StorageEngine = new CloudinaryStorage({
    cloudinary,
    params: async (req: Request, file: Express.Multer.File) => ({
        folder: 'car_images',
        allowed_formats: 'jpg,jpeg,png,webp',
        transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
    })
});

const uploadProperty = multer({
    storage: PropertyStorage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for images
});

const uploadCar = multer({
    storage: CarStorage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for images
});

export  { uploadProperty, uploadCar };