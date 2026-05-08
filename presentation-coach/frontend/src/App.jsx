import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

const API = 'http://localhost:8000'

function extractUpdatedNotes(raw) {
  const match = raw.match(/##\s*Updated Speaking Notes\s*\n([\s\S]*?)(?=\n##\s*Coaching Feedback|$)/)
  return match ? match[1].trim() : null
}

export default function App() {
  const [notes, setNotes] = useState(null)

  useEffect(() => {
    fetch(`${API}/notes`)
      .then((r) => r.json())
      .then((d) => setNotes(d.notes))
      .catch(() => setNotes(''))
  }, [])

  const [transcript, setTranscript] = useState('')
  const [suggestions, setSuggestions] = useState('')
  const [recording, setRecording] = useState(false)
  const [status, setStatus] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [confirmSave, setConfirmSave] = useState(false)

  const mediaRef = useRef(null)
  const chunksRef = useRef([])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await transcribeAudio(blob)
      }

      recorder.start(1000) // collect chunks every second — prevents 30s browser cutoff
      mediaRef.current = recorder
      setRecording(true)
      setStatus('Recording...')
    } catch (err) {
      setStatus('Microphone access denied.')
    }
  }

  function stopRecording() {
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop()
    }
    setRecording(false)
    setStatus('Transcribing...')
  }

  async function transcribeAudio(blob) {
    try {
      const form = new FormData()
      form.append('audio', blob, 'recording.webm')
      const res = await fetch(`${API}/transcribe`, { method: 'POST', body: form })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      setTranscript(data.transcript)
      setStatus('Transcription done.')
    } catch (err) {
      setStatus(`Transcription failed: ${err.message}`)
    }
  }

  async function getSuggestions() {
    if (!transcript || !notes) return
    setSuggestions('')
    setStreaming(true)
    setStatus('Getting suggestions...')

    try {
      const res = await fetch(`${API}/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, notes }),
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8', { fatal: false })
      let done = false
      while (!done) {
        const { value, done: d } = await reader.read()
        done = d
        if (value) {
          setSuggestions((prev) => prev + decoder.decode(value, { stream: true }))
        }
      }
      setStatus('Done.')
    } catch (err) {
      setStatus(`Suggestion error: ${err.message}`)
    } finally {
      setStreaming(false)
    }
  }

  async function saveNotes() {
    const updatedNotes = extractUpdatedNotes(suggestions)
    if (!updatedNotes) {
      setStatus('Could not extract updated notes from output.')
      setConfirmSave(false)
      return
    }
    try {
      const res = await fetch(`${API}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedNotes }),
      })
      const data = await res.json()
      if (data.saved) {
        setNotes(updatedNotes)
        setStatus('Notes saved.')
      } else {
        setStatus(`Save failed: ${data.error}`)
      }
    } catch (err) {
      setStatus(`Save failed: ${err.message}`)
    } finally {
      setConfirmSave(false)
    }
  }

  const updatedNotesPreview = suggestions ? extractUpdatedNotes(suggestions) : null

  return (
    <>
      <header>
        <h1>Presentation Coach</h1>
        <span>Record · Transcribe · Improve</span>
      </header>

      {confirmSave && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <p>Save updated speaking notes to your notes file?</p>
            <p className="confirm-sub">This will overwrite your current notes with the updated version.</p>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => setConfirmSave(false)}>Cancel</button>
              <button className="btn-confirm" onClick={saveNotes}>Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="layout">
        {/* Left panel: notes + recording + transcript */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
          <div className="panel" style={{ flex: '0 0 45%' }}>
            <div className="panel-header">Speaking Notes</div>
            <textarea
              value={notes ?? ''}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={notes === null ? 'Loading...' : notes === '' ? 'No speaking notes found. Paste yours here or set NOTES_PATH.' : ''}
            />
          </div>

          <div className="panel" style={{ flex: 1 }}>
            <div className="panel-header">Transcript</div>
            <div className={`transcript-box${transcript ? '' : ' empty'}`}>
              {transcript || 'Record yourself speaking, then the transcript will appear here.'}
            </div>
            <div className="controls">
              <button
                className={`btn-record${recording ? ' recording' : ''}`}
                onClick={recording ? stopRecording : startRecording}
                disabled={streaming}
              >
                {recording ? 'Stop Recording' : 'Start Recording'}
              </button>
              <button
                className="btn-suggest"
                onClick={getSuggestions}
                disabled={!transcript || !notes || streaming || recording}
              >
                {streaming ? 'Updating notes...' : 'Update Notes'}
              </button>
              {status && <span className="status">{status}</span>}
            </div>
          </div>
        </div>

        {/* Right panel: updated notes + coaching feedback */}
        <div className="panel">
          <div className="panel-header">
            Updated Speaking Notes
            {updatedNotesPreview && !streaming && (
              <button className="btn-save" onClick={() => setConfirmSave(true)}>
                Save Changes
              </button>
            )}
          </div>
          {suggestions ? (
            <div className="suggestions-box">
              <ReactMarkdown>{suggestions}</ReactMarkdown>
            </div>
          ) : (
            <div className="suggestions-box empty">
              Record your practice run, then click "Update Notes" to get your rewritten speaking notes.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
