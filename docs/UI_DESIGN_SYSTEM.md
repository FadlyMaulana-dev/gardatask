# 🎨 GardaTask - UI Design System

## Brand Identity

**GardaTask** adalah premium modern SaaS dashboard untuk task management, terinspirasi dari Linear, Notion, Jira, dan Asana.

### Brand Values
- **Premium**: Enterprise-grade, polished, high-end
- **Modern**: Clean, minimalist, contemporary design
- **Accessible**: WCAG compliant, keyboard navigation
- **Performant**: Fast, smooth animations, optimized UI

---

## 🎨 Color Palette

### Primary Colors
```
Background White:     #FFFFFF / #F8F7F5 (off-white)
Primary Accent:       #D4A574 (gold/beige)
Secondary Accent:     #87CEEB (soft blue)
Neutral Gray:         #6B7280 (text)
```

### Status Colors
```
Success:              #10B981 (green)
Warning:              #F59E0B (amber)
Error:                #EF4444 (red)
Info:                 #3B82F6 (blue)
```

### Dark Mode
```
Dark BG:              #0F172A (slate-950)
Dark Surface:         #1E293B (slate-800)
Dark Text:            #E2E8F0 (slate-100)
Dark Gold:            #B8860B (dark goldenrod)
```

---

## 🔤 Typography

### Font Stack
```css
/* Headings */
font-family: 'Inter', 'Segoe UI', system-ui;
font-weight: 600-700;
letter-spacing: -0.02em;

/* Body */
font-family: 'Inter', 'Segoe UI', system-ui;
font-weight: 400-500;
letter-spacing: 0;
```

### Type Scale
```
H1: 32px / 40px (700)  — Main heading
H2: 24px / 32px (600)  — Section heading
H3: 18px / 28px (600)  — Subsection
H4: 16px / 24px (600)  — Component heading
Body: 14px / 20px (400) — Regular text
Small: 12px / 16px (400) — Secondary text
```

---

## 🧩 Component System

### Buttons
```jsx
// Primary
<Button variant="primary">Add Task</Button>

// Secondary
<Button variant="secondary">Cancel</Button>

// Ghost
<Button variant="ghost">Learn More</Button>

// Size variants
<Button size="sm" />
<Button size="md" />
<Button size="lg" />
```

### Cards
```jsx
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Content>Content here</Card.Content>
  <Card.Footer>Footer</Card.Footer>
</Card>
```

### Input Components
```jsx
<Input type="text" placeholder="Task name" />
<Select options={options} />
<Checkbox label="Mark as complete" />
<Toggle label="Notifications" />
```

---

## 🎭 Component Spacing

```
xs: 4px (2 units)
sm: 8px (4 units)
md: 16px (8 units)
lg: 24px (12 units)
xl: 32px (16 units)
2xl: 48px (24 units)
```

---

## 📐 Border & Shadows

### Border Radius
```
sm: 4px
md: 8px
lg: 12px
xl: 16px
2xl: 24px (cards, modals)
full: 9999px (pills, avatars)
```

### Shadows
```
sm: 0 1px 2px 0 rgba(0,0,0,0.05)
md: 0 4px 6px -1px rgba(0,0,0,0.1)
lg: 0 10px 15px -3px rgba(0,0,0,0.1)
xl: 0 20px 25px -5px rgba(0,0,0,0.1)
```

---

## 🖼️ Page Layouts

### Main Dashboard Layout
```
┌─────────────────────────────────────────────────────┐
│  Logo │ Search │ Notifications │ Profile           │ ← Navbar
├────────┼─────────────────────────────────────────────┤
│        │                                             │
│ Nav    │      Main Content Area                      │
│        │ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│        │ │ Widget 1 │ │ Widget 2 │ │ Widget 3 │     │
│        │ └──────────┘ └──────────┘ └──────────┘     │
│        │                                             │
│        │ ┌─────────────────────────────────────────┐ │
│        │ │  Kanban Board / Chart / Table           │ │
│        │ └─────────────────────────────────────────┘ │
└────────┴─────────────────────────────────────────────┘
 Sidebar     Main Area               (Right panel)
```

### Component Breakdown
- **Navbar**: Fixed top, 64px height
- **Sidebar**: Fixed left, 280px width (collapsible to 80px)
- **Main Area**: Responsive grid layout
- **Right Panel**: 320px fixed (for task details, notifications)

---

## ✨ Micro-interactions

### Hover States
```
Button hover: opacity-80, slight scale (1.02)
Card hover: shadow increase, slight lift
Link hover: underline, color change
```

### Transitions
```
Duration: 150-300ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### Animations
```
Fade in: 300ms
Slide in: 300ms (from direction)
Bounce: 600ms (entrance)
Drag & drop: smooth transform
```

---

## 📱 Responsive Design

### Breakpoints
```
xs: 320px   (mobile)
sm: 640px   (mobile landscape)
md: 768px   (tablet)
lg: 1024px  (desktop)
xl: 1280px  (desktop large)
2xl: 1536px (widescreen)
```

### Desktop-First (16:9 Widescreen)
- Optimized for 1920px width
- Sidebar always visible on desktop
- Grid-based responsive layouts
- Full-width kanban boards

---

## 🌙 Dark Mode

### Implementation
- Toggle in Settings
- Persistent in localStorage
- Smooth transition (300ms)
- Follows system preference option

### Dark Mode Colors
```
Background: #0F172A
Surface: #1E293B
Text: #E2E8F0
Accent: #D4A574 (gold maintained)
```

---

## 🎯 Design Patterns

### Empty States
- Illustrated icon
- Descriptive text
- CTA button
- Centered, spacious layout

### Loading States
- Skeleton screens (preferred)
- Subtle animations
- Progress indicators for long operations

### Error States
- Clear error message
- Icon indicator
- Suggested action
- Dismissible alert

### Success States
- Toast notification (auto-dismiss)
- Confirmation modal for critical actions
- Green accent color

---

## 📊 Data Visualization

### Charts (Recharts)
```
- Line charts: Productivity trends
- Bar charts: Team workload
- Pie charts: Task distribution
- Calendar heatmap: Activity
```

### Color Coding
```
High Priority: #EF4444 (red)
Medium: #F59E0B (amber)
Low: #10B981 (green)
```

---

## ♿ Accessibility

### WCAG 2.1 Level AA
- Minimum contrast ratio 4.5:1 for text
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader support
- Focus indicators visible
- Alternative text for images

---

## 🚀 Implementation (Tailwind CSS)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#D4A574',
          blue: '#87CEEB',
        },
      },
      spacing: { /* custom */ },
      borderRadius: { /* custom */ },
    },
  },
};
```

---

## 📖 Design References

Inspired by:
- **Linear.app** - Minimalist, fast
- **Notion** - Spacious, modular
- **Figma** - Collaborative, modern
- **Asana** - Enterprise, feature-rich
