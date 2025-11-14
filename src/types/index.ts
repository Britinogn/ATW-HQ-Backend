import { ObjectId } from 'mongoose'
import { UserRole , PropertyStatus , PropertyType , CarCondition } from './enums';
// Redis type
export interface CacheOptions{
    isOpen: boolean;
    ttl?: number; // Time to live in seconds
}

export interface IUser {
    id?: ObjectId | string;  
    name: string;
    email: string;
    password: string;
    profile?: string;
    role: UserRole;

    isVerified?: boolean;         // email verification
    verificationToken?: string;   // for email verification
    resetPasswordToken?: string;  // for password reset
    resetPasswordExpires?: Date;

    createdAt?: Date;    // timestamp when user was created
    updatedAt?: Date;    // timestamp when user was last updated
}



export interface IProperty {
    _id: ObjectId | string; 
    title: string;
    propertyType: PropertyType;
    price: number; 
    location: {
        city: string;     
        state: string;    
        area?: string;    
        address?: string;  
    };
    //address?: string; 
    description: string;
    images: string[]; 
    size: number;  
    bedrooms?: number;
    bathrooms?: number;
    amenities?: string[];  
    status: PropertyStatus;
    views: number; 
    postedBy: ObjectId | string; 
    agentName?: string; 
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ICar {
    id: ObjectId | string;
    make: string;
    model: string;
    year: number;  
    mileage: number;  
    condition: CarCondition;
    price: number;
    description: string;
    images: string[];  
    location: {
        city: string;
        state: string;
        address?:string
        showroom?: string;  // Optional: specific showroom/lot name
    };
    status: PropertyStatus;  
    postedBy: ObjectId | string; 
    createdAt?: Date;
    updatedAt?: Date;
}


export interface MulterFile {
    path: string;
    filename: string;
}




export type CacheKey = 
    | `property:${string}`
    | `car:${string}`
    | `properties:list:${string}`
    | `cars:list:${string}`;

export * from './express';