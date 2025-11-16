import { Router } from 'express';
import propertyController from '../controller/propertyController';
import { requireRole } from '../middleware/roleMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';
import { uploadProperty } from '../middleware/uploadMiddleware'; 

const router = Router();

// GET /api/properties - Retrieve all properties (authenticated users only)
router.get('/',  propertyController.getAllProperties);

// GET /api/properties/:id - Retrieve a single property (authenticated users only)
router.get('/:id',  propertyController.getPropertyById);

// POST /api/properties - Create a new property (admin/agent only)
router.post('/', authMiddleware, requireRole(['admin', 'agent']), uploadProperty.array('images', 10), propertyController.createProperty);

// PATCH /api/properties/:id - Update a property (admin/agent or owner only)
router.patch('/:id', authMiddleware, requireRole(['admin', 'agent']), uploadProperty.array('images', 10),  propertyController.updateProperty);

// DELETE /api/properties/:id - Delete a property (admin/agent or owner only)
router.delete('/:id', authMiddleware, requireRole(['admin', 'agent']), propertyController.deleteProperty);

export default router;