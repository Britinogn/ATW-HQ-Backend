import {Car} from '../models/Cars'
import cloudinary from '../config/cloudinary';
import { Request, Response, NextFunction } from 'express';
import { ICar } from '../types';
import { PropertyStatus ,CarCondition } from '../types/enums';

export const getAllCars = async (req: Request, res: Response) => {
    try {
    
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while retrieving projects';
        res.status(500).json({ error: errorMessage });
    }
};

export const getCarById = async (req: Request, res: Response) => {
    try {
    
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while retrieving projects';
        res.status(500).json({ error: errorMessage });
    }
};

export const createCar = async (req: Request, res: Response) => {
    try {
    
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while retrieving projects';
        res.status(500).json({ error: errorMessage });
    }
};

export const updateCar = async (req: Request, res: Response) => {
    try {
    
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while retrieving projects';
        res.status(500).json({ error: errorMessage });
    }
};


export const deleteCar = async (req: Request, res: Response) => {
    try {
    
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while retrieving projects';
        res.status(500).json({ error: errorMessage });
    }
};


export default { 
    getAllCars,
    getCarById,
    createCar,
    updateCar,
    deleteCar,
};