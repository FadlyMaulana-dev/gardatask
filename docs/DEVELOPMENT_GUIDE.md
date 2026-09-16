# 🎯 GardaTask - Development Guide

Comprehensive guide for developers working on GardaTask project.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Contributing](#contributing)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites
- PHP 8.2+ with extensions: curl, zip, gd, intl
- Node.js 18+ with npm
- MySQL 8.0+ or PostgreSQL 14+
- Composer 2.0+
- Git

### First Time Setup

```bash
# Clone repository
git clone https://github.com/gardatech/gardatask.git
cd gardatask

# Backend setup
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan seed

# Frontend setup
cd ../frontend
npm install

# Start development
# Terminal 1: Backend
cd backend && php artisan serve

# Terminal 2: Frontend
cd frontend && npm run dev
```

---

## Project Structure

### Backend (Laravel)

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/     # API controllers
│   │   ├── Middleware/      # Auth, CORS, rate limiting
│   │   └── Requests/        # Form request validation
│   ├── Models/              # Eloquent models
│   ├── Services/            # Business logic layer
│   ├── Events/              # Event classes
│   ├── Listeners/           # Event listeners
│   ├── Jobs/                # Queue jobs
│   └── Exceptions/          # Custom exceptions
├── config/                  # Configuration files
├── database/
│   ├── migrations/          # Database migrations
│   ├── seeders/             # Test data seeders
│   └── factories/           # Model factories
├── routes/
│   ├── api.php              # API v1 routes
│   └── web.php              # Web routes
├── tests/
│   ├── Feature/             # Feature tests
│   └── Unit/                # Unit tests
├── storage/                 # File storage
└── composer.json
```

### Frontend (React)

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable components
│   │   ├── dashboard/       # Dashboard sections
│   │   ├── kanban/          # Kanban board
│   │   ├── tasks/           # Task components
│   │   └── ui/              # Base UI elements
│   ├── pages/               # Page components
│   ├── layouts/             # Layout components
│   ├── hooks/               # Custom React hooks
│   ├── context/             # React Context providers
│   ├── utils/               # Helper functions
│   ├── services/            # API clients
│   ├── styles/              # Global styles
│   ├── App.jsx
│   └── main.jsx
├── public/                  # Static assets
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## Development Workflow

### Creating a New Feature

#### 1. Backend Feature

```bash
cd backend

# Create model with migration
php artisan make:model Feature -m

# Create controller
php artisan make:controller Api/FeatureController --api

# Create service
php artisan make:controller Api/Services/FeatureService

# Create request validation
php artisan make:request StoreFeatureRequest
```

**Example Controller:**
```php
namespace App\Http\Controllers\Api;

use App\Services\FeatureService;
use App\Http\Requests\StoreFeatureRequest;
use Illuminate\Http\Response;

class FeatureController extends Controller
{
    public function __construct(private FeatureService $service) {}

    public function index()
    {
        return response()->json($this->service->getAll());
    }

    public function store(StoreFeatureRequest $request)
    {
        return response()->json(
            $this->service->create($request->validated()),
            Response::HTTP_CREATED
        );
    }
}
```

#### 2. Frontend Feature

```bash
cd frontend

# Create component
mkdir -p src/components/features
touch src/components/features/FeatureCard.jsx

# Create page
touch src/pages/FeaturePage.jsx

# Create service
touch src/services/featureService.js
```

**Example Component:**
```jsx
import React, { useState, useEffect } from 'react'
import { featureService } from '../services/featureService'

export default function FeaturePage() {
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeatures()
  }, [])

  const loadFeatures = async () => {
    try {
      const data = await featureService.getAll()
      setFeatures(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      {features.map(feature => (
        <div key={feature.id} className="p-4 border rounded-lg">
          {feature.name}
        </div>
      ))}
    </div>
  )
}
```

---

## Code Standards

### PHP/Laravel

#### Naming Conventions
```php
// Controllers
class UserController         // singular resource
class UserTaskController     // related resources

// Models
class User                   // singular
class Task

// Services
class UserService
class TaskManagementService

// Methods
public function index()       // list all
public function show($id)     // show single
public function store()       // create
public function update($id)   // update
public function destroy($id)  // delete

// Variables
private $userId              // camelCase
private $userName

// Constants
const MAX_RESULTS = 100      // UPPER_SNAKE_CASE
```

#### Code Style
```php
// Use type hints
public function store(StoreTaskRequest $request): Response

// Use early returns
if (!$user) return response()->json(['error' => 'Not found'], 404);

// Use descriptive names
$completedTasks = $tasks->where('status', 'done');

// Single responsibility
private function validateUser($user)
private function createTask($data)
private function notifyUser($user)
```

### React/JavaScript

#### Naming Conventions
```javascript
// Components (PascalCase)
function UserProfile() {}
export default TaskCard

// Hooks (camelCase with 'use' prefix)
function useAuth() {}
function useTasks() {}

// Variables (camelCase)
const userName = 'John'
const isLoading = true

// Constants (UPPER_SNAKE_CASE)
const API_BASE_URL = 'http://localhost:8000/api'
const MAX_RETRIES = 3

// Functions (camelCase)
function handleClick() {}
const formatDate = (date) => {}
```

#### Code Style
```javascript
// Use destructuring
const { id, name, email } = user

// Use arrow functions
const tasks = data.map((task) => ({ ...task, completed: true }))

// Use async/await
async function fetchTasks() {
  try {
    const response = await apiClient.get('/tasks')
    return response.data
  } catch (error) {
    console.error(error)
  }
}

// Use meaningful variable names
const isUserAuthenticated = !!token
const hasErrors = errors.length > 0
```

---

## Testing

### Backend Testing

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/TaskTest.php

# Run with coverage
php artisan test --coverage

# Run specific test
php artisan test tests/Feature/TaskTest.php --filter test_create_task
```

**Example Test:**
```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Task;

class TaskTest extends TestCase
{
    public function test_user_can_create_task()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/tasks', [
                'title' => 'Test Task',
                'project_id' => 1,
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('tasks', ['title' => 'Test Task']);
    }

    public function test_task_requires_title()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/tasks', [
                'project_id' => 1,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title']);
    }
}
```

### Frontend Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test -- --watch
```

**Example Test:**
```javascript
import { render, screen } from '@testing-library/react'
import { LoginPage } from '../pages/LoginPage'

describe('LoginPage', () => {
  it('should render login form', () => {
    render(<LoginPage />)
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('should require email', async () => {
    render(<LoginPage />)
    const submitBtn = screen.getByText('Sign In')
    fireEvent.click(submitBtn)
    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })
})
```

---

## Git Workflow

### Branch Naming
```
feature/feature-name          # New feature
bugfix/bug-name               # Bug fix
hotfix/critical-bug           # Critical production fix
refactor/refactor-name        # Code refactoring
docs/documentation-update     # Documentation
```

### Commit Messages
```
feat: Add user authentication
fix: Resolve task status bug
docs: Update README
refactor: Improve performance
test: Add user service tests

# Format: <type>: <subject>
```

### Pull Request Process
1. Create feature branch from `develop`
2. Make changes with clear commits
3. Create pull request with description
4. Get 2 approvals from code reviewers
5. Merge to `develop`
6. Deploy to staging for testing
7. Release to production on schedule

---

## Deployment

### Staging Deployment

```bash
# Backend
cd backend
php artisan migrate --env=staging
php artisan config:cache

# Frontend
cd frontend
npm run build
```

### Production Deployment

```bash
# Backend
cd backend
php artisan migrate --force
php artisan cache:clear
php artisan config:cache

# Frontend
cd frontend
npm run build
# Deploy dist/ to CDN
```

---

## Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check .env credentials
cat .env | grep DB_

# Verify MySQL is running
mysql -u root -p -e "SELECT 1"

# Reset database
php artisan migrate:fresh --seed
```

#### Frontend Build Errors
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+

# Check Tailwind config
npm run build:css
```

#### JWT Token Issues
```bash
# Regenerate JWT secret
php artisan jwt:secret

# Check token expiration
php artisan tinker
>>> \Firebase\JWT\JWT::decode($token, ...)
```

---

## Performance Tips

### Backend
- Use database eager loading: `with('relations')`
- Cache frequently accessed data: `cache()->remember()`
- Use pagination for large datasets
- Optimize database queries: use indexes
- Use queue jobs for heavy tasks

### Frontend
- Code splitting for large components
- Lazy load components: `React.lazy()`
- Memoize expensive computations: `useMemo()`
- Use virtual scrolling for long lists
- Optimize images: use WebP format

---

## Security Checklist

- [ ] Validate all user inputs
- [ ] Use HTTPS in production
- [ ] Set proper CORS headers
- [ ] Implement rate limiting
- [ ] Use CSRF tokens
- [ ] Hash passwords with bcrypt
- [ ] Sanitize user output
- [ ] Use environment variables for secrets
- [ ] Implement logging for audits
- [ ] Regular security updates

---

## Resources

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [API Design Best Practices](https://restfulapi.net)
- [Clean Code in PHP](https://www.phptherightway.com)

---

## Contact & Support

- 💬 Slack: #gardatask-dev
- 📧 Email: dev@gardatech.io
- 🐛 Issues: GitHub Issues
- 📚 Wiki: GitHub Wiki
