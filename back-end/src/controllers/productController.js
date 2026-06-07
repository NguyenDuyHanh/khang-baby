const productService = require('../services/productService');

// Get all products
async function getAllProducts(req, res) {
  try {
    const filters = {
      danh_muc: req.query.danh_muc,
      nha_cung_cap: req.query.nha_cung_cap,
      search: req.query.search,
      trang_thai: req.query.trang_thai || 'HOAT_DONG',
      ton_kho_trang_thai: req.query.ton_kho_trang_thai,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };

    const { rows, totalItems, page, limit } = await productService.getAllProducts(filters);
    res.json({ 
      ok: true, 
      data: rows,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit
      }
    });
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

    if (req.file) {
      productData.hinh_anh = `/uploads/products/${req.file.filename}`;
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
    const updateData = req.body;
    
    if (req.file) {
      updateData.hinh_anh = `/uploads/products/${req.file.filename}`;
    }

    await productService.updateProduct(req.params.id, updateData);

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
    const includeInactive = req.query.all === 'true';
    const categories = await productService.getCategories(includeInactive);
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

// Update category
async function updateCategory(req, res) {
  try {
    const { ten_danh_muc, mo_ta, trang_thai } = req.body;
    if (!ten_danh_muc) {
      return res.status(400).json({ ok: false, message: 'Category name required' });
    }
    
    await productService.updateCategory(req.params.id, { ten_danh_muc, mo_ta, trang_thai });
    res.json({ ok: true, message: 'Category updated successfully' });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

// Delete category
async function deleteCategory(req, res) {
  try {
    await productService.deleteCategory(req.params.id);
    res.json({ ok: true, message: 'Category deleted successfully' });
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
  updateCategory,
  deleteCategory,
  getSuppliers,
  createSupplier,
};
