import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { getStorageProvider } from './storage';
import './theme.css';

/** Debounce helper */
function useDebouncedEffect(effect, deps, delay) {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(deps || []), delay]);
}

function Header({ onNew, onDelete, hasSelection, providerType }) {
  return (
    <header className="app-header" role="banner">
      <div className="header-inner">
        <div className="brand" aria-label="Personal Notes Organizer">
          <div className="brand-icon" />
          <div className="brand-title">Personal Notes</div>
          <span className="badge" title={`Data source: ${providerType}`}>
            {providerType === 'supabase' ? 'Supabase' : 'Local'}
          </span>
        </div>
        <div className="header-actions">
          <button className="btn" onClick={onNew} aria-label="Create note">
            + New
          </button>
          <button
            className="btn btn-danger"
            onClick={onDelete}
            disabled={!hasSelection}
            aria-disabled={!hasSelection}
            aria-label="Delete selected note"
            title={hasSelection ? 'Delete selected' : 'Select a note to delete'}
          >
            Delete
          </button>
        </div>
      </div>
    </header>
  );
}

function LeftPane({ notes, selectedId, onSelect, search, setSearch, sort, setSort }) {
  const filtered = useMemo(() => {
    let res = notes;
    if (search.trim()) {
      const s = search.toLowerCase();
      res = res.filter(n => (n.title || '').toLowerCase().includes(s) || (n.content || '').toLowerCase().includes(s));
    }
    if (sort === 'updated_desc') {
      res = [...res].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    } else if (sort === 'title_asc') {
      res = [...res].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    return res;
  }, [notes, search, sort]);

  return (
    <aside className="pane" aria-label="Notes list">
      <div className="pane-header">
        <div className="search-row">
          <input
            className="input"
            placeholder="Search notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search notes"
          />
          <select
            className="sort-select"
            value={sort}
            onChange={e => setSort(e.target.value)}
            aria-label="Sort notes"
            title="Sort notes"
          >
            <option value="updated_desc">Recent</option>
            <option value="title_asc">Title A–Z</option>
          </select>
        </div>
      </div>
      <ul className="note-list">
        {filtered.map(n => (
          <li
            key={n.id}
            className={`note-item ${selectedId === n.id ? 'active' : ''}`}
            onClick={() => onSelect(n.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') onSelect(n.id); }}
            aria-label={`Open note ${n.title || 'Untitled'}`}
          >
            <div style={{ flex: 1 }}>
              <div className="note-title">{n.title || 'Untitled'}</div>
              <div className="note-preview">{(n.content || '').slice(0, 80) || '—'}</div>
            </div>
            <div className="badge" title="Last updated">
              {new Date(n.updated_at).toLocaleString()}
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <div className="empty" role="note">
            <div className="empty-card">
              <div className="empty-title">No notes found</div>
              <div className="empty-desc">Try creating a new note or adjusting your search.</div>
            </div>
          </div>
        )}
      </ul>
    </aside>
  );
}

function EditorPane({ note, onTitleChange, onContentChange, saving }) {
  if (!note) {
    return (
      <section className="pane editor" aria-label="Editor empty">
        <div className="empty" role="status">
          <div className="empty-card">
            <div className="empty-title">Select or create a note</div>
            <div className="empty-desc">Your notes will appear here. Markdown syntax is supported in content.</div>
            <div>
              <span className="badge">Autosave</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pane editor" aria-label="Note editor">
      <div className="editor-header">
        <input
          className="title-input"
          value={note.title || ''}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="Note title"
          aria-label="Note title"
        />
        <div className="toolbar">
          <span className="badge" aria-live="polite">{saving ? 'Saving…' : 'Saved'}</span>
        </div>
      </div>
      <div className="editor-content">
        <textarea
          className="textarea"
          value={note.content || ''}
          onChange={e => onContentChange(e.target.value)}
          placeholder="Write your note in Markdown..."
          aria-label="Note content"
        />
      </div>
    </section>
  );
}

function AppInner() {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const provider = useMemo(() => getStorageProvider(), []);
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('updated_desc');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const list = await provider.listNotes();
    setNotes(list);
  }, [provider]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (routeId) {
      setSelectedId(routeId);
    }
  }, [routeId]);

  const selectedNote = useMemo(() => notes.find(n => n.id === selectedId) || null, [notes, selectedId]);

  async function handleNew() {
    const created = await provider.createNote({ title: 'Untitled', content: '' });
    await load();
    setSelectedId(created.id);
    navigate(`/note/${created.id}`, { replace: false });
  }

  async function handleDelete() {
    if (!selectedId) return;
    await provider.deleteNote(selectedId);
    await load();
    setSelectedId(null);
    navigate(`/`, { replace: false });
  }

  function handleSelect(id) {
    setSelectedId(id);
    navigate(`/note/${id}`, { replace: false });
  }

  useDebouncedEffect(() => {
    (async () => {
      if (!selectedNote) return;
      setSaving(true);
      try {
        await provider.updateNote(selectedNote.id, { title: selectedNote.title, content: selectedNote.content });
        await load();
      } finally {
        setSaving(false);
      }
    })();
  }, [selectedNote?.title, selectedNote?.content], 500);

  function updateSelected(patch) {
    setNotes(prev => prev.map(n => (n.id === selectedId ? { ...n, ...patch } : n)));
  }

  return (
    <div className="app-root">
      <Header
        onNew={handleNew}
        onDelete={handleDelete}
        hasSelection={!!selectedId}
        providerType={provider.type}
      />
      <main className="main" role="main">
        <LeftPane
          notes={notes}
          selectedId={selectedId}
          onSelect={handleSelect}
          search={search}
          setSearch={setSearch}
          sort={sort}
          setSort={setSort}
        />
        <EditorPane
          note={selectedNote}
          onTitleChange={(v) => updateSelected({ title: v })}
          onContentChange={(v) => updateSelected({ content: v })}
          saving={saving}
        />
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function NotesAppRouter() {
  /** This is a public function that provides routing and renders the app. */
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppInner />} />
        <Route path="/note/:id" element={<AppInner />} />
      </Routes>
    </BrowserRouter>
  );
}
