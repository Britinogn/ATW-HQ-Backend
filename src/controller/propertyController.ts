import Property from '../models/Property'
import cloudinary from '../config/cloudinary';
import { Request, Response, NextFunction } from 'express';
import { IProperty } from '../types';
import { PropertyStatus ,PropertyType } from '../types/enums';

export const getAllProperties = async (req: Request, res: Response) => {
    try {
    
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while retrieving projects';
        res.status(500).json({ error: errorMessage });
    }
};

export const getPropertyById = async (req: Request, res: Response) => {
    try {
    
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while retrieving projects';
        res.status(500).json({ error: errorMessage });
    }
};

export const createProperty = async (req: Request, res: Response) => {
    try {
    
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while retrieving projects';
        res.status(500).json({ error: errorMessage });
    }
};

export const updateProperty = async (req: Request, res: Response) => {
    try {
    
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while retrieving projects';
        res.status(500).json({ error: errorMessage });
    }
};


export const deleteProperty = async (req: Request, res: Response) => {
    try {
    
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while retrieving projects';
        res.status(500).json({ error: errorMessage });
    }
};


export default { 
    getAllProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
};