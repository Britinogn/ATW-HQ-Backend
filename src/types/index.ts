import { ObjectId } from 'mongoose'
import { UserRole , PropertyStatus , PropertyType , CarCondition } from './enums';
import { Request } from "express";

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
    verificationToken?: string | undefined;   // for email verification
    resetPasswordToken?: string | undefined;  // for password reset
    resetPasswordExpires?: Date | undefined;

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

// ------------------------------
// Paystack Payment Types
// ------------------------------

export interface IPaymentInitialize {
    email: string;
    amount: number; // in Naira, will convert to kobo
    callbackUrl?: string;
}

export interface IPaymentInitializeResponse {
    status: boolean;
    message?: string;
    data: {
        authorizationUrl: string;
        accessCode: string;
        reference: string;
    };
}

export interface IPaymentVerifyResponse {
    status: boolean;
    message: string;
    data: {
        id: number;
        domain: string;
        status: 'success' | 'failed' | 'abandoned';
        reference: string;
        amount: number;   // in kobo
        message: string | null;
        gateway_response: string | null;
        paid_at?: Date | null;
        channel: string;
        currency: string;
        customer: {
            email: string;
            firstName?: string;
            lastName?: string;
            
        };
    };
}

export interface PaystackError {
    status: false;
    message: string;
}

// Generic request body type
// export interface IRequestBody<T> extends Request {
//     body: T;
// }

// // Generic request query type (optional)
// export interface IRequestQuery<T> extends Request {
//     query: T;
// }



export type CacheKey = 
    | `property:${string}`
    | `car:${string}`
    | `properties:list:${string}`
    | `cars:list:${string}`;

export * from './express';