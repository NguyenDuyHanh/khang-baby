const productService = require('../services/productService');

// Get all products
async function getAllProducts(req, res) {
  try {
    const filters = {
      danh_muc: req.query.danh_muc,
      nha_cung_cap: req.query.nha_cung_cap,
      search: req.query.search,
      trang_thai: req.query.trang_thai || 'HOAT_DONG',
    };

    const products = await productService.getAllProducts(filters);
    res.json({ ok: true, data: products });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Get product by ID
async function getProductById(req, res) {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ ok: false, message: 'Product not found' });
    }
    res.json({ ok: true, data: product });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Create product
async function createProduct(req, res) {
  try {
    const productData = req.body;

    if (!productData.ma_sp || !productData.ten_sp || !productData.id_danh_muc || !productData.id_nha_cung_cap) {
      return res.status(400).json({ ok: false, message: 'Missing required fields' });
    }

    const id = await productService.createProduct(productData);

    res.status(201).json({
      ok: true,
      message: 'Product created successfully',
      id,
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

// Update product
async function updateProduct(req, res) {
  try {
    await productService.updateProduct(req.params.id, req.body);

    res.json({
      ok: true,
      message: 'Product updated successfully',
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

// Delete product
async function deleteProduct(req, res) {
  try {
    await productService.deleteProduct(req.params.id);

    res.json({
      ok: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

// Get products near minimum stock
async function getProductsNearMinimumStock(req, res) {
  try {
    const products = await productService.getProductsNearMinimumStock();
    res.json({ ok: true, data: products });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Get products near/past expiry
async function getProductsNearExpiry(req, res) {
  try {
    const days = req.query.days || 30;
    const products = await productService.getProductsNearExpiry(days);
    res.json({ ok: true, data: products });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Get categories
async function getCategories(req, res) {
  try {
    const categories = await productService.getCategories();
    res.json({ ok: true, data: categories });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Create category
async function createCategory(req, res) {
  try {
    const { ten_danh_muc, mo_ta } = req.body;

    if (!ten_danh_muc) {
      return res.status(400).json({ ok: false, message: 'Category name required' });
    }

    const id = await productService.createCategory(ten_danh_muc, mo_ta);

    res.status(201).json({
      ok: true,
      message: 'Category created successfully',
      id,
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

// Delete category
async function deleteCategory(req, res) {
  try {
    await productService.deleteCategory(req.params.id);

    res.json({
      ok: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

// Get suppliers
async function getSuppliers(req, res) {
  try {
    const suppliers = await productService.getSuppliers();
    res.json({ ok: true, data: suppliers });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Create supplier
async function createSupplier(req, res) {
  try {
    const supplierData = req.body;

    if (!supplierData.ten_ncc) {
      return res.status(400).json({ ok: false, message: 'Supplier name required' });
    }

    const id = await productService.createSupplier(supplierData);

    res.status(201).json({
      ok: true,
      message: 'Supplier created successfully',
      id,
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsNearMinimumStock,
  getProductsNearExpiry,
  getCategories,
  createCategory,
  deleteCategory,
  getSuppliers,
  createSupplier,
};
