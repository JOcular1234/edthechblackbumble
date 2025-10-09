# Edtech BlackBumble - Digital Services Platform

A full-stack web application for managing and showcasing digital services with an admin dashboard for dynamic product management.

## 🚀 Features

### Frontend
- **Modern React UI** with Tailwind CSS
- **Responsive Design** for all devices
- **Dynamic Product Display** from API
- **Service Categories** with filtering
- **Professional Landing Page**

### Backend
- **Node.js/Express API** with MongoDB
- **JWT Authentication** for admin access
- **Role-based Access Control** (Admin/Super Admin)
- **Product CRUD Operations**
- **Account Security** (login attempts, account locking)

### Admin Dashboard
- **Product Management** - Add, edit, delete products
- **Category Management** - Organize products by categories
- **Popular Products** - Mark products as featured
- **Real-time Updates** - Changes reflect immediately on frontend

## 🛠️ Tech Stack

**Frontend:**
- React 18
- React Router DOM
- Tailwind CSS
- Axios

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Cloudinary for file uploads

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd edtech-blackbumble
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Environment Variables
Create `.env` file in backend directory:
```env
FRONTEND_URL=http://localhost:5173
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/edtech-blackbumble-db

JWT_SECRET=your-super-secret-jwt-key-here
EMAIL_USER=your_email
EMAIL_PASS=your_email_password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Database Setup
```bash
# Create default admin and seed products
npm run setup

# Or run individually:
npm run create-admin
npm run seed-products
```

### 5. Frontend Setup
```bash
cd ../frontend
npm install
```

## 🚀 Running the Application

### Development Mode

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

### Production Mode
```bash
cd backend
npm start
```

## 🔐 Admin Access

### Default Admin Credentials
- **URL:** `http://localhost:5173/admin/signin`
- **Username:** `admin`
- **Password:** `admin123456`
- **Role:** Super Admin

⚠️ **Important:** Change the default password after first login!

## 📱 API Endpoints

### Authentication
- `POST /api/auth/signin` - Admin signin
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current admin profile
- `POST /api/auth/signout` - Admin signout
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/create-admin` - Create new admin (Super Admin only)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/categories` - Get categories with counts
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `PATCH /api/products/:id/toggle-popular` - Toggle popular status (Admin)
- `PATCH /api/products/:id/toggle-active` - Toggle active status (Admin)

## 🎨 Product Categories

- **Graphic Design** - Visual design services
- **Logo & Branding** - Brand identity packages
- **Web Development** - Website creation services
- **Mobile App** - Mobile application development
- **Digital Marketing** - Online marketing services
- **SEO Services** - Search engine optimization
- **Virtual Assistant** - Administrative support
- **UI/UX Design** - User interface design

## 🔧 Admin Dashboard Features

### Product Management
- ✅ **Add Products** - Create new service packages
- ✅ **Edit Products** - Update existing products
- ✅ **Delete Products** - Remove products
- ✅ **Toggle Popular** - Mark products as featured
- ✅ **Toggle Active** - Enable/disable products
- ✅ **Category Organization** - Organize by service type
- ✅ **Feature Management** - Add/remove product features
- ✅ **Pricing Control** - Set prices and billing types
- ✅ **Visual Customization** - Choose gradient styles

### Security Features
- 🔐 **JWT Authentication** - Secure token-based auth
- 🛡️ **Role-based Access** - Admin/Super Admin roles
- 🔒 **Account Locking** - Protection against brute force
- 📊 **Login Tracking** - Monitor admin activity
- 🔑 **Password Security** - Bcrypt hashing

## 🌐 Frontend Pages

- **Home** (`/`) - Landing page with hero section
- **Services** (`/services`) - Dynamic product showcase
- **Pricing** (`/pricing`) - Pricing information
- **About** (`/about`) - Company information
- **Contact** (`/contact`) - Contact form
- **Admin Signin** (`/admin/signin`) - Admin authentication
- **Admin Dashboard** (`/admin/dashboard`) - Product management

## 📊 Database Schema

### Admin Model
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String (admin/super_admin),
  firstName: String,
  lastName: String,
  isActive: Boolean,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date
}
```

### Product Model
```javascript
{
  name: String,
  subtitle: String,
  description: String,
  category: String (enum),
  price: Number,
  currency: String,
  billing: String (enum),
  features: [String],
  gradient: String,
  hoverGradient: String,
  popular: Boolean,
  isActive: Boolean,
  sortOrder: Number,
  note: String,
  icon: String,
  deliveryTime: String,
  revisions: String,
  createdBy: ObjectId (Admin),
  updatedBy: ObjectId (Admin)
}
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Use PM2 for process management
3. Configure reverse proxy (Nginx)
4. Set up SSL certificates

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Deploy to static hosting (Netlify, Vercel)
3. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: admin@edtech-blackbumble.com

---

**Built with ❤️ for digital service providers**
