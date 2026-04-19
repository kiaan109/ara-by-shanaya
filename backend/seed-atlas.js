/**
 * Seeds products into MongoDB Atlas.
 * Run once: node seed-atlas.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product  = require('./models/Product');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ara-by-shanaya';
const BASE_IMG  = 'https://ara-by-shanaya.vercel.app/products';

const products = [
  {
    name: 'Bustier Dress Black Pink',
    description: 'Elegant bustier dress in black and pink — a bold statement for every occasion.',
    price: 2499,
    category: 'Gown',
    sizes: ['XS','S','M','L','XL'],
    images: [
      `${BASE_IMG}/bustier-dress-black-pink.jpg`,
      `${BASE_IMG}/bustier-dress-black-pink-1.jpg`,
      `${BASE_IMG}/bustier-dress-black-pink-2.jpg`,
      `${BASE_IMG}/bustier-dress-black-pink-3.jpg`,
    ],
    inStock: true,
    featured: true,
  },
  {
    name: 'Collage Blazer',
    description: 'Contemporary collage-print blazer — structured yet effortlessly chic.',
    price: 3299,
    category: 'Other',
    sizes: ['S','M','L','XL'],
    images: [
      `${BASE_IMG}/collage-blazer.jpg`,
      `${BASE_IMG}/collage-blazer-1.jpg`,
      `${BASE_IMG}/collage-blazer-2.jpg`,
    ],
    inStock: true,
    featured: true,
  },
  {
    name: 'Confetti Co-ord Set',
    description: 'Playful confetti-print co-ord set perfect for summer days.',
    price: 2799,
    category: 'Suit',
    sizes: ['XS','S','M','L'],
    images: [
      `${BASE_IMG}/confetti-set.jpg`,
      `${BASE_IMG}/confetti-set-1.jpg`,
      `${BASE_IMG}/confetti-set-2.jpg`,
    ],
    inStock: true,
    featured: true,
  },
  {
    name: 'Confetti Skirt',
    description: 'Fun and vibrant confetti-print skirt — mix and match with ease.',
    price: 1599,
    category: 'Other',
    sizes: ['XS','S','M','L','XL'],
    images: [
      `${BASE_IMG}/confetti-skirt.jpg`,
      `${BASE_IMG}/confetti-skirt-1.jpg`,
      `${BASE_IMG}/confetti-skirt-2.jpg`,
    ],
    inStock: true,
    featured: false,
  },
  {
    name: 'Minty Green Dress',
    description: 'Fresh minty green dress — light, airy, and summer-ready.',
    price: 2199,
    category: 'Gown',
    sizes: ['XS','S','M','L'],
    images: [
      `${BASE_IMG}/minty-green-dress.jpg`,
      `${BASE_IMG}/minty-green-dress-1.jpg`,
      `${BASE_IMG}/minty-green-dress-2.jpg`,
    ],
    inStock: true,
    featured: true,
  },
  {
    name: 'Orange Blue Outfit Dress',
    description: 'Striking orange and blue contrast dress — vibrant and eye-catching.',
    price: 2699,
    category: 'Gown',
    sizes: ['S','M','L','XL'],
    images: [
      `${BASE_IMG}/orange-blue-antift-dress.jpg`,
      `${BASE_IMG}/orange-blue-antift-dress-1.jpg`,
      `${BASE_IMG}/orange-blue-antift-dress-2.jpg`,
      `${BASE_IMG}/orange-blue-antift-dress-3.jpg`,
    ],
    inStock: true,
    featured: true,
  },
  {
    name: 'Orange Blue Bustier Top',
    description: 'Bold orange and blue bustier top — pair it with anything for an instant look.',
    price: 1899,
    category: 'Kurti',
    sizes: ['XS','S','M','L','XL'],
    images: [
      `${BASE_IMG}/orange-blue-bustier-top.jpg`,
      `${BASE_IMG}/orange-blue-bustier-top-1.jpg`,
      `${BASE_IMG}/orange-blue-bustier-top-2.jpg`,
      `${BASE_IMG}/orange-blue-bustier-top-3.jpg`,
    ],
    inStock: true,
    featured: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    const existing = await Product.countDocuments();
    if (existing > 0) {
      console.log(`${existing} products already exist — clearing and re-seeding…`);
      await Product.deleteMany({});
    }

    const inserted = await Product.insertMany(products);
    console.log(`✅ Seeded ${inserted.length} products successfully!`);
    inserted.forEach(p => console.log(`  • ${p.name} — ₹${p.price}`));
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
