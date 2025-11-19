import { Request, Response } from 'express';
import {Property} from '../models/Property';
import cloudinary from '../config/cloudinary';
import { IProperty } from '../types';
import { PropertyStatus, PropertyType } from '../types/enums';
import { url } from 'inspector';
import { MediaItem } from '../types';

// Response interfaces for type safety
export interface IPropertyResponse {
    status: boolean;
    message: string;
    data?: { property?: Partial<IProperty>; properties?: Partial<IProperty>[] };
}

export interface IErrorResponse {
    status: boolean;
    message: string;
}

// Get All Properties
export const getAllProperties = async (
    req: Request,
    res: Response<IPropertyResponse | IErrorResponse>
): Promise<void> => {
    try {
        // Implementation here
    } catch (error: any) {
        console.error('Get all properties error:', error);
        res.status(500).json({ 
            status: false, 
            message: error.message || 'Failed to fetch properties' 
        });
    }
};

// Get Property By ID
export const getPropertyById = async (
    req: Request<{ id: string }>,
    res: Response<IPropertyResponse | IErrorResponse>
): Promise<void> => {
    try {
        // Implementation here
    } catch (error: any) {
        console.error('Get property by ID error:', error);
        res.status(500).json({ 
            status: false, 
            message: error.message || 'Failed to fetch property' 
        });
    }
};

// Create Property
export const createProperty = async (
    req: Request<{}, IPropertyResponse | IErrorResponse, Partial<IProperty>>,
    res: Response<IPropertyResponse | IErrorResponse>
): Promise<void> => {
    try {
        const {
            title,
            propertyType,
            price,
            offPrice,
            callOnPrice,
            location,
            description,
            size,
            bedrooms,
            bathrooms,
            amenities,
            status,
            postedBy
        } = req.body;

        // Basic validation
        if (!title || !propertyType || !price || !location || !size) {
            res.status(400).json({
                status: false,
                message: 'Title, property type, price, location, and size are required'
            });
            return;
        }

        // Parse location object (assuming JSON string from form)
        const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

        // Parse amenities array (assuming JSON string from form)
        const parsedAmenities = amenities ? (typeof amenities === 'string' ? JSON.parse(amenities) : amenities) : [];

        // Parse callOnPrice to boolean
        const callOnPriceBool = callOnPrice === true ;

        // Handle images and videos from multer uploads
        const images: MediaItem[] = [];
        if (req.files && (req.files as any)['images']) {
            const imageFiles = Array.isArray((req.files as any)['images']) ? (req.files as any)['images'] : [(req.files as any)['images']];
            for (const file of imageFiles) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'property_images',
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
                    folder: 'property_videos',
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

        // Create property document
        const newProperty: Partial<IProperty> = {
            title,
            propertyType,
            price: parseFloat(String(price)),
            offPrice: offPrice ? parseFloat(String(offPrice)) : undefined,
            callOnPrice: callOnPriceBool,
            location: parsedLocation,
            description,
            images,
            videos,
            size: parseFloat(String(size)),
            bedrooms: bedrooms ? parseInt(String(bedrooms)) : undefined,
            bathrooms: bathrooms ? parseInt(String(bathrooms)) : undefined,
            amenities: parsedAmenities,
            status: status as PropertyStatus || PropertyStatus.AVAILABLE,
            postedBy:  (req.user as any)?._id  // From auth middleware
        };

        const property = await Property.create(newProperty);

        // Populate agent name if needed
        await property.populate('postedBy', 'name');

        res.status(201).json({
            status: true,
            message: 'Property created successfully',
            data: { property }
        });
    } catch (error: any) {
        console.error('Create property error:', error);
        res.status(500).json({
            status: false,
            message: error.message || 'Failed to create property'
        });
    }
};


// Update Property
export const updateProperty = async (
    req: Request<{ id: string }, IPropertyResponse | IErrorResponse, Partial<IProperty>>,
    res: Response<IPropertyResponse | IErrorResponse>
): Promise<void> => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            res.status(404).json({status: false , message: 'Property not found'})
            return;
        }

        const {
            title,
            propertyType,
            price,
            offPrice,
            callOnPrice,
            location,
            description,
            size,
            bedrooms,
            bathrooms,
            amenities,
            status,
            postedBy
        } = req.body;

         // Parse location object (assuming JSON string from form)
        const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

        // Parse amenities array (assuming JSON string from form)
        const parsedAmenities = amenities ? (typeof amenities === 'string' ? JSON.parse(amenities) : amenities) : [];

        // Parse callOnPrice to boolean
        const callOnPriceBool = callOnPrice === true ;
        
        // Update scalar fields with nullish coalescing (keep existing if not provided)
        property.title = title || property.title;
        property.propertyType = propertyType || property.propertyType;
        property.price = price ? parseFloat(String(price)) : property.price;
        property.offPrice = offPrice ? parseFloat(String(offPrice)) : property.offPrice;
        property.callOnPrice = callOnPriceBool;
        property.location = parsedLocation;
        property.description = description || property.description;
        property.size = size ? parseFloat(String(size)) : property.size;
        property.bedrooms = bedrooms ? parseInt(String(bedrooms)) : property.bedrooms;
        property.bathrooms = bathrooms ? parseInt(String(bathrooms)) : property.bathrooms;
        property.amenities = parsedAmenities;
        property.status = status || property.status;
        property.postedBy = postedBy ?? property.postedBy;

        

        // Handle images and videos from multer uploads
        const images: MediaItem[] = [];
        if (req.files && (req.files as any)['images']) {
            const imageFiles = Array.isArray((req.files as any)['images']) ? (req.files as any)['images'] : [(req.files as any)['images']];
            for (const file of imageFiles) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'property_images',
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
                    folder: 'property_videos',
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
    

        // Populate agent name if needed
        await property.populate('postedBy', 'name');
        
        await property.save();

        res.status(201).json({
            status: true,
            message: 'Property updated successfully',
            data: { property }
        });

    } catch (error: any) {
        console.error('Update property error:', error);
        res.status(500).json({ 
            status: false, 
            message: error.message || 'Failed to update property' 
        });
    }
};

// Delete Property
export const deleteProperty = async (
    req: Request<{ id: string }>,
    res: Response<IPropertyResponse | IErrorResponse>
): Promise<void> => {
    try {
        // Implementation here
    } catch (error: any) {
        console.error('Delete property error:', error);
        res.status(500).json({ 
            status: false, 
            message: error.message || 'Failed to delete property' 
        });
    }
};

export default {
    getAllProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
};