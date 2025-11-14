import { Router } from 'express';
import {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
} from '../controller/carsController'; // Adjust path to your controllers
import { protect, authorize } from '../middleware/authMiddleware';  // Adjust path to middleware

const router = Router();

// GET /api/cars - Retrieve all cars (authenticated users only)
router.get('/', protect, getAllCars);

// GET /api/cars/:id - Retrieve a single car (authenticated users only)
router.get('/:id', protect, getCarById);

// POST /api/cars - Create a new car (admin/agent only)
router.post('/', protect, authorize('admin', 'agent'), createCar);

// PATCH /api/cars/:id - Update a car (admin/agent or owner only)
router.patch('/:id', protect, authorize('admin', 'agent'), updateCar);

// DELETE /api/cars/:id - Delete a car (admin/agent or owner only)
router.delete('/:id', protect, authorize('admin', 'agent'), deleteCar);

export default router;