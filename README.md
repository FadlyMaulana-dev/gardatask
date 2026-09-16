# 🚀 GardaTask - Premium SaaS Task Management System

**GardaTask** adalah sistem manajemen tugas dan produktivitas tim yang modern, dibangun dengan teknologi terkini untuk startup, digital agency, dan tim enterprise.

Dibuat oleh **GardaTech** — sebuah digital agency berfokus pada solusi enterprise-grade.

---

## 🎯 What is GardaTask?

Platform all-in-one untuk:
- 📋 **Task Management** - Kelola pekerjaan dengan Kanban board, timeline, dan calendar
- 👥 **Team Collaboration** - Real-time collaboration dengan comments, mentions, activity feed
- 📊 **Analytics & Insights** - Dashboard productivity dengan metrics dan trends
- 🤖 **AI-Powered** - Smart task recommendations dan scheduling assistant
- 📱 **Responsive Design** - Desktop-first, optimized untuk widescreen (16:9)
- 🌙 **Dark Mode** - Elegant light & dark themes

---

## 📦 Tech Stack

### Backend
```
Framework:     Laravel 11+
Database:      MySQL / PostgreSQL
Cache:         Redis
API:           RESTful + WebSocket
Auth:          JWT / Sanctum
```

### Frontend
```
Framework:     React 18+
Styling:       Tailwind CSS 3+
State:         Zustand / Context API
UI Library:    Shadcn/ui
Animations:    Framer Motion
Charts:        Recharts
Icons:         Lucide React
```

---

## 🚀 Quick Start

### Prerequisites
- PHP 8.2+
- Node.js 18+
- MySQL 8.0+
- Composer
- Git

### Backend Setup (5 minutes)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```
✅ Backend running at **http://localhost:8000**

### Frontend Setup (5 minutes)
```bash
cd frontend
npm install
npm run dev
```
✅ Frontend running at **http://localhost:5173**

See [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) untuk instruksi lengkap.

---

## 📋 Project Structure

```
gardatask/
├── backend/                 # Laravel API
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/
│   └── ...
│
├── frontend/                # React SaaS Dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── context/
│   │   └── ...
│   ├── package.json
│   └── tailwind.config.js
│
└── docs/                    # Documentation
    ├── PROJECT_STRUCTURE.md
    ├── SETUP_GUIDE.md
    ├── UI_DESIGN_SYSTEM.md
    └── AI_IMAGE_GENERATOR_PROMPT.md
```

---

## ✨ Key Features

### Dashboard
- **Productivity Overview** - Active tasks, completed, team members
- **Analytics Widgets** - Charts, trends, performance metrics
- **Quick Actions** - Add task, create project, invite member
- **Activity Feed** - Real-time team activity

### Kanban Board
- **5 Columns**: Backlog → Todo → In Progress → Review → Done
- **Drag & Drop**: Smooth animations, instant feedback
- **Task Cards**: Priority badges, due dates, team avatars, comments
- **Filtering**: By project, team, priority, date

### Task Management
- **Rich Details**: Description, attachments, checklists
- **Comments**: Inline comments with @mentions
- **Timeline**: Visual task timeline
- **Calendar**: Calendar view with task scheduling

### Team Collaboration
- **Real-time Updates**: Live task changes
- **@Mentions**: Notify team members
- **Activity Timeline**: All project activities
- **Permissions**: Role-based access control

### Additional Features
- **Yearly Planner** - 12-month planning dashboard (luxury aesthetic)
- **Notifications** - Real-time alerts & activity center
- **Search** - Global search across all tasks
- **Settings** - Customization, preferences, workspace config
- **Dark Mode** - Elegant theme switching

---

## 🎨 Design System

### Color Palette
- **Primary**: Gold/Beige `#D4A574` (GardaTech brand)
- **Accent**: Soft Blue `#87CEEB`
- **Background**: Off-white `#F8F7F5`
- **Text**: Muted Gray `#6B7280`

### Typography
- **Font**: Inter, Segoe UI, System fonts
- **Headings**: 600-700 weight, tight tracking
- **Body**: 400-500 weight, regular tracking

### Components
- **Radius**: 2xl rounded corners (24px) for cards
- **Shadows**: Soft, layered shadows for depth
- **Spacing**: 8px base unit grid
- **Glassmorphism**: Subtle transparency & blur effects

Lihat [UI_DESIGN_SYSTEM.md](./docs/UI_DESIGN_SYSTEM.md) untuk detail lengkap.

---

## 📊 Pages Included

| Page | Description |
|------|-------------|
| 🔐 **Login** | Authentication with email & password |
| 📊 **Dashboard** | Productivity overview & analytics |
| 📋 **Projects** | All projects workspace |
| 🎯 **Kanban** | Drag & drop task board |
| 📅 **Calendar** | Task calendar & timeline |
| 📈 **Yearly Planner** | 12-month planning view |
| 👥 **Team** | Team management & collaboration |
| ⚙️ **Settings** | User & workspace settings |

---

## 🤖 AI Features (Upcoming)

- **Smart Task Suggestions** - AI recommends next tasks
- **Deadline Optimization** - ML-powered deadline predictions
- **Workload Balancing** - AI suggests task assignments
- **Progress Forecasting** - Predicts project completion date

---

## 🔐 Security

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **CORS Protection** - Cross-origin resource sharing
- ✅ **SQL Injection Prevention** - Eloquent ORM protection
- ✅ **XSS Protection** - Input validation & output encoding
- ✅ **Role-Based Access** - RBAC with granular permissions
- ✅ **Encrypted Passwords** - bcrypt hashing
- ✅ **Rate Limiting** - API endpoint protection

---

## 📚 Documentation

- [PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) - Folder organization & architecture
- [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) - Installation & configuration
- [UI_DESIGN_SYSTEM.md](./docs/UI_DESIGN_SYSTEM.md) - Design guidelines & components
- [AI_IMAGE_GENERATOR_PROMPT.md](./docs/AI_IMAGE_GENERATOR_PROMPT.md) - Master prompt untuk Midjourney/DALL-E

---

## 🎨 Generate UI Mockups

Gunakan master prompt kami untuk membuat UI mockups dengan AI image generators:

**Midjourney/DALL-E:**
```
/imagine [lihat AI_IMAGE_GENERATOR_PROMPT.md untuk full prompt]
```

Hasil: High-fidelity SaaS UI mockup siap untuk pitch deck dan investor presentations.

---

## 🔧 Development

### Running Tests
```bash
# Backend
cd backend && php artisan test

# Frontend
cd frontend && npm test
```

### Code Formatting
```bash
# Backend (Pint)
cd backend && ./vendor/bin/pint

# Frontend (Prettier)
cd frontend && npm run format
```

### Building for Production
```bash
# Backend
cd backend && php artisan optimize

# Frontend
cd frontend && npm run build
```

---

## 🚀 Deployment

### Backend Deployment
```bash
# AWS, DigitalOcean, Heroku, atau Vercel
# Laravel dapat di-deploy di berbagai platform
# Pastikan environment variables sudah dikonfigurasi
```

### Frontend Deployment
```bash
# Vercel, Netlify, atau static hosting lainnya
# npm run build menghasilkan dist/ folder untuk hosting
```

---

## 📞 Support & Contact

Untuk pertanyaan atau dukungan:
- 📧 Email: support@gardatech.io
- 🌐 Website: https://gardatech.io
- 💬 Discord: [Join our community]
- 🐛 Issues: GitHub Issues

---

## 📄 License

© 2026 **GardaTech**. All Rights Reserved.

This is a proprietary SaaS application. Unauthorized copying or redistribution is prohibited.

---

## 👥 Team

Built by **GardaTech** — Premium digital agency specializing in enterprise-grade SaaS solutions.

**The GardaTask Team** 🚀
- Product Design: Innovative, modern, premium aesthetic
- Backend Engineering: Scalable Laravel API
- Frontend Engineering: Smooth React UI
- DevOps: Cloud-ready deployment

---

## 🎯 Roadmap

### Phase 1 (Q2 2026) ✅
- [x] Core task management
- [x] Kanban board
- [x] Team collaboration
- [x] Dashboard

### Phase 2 (Q3 2026) 🔄
- [ ] AI-powered features
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Third-party integrations

### Phase 3 (Q4 2026) 📋
- [ ] Enterprise SSO
- [ ] Advanced reporting
- [ ] API marketplace
- [ ] Custom workflows

---

## 🌟 Show Your Support

If you find GardaTask useful, please:
- ⭐ Star this repository
- 📢 Share with your team
- 💬 Leave feedback & suggestions
- 🤝 Contribute & collaborate

---

**Made with ❤️ by GardaTech**

*Premium Productivity for Modern Teams* 🚀
