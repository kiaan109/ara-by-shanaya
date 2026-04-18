# ARA by Shanaya — AI-Powered 3D Fashion Platform

A complete luxury fashion platform with:
- **Frontend**: Next.js 14, React Three Fiber (3D), Framer Motion, Tailwind CSS
- **Backend**: Node.js/Express, MongoDB, JWT Auth, Multer, XLSX
- **Admin Panel**: Next.js 14, full product & order management
- **AI Module**: Python FastAPI, Stable Diffusion inpainting, OpenCV, Pillow

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| Python | 3.10+ |
| MongoDB | 6+ |
| GPU (optional) | CUDA 11.8+ for SD acceleration |

---

## Step-by-Step Setup

### 1. Clone / Extract the project

```
cd ara-by-shanaya
```

---

### 2. Start MongoDB

**Windows:**
```bash
# If installed as a service:
net start MongoDB

# Or run manually:
mongod --dbpath C:\data\db
```

**macOS/Linux:**
```bash
mongod --fork --logpath /var/log/mongodb.log
```

---

### 3. Backend

```bash
cd backend
npm install
# .env is already configured — edit if needed
npm run dev
```

> Backend runs at **http://localhost:5000**

Default admin is auto-seeded on first run:
- Email: `admin@arabyshanaya.com`
- Password: `Admin@1234`

---

### 4. Frontend (Customer Website)

```bash
cd frontend
npm install
npm run dev
```

> Frontend runs at **http://localhost:3000**

---

### 5. Admin Panel

```bash
cd admin
npm install
npm run dev
```

> Admin panel runs at **http://localhost:3001**

Login with the credentials above.

---

### 6. AI Module

**Create virtual environment:**
```bash
cd ai-module
python -m venv venv

# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate
```

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Optional — MediaPipe for better pose detection:**
```bash
pip install mediapipe
```

**Run the AI server:**
```bash
python main.py
```

> AI module runs at **http://localhost:8000**

---

## GPU Acceleration (Optional but Recommended for AI)

For the best try-on quality with Stable Diffusion:

```bash
# Install PyTorch with CUDA 11.8:
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

# First run will auto-download the SD inpainting model (~4GB)
# Subsequent runs use the cached model
```

Without a GPU, the system uses a CPU-based compositing fallback that blends the clothing onto the person image.

---

## All Services Running

| Service | URL |
|---------|-----|
| Customer Website | http://localhost:3000 |
| Admin Panel | http://localhost:3001 |
| Backend API | http://localhost:5000 |
| AI Module | http://localhost:8000 |
| API Docs (FastAPI) | http://localhost:8000/docs |

---

## Features

### Customer Website
- Dark luxury UI with gold accents
- 3D rotating hero scene (Three.js / React Three Fiber)
- 3D product viewer with auto-rotation
- Product browse with search & filter by category
- Cart with persistent state (Zustand + localStorage)
- Checkout with UPI QR code + GPay deep link

### Admin Panel
- Secure JWT login
- Dashboard with stats
- Full product CRUD with image upload
- **Excel bulk import** — upload `.xlsx` to create multiple products at once
- Download Excel template
- Order management with status updates

### AI Try-On
- Upload your photo or use webcam
- Select any product or upload custom clothing
- GPU: Stable Diffusion inpainting for photorealistic try-on
- CPU: OpenCV-based compositing fallback
- Download generated result

---

## Project Structure

```
ara-by-shanaya/
├── frontend/               # Next.js customer website
│   ├── app/
│   │   ├── page.tsx        # Homepage with 3D hero
│   │   ├── products/       # Product listing & detail
│   │   ├── cart/           # Shopping cart
│   │   ├── checkout/       # Checkout + UPI payment
│   │   └── try-on/         # AI virtual try-on
│   ├── components/
│   │   ├── 3d/             # Three.js components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── ProductCard.tsx
│   ├── store/cartStore.ts  # Zustand cart state
│   └── lib/api.ts          # API client
│
├── backend/                # Node.js/Express API
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Auth + file upload
│   ├── config/db.js
│   └── server.js
│
├── admin/                  # Next.js admin panel
│   ├── app/
│   │   ├── page.tsx        # Login
│   │   └── dashboard/      # All admin pages
│   ├── components/AdminNav.tsx
│   └── lib/api.ts
│
└── ai-module/              # Python FastAPI
    ├── main.py             # FastAPI app
    ├── config.py
    ├── routers/tryon.py    # Upload + generate endpoints
    ├── models/
    │   ├── diffusion.py    # SD inpainting pipeline
    │   ├── segmentation.py # Body segmentation
    │   └── pose.py         # Pose estimation
    └── utils/image_utils.py
```

---

## API Reference

### Backend (Port 5000)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /api/products | — | List products |
| GET | /api/products/:id | — | Get product |
| POST | /api/products | Admin | Create product |
| PUT | /api/products/:id | Admin | Update product |
| DELETE | /api/products/:id | Admin | Delete product |
| POST | /api/orders | — | Create order |
| GET | /api/orders | Admin | List orders |
| PUT | /api/orders/:id/status | Admin | Update status |
| POST | /api/upload/excel | Admin | Bulk import |
| POST | /api/upload/product-image/:id | Admin | Upload image |
| GET | /api/upload/template | Admin | Download template |
| POST | /api/auth/login | — | Admin login |

### AI Module (Port 8000)

| Method | Route | Description |
|--------|-------|-------------|
| POST | /upload-person | Upload person photo |
| POST | /upload-cloth | Upload clothing image |
| POST | /generate | Generate try-on |
| GET | /pose/:person_id | Get pose visualization |
| GET | /health | Health check |

---

## Excel Import Format

Download the template from Admin → Upload → "Download Template"

| Column | Required | Example |
|--------|----------|---------|
| name | Yes | Banarasi Silk Saree |
| price | Yes | 15000 |
| description | No | Handwoven pure silk... |
| category | No | Saree |
| sizes | No | S,M,L,XL |
| colors | No | #FF0000,#FFD700 |

---

## Troubleshooting

**MongoDB connection failed:**
```bash
# Make sure mongod is running and check MONGODB_URI in backend/.env
```

**Three.js canvas error in Next.js:**
- The `transpilePackages` in `next.config.js` handles this — ensure it's present.

**AI module slow on CPU:**
- This is expected. GPU is strongly recommended for SD-based generation.
- The compositing fallback still works and returns results in 1-3 seconds.

**Port already in use:**
```bash
# Kill process on port 5000 (Windows):
netstat -ano | findstr :5000
taskkill /PID <pid> /F
```
