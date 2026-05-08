import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

const API = 'http://localhost:8000'

export default function App() {
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetch(`${API}/notes`)
      .then((r) => r.json())
      .then((d) => setNotes(d.notes))
      .catch(() => {})
  }, [])
  const [transcript, setTranscript] = useState('')
  const [suggestions, setSuggestions] = useState('')
  const [recording, setRecording] = useState(false)
  const [status, setStatus] = useState('')
  const [streaming, setStreaming] = useState(false)

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

  return (
    <>
      <header>
        <h1>Presentation Coach</h1>
        <span>Record · Transcribe · Improve</span>
      </header>

      <div className="layout">
        {/* Left panel: notes + recording + transcript */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
          <div className="panel" style={{ flex: '0 0 45%' }}>
            <div className="panel-header">Speaking Notes</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Loading speaking notes..."
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

        {/* Right panel: updated notes */}
        <div className="panel">
          <div className="panel-header">Updated Speaking Notes</div>
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
