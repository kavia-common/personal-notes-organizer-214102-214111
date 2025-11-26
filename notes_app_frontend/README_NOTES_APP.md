# Notes App (Ocean Professional)

A modern, lightweight React UI for managing notes with a split layout: left note list and right editor. Uses localStorage by default and can optionally use Supabase if environment variables are provided.

## Features

- Ocean Professional theme (primary #2563EB, secondary/success #F59E0B, error #EF4444, background #f9fafb, surface #ffffff, text #111827)
- Split layout: searchable/sortable note list on the left, editor on the right
- Create, select, edit, delete notes
- Autosave (debounced) while editing
- Session persistence via localStorage when Supabase is not configured
- Optional Supabase backend (table: `notes` with fields `id (uuid)`, `title (text)`, `content (text)`, `updated_at (timestamp)`)

## Getting Started

1. Install dependencies:
   - npm install
2. Start the dev server:
   - npm start
3. Open http://localhost:3000

The app runs without any backend by default using localStorage.

## Optional: Supabase Configuration

If you set these environment variables, the app will use Supabase automatically:

- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

Example `.env` entries (do not commit secrets):

REACT_APP_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
REACT_APP_SUPABASE_KEY=YOUR_ANON_OR_SERVICE_ROLE_KEY

No other environment variables are required. If both values are non-empty, CRUD is performed against the `notes` table.

### Supabase Table

Create a `notes` table with the following fields:

- id: uuid (default value: gen_random_uuid() or uuid_generate_v4())
- title: text
- content: text
- updated_at: timestamp with time zone (default: now())

RLS can be configured as needed. The app uses anon key for simple CRUD in this demo.

## Routing

- /         → Main view
- /note/:id → Select a specific note

## Files

- src/NotesApp.js     → Main app layout and logic
- src/storage.js      → Storage abstraction (localStorage or Supabase)
- src/theme.css       → Ocean Professional theme and layout styles
- src/App.js          → Entry that mounts the NotesApp

## Accessibility

- Keyboard navigation on the list
- ARIA labels for interactive elements
- Live region badge shows "Saving…" vs "Saved"

## Design Notes

- Subtle gradient background
- Rounded corners, shadows, and smooth transitions
- Clean, modern form styling
