# 🗄️ GardaTask - Database Schema

Complete database design for GardaTask application.

---

## Database Diagram

```
Users (1) ────────────┐
                      │
                      ├─ (M) Teams
                      │      ├─ (M) Projects
                      │           ├─ (M) Tasks
                      │           │    ├─ (M) Comments
                      │           │    ├─ (M) Attachments
                      │           │    └─ (M) TaskChecklists
                      │           │
                      │           └─ (M) TeamMembers
                      │
                      ├─ (M) Tasks (assigned)
                      ├─ (M) Comments
                      └─ (M) Notifications
```

---

## Tables

### users
Main user table

```sql
CREATE TABLE users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  email_verified_at TIMESTAMP NULL,
  password VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(255) NULL,
  bio TEXT NULL,
  phone VARCHAR(20) NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  language VARCHAR(10) DEFAULT 'en',
  remember_token VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL (soft delete),
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
);
```

**Columns:**
- `id` - Primary key
- `name` - User full name
- `email` - Unique email address
- `email_verified_at` - Email verification timestamp
- `password` - Bcrypt hashed password
- `avatar_url` - Profile picture URL
- `bio` - User bio/description
- `phone` - Contact phone number
- `timezone` - User's timezone
- `language` - Preferred language
- `remember_token` - For "remember me"
- `created_at`, `updated_at` - Timestamps
- `deleted_at` - Soft delete timestamp

---

### teams
Team/Organization table

```sql
CREATE TABLE teams (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  owner_id BIGINT UNSIGNED NOT NULL,
  logo_url VARCHAR(255) NULL,
  status ENUM('active', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_owner_id (owner_id),
  INDEX idx_status (status)
);
```

---

### team_members
Team members relationship

```sql
CREATE TABLE team_members (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  team_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  role ENUM('admin', 'manager', 'member') DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_team_user (team_id, user_id),
  INDEX idx_role (role)
);
```

---

### projects
Project table

```sql
CREATE TABLE projects (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT NULL,
  team_id BIGINT UNSIGNED NOT NULL,
  owner_id BIGINT UNSIGNED NOT NULL,
  status ENUM('active', 'archived', 'completed') DEFAULT 'active',
  color VARCHAR(7) DEFAULT '#D4A574',
  icon VARCHAR(50) NULL,
  visibility ENUM('private', 'internal', 'public') DEFAULT 'internal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_slug_team (slug, team_id),
  INDEX idx_team_id (team_id),
  INDEX idx_status (status)
);
```

---

### tasks
Task/Issue table

```sql
CREATE TABLE tasks (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  description LONGTEXT NULL,
  status ENUM('backlog', 'todo', 'in_progress', 'review', 'done') DEFAULT 'backlog',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  assigned_to BIGINT UNSIGNED NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  due_date DATE NULL,
  start_date DATE NULL,
  completed_at TIMESTAMP NULL,
  order INT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_project_id (project_id),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_due_date (due_date)
);
```

---

### task_checklists
Checklist items for tasks

```sql
CREATE TABLE task_checklists (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  task_id BIGINT UNSIGNED NOT NULL,
  text VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  order INT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  INDEX idx_task_id (task_id),
  INDEX idx_completed (completed)
);
```

---

### comments
Comments on tasks

```sql
CREATE TABLE comments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  task_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  text TEXT NOT NULL,
  mentions JSON NULL,
  edited_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_task_id (task_id),
  INDEX idx_user_id (user_id)
);
```

---

### attachments
File attachments for tasks

```sql
CREATE TABLE attachments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  task_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(50) NOT NULL,
  size INT UNSIGNED NOT NULL,
  url VARCHAR(255) NOT NULL,
  storage_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_task_id (task_id)
);
```

---

### activities
Activity log/audit trail

```sql
CREATE TABLE activities (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NULL,
  task_id BIGINT UNSIGNED NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(50) NOT NULL,
  model_type VARCHAR(100) NOT NULL,
  model_id BIGINT UNSIGNED NOT NULL,
  old_values JSON NULL,
  new_values JSON NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_model (model_type, model_id),
  INDEX idx_created_at (created_at)
);
```

**Example Actions:** created, updated, deleted, status_changed, assigned, unassigned

---

### notifications
User notifications

```sql
CREATE TABLE notifications (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSON NULL,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_read (read),
  INDEX idx_created_at (created_at)
);
```

**Notification Types:**
- `task_assigned`
- `task_mentioned`
- `task_updated`
- `comment_added`
- `task_due_soon`
- `team_member_added`
- `project_shared`

---

### permissions
Role-based permissions

```sql
CREATE TABLE permissions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### role_permissions
Role-permission relationship

```sql
CREATE TABLE role_permissions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  role VARCHAR(50) NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_permission (role, permission_id)
);
```

---

## Indexes & Performance

### Critical Indexes
```sql
-- User queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Team queries
CREATE INDEX idx_teams_owner_id ON teams(owner_id);
CREATE INDEX idx_teams_status ON teams(status);

-- Project queries
CREATE INDEX idx_projects_team_id ON projects(team_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Task queries
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Activity queries
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);

-- Notification queries
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

---

## Migrations Order

1. `create_users_table`
2. `create_teams_table`
3. `create_team_members_table`
4. `create_projects_table`
5. `create_tasks_table`
6. `create_task_checklists_table`
7. `create_comments_table`
8. `create_attachments_table`
9. `create_activities_table`
10. `create_notifications_table`
11. `create_permissions_table`
12. `create_role_permissions_table`

---

## Sample Data

### Users
```json
{
  "id": 1,
  "name": "Fadly Fauzansyah",
  "email": "fadly@gardatech.io",
  "password": "bcrypt_hash",
  "avatar_url": "https://...",
  "role": "admin"
}
```

### Teams
```json
{
  "id": 1,
  "name": "GardaTech",
  "owner_id": 1,
  "description": "Digital Agency",
  "status": "active"
}
```

### Projects
```json
{
  "id": 1,
  "name": "GardaTask SaaS",
  "team_id": 1,
  "owner_id": 1,
  "status": "active"
}
```

### Tasks
```json
{
  "id": 1,
  "project_id": 1,
  "title": "Design dashboard UI",
  "status": "in_progress",
  "priority": "high",
  "assigned_to": 2,
  "created_by": 1,
  "due_date": "2026-06-01"
}
```

---

## Backup & Recovery

### Backup
```bash
mysqldump -u root -p gardatask_dev > backup.sql
```

### Restore
```bash
mysql -u root -p gardatask_dev < backup.sql
```

---

## Notes

- Use soft deletes for data retention & compliance
- All timestamps in UTC
- Foreign keys enforce referential integrity
- Indexes optimized for common queries
- JSON columns for flexible metadata
- Audit trail via `activities` table
