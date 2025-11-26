# Lightweight React Template for KAVIA + Notes App

This project includes a modern Notes App UI following the Ocean Professional theme.

## Notes App Overview

- Split layout: left notes list (search/sort), right editor (title + content)
- Create, select, edit, delete notes
- Autosave and session persistence via localStorage
- Optional Supabase backend (enabled automatically if env vars are set)

### Environment Variables (optional)

- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

If both are present and non-empty, the app will use Supabase table `notes` with fields:
`id (uuid)`, `title (text)`, `content (text)`, `updated_at (timestamp)`.

For more details see `README_NOTES_APP.md`.

## Getting Started

In the project directory:

- npm install
- npm start

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).
