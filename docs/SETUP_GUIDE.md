# 🚀 GardaTask - Setup Guide

Complete installation & configuration guide for GardaTask development.

---

## Prerequisites

- **PHP**: 8.2+
- **Node.js**: 18+ (with npm)
- **MySQL**: 8.0+ or PostgreSQL 14+
- **Git**
- **Composer**: Latest version
- **VS Code** (recommended)

---

## 🔧 Backend Setup (Laravel)

### 1. Install PHP Dependencies

```bash
cd backend
composer install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env`:
```env
APP_NAME=GardaTask
APP_ENV=local
APP_KEY=          # Will be generated below
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gardatask_dev
DB_USERNAME=root
DB_PASSWORD=

# JWT
JWT_SECRET=your-jwt-secret-key

# Redis (optional)
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Mail (optional)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
```

### 3. Generate Application Key

```bash
php artisan key:generate
```

### 4. Create Database

```bash
# MySQL
mysql -u root -p
CREATE DATABASE gardatask_dev;
exit;
```

### 5. Run Migrations

```bash
php artisan migrate
```

### 6. Seed Database (Optional)

```bash
php artisan db:seed
```

### 7. Start Backend Server

```bash
php artisan serve
```

Backend running at: **http://localhost:8000**

---

## 🎨 Frontend Setup (React)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create `.env`:
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=GardaTask
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend running at: **http://localhost:5173**

### 4. Build for Production

```bash
npm run build
```

---

## 📦 Project Dependencies

### Backend (Laravel)
```bash
# Core Laravel
composer require laravel/framework

# Authentication
composer require laravel/sanctum

# API
composer require laravel/passport

# Utilities
composer require laravel/tinker

# Development
composer require --dev phpunit/phpunit
composer require --dev laravel/pint
composer require --dev laravel/sail
```

### Frontend (React)

```bash
npm install react react-dom react-router-dom
npm install axios zustand
npm install -D tailwindcss postcss autoprefixer
npm install framer-motion lucide-react
npm install recharts react-calendar
```

---

## 🗂️ Database Schema

### Create Models & Migrations

```bash
# User (already exists)
# Create other models
php artisan make:model Team -m
php artisan make:model Project -m
php artisan make:model Task -m
php artisan make:model Comment -m
php artisan make:model Notification -m
```

### Migration Hints

```php
// Users Table
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('password');
    $table->string('avatar_url')->nullable();
    $table->rememberToken();
    $table->timestamps();
});

// Teams Table
Schema::create('teams', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->text('description')->nullable();
    $table->foreignId('owner_id')->constrained('users');
    $table->timestamps();
});

// Projects Table
Schema::create('projects', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->text('description')->nullable();
    $table->foreignId('team_id')->constrained('teams');
    $table->enum('status', ['active', 'archived']);
    $table->timestamps();
});

// Tasks Table
Schema::create('tasks', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('description')->nullable();
    $table->foreignId('project_id')->constrained('projects');
    $table->foreignId('assigned_to')->nullable()->constrained('users');
    $table->enum('status', ['backlog', 'todo', 'in_progress', 'review', 'done']);
    $table->enum('priority', ['low', 'medium', 'high']);
    $table->date('due_date')->nullable();
    $table->timestamps();
});
```

---

## 🔐 Authentication Setup

### Backend (JWT/Sanctum)

```bash
# Install Sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate

# Or use Passport for OAuth2
php artisan vendor:publish --provider="Laravel\Passport\PassportServiceProvider"
php artisan passport:install
```

### Frontend (Context API)

```jsx
// Create auth context in src/context/AuthContext.jsx
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async (email, password) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
  };

  return (
    <AuthContext.Provider value={{ user, token, login }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## ✅ Verification Checklist

- [ ] PHP version 8.2+ installed
- [ ] Node.js 18+ installed
- [ ] MySQL database created
- [ ] Backend `.env` configured
- [ ] `php artisan migrate` successful
- [ ] Frontend `.env` configured
- [ ] Backend server running on :8000
- [ ] Frontend server running on :5173
- [ ] Login page accessible
- [ ] Dashboard loads without errors

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Clear cache
php artisan cache:clear
php artisan config:clear

# Generate key
php artisan key:generate

# Check permissions
chmod -R 775 storage bootstrap/cache
```

### Frontend Build Errors
```bash
# Clear node_modules
rm -r node_modules package-lock.json
npm install

# Clear Vite cache
rm -r .vite
npm run dev
```

### Database Connection Error
```bash
# Verify credentials in .env
# Ensure MySQL is running
# Test connection:
mysql -u root -p -h 127.0.0.1 gardatask_dev
```

---

## 📚 Next Steps

1. Create first API endpoint (Tasks)
2. Build dashboard components
3. Implement Kanban board
4. Add authentication UI
5. Deploy to staging

See [API_SPECIFICATION.md](./API_SPECIFICATION.md) for API endpoints.
