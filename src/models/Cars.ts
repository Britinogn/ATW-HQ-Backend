import mongoose, { Schema, Model } from 'mongoose';
import { ICar } from '../types';  // Adjust path as needed
import { CarCondition, PropertyStatus } from '../types/enums';  // Adjust imports accordingly

const CarSchema: Schema<ICar> = new Schema<ICar>({
    make: {
        type: String,
        required: [true, 'Make is required'],
        trim: true,
        uppercase: true, 
    },
    model: {
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
        required: [true, 'Mileage is required'],
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
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    images: {
        type: [String],
        required: true,
        validate: {
            validator: (v: string[]) => Array.isArray(v) && v.length > 0 && v.every(i => typeof i === 'string'),
            message: 'Images must be a non-empty array of image URLs',
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

}, { timestamps: true }
);

// Indexes for efficient queries
CarSchema.index({ status: 1 });  // Filter by availability
CarSchema.index({ make: 1, model: 1 });  // Search by vehicle details
CarSchema.index({ year: 1, price: 1 });  // Sort by year and price
CarSchema.index({ postedBy: 1 });  // Queries by dealer

// Compile the model
const Car: Model<ICar> = mongoose.model<ICar>('Car', CarSchema);

export { CarSchema, Car };