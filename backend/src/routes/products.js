const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireAuth } = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

// GET /api/products - Get all products for user
router.get('/', productController.getUserProducts);

// POST /api/products - Add new product
router.post('/', productController.addProduct);

// PUT /api/products/:id - Update product
router.put('/:id', productController.updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', productController.deleteProduct);

// GET /api/products/:id/history - Get price history
router.get('/:id/history', productController.getPriceHistory);

// POST /api/products/:id/refresh - Manually refresh product data
router.post('/:id/refresh', productController.refreshProduct);

module.exports = router;
