/**
 * Seeds real products from ARA SUMMER Excel into MongoDB Atlas.
 * Run: node seed-atlas.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product  = require('./models/Product');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ara-by-shanaya';
const BASE      = 'https://ara-by-shanaya.vercel.app/products';

const products = [
  {
    name:        'Minty Green Dress',
    description: 'A fresh, flowy minty green dress perfect for summer days. Light fabric, relaxed silhouette.',
    price:       8500,
    category:    'Gown',
    sizes:       ['XS','S','M','L','XL'],
    images:      [`${BASE}/minty-green-dress-1.jpg`, `${BASE}/minty-green-dress-2.jpg`],
    inStock:     true,
    featured:    true,
  },
  {
    name:        'Confetti Skirt',
    description: 'Vibrant confetti-print skirt. Fun, playful and effortlessly stylish.',
    price:       9000,
    category:    'Other',
    sizes:       ['XS','S','M','L','XL'],
    images:      [`${BASE}/confetti-skirt-1.jpg`, `${BASE}/confetti-skirt-2.jpg`],
    inStock:     true,
    featured:    true,
  },
  {
    name:        'Orange & Blue Bustier Top',
    description: 'Bold orange and blue bustier top. Make a statement wherever you go.',
    price:       6500,
    category:    'Kurti',
    sizes:       ['XS','S','M','L','XL'],
    images:      [`${BASE}/bustier-top-ob-1.jpg`, `${BASE}/bustier-top-ob-2.jpg`, `${BASE}/bustier-top-ob-3.jpg`],
    inStock:     true,
    featured:    true,
  },
  {
    name:        'Bustier Dress in Black & Pink',
    description: 'Elegant structured bustier dress in striking black and pink. For the woman who commands attention.',
    price:       9000,
    category:    'Gown',
    sizes:       ['XS','S','M','L'],
    images:      [`${BASE}/bustier-dress-bp-1.jpg`, `${BASE}/bustier-dress-bp-2.jpg`, `${BASE}/bustier-dress-bp-3.jpg`],
    inStock:     true,
    featured:    true,
  },
  {
    name:        'Confetti Co-ord Set',
    description: 'Matching confetti-print co-ord set. Mix, match, or wear together for a complete look.',
    price:       11500,
    category:    'Suit',
    sizes:       ['XS','S','M','L'],
    images:      [`${BASE}/confetti-set-1.jpg`, `${BASE}/confetti-set-2.jpg`],
    inStock:     true,
    featured:    true,
  },
  {
    name:        'Orange & Blue Anti-Fit Dress',
    description: 'Striking anti-fit dress in orange and blue. Contemporary silhouette, maximum impact.',
    price:       10500,
    category:    'Gown',
    sizes:       ['S','M','L','XL'],
    images:      [`${BASE}/ob-antift-dress-1.jpg`, `${BASE}/ob-antift-dress-2.jpg`, `${BASE}/ob-antift-dress-3.jpg`],
    inStock:     true,
    featured:    true,
  },
  {
    name:        'Collage Blazer',
    description: 'Artistic collage-print blazer. Structured, bold, and completely unique.',
    price:       9000,
    category:    'Other',
    sizes:       ['S','M','L','XL'],
    images:      [`${BASE}/collage-blazer-1.jpg`, `${BASE}/collage-blazer-2.jpg`],
    inStock:     true,
    featured:    false,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');
    await Product.deleteMany({});
    console.log('🗑  Cleared old products');
    const inserted = await Product.insertMany(products);
    console.log(`✅ Seeded ${inserted.length} products:`);
    inserted.forEach(p => console.log(`   • ${p.name} — ₹${p.price.toLocaleString('en-IN')}`));
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
