require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');
const path     = require('path');
const connectDB = require('./config/db');
const Admin    = require('./models/Admin');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware — allow all origins (JWT auth, no cookies)
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (uploaded images)
// Serve uploads with no-cache so updated images show immediately
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  next();
}, express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/upload',   require('./routes/upload'));
app.use('/api/tryon',    require('./routes/tryon'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'ARA Backend', time: new Date() }));

// Seed default admin on first run
async function seedAdmin() {
  const count = await Admin.countDocuments();
  if (count === 0) {
    const email    = process.env.ADMIN_EMAIL    || 'admin@arabyshanaya.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@1234';
    await Admin.create({ email, password, name: 'ARA Admin' });
    console.log(`Default admin seeded: ${email} / ${password}`);
  }
}
seedAdmin().catch(console.error);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ARA Backend running on http://localhost:${PORT}`));
