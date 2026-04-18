const express = require('express');
const router  = express.Router();
const XLSX    = require('xlsx');
const auth    = require('../middleware/auth');
const { uploadExcel, uploadImage } = require('../middleware/upload');
const Product = require('../models/Product');
const path    = require('path');
const fs      = require('fs');

// POST /api/upload/excel — upload & parse Excel (handles alternating-row ARA format)
router.post('/excel', auth, uploadExcel.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const workbook  = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet     = workbook.Sheets[sheetName];

    // Get all raw rows (with header detection)
    const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

    // ARA format: alternating rows, header may be on row 1 or 2
    // Scan ALL rows for NAME/PRICE data — skip header rows and empty rows
    const products = [];
    const errors   = [];

    // Find column indices from any row that looks like a header
    let nameIdx = 0, priceIdx = 1; // defaults for ARA format
    for (const row of raw) {
      if (!row) continue;
      const upper = row.map((c) => (c ? String(c).toUpperCase().trim() : ''));
      if (upper.includes('NAME') || upper.includes('PRODUCT NAME')) {
        nameIdx  = upper.findIndex((h) => h.includes('NAME'));
        priceIdx = upper.findIndex((h) => h.includes('PRICE'));
        break;
      }
    }

    for (let i = 0; i < raw.length; i++) {
      const row = raw[i];
      if (!row || row.every((c) => !c)) continue;

      const nameVal  = row[nameIdx];
      const priceVal = row[priceIdx];

      // Skip header row itself
      if (nameVal && String(nameVal).toUpperCase().trim() === 'NAME') continue;
      if (!nameVal) continue;

      const name  = String(nameVal).trim();
      const price = Number(priceVal) || 0;

      if (!name)  continue;
      if (!price) { errors.push(`Row ${i + 1}: invalid price for "${name}"`); continue; }

      products.push({
        name,
        price,
        description: '',
        category: detectCategory(name),
        images: [],
        colors: [],
        sizes:  [],
        inStock: true,
      });
    }

    const created = products.length ? await Product.insertMany(products) : [];
    fs.unlinkSync(req.file.path);

    res.json({
      message:  `${created.length} products imported successfully`,
      created:  created.length,
      errors,
      products: created,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Detect category from product name
function detectCategory(name) {
  const n = name.toUpperCase();
  if (n.includes('SAREE') || n.includes('SARI'))        return 'Saree';
  if (n.includes('LEHENGA'))                             return 'Lehenga';
  if (n.includes('KURTI') || n.includes('KURTA'))       return 'Kurti';
  if (n.includes('GOWN'))                                return 'Gown';
  if (n.includes('SUIT') || n.includes('SET'))          return 'Suit';
  if (n.includes('DUPATTA'))                             return 'Dupatta';
  if (n.includes('DRESS'))                               return 'Gown';
  if (n.includes('SKIRT'))                               return 'Other';
  if (n.includes('TOP') || n.includes('BUSTIER'))       return 'Other';
  if (n.includes('BLAZER') || n.includes('JACKET'))     return 'Other';
  return 'Other';
}

// POST /api/upload/product-image/:productId
router.post('/product-image/:productId', auth, uploadImage.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  try {
    const imagePath = 'uploads/images/' + req.file.filename;
    const product   = await Product.findByIdAndUpdate(
      req.params.productId,
      { $push: { images: imagePath } },
      { new: true }
    );
    if (!product) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Image uploaded', imagePath, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/upload/template — download ARA-format Excel template
router.get('/template', auth, (req, res) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    ['NAME', 'PRICE', 'IMAGE'],
    [],
    ['MINTY GREEN DRESS', 8500, ''],
    [],
    ['CONFETTI SKIRT', 9000, ''],
    [],
    ['ORANGE AND BLUE BUSTIER TOP', 6500, ''],
  ]);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename=ara-products-template.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
});

module.exports = router;

