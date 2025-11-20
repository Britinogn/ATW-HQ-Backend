import { Router } from 'express';
import carController from '../controller/carsController'; 
import { requireRole } from '../middleware/roleMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';
import { uploadCar } from '../middleware/uploadMiddleware'; 

const router = Router();

// GET /api/cars - Retrieve all cars (authenticated users only)
router.get('/',  carController.getAllCars);

// GET /api/cars/:id - Retrieve a single car (authenticated users only)
router.get('/:id',  carController.getCarById);

// POST /api/cars - Create a new car (admin/agent only)
// router.post('/', authMiddleware, requireRole(['admin', 'agent']), uploadCar.array('images',10) ,carController.createCar);

// // PATCH /api/cars/:id - Update a car (admin/agent or owner only)
// router.patch('/:id', authMiddleware, requireRole(['admin', 'agent']),  uploadCar.array('images',10), carController.updateCar);

router.post('/', 
    authMiddleware, 
    requireRole(['admin', 'agent']), 
    uploadCar.fields([
        { name: 'images', maxCount: 10 },
        { name: 'videos', maxCount: 5 }
    ]), 
    carController.createCar
);

// PATCH /api/properties/:id - Update a property (admin/agent or owner only)
router.patch('/:id', 
    authMiddleware, 
    requireRole(['admin', 'agent']), 
    uploadCar.fields([
        { name: 'images', maxCount: 10 },
        { name: 'videos', maxCount: 5 }
    ]), 
    carController.updateCar
);

// DELETE /api/cars/:id - Delete a car (admin/agent or owner only)
router.delete('/:id', authMiddleware, requireRole(['admin', 'agent']), carController.deleteCar);

export default router;