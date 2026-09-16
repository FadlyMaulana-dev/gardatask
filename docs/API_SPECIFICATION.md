# 📡 GardaTask - API Specification

Complete REST API documentation for GardaTask Backend.

---

## Base URL

```
Development:  http://localhost:8000/api
Production:   https://api.gardatask.io/api
```

---

## Authentication

All endpoints require JWT token in Authorization header:

```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## Response Format

### Success (200-201)
```json
{
  "success": true,
  "data": { /* resource data */ },
  "message": "Operation successful"
}
```

### Error (4xx-5xx)
```json
{
  "success": false,
  "error": "Error code",
  "message": "Detailed error message",
  "errors": { /* field-level errors */ }
}
```

---

## Authentication Endpoints

### POST /auth/register
Register new user

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "password_confirmation": "SecurePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "eyJhbGc..."
  }
}
```

---

### POST /auth/login
Login user

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "eyJhbGc..."
  }
}
```

---

### POST /auth/logout
Logout user (requires auth)

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /auth/me
Get current user (requires auth)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "avatar_url": "https://...",
    "created_at": "2026-05-23T10:00:00Z"
  }
}
```

---

## Users Endpoints

### GET /users
Get all users (requires auth)

**Query Parameters:**
```
?page=1
&per_page=15
&search=john
&role=admin
```

**Response (200):**
```json
{
  "success": true,
  "data": [ /* array of users */ ],
  "pagination": {
    "total": 50,
    "per_page": 15,
    "current_page": 1,
    "last_page": 4
  }
}
```

---

### GET /users/:id
Get single user

**Response (200):**
```json
{
  "success": true,
  "data": { /* user object */ }
}
```

---

### PUT /users/:id
Update user

**Request:**
```json
{
  "name": "Jane Doe",
  "avatar_url": "https://...",
  "bio": "Product Designer"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated user */ }
}
```

---

## Teams Endpoints

### GET /teams
Get user's teams

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "GardaTech",
      "description": "Main team",
      "owner_id": 1,
      "members_count": 5,
      "created_at": "2026-05-23T10:00:00Z"
    }
  ]
}
```

---

### POST /teams
Create new team

**Request:**
```json
{
  "name": "Design Team",
  "description": "Design and UX team"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { /* created team */ }
}
```

---

### GET /teams/:id
Get team details

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "GardaTech",
    "description": "Main team",
    "owner": { /* user object */ },
    "members": [ /* member objects */ ],
    "projects_count": 10,
    "created_at": "2026-05-23T10:00:00Z"
  }
}
```

---

### POST /teams/:id/members
Add member to team

**Request:**
```json
{
  "user_id": 5,
  "role": "member"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { /* team member */ }
}
```

---

## Projects Endpoints

### GET /projects
Get all projects

**Query Parameters:**
```
?team_id=1
&status=active
&page=1
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "GardaTask SaaS",
      "description": "Premium task management",
      "team_id": 1,
      "status": "active",
      "owner": { /* user */ },
      "tasks_count": 24,
      "completed_count": 12,
      "created_at": "2026-05-23T10:00:00Z"
    }
  ]
}
```

---

### POST /projects
Create new project

**Request:**
```json
{
  "name": "Mobile App",
  "description": "iOS & Android app",
  "team_id": 1,
  "status": "active"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { /* created project */ }
}
```

---

### GET /projects/:id
Get project details

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "GardaTask SaaS",
    "description": "Premium task management",
    "team_id": 1,
    "status": "active",
    "owner": { /* user */ },
    "members": [ /* team members */ ],
    "tasks": [ /* tasks */ ],
    "statistics": {
      "total_tasks": 24,
      "completed_tasks": 12,
      "progress": 50,
      "overdue_tasks": 2
    },
    "created_at": "2026-05-23T10:00:00Z"
  }
}
```

---

### PUT /projects/:id
Update project

**Request:**
```json
{
  "name": "GardaTask Platform",
  "description": "Updated description",
  "status": "archived"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated project */ }
}
```

---

### DELETE /projects/:id
Delete project

**Response (200):**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## Tasks Endpoints

### GET /tasks
Get all tasks (with filters)

**Query Parameters:**
```
?project_id=1
&status=in_progress
&priority=high
&assigned_to=5
&page=1
&per_page=20
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Design login page",
      "description": "Create modern login UI",
      "project_id": 1,
      "assigned_to": { /* user */ },
      "status": "in_progress",
      "priority": "high",
      "due_date": "2026-06-01",
      "checklist": {
        "total": 5,
        "completed": 3
      },
      "comments_count": 2,
      "attachments_count": 1,
      "created_at": "2026-05-23T10:00:00Z"
    }
  ]
}
```

---

### POST /tasks
Create new task

**Request:**
```json
{
  "title": "Design dashboard",
  "description": "Create premium dashboard UI",
  "project_id": 1,
  "assigned_to": 2,
  "status": "todo",
  "priority": "high",
  "due_date": "2026-06-05"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { /* created task */ }
}
```

---

### GET /tasks/:id
Get task details

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Design login page",
    "description": "Create modern login UI",
    "project": { /* project */ },
    "assigned_to": { /* user */ },
    "created_by": { /* user */ },
    "status": "in_progress",
    "priority": "high",
    "due_date": "2026-06-01",
    "checklist": [
      { "id": 1, "text": "Create wireframe", "completed": true },
      { "id": 2, "text": "Design mockup", "completed": true },
      { "id": 3, "text": "Get feedback", "completed": false }
    ],
    "comments": [
      {
        "id": 1,
        "text": "Great progress!",
        "user": { /* user */ },
        "created_at": "2026-05-23T10:00:00Z"
      }
    ],
    "attachments": [
      {
        "id": 1,
        "filename": "mockup.pdf",
        "url": "https://...",
        "size": 2048
      }
    ],
    "activity": [ /* activity log */ ],
    "created_at": "2026-05-23T10:00:00Z"
  }
}
```

---

### PUT /tasks/:id
Update task

**Request:**
```json
{
  "title": "Updated title",
  "status": "review",
  "priority": "medium",
  "assigned_to": 3
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated task */ }
}
```

---

### PATCH /tasks/:id/status
Change task status

**Request:**
```json
{
  "status": "done"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated task */ }
}
```

---

### DELETE /tasks/:id
Delete task

**Response (200):**
```json
{
  "success": true,
  "message": "Task deleted"
}
```

---

## Comments Endpoints

### POST /tasks/:id/comments
Add comment to task

**Request:**
```json
{
  "text": "@John Great work on this!",
  "mentions": [1, 2]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "text": "@John Great work on this!",
    "user": { /* user */ },
    "task_id": 1,
    "created_at": "2026-05-23T10:00:00Z"
  }
}
```

---

### GET /tasks/:id/comments
Get task comments

**Response (200):**
```json
{
  "success": true,
  "data": [ /* array of comments */ ]
}
```

---

### DELETE /comments/:id
Delete comment

**Response (200):**
```json
{
  "success": true,
  "message": "Comment deleted"
}
```

---

## Notifications Endpoints

### GET /notifications
Get user notifications

**Query Parameters:**
```
?unread=true
&page=1
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "task_assigned",
      "title": "New task assigned to you",
      "message": "John assigned you to 'Design dashboard'",
      "data": { "task_id": 1 },
      "read": false,
      "created_at": "2026-05-23T10:00:00Z"
    }
  ]
}
```

---

### PATCH /notifications/:id/read
Mark notification as read

**Response (200):**
```json
{
  "success": true,
  "message": "Marked as read"
}
```

---

### POST /notifications/read-all
Mark all notifications as read

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Success |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid request |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable | Validation error |
| 500 | Server Error | Internal error |

---

## Rate Limiting

- 100 requests per minute per user
- X-RateLimit-Limit header indicates limit
- X-RateLimit-Remaining shows remaining requests
- X-RateLimit-Reset shows reset time (Unix timestamp)

---

## Webhooks

Coming soon...

---

## GraphQL API

Coming soon...

---

## Implementation Notes

- All timestamps in ISO 8601 format
- Pagination default: 15 items per page
- Maximum 100 items per page
- All IDs are integers
- Soft deletes used for archived resources
