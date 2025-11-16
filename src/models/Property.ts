import mongoose, { Schema, Model } from 'mongoose';
import { IProperty } from '../types';  // Adjust path as needed
import { PropertyStatus, PropertyType } from '../types/enums'; 

// Define the schema with fields matching IProperty
const PropertySchema: Schema<IProperty> = new Schema<IProperty>({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    propertyType: {
        type: String,
        enum: {
            values: Object.values(PropertyType),
            message: `Property type must be one of: ${Object.values(PropertyType).join(', ')}`,
        },
        required: [true, 'Property type is required'],
        default: PropertyType.APARTMENT,
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

    location: {
        type: {
            city: { type: String, required: true, default: 'Agbor' },
            state: { type: String, required: true, default: 'Delta' },
            area: { type: String, required: false },
            address: { type: String, required: false }
        },
        required: true
    },
    // location: {
    //     type: String,
    //     required: [true, 'Location is required'],
    //     trim: true,
    // },
    // address: {
    //     type: String,
    //     trim: true,
    //     maxlength: [200, 'Address cannot exceed 200 characters'],
    // },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    images: {
        type: [String],
        required: true,
        validate: {
            validator: (v) => Array.isArray(v) && v.length > 0 && v.every(i => typeof i === 'string'),
            message: 'Images must be an array of image URLs',
        },
    },
    size: {
        type: Number,
        required: [true, 'Size is required'],
        min: [0, 'Size cannot be negative'],
    },
    bedrooms: {
        type: Number,
        min: [0, 'Bedrooms cannot be negative'],
    },
    bathrooms: {
        type: Number,
        min: [0, 'Bathrooms cannot be negative'],
    },
    amenities: {
        type: [String],
        default: [],
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
    views: {
        type: Number,
        default: 0,
        min: [0, 'Views cannot be negative'],
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',  // References the User model for population (e.g., to fetch agent name)
        required: [true, 'Posted by user is required'],
    },
    agentName: {
      type: String,  // Denormalized for quick display; populate from User.name
      select: false,  // Optional: Exclude unless needed
    },
    },
    { timestamps: true }
);

// Indexes for performance (property-specific)
PropertySchema.index({ status: 1 });  // Quick filtering by availability
PropertySchema.index({ location: 'text' });  // Text search on location
PropertySchema.index({ postedBy: 1 });  // Efficient queries by agent
PropertySchema.index({ price: 1 });  // Sorting/filtering by price
PropertySchema.index({ 'location.city': 1 });

// Compile the model
const Property: Model<IProperty> = mongoose.model<IProperty>('Property', PropertySchema);

export  { PropertySchema, Property };