const express   = require('express');
const router    = express.Router();
const Product   = require('../models/Product');
const auth      = require('../middleware/auth');
const { uploadImages } = require('../middleware/upload');
const path      = require('path');
const fs        = require('fs');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12, featured } = req.query;
    const query = {};

    if (category && category !== 'All') query.category = category;
    if (featured)                        query.featured = true;
    if (search) {
      query.$or = [
        { name:        { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category:    { $regex: search, $options: 'i' } },
      ];
    }

    const total    = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      products,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products (admin)
router.post('/', auth, uploadImages.array('images', 10), async (req, res) => {
  try {
    const { name, price, description, category, colors, sizes, inStock, featured, stock } = req.body;
    const images = (req.files || []).map((f) => 'uploads/images/' + f.filename);

    const product = await Product.create({
      name,
      price:       Number(price),
      description: description || '',
      category:    category || 'Other',
      images,
      colors: colors ? JSON.parse(colors) : [],
      sizes:  sizes  ? JSON.parse(sizes)  : [],
      inStock: inStock !== 'false',
      featured: featured === 'true',
      stock:    Number(stock) || 0,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/products/:id (admin)
router.put('/:id', auth, uploadImages.array('images', 10), async (req, res) => {
  try {
    const { name, price, description, category, colors, sizes, inStock, featured, stock, removeImages } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const newImages = (req.files || []).map((f) => 'uploads/images/' + f.filename);
    const toRemove  = removeImages ? JSON.parse(removeImages) : [];

    // Delete removed image files
    toRemove.forEach((imgPath) => {
      const fullPath = path.join(__dirname, '../public', imgPath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    });

    const updatedImages = [...product.images.filter((i) => !toRemove.includes(i)), ...newImages];

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name, price: Number(price), description, category,
        colors:   colors ? JSON.parse(colors) : product.colors,
        sizes:    sizes  ? JSON.parse(sizes)  : product.sizes,
        inStock:  inStock !== 'false',
        featured: featured === 'true',
        stock:    Number(stock) || product.stock,
        images:   updatedImages,
      },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/products/:id (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Delete image files
    product.images.forEach((imgPath) => {
      const fullPath = path.join(__dirname, '../public', imgPath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    });

    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
