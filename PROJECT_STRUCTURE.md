# TourMate Project Structure

## Overview
TourMate is a full-stack travel platform built with **Node.js + Express** backend and **React + Vite** frontend. This document outlines the clean project structure.

---

## Backend Structure (`/Backend`)

```
Backend/
├── config/
│   └── db.js                 # MongoDB connection configuration
├── controllers/              # Request handlers by feature
│   ├── authController.js     # Authentication (register, login, profile)
│   ├── bookingController.js  # Service booking management
│   ├── feedbackController.js # Review/feedback operations
│   ├── messageController.js  # Chat/messaging features
│   ├── paymentController.js  # Payment processing (PayHere)
│   ├── notificationController.js # Push notifications
│   ├── serviceController.js  # Tourism services
│   ├── sosController.js      # Emergency SOS alerts
│   ├── tourController.js     # Tour request & bidding
│   ├── userController.js     # User profile operations
│   └── adminController.js    # Admin dashboard & management
├── middleware/
│   └── auth.js               # JWT authentication & authorization
├── models/                   # MongoDB schemas
│   ├── User.js               # User profile (tourist/provider/admin)
│   ├── Service.js            # Tourism services
│   ├── Booking.js            # Service bookings
│   ├── TourRequest.js        # Custom tour requests & bids
│   ├── Payment.js            # Payment records
│   ├── Message.js            # Chat messages
│   ├── Notification.js       # User notifications
│   ├── Feedback.js           # Service reviews
│   └── SOSAlert.js           # Emergency alerts
├── routes/                   # API endpoints by feature
│   ├── authRoutes.js         # /api/auth endpoints
│   ├── bookingRoutes.js      # /api/bookings endpoints
│   ├── serviceRoutes.js      # /api/services endpoints
│   ├── tourRoutes.js         # /api/tours endpoints
│   ├── paymentRoutes.js      # /api/payments endpoints
│   ├── messageRoutes.js      # /api/messages endpoints
│   ├── notificationRoutes.js # /api/notifications endpoints
│   ├── feedbackRoutes.js     # /api/feedback endpoints
│   ├── sosRoutes.js          # /api/sos endpoints
│   ├── userRoutes.js         # /api/users endpoints
│   └── adminRoutes.js        # /api/admin endpoints
├── utils/
│   └── notificationService.js # Notification logic
├── uploads/                  # ⚠️ User-generated files (git-ignored)
├── .env                      # ⚠️ Environment variables (git-ignored)
├── .gitignore                # Git ignore rules
├── server.js                 # Express server setup
├── socket.js                 # Socket.IO real-time features
├── seed.js                   # Database seeding script
├── package.json
└── openapi.json              # API documentation

```

**Key Notes:**
- All `.env` files are **git-ignored** (use `npm start` with local `.env`)
- `/uploads` folder contains user avatars and documents (ignored in git)
- Controllers are organized by feature (not by role)
- Each route file maps to a specific API resource

---

## Frontend Structure (`/Frontend`)

```
Frontend/src/
├── api/
│   └── index.js              # Centralized API client methods
├── components/
│   ├── common/               # Shared UI components (Logo, Navbar, Footer)
│   ├── auth/                 # Auth-related (GoogleSignIn, Verification)
│   ├── payments/             # Payment UI (PayHereCheckoutButton)
│   ├── feedback/             # Review components
│   ├── tourist/              # Tourist-specific components
│   ├── DashboardLayout.jsx   # Main layout wrapper
│   ├── SOSModal.jsx          # Emergency SOS modal
│   └── NotificationDropdown.jsx # Real-time notifications
├── data/
│   └── sriLankaTour.js       # Sri Lanka districts & location data
├── pages/
│   ├── admin/                # Admin dashboard pages
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminSOSPage.jsx
│   │   ├── AdminUsersPage.jsx
│   │   └── AdminDashboardHome.jsx
│   ├── provider/             # Provider-specific pages
│   │   ├── ProviderBookings.jsx
│   │   ├── ProviderPackagesPage.jsx
│   │   └── ProviderDashboardHome.jsx
│   ├── tourist/              # Tourist-specific pages
│   │   ├── TourRequestsPage.jsx  # Tour request management
│   │   ├── TourRequestCreate.jsx # Create custom requests
│   │   ├── MyBookings.jsx        # Tourist bookings
│   │   ├── ServicesPage.jsx      # Browse services
│   │   └── TouristDashboardHome.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── ProfilePage.jsx
│   ├── MessagesPage.jsx
│   ├── HomePage.jsx
│   ├── GoogleCallback.jsx
│   ├── PaymentSuccessPage.jsx
│   └── ForgotPasswordPage.jsx
├── services/
│   └── paymentService.js     # Payment service utilities
├── store/
│   └── authStore.js          # Zustand auth state management
├── utils/
│   └── axios.js              # Axios instance with interceptors
├── App.jsx                   # Main app component & routing
├── main.jsx                  # React entry point
└── index.css                 # Global styles

```

**Key Notes:**
- `/data` contains non-interactive data (districts, locations)
- `/pages` organized by role (admin/, provider/, tourist/) for clarity
- `/components` will be reorganized into `/common`, `/auth`, `/payments` for better structure
- State management uses **Zustand** for auth
- API calls use centralized `/api/index.js`

---

## Environment Setup

### Backend `.env` (not tracked)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
PAYHERE_SANDBOX=true
PAYHERE_MERCHANT_ID=...
PAYHERE_MERCHANT_SECRET=...
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

### Frontend `.env.local` (not tracked)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=...
```

---

## Cleanup Actions Completed ✅

1. ✅ **Removed unused file**: `Frontend/src/data/sriLankaMapLayout.js`
2. ✅ **Removed debug console.logs**: `Frontend/src/pages/provider/ProviderPackagesPage.jsx`
3. ✅ **Created component folders**: `common/`, `auth/` (for future organization)
4. ✅ **Verified git-ignore**: `.env` and `/uploads` properly ignored
5. ✅ **Verified build**: Frontend builds successfully ✓

---

## Development Commands

### Backend
```bash
cd Backend
npm install
npm start           # Start server on port 5000
npm run seed        # Seed database with sample data
```

### Frontend
```bash
cd Frontend
npm install
npm run dev         # Start dev server on port 3000
npm run build       # Production build
npm run preview     # Preview production build
```

---

## Future Optimization Suggestions

1. **Code-splitting**: Break up the large JavaScript bundle (1MB) using dynamic imports
2. **Move components**: Migrate files to `common/`, `auth/`, `payments/` subfolders
3. **Remove unused packages**: Check package.json for unused dependencies
4. **API documentation**: Keep OpenAPI spec (`openapi.json`) updated

---

**Last Updated**: June 17, 2026  
**Project**: TourMate - Smart Travel Platform
