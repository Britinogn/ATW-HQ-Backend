import mongoose, { Schema, Model } from 'mongoose';
import { ICar } from '../types';  // Adjust path as needed
import { CarCondition, PropertyStatus } from '../types/enums';  // Adjust imports accordingly
import type { MediaItem } from '../types'; 

// Sub-schema for MediaItem
const mediaItemSchema = new Schema<MediaItem>({
    url: {
        type: String,
        required: [true, 'URL is required'],
        validate: {
            validator: (v: string) => typeof v === 'string' && v.startsWith('https://res.cloudinary.com/'),
            message: 'URL must be a valid Cloudinary link'
        }
    },
    publicId: {
        type: String,
        required: [true, 'Public ID is required'],
        trim: true
    }
});

const CarSchema: Schema<ICar> = new Schema<ICar>({
    make: {
        type: String,
        required: [true, 'Make is required'],
        trim: true,
        uppercase: true, 
    },
    carModel: {
        type: String,
        required: [true, 'Model is required'],
        trim: true,
    },
    year: {
        type: Number,
        required: [true, 'Year is required'],
        min: [1886, 'Year cannot precede automobile invention'], 
        max: [new Date().getFullYear() + 1, 'Year cannot exceed current year +1'],
    },
    mileage: {
        type: Number,
        required: [false, 'Mileage is required'],
        min: [0, 'Mileage cannot be negative'],
    },
    condition: {
        type: String,
        enum: {
            values: Object.values(CarCondition),
            message: `Condition must be one of: ${Object.values(CarCondition).join(', ')}`,
        },
        required: [true, 'Condition is required'],
        default: CarCondition.USED,
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
    },

    offPrice: {
        type: Number,
        required:false,
    },

    callOnPrice: {
        type: Boolean,
        default: false,
    },

    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    images: {
        type: [mediaItemSchema],
        required: true,
        validate: {
            validator: (v: MediaItem[]) => Array.isArray(v) && v.length > 0,
            message: 'Images must be a non-empty array of MediaItem objects',
        },
    },
    videos: {
        type: [mediaItemSchema],
        validate: {
            validator: (v: MediaItem[]) => Array.isArray(v),  // Allow empty array or omission
            message: 'Videos must be an array of MediaItem objects',
        },
    },
    status: {
        type: String,
        enum: {
            values: Object.values(PropertyStatus),
            message: `Status must be one of: ${Object.values(PropertyStatus).join(', ')}`,
        },
        required: [true, 'Status is required'],
        default: PropertyStatus.AVAILABLE,
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',  // Links to IUser for agent/dealer attribution
        required: [true, 'Posted by user is required'],
    },

    location: {
        type: {
            city: { type: String, required: [true, 'City is required'], trim: true, default: 'Agbor' },
            state: { type: String, required: [true, 'State is required'], trim: true, default: 'Delta' },
            showroom: { type: String, trim: true }
        },
        required: true
    }

}, { timestamps: true }
);

// Indexes for efficient queries
CarSchema.index({ status: 1 });  // Filter by availability
CarSchema.index({ make: 1, model: 1 });  // Search by vehicle details
CarSchema.index({ year: 1, price: 1 });  // Sort by year and price
CarSchema.index({ postedBy: 1 });  // Queries by dealer
CarSchema.index({ 'location.city': 1 });

// Compile the model
const Car: Model<ICar> = mongoose.model<ICar>('Car', CarSchema);

export { CarSchema, Car };