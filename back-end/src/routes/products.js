const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const { checkRole } = auth;

// All product routes require authentication
router.use(auth);

// Products
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', checkRole('MANAGER', 'WAREHOUSE'), productController.createProduct);
router.put('/:id', checkRole('MANAGER', 'WAREHOUSE'), productController.updateProduct);
router.delete('/:id', checkRole('MANAGER', 'WAREHOUSE'), productController.deleteProduct);

// Stock alerts
router.get('/alerts/near-minimum', productController.getProductsNearMinimumStock);
router.get('/alerts/expiring', productController.getProductsNearExpiry);

// Categories
router.get('/categories/list', productController.getCategories);
router.post('/categories', checkRole('MANAGER', 'WAREHOUSE'), productController.createCategory);
router.delete('/categories/:id', checkRole('MANAGER', 'WAREHOUSE'), productController.deleteCategory);

// Suppliers
router.get('/suppliers/list', productController.getSuppliers);
router.post('/suppliers', checkRole('MANAGER', 'WAREHOUSE'), productController.createSupplier);

module.exports = router;
