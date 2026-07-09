# TaskFlow Pro

TaskFlow Pro is a production-ready Kanban project management app inspired by Trello, Jira, Linear, and Notion. It is local-first, fast, responsive, and designed for hackathon demos where judges need to see real workflow depth quickly.

## Features

- Multiple boards with editable names and background themes
- Default Kanban columns: To Do, In Progress, Review, Done
- Create, edit, delete, duplicate, archive, and restore tasks
- Drag-and-drop card movement between columns and within columns
- Drag-and-drop column reordering
- Search by title, description, and assignee
- Filters for priority, status, labels, and due dates
- Priority badges: Low, Medium, High, Critical
- Task details: description, labels, assignee, estimate, due date, comments, checklist, attachments
- Dashboard statistics: total, completed, pending, overdue, productivity score
- Calendar-style due date view
- Activity timeline and recent activity
- Dark and light themes
- LocalStorage persistence for boards, tasks, settings, labels, and activity
- Import/export as JSON
- Keyboard shortcuts: `N` quick add, `/` search, `Esc` close
- Responsive mobile navigation

## Architecture

```text
src/
  components/
    Board.jsx
    Column.jsx
    TaskCard.jsx
    TaskModal.jsx
    Navbar.jsx
    Sidebar.jsx
    Dashboard.jsx
    Filters.jsx
    SearchBar.jsx
  hooks/
    useBoard.js
    useLocalStorage.js
  utils/
    helpers.js
    storage.js
  constants/
    priorities.js
    labels.js
```

`useBoard.js` owns the board domain model and all mutations. `storage.js` isolates LocalStorage persistence and import validation. UI components stay focused on rendering and interaction.

## Screenshots

Add screenshots after running the app:

- `docs/screenshots/dashboard.png`
- `docs/screenshots/kanban-board.png`
- `docs/screenshots/task-modal.png`
- `docs/screenshots/mobile.png`

Recommended captures: dashboard landing, Kanban drag-and-drop board, task details modal, and mobile board navigation.

## Setup

```bash
npm install
npm run dev
```

Vite defaults to `http://localhost:5180/`.

## Production Build

```bash
npm run lint
npm run build
npm run preview
```

The static production output is generated in `dist/`.

## Deployment

Deploy the `dist/` folder to any static host:

- Vercel: import the project, build command `npm run build`, output `dist`
- Netlify: build command `npm run build`, publish directory `dist`
- GitHub Pages: publish `dist` through your preferred Pages workflow
- Static server: copy `dist` to the server root

## Data Persistence

TaskFlow Pro stores everything in browser LocalStorage under `taskflow-pro-state-v1`. Export JSON before clearing browser storage if you want a portable backup.

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Framer Motion
- React Icons
- @dnd-kit/core
- @dnd-kit/sortable
- UUID
- date-fns
