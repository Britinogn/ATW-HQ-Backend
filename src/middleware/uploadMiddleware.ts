import multer, { StorageEngine } from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';
import type { Request } from 'express'; // Import Request type for params function
import type { Express } from 'express';

// General media storage for properties (handles images and videos)
const PropertyMediaStorage: StorageEngine = new CloudinaryStorage({
    cloudinary,
    params: async(req: Request , file: Express.Multer.File) => {
        const isVideo = file.mimetype.startsWith('video/');
        return {
            folder: isVideo ? 'property_videos' : 'property_images' ,
            allowed_formats: isVideo ? 'mp4,avi,mov,webm' : 'jpg,jpeg,png,webp',
            resource_type: isVideo ? 'video' : 'image',
            transformation: isVideo 
                ? [{ width: 800, height: 600, crop: 'fill' }]  // Video thumbnail
                : [{ width: 1200, height: 1200, crop: 'limit' }]  // Image resize
        }
    }
})

const CarMediaStorage: StorageEngine = new CloudinaryStorage({
    cloudinary,
    params: async(req: Request , file: Express.Multer.File) => {
        const isVideo = file.mimetype.startsWith('video/');
        return {
            folder: isVideo ? 'car_videos' : 'car_images' ,
            allowed_formats: isVideo ? 'mp4,avi,mov,webm' : 'jpg,jpeg,png,webp',
            resource_type: isVideo ? 'video' : 'image',
            transformation: isVideo 
                ? [{ width: 800, height: 600, crop: 'fill' }]  // Video thumbnail
                : [{ width: 1200, height: 1200, crop: 'limit' }]  // Image resize
        }
    }
})



const uploadProperty = multer({
    storage: PropertyMediaStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for images

    fileFilter: (req, file, cb) => {
        // Accept images and videos only
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb({ message: 'Only images and videos are allowed' } as any, false);
        }
    }

});

const uploadCar = multer({
    storage: CarMediaStorage,
    limits: { fileSize: 5 * 1024 * 1024 } ,// 5MB limit for images
    fileFilter: (req, file, cb) => {
        // Accept images and videos only
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb({ message: 'Only images and videos are allowed' } as any, false);
        }
    }
});

export  { uploadProperty, uploadCar };