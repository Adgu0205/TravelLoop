import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Save, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

type Note = { id: string; content: string; stop_id: string | null; created_at: string; updated_at: string }

export default function Notes() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [notes, setNotes] = useState<Note[]>([])
  const [trip, setTrip] = useState<any>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedIndicator, setSavedIndicator] = useState(false)
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!id) return
    supabase.from('trips').select('name').eq('id', id).single().then(({ data }) => setTrip(data))
    supabase.from('trip_notes').select('*').eq('trip_id', id).order('updated_at', { ascending: false }).then(({ data }) => setNotes(data ?? []))
  }, [id])

  function handleContentChange(val: string) {
    setEditContent(val)
    clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => autoSave(val), 1500)
  }

  async function autoSave(content: string) {
    if (!editingId || !content.trim()) return
    setSaving(true)
    await supabase.from('trip_notes').update({ content }).eq('id', editingId)
    setNotes((prev) => prev.map((n) => n.id === editingId ? { ...n, content } : n))
    setSaving(false)
    setSavedIndicator(true)
    setTimeout(() => setSavedIndicator(false), 2000)
  }

  async function saveNote() {
    if (!editContent.trim() || !id) return
    setSaving(true)
    if (editingId) {
      await supabase.from('trip_notes').update({ content: editContent }).eq('id', editingId)
      setNotes((prev) => prev.map((n) => n.id === editingId ? { ...n, content: editContent } : n))
    } else {
      const { data } = await supabase.from('trip_notes').insert({ trip_id: id, content: editContent }).select().single()
      if (data) setNotes((prev) => [data as Note, ...prev])
    }
    setSaving(false)
    setEditorOpen(false)
    setEditContent('')
    setEditingId(null)
    toast.success('Note saved')
  }

  function openNew() {
    setEditingId(null)
    setEditContent('')
    setEditorOpen(true)
  }

  function openEdit(note: Note) {
    setEditingId(note.id)
    setEditContent(note.content)
    setEditorOpen(true)
  }

  async function deleteNote(noteId: string) {
    await supabase.from('trip_notes').delete().eq('id', noteId)
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
  }

  function renderMarkdown(text: string) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '• $1')
      .replace(/\n/g, '<br/>')
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pt-16">
      <div className="glass-strong border-b border-[var(--glass-border)] px-4 sm:px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(`/trips/${id}`)} className="w-8 h-8 glass rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <ArrowLeft size={16} />
          </button>
          <h1 className="font-display text-xl text-[var(--text-primary)] flex-1">{trip?.name} — Notes</h1>
          {saving && <span className="text-xs text-[var(--text-muted)]">Saving...</span>}
          {savedIndicator && <span className="text-xs text-green-400">Saved ✓</span>}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 relative min-h-[calc(100vh-120px)]">
        {/* Notes list */}
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-muted)]">
              <p className="text-lg mb-2">No notes yet</p>
              <p className="text-sm">Tap + to add your first journal entry</p>
            </div>
          ) : (
            notes.map((note) => (
              <motion.div key={note.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 cursor-pointer hover:border-[var(--accent-teal)] border border-[var(--glass-border)] transition-colors" onClick={() => openEdit(note)}>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-3 line-clamp-4" dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) }} />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <Clock size={10} /> {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id) }} className="text-xs text-[var(--text-muted)] hover:text-red-400 transition-colors">Delete</button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* FAB */}
        <motion.button
          onClick={openNew}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-8 right-8 w-14 h-14 btn-gold rounded-full shadow-glow-gold flex items-center justify-center z-40"
        >
          <Plus size={24} />
        </motion.button>

        {/* Slide-up editor */}
        <AnimatePresence>
          {editorOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setEditorOpen(false)} />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30 }} className="fixed bottom-0 left-0 right-0 glass-strong rounded-t-3xl z-50 max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-[var(--glass-border)]">
                  <h3 className="font-display text-lg text-[var(--text-primary)]">{editingId ? 'Edit Note' : 'New Note'}</h3>
                  <div className="flex items-center gap-2">
                    {saving && <span className="text-xs text-[var(--text-muted)]">Auto-saving...</span>}
                    {savedIndicator && <span className="text-xs text-green-400">Saved ✓</span>}
                    <button onClick={saveNote} className="btn-gold px-4 py-1.5 rounded-lg text-xs flex items-center gap-1">
                      <Save size={12} /> Save
                    </button>
                  </div>
                </div>
                <div className="p-5 flex-1 overflow-y-auto">
                  <p className="text-xs text-[var(--text-muted)] mb-2">Supports **bold**, *italic*, - list items</p>
                  <textarea
                    value={editContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Write your thoughts..."
                    autoFocus
                    className="w-full h-48 bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl p-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-gold)] resize-none font-sans text-sm leading-relaxed"
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
