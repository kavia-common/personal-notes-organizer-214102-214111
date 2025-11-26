/**
 * Storage abstraction for notes with optional Supabase backend.
 * Falls back to localStorage (session-persistent) if env vars not present.
 */

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;

/** Utility: simple uuid v4-ish for local usage */
function uuid() {
  // Not cryptographically secure; sufficient for localStorage ids
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    // eslint-disable-next-line no-mixed-operators
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Note model typedef
 * @typedef {{id: string, title: string, content: string, updated_at: string}} Note
 */

// PUBLIC_INTERFACE
export function getStorageProvider() {
  /** This is a public function that returns the active storage provider:
   * - SupabaseStorage if REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY are set and non-empty
   * - LocalStorage provider otherwise
   */
  const hasSupabase =
    typeof SUPABASE_URL === 'string' && SUPABASE_URL.trim() !== '' &&
    typeof SUPABASE_KEY === 'string' && SUPABASE_KEY.trim() !== '';
  if (hasSupabase) {
    return SupabaseStorage(SUPABASE_URL, SUPABASE_KEY);
  }
  return LocalStorageStorage();
}

/** LocalStorage-based storage */
function LocalStorageStorage() {
  const KEY = 'notes_app_notes_v1';

  /** @returns {Note[]} */
  function loadAll() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /** @param {Note[]} notes */
  function saveAll(notes) {
    localStorage.setItem(KEY, JSON.stringify(notes));
  }

  // PUBLIC_INTERFACE
  async function listNotes() {
    return loadAll().sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }

  // PUBLIC_INTERFACE
  async function createNote(partial = {}) {
    const now = new Date().toISOString();
    const note = {
      id: uuid(),
      title: partial.title || 'Untitled',
      content: partial.content || '',
      updated_at: now,
    };
    const all = loadAll();
    all.unshift(note);
    saveAll(all);
    return note;
  }

  // PUBLIC_INTERFACE
  async function updateNote(id, patch) {
    const all = loadAll();
    const idx = all.findIndex(n => n.id === id);
    if (idx === -1) throw new Error('Note not found');
    const updated = { ...all[idx], ...patch, updated_at: new Date().toISOString() };
    all[idx] = updated;
    saveAll(all);
    return updated;
  }

  // PUBLIC_INTERFACE
  async function deleteNote(id) {
    const all = loadAll().filter(n => n.id !== id);
    saveAll(all);
    return true;
  }

  // PUBLIC_INTERFACE
  async function getNote(id) {
    return loadAll().find(n => n.id === id) || null;
  }

  return { listNotes, createNote, updateNote, deleteNote, getNote, type: 'local' };
}

/** Supabase-based storage (lazy import to avoid dependency if not configured) */
function SupabaseStorage(url, key) {
  // dynamic import using eval to avoid bundling if not used when env vars empty
  let supabase = null;

  async function ensureClient() {
    if (supabase) return supabase;
    const { createClient } = await import('@supabase/supabase-js');
    supabase = createClient(url, key);
    return supabase;
  }

  const table = 'notes';

  // PUBLIC_INTERFACE
  async function listNotes() {
    const client = await ensureClient();
    const { data, error } = await client.from(table).select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  // PUBLIC_INTERFACE
  async function createNote(partial = {}) {
    const client = await ensureClient();
    const now = new Date().toISOString();
    const payload = {
      title: partial.title || 'Untitled',
      content: partial.content || '',
      updated_at: now,
    };
    const { data, error } = await client.from(table).insert(payload).select().single();
    if (error) throw error;
    return data;
  }

  // PUBLIC_INTERFACE
  async function updateNote(id, patch) {
    const client = await ensureClient();
    const payload = { ...patch, updated_at: new Date().toISOString() };
    const { data, error } = await client.from(table).update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  // PUBLIC_INTERFACE
  async function deleteNote(id) {
    const client = await ensureClient();
    const { error } = await client.from(table).delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // PUBLIC_INTERFACE
  async function getNote(id) {
    const client = await ensureClient();
    const { data, error } = await client.from(table).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  return { listNotes, createNote, updateNote, deleteNote, getNote, type: 'supabase' };
}
=======
import React from 'react';
import NotesApp from './NotesApp';

// PUBLIC_INTERFACE
function App() {
  /** This is a public function that renders the Notes application. */
  return <NotesApp />;
}

export default App;
>>>>>>> REPLACE
