import { Request, Response } from 'express';
import { Car } from '../models/Cars';
import cloudinary from '../config/cloudinary';
import { ICar } from '../types';
import { PropertyStatus } from '../types/enums';
import { MediaItem } from '../types';
import { cache } from '../utils/cache';


// Response interfaces for type safety
export interface ICarResponse {
    status: boolean;
    message: string;
    data?: { car?: Partial<ICar>; cars?: Partial<ICar>[] };
}

export interface IErrorResponse {
    status: boolean;
    message: string;
}

// Get All Cars
export const getAllCars = async (
    req: Request,
    res: Response<ICarResponse | IErrorResponse>
): Promise<void> => {

    try {
        const cacheKey = 'cars:all';
        const CacheOptions = 300;  // 5 minutes

        // Try cache first
        const cachedCars = await cache.get<ICar[]>(cacheKey);
        if (cachedCars) {
            res.json({
                status: true,
                message: 'Car retrieved successfully',
                data: { cars: cachedCars }
            });
            return;
        }

        // Fetch from DB with populate
        const cars = await Car.find()
            .populate('postedBy', 'name')  // Populate agent name from User
            .sort({ createdAt: -1 });  // Most recent first

        // Cache the result
        await cache.set(cacheKey, cars, { ttl: CacheOptions });

        res.json({
            status: true,
            message: 'Properties retrieved successfully',
            data: { cars }
        });
    } catch (error: any) {
        console.error('Get all cars error:', error);
        res.status(500).json({
            status: false,
            message: error.message || 'Failed to fetch cars'
        });
    }
};

// Get Car By ID
export const getCarById = async (
    req: Request<{ id: string }>,
    res: Response<ICarResponse | IErrorResponse>
): Promise<void> => {
    try {
        const { id } = req.params;

        // Validate ID format (basic check for ObjectId)
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            res.status(400).json({
                status: false,
                message: 'Invalid car ID'
            });
            return;
        }

        // Find property by ID
        const car = await Car.findById(id);
            // .populate('postedBy', 'name')  ;
        

        if (!car) {
            res.status(404).json({
                status: false,
                message: 'Car not found'
            });
            return;
        }

        // Populate agent name from postedBy
        await car.populate('postedBy', 'name');

        res.status(200).json({
            status: true,
            message: 'Car retrieved successfully',
            data: { car }
        });
    } catch (error: any) {
        console.error('Get car by ID error:', error);
        res.status(500).json({ 
            status: false, 
            message: error.message || 'Failed to fetch car' 
        });
    }
};

// Create Car
export const createCar = async (
    req: Request<{}, ICarResponse | IErrorResponse, Partial<ICar>>,
    res: Response<ICarResponse | IErrorResponse>
): Promise<void> => {
    const uploadedPublicIds: string[] = []; // Track IDs for rollback
    
    try {
        const { 
            make, carModel, year, 
            mileage, condition, price, 
            offPrice, callOnPrice, description,  
            status, location , 
        } = req.body;
        
        // Basic validation
        if (!make || !carModel || !description || !year || !location || !price) {
            res.status(400).json({
                status: false,
                message: 'Make, model, description, price, year, and location are required'
            });
            return;
        }

         // Parse location object (assuming JSON string from form)
        const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

        // Parse callOnPrice to boolean
        const callOnPriceBool =  callOnPrice === true;


        // Handle images and videos from multer uploads
        const images: MediaItem[] = [];
        if (req.files && (req.files as any)['images']) {
            const imageFiles = Array.isArray((req.files as any)['images']) ? (req.files as any)['images'] : [(req.files as any)['images']];
            for (const file of imageFiles) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'car_images',
                    resource_type: 'image'
                });
                images.push({
                    url: result.secure_url,
                    publicId: result.public_id
                    // url: file.path, 
                    // publicId: file.filename
                });

                uploadedPublicIds.push(result.public_id); // Capture for rollback
            }
        }
        
        const videos: MediaItem[] = [];
        if (req.files && (req.files as any)['videos']) {
            const videoFiles = Array.isArray((req.files as any)['videos']) ? (req.files as any)['videos'] : [(req.files as any)['videos']];
            for (const file of videoFiles) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'car_videos',
                    resource_type: 'video',
                    format: 'mp4'
                });
                videos.push({
                    url: result.secure_url,
                    publicId: result.public_id
                    // url: file.path, 
                    // publicId: file.filename
                });
            }
        }
        
        // Ensure images are non-empty
        if (images.length === 0) {
            res.status(400).json({
                status: false,
                message: 'At least one image is required'
            });
            return;
        }


        const newCar: Partial<ICar> = {
            make,
            carModel,
            year,
            mileage,
            condition,
            price: parseFloat(String(price)),
            offPrice: offPrice ? parseFloat(String(offPrice)) : undefined,
            description,
            images,
            videos,
            status: status as PropertyStatus || PropertyStatus.AVAILABLE,
            postedBy: (req.user as any)?._id, 
            location: parsedLocation,
            callOnPrice: callOnPriceBool,
        };

        const car = await Car.create(newCar);

        // Invalidate relevant caches (e.g., property lists)
        await cache.del('cars:all');  // Clear global list cache

        await car.populate('postedBy', 'name');

        res.status(201).json({
            status: true,
            message: 'Car created successfully',
            data: { car }
        });

    } catch (error: any) {
        console.error('Create car error:', error);
        res.status(500).json({
            status: false,
            message: error.message || 'Failed to create car'
        });
    }
};

// Update Car
export const updateCar = async (
    req: Request<{ id: string }, ICarResponse | IErrorResponse, Partial<ICar>>,
    res: Response<ICarResponse | IErrorResponse>
): Promise<void> => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            res.status(404).json({status: false , message: 'Car not found'})
            return;
        }

        const { 
            make, carModel, year, 
            mileage, condition, price, 
            offPrice, callOnPrice, description,  
            status, postedBy, location 
        } = req.body;

        // Parse location object (assuming JSON string from form)
        const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

        // Parse callOnPrice to boolean
        const callOnPriceBool = callOnPrice === true ;

        car.make = make || car.make;
        car.year = year || car.year;
        car.carModel = carModel || car.carModel;
        car.mileage = mileage || car.mileage;
        car.condition = condition || car.condition;
        car.price = price ? parseFloat(String(price)) : car.price;
        car.offPrice = offPrice ? parseFloat(String(offPrice)) : car.offPrice;
        car.callOnPrice = callOnPriceBool;
        car.location = parsedLocation;
        car.description = description || car.description;
        car.status = status || car.status;
        car.postedBy = postedBy ?? car.postedBy;

        // Handle images and videos from multer uploads
        const images: MediaItem[] = [];
        if (req.files && (req.files as any)['images']) {
            const imageFiles = Array.isArray((req.files as any)['images']) ? (req.files as any)['images'] : [(req.files as any)['images']];
            for (const file of imageFiles) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'car_images',
                    resource_type: 'image'
                });
                images.push({
                    url: result.secure_url,
                    publicId: result.public_id
                });
            }
        }

        const videos: MediaItem[] = [];
        if (req.files && (req.files as any)['videos']) {
            const videoFiles = Array.isArray((req.files as any)['videos']) ? (req.files as any)['videos'] : [(req.files as any)['videos']];
            for (const file of videoFiles) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'car_videos',
                    resource_type: 'video',
                    format: 'mp4'
                });
                videos.push({
                    url: result.secure_url,
                    publicId: result.public_id
                });
            }
        }

        
        // Ensure images are non-empty
        if (images.length === 0) {
            res.status(400).json({
                status: false,
                message: 'At least one image is required'
            });
            return;
        }
    
        // Invalidate relevant caches (e.g., property lists)
        await cache.del('cars:all');  // Clear global list cache

        await car.populate('postedBy', 'name');

        res.status(201).json({
            status: true,
            message: 'Car updated successfully',
            data: { car }
        });




    } catch (error: any) {
        console.error('Update car error:', error);
        res.status(500).json({
            status: false,
            message: error.message || 'Failed to update car'
        });
    }
};

// Delete Car
export const deleteCar = async (
    req: Request<{ id: string }>,
    res: Response<ICarResponse | IErrorResponse>
): Promise<void> => {
    try {
        const { id } = req.params;

        // Find the car
        const car = await Car.findById(req.params.id);
        if (!car) {
            res.status(404).json({
                status: false,
                message: 'Car not found'
            });
            return;
        }

        // Ownership validation (poster or admin only)
        if (car.postedBy.toString() !== (req.user as any)?._id.toString() && req.user?.role !== 'admin') {
            res.status(403).json({
                status: false,
                message: 'Access denied. You can only delete your own cars.'
            });
            return;
        }

        // Delete images from Cloudinary
        for (const image of car.images || []) {
            await cloudinary.uploader.destroy(image.publicId, { resource_type: 'image' });
        }

        // Delete videos from Cloudinary
        for (const video of car.videos || []) {
            await cloudinary.uploader.destroy(video.publicId, { resource_type: 'video' });
        }

        // Delete the car document
        await Car.findByIdAndDelete(id);

        // Invalidate any relevant caches (e.g., car lists)
        // await cache.del('cars:all');  // Uncomment if using caching

        res.status(200).json({
            status: true,
            message: 'Car deleted successfully'
        });

    } catch (error: any) {
        console.error('Delete car error:', error);
        res.status(500).json({
            status: false,
            message: error.message || 'Failed to delete car'
        });
    }
};

export default {
    getAllCars,
    getCarById,
    createCar,
    updateCar,
    deleteCar,
};