const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../public/uploads/images');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../public/uploads/excel');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, 'products-' + Date.now() + path.extname(file.originalname));
  },
});

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

const excelFilter = (req, file, cb) => {
  const allowed = /xlsx|xls|csv/;
  if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
  else cb(new Error('Only Excel/CSV files are allowed'));
};

exports.uploadImage  = multer({ storage: imageStorage,  fileFilter: imageFilter,  limits: { fileSize: 10 * 1024 * 1024 } });
exports.uploadExcel  = multer({ storage: excelStorage,  fileFilter: excelFilter,  limits: { fileSize: 5  * 1024 * 1024 } });
exports.uploadImages = multer({ storage: imageStorage,  fileFilter: imageFilter,  limits: { fileSize: 10 * 1024 * 1024 } });
