import { Router } from 'express';
import {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../controller/propertyController';  // Adjust path to your controllers
import { protect, authorize } from '../middleware/authMiddleware';  // Adjust path to middleware

const router = Router();

// GET /api/properties - Retrieve all properties (authenticated users only)
router.get('/', protect, getAllProperties);

// GET /api/properties/:id - Retrieve a single property (authenticated users only)
router.get('/:id', protect, getPropertyById);

// POST /api/properties - Create a new property (admin/agent only)
router.post('/', protect, authorize('admin', 'agent'), createProperty);

// PATCH /api/properties/:id - Update a property (admin/agent or owner only)
router.patch('/:id', protect, authorize('admin', 'agent'), updateProperty);

// DELETE /api/properties/:id - Delete a property (admin/agent or owner only)
router.delete('/:id', protect, authorize('admin', 'agent'), deleteProperty);

export default router;