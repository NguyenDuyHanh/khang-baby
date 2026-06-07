const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const { checkRole } = auth;

// Configure Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../../uploads/products');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// All product routes require authentication
router.use(auth);

// Stock alerts
router.get('/alerts/near-minimum', productController.getProductsNearMinimumStock);
router.get('/alerts/expiring', productController.getProductsNearExpiry);

// Categories
router.get('/categories/list', productController.getCategories);
router.post('/categories', checkRole('MANAGER', 'WAREHOUSE'), productController.createCategory);
router.put('/categories/:id', checkRole('MANAGER', 'WAREHOUSE'), productController.updateCategory);
router.delete('/categories/:id', checkRole('MANAGER', 'WAREHOUSE'), productController.deleteCategory);

// Suppliers
router.get('/suppliers/list', productController.getSuppliers);
router.post('/suppliers', checkRole('MANAGER', 'WAREHOUSE'), productController.createSupplier);

// Products - General & Parameterized routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', checkRole('MANAGER', 'WAREHOUSE'), upload.single('hinh_anh'), productController.createProduct);
router.put('/:id', checkRole('MANAGER', 'WAREHOUSE'), upload.single('hinh_anh'), productController.updateProduct);
router.delete('/:id', checkRole('MANAGER', 'WAREHOUSE'), productController.deleteProduct);

module.exports = router;
