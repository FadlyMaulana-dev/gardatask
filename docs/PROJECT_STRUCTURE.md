# 🏗️ GardaTask - Project Structure Guide

## Overview

GardaTask adalah SaaS modern untuk task management & team productivity. Dibangun dengan **Laravel (Backend)** dan **React + Tailwind CSS (Frontend)**.

---

## 📂 Root Structure

```
gardatask/
├── backend/                    # Laravel API Server
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/    # API Controllers
│   │   │   └── Middleware/     # Auth, CORS, etc
│   │   ├── Models/             # Eloquent Models
│   │   ├── Services/           # Business Logic
│   │   └── Providers/          # Service Providers
│   ├── config/                 # Configuration
│   ├── database/
│   │   ├── migrations/         # Schema migrations
│   │   ├── seeders/            # Test data
│   │   └── factories/          # Model factories
│   ├── routes/
│   │   ├── api.php             # API routes (v1)
│   │   └── web.php             # Web routes
│   ├── storage/                # File storage
│   ├── tests/                  # PHPUnit tests
│   ├── composer.json           # PHP dependencies
│   └── .env.example            # Environment template
│
├── frontend/                   # React SaaS Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Reusable components (Button, Card, etc)
│   │   │   ├── dashboard/      # Dashboard components
│   │   │   ├── kanban/         # Kanban board components
│   │   │   ├── calendar/       # Calendar components
│   │   │   ├── team/           # Team collaboration
│   │   │   └── ui/             # Base UI elements
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── KanbanPage.jsx
│   │   │   ├── CalendarPage.jsx
│   │   │   ├── TeamPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── layouts/
│   │   │   ├── AppLayout.jsx   # Main app layout
│   │   │   ├── AuthLayout.jsx  # Auth pages layout
│   │   │   └── Sidebar.jsx     # Navigation sidebar
│   │   ├── hooks/
│   │   │   ├── useAuth.js      # Auth context hook
│   │   │   ├── useTasks.js     # Task management hook
│   │   │   └── useApi.js       # API calls hook
│   │   ├── context/
│   │   │   ├── AuthContext.jsx # Auth state
│   │   │   ├── TaskContext.jsx # Task state
│   │   │   └── UIContext.jsx   # UI state (theme, sidebar, etc)
│   │   ├── styles/
│   │   │   └── globals.css     # Global styles
│   │   ├── utils/
│   │   │   ├── api.js          # API client
│   │   │   └── helpers.js      # Utility functions
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   ├── public/                 # Static assets
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── docs/                       # Documentation
│   ├── PROJECT_STRUCTURE.md    # This file
│   ├── API_SPECIFICATION.md    # API endpoints
│   ├── DATABASE_SCHEMA.md      # DB design
│   ├── SETUP_GUIDE.md          # Installation guide
│   └── UI_DESIGN_SYSTEM.md     # Design system
│
├── package.json                # Root npm scripts
└── README.md                   # Project overview
```

---

## 🔄 Data Flow

```
Frontend (React)
    ↓
API Client (Axios/Fetch)
    ↓
Backend (Laravel API)
    ↓
Database (MySQL/PostgreSQL)
    ↓
Cache (Redis)
```

---

## 📊 Key Entities

### Backend Models (Laravel Eloquent)

```
User
├── Team
├── Project
│   ├── Task
│   │   ├── Comment
│   │   ├── Attachment
│   │   └── Activity
│   └── Board (Kanban)
├── Notification
└── Role / Permission
```

### Frontend Components Hierarchy

```
<App>
  ├── <AuthLayout>
  │   ├── <LoginPage>
  │   └── <RegisterPage>
  └── <AppLayout>
      ├── <Sidebar>
      ├── <Navbar>
      └── <MainContent>
          ├── <DashboardPage>
          ├── <KanbanPage>
          ├── <CalendarPage>
          ├── <ProjectsPage>
          ├── <TeamPage>
          └── <SettingsPage>
```

---

## 🚀 Development Workflow

1. **Backend Development**
   - Create/modify Laravel models in `backend/app/Models/`
   - Create migrations in `database/migrations/`
   - Create API controllers in `backend/app/Http/Controllers/`
   - Define routes in `backend/routes/api.php`

2. **Frontend Development**
   - Create React components in `frontend/src/components/`
   - Create pages in `frontend/src/pages/`
   - Manage state with Context API in `frontend/src/context/`
   - Call backend API using `frontend/src/utils/api.js`

3. **Testing**
   - Backend: `php artisan test`
   - Frontend: `npm test` (Jest + React Testing Library)

4. **Deployment**
   - Backend: Laravel on AWS/DigitalOcean
   - Frontend: Vercel/Netlify for static hosting

---

## 📋 Configuration Files

| File | Purpose |
|------|---------|
| `backend/.env` | Backend environment variables |
| `frontend/.env` | Frontend API URL config |
| `tailwind.config.js` | Tailwind CSS customization |
| `vite.config.js` | Vite build configuration |
| `composer.json` | PHP dependencies |
| `package.json` | Node dependencies (root) |

---

## 🔐 Security

- Backend API uses JWT for authentication
- Frontend stores token in secure HTTP-only cookies
- CORS properly configured
- Role-based access control (RBAC)
- Input validation on both frontend & backend
- SQL injection prevention via Eloquent ORM

---

## 📦 Dependencies

### Backend (Laravel)
- laravel/framework
- laravel/sanctum (Auth)
- laravel/tinker
- laravel/pint (Code formatter)
- phpunit/phpunit (Testing)

### Frontend (React)
- react
- react-router-dom
- axios (API calls)
- zustand (State management)
- tailwindcss
- framer-motion (Animations)
- lucide-react (Icons)
- recharts (Charts)

---

## 🎯 Getting Started

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for installation & setup instructions.
