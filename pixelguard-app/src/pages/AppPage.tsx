import { useState, useRef, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Upload, Play, Pause, Download, Trash2,
  Sliders, Eye, AlertCircle, CheckCircle,
  Loader, ZoomIn, ZoomOut, RotateCcw, Shield
} from 'lucide-react'
import './AppPage.css'

type BlurMode = 'blur' | 'redact' | 'mosaic'
type ProcessingStatus = 'idle' | 'loading-model' | 'processing' | 'done' | 'error'

interface FaceBox { x: number; y: number; w: number; h: number }
interface ManualZone extends FaceBox { id: string }
interface TrackedFace extends FaceBox { id: string; history: FaceBox[]; missedFrames: number }

const BLUR_MODES: { id: BlurMode; label: string; emoji: string }[] = [
  { id: 'blur',     label: 'Blur',     emoji: '🌫️' },
  { id: 'redact',   label: 'Redact',   emoji: '⬛' },
  { id: 'mosaic',   label: 'Mosaic',   emoji: '🎨' },
]

/* ─── Canvas helpers ─── */
const scratchCanvas = document.createElement('canvas');
const scratchCtx = scratchCanvas.getContext('2d', { willReadFrequently: true })!;

function applyBlurEffect(
  ctx: CanvasRenderingContext2D,
  box: FaceBox,
  mode: BlurMode,
  intensity: number,
  isManualZone: boolean = false
) {
  try {
    const { x, y, w, h } = box
    const bx = x
    const by = y
    const bw = Math.max(1, w)
    const bh = Math.max(1, h)
    
    // Create an organic elliptical mask so the blur ONLY covers the face, not the boxy background corners
    const cx = bx + bw / 2
    const cy = by + bh / 2
    const rx = bw / 2
    const ry = bh / 2

    if (mode === 'blur') {
      ctx.save()
      if (!isManualZone) {
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI)
        ctx.clip()
      }
      
      ctx.filter = `blur(${Math.round(intensity * 0.5)}px)`
      ctx.drawImage(ctx.canvas, bx, by, bw, bh, bx, by, bw, bh)
      ctx.restore()
    } else if (mode === 'redact') {
      ctx.save()
      ctx.fillStyle = '#000000'
      if (isManualZone) {
        ctx.fillRect(bx, by, bw, bh)
      } else {
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI)
        ctx.fill()
      }
      ctx.restore()
    } else if (mode === 'mosaic') {
      const blockSize = Math.max(4, Math.round(intensity * 0.4))
      const scale = 1 / blockSize

      const tinyW = Math.max(1, Math.floor(bw * scale))
      const tinyH = Math.max(1, Math.floor(bh * scale))

      scratchCanvas.width = tinyW
      scratchCanvas.height = tinyH
      
      scratchCtx.clearRect(0, 0, tinyW, tinyH)
      scratchCtx.drawImage(ctx.canvas, bx, by, bw, bh, 0, 0, tinyW, tinyH)

      ctx.save()
      if (!isManualZone) {
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI)
        ctx.clip()
      }

      ctx.imageSmoothingEnabled = false
      ctx.drawImage(scratchCanvas, 0, 0, tinyW, tinyH, bx, by, bw, bh)

      // Add mosaic grid overlay
      ctx.strokeStyle = 'rgba(0,0,0,0.2)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      for (let px = bx; px < bx + bw; px += blockSize) {
        ctx.moveTo(px, by)
        ctx.lineTo(px, by + bh)
      }
      for (let py = by; py < by + bh; py += blockSize) {
        ctx.moveTo(bx, py)
        ctx.lineTo(bx + bw, py)
      }
      ctx.stroke()
      ctx.restore()
    }
  } catch (e) {
    console.warn("Blur effect skipped for frame:", e)
  }
}

const logoImg = new Image()
logoImg.src = '/favicon.svg'

function drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save()
  
  const text = 'PixelGuard'
  ctx.font = 'bold 24px Inter, system-ui, sans-serif'
  
  const textWidth = ctx.measureText(text).width
  const padding = 20
  const logoSize = 28
  const gap = 10
  
  const totalWidth = logoSize + gap + textWidth
  
  const startX = width - totalWidth - padding
  const startY = height - Math.max(logoSize, 24) - padding
  
  // Apply shadow to both image and text for visibility
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetX = 1
  ctx.shadowOffsetY = 1
  
  if (logoImg.complete && logoImg.naturalWidth > 0) {
    ctx.globalAlpha = 0.8
    ctx.drawImage(logoImg, startX, startY, logoSize, logoSize)
  }
  
  ctx.globalAlpha = 1.0
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, startX + logoSize + gap, startY + logoSize / 2)
  
  ctx.restore()
}

export default function AppPage() {
  const [file, setFile] = useState<File | null>(null)
  const [videoURL, setVideoURL] = useState<string>('')
  const [status, setStatus] = useState<ProcessingStatus>('idle')
  const [mode, setMode] = useState<BlurMode>('blur')
  const [padding, setPadding] = useState(20)
  const [progress, setProgress] = useState(0)
  const [downloadURL, setDownloadURL] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [intensity, setIntensity] = useState(18)
  const [isPlaying, setIsPlaying] = useState(false)
  const [manualZones, setManualZones] = useState<ManualZone[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null)
  const [currentDraw, setCurrentDraw] = useState<FaceBox | null>(null)
  const [showManualMode, setShowManualMode] = useState(false)
  const [facesDetected, setFacesDetected] = useState<number>(0)
  const [modelLoaded, setModelLoaded] = useState(false)

  const videoRef   = useRef<HTMLVideoElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const modelRef   = useRef<any>(null)
  const animRef    = useRef<number>(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef        = useRef<Blob[]>([])
  const trackedFacesRef  = useRef<TrackedFace[]>([])
  const progressRef      = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (progressRef.current) progressRef.current.style.width = `${progress}%`
  }, [progress])

  const smoothFaces = useCallback((preds: any[], prevTracks: TrackedFace[]): TrackedFace[] => {
    const newTracks: TrackedFace[] = [];

    const currentFaces = preds.map(pred => {
      const [x1, y1] = pred.topLeft as [number, number];
      const [x2, y2] = pred.bottomRight as [number, number];
      const w = x2 - x1;
      const h = y2 - y1;
      return { x: x1, y: y1, w, h };
    });

    for (const prev of prevTracks) {
      // Drop the track much faster (4 frames ~ 130ms) if the face turns away. 
      // This stops the blur from floating in the background ("clean face only").
      if (prev.missedFrames > 4) continue; 

      const prevCenter = { x: prev.x + prev.w / 2, y: prev.y + prev.h / 2 };
      let bestMatchIdx = -1;
      let minD = Infinity;
      const dynamicMaxDist = Math.max(80, prev.w * 1.5); // Allow fast movement, but scale with face size

      for (let i = 0; i < currentFaces.length; i++) {
        const c = currentFaces[i];
        const center = { x: c.x + c.w / 2, y: c.y + c.h / 2 };
        const d = Math.hypot(center.x - prevCenter.x, center.y - prevCenter.y);
        if (d < minD && d < dynamicMaxDist) {
          minD = d;
          bestMatchIdx = i;
        }
      }

      if (bestMatchIdx !== -1) {
        const match = currentFaces[bestMatchIdx];
        // Smaller window (5 frames) means less lag trailing behind the face
        const newHistory = [...prev.history, match].slice(-5); 
        
        const sortedX = [...newHistory].map(h => h.x).sort((a,b) => a-b);
        const sortedY = [...newHistory].map(h => h.y).sort((a,b) => a-b);
        const sortedW = [...newHistory].map(h => h.w).sort((a,b) => a-b);
        const sortedH = [...newHistory].map(h => h.h).sort((a,b) => a-b);
        
        const mid = Math.floor(newHistory.length / 2);
        
        newTracks.push({
          id: prev.id,
          x: sortedX[mid],
          y: sortedY[mid],
          w: sortedW[mid],
          h: sortedH[mid],
          history: newHistory,
          missedFrames: 0
        });
        currentFaces.splice(bestMatchIdx, 1);
      } else {
        newTracks.push({ ...prev, missedFrames: prev.missedFrames + 1 });
      }
    }

    for (const newFace of currentFaces) {
      newTracks.push({
        ...newFace,
        id: Math.random().toString(),
        history: [newFace],
        missedFrames: 0
      });
    }

    return newTracks;
  }, []);

  /* Load model lazily */
  const loadModel = useCallback(async () => {
    if (modelRef.current) return
    setStatus('loading-model')
    try {
      const tf = await import('@tensorflow/tfjs')
      await tf.ready()
      const blazeface = await import('@tensorflow-models/blazeface')
      modelRef.current = await blazeface.load()
      setStatus('idle')
      setModelLoaded(true)
    } catch {
      /* fallback: no model, manual zones only */
      modelRef.current = null
      setStatus('idle')
      setModelLoaded(true)
    }
  }, [])

  /* Drop */
  const onDrop = useCallback(async (files: File[]) => {
    const f = files[0]
    if (!f) return
    if (!f.type.startsWith('video/')) { setError('Please upload a valid video file.'); return }
    setFile(f)
    setVideoURL(URL.createObjectURL(f))
    setDownloadURL('')
    setStatus('idle')
    setProgress(0)
    setError('')
    setManualZones([])
    setFacesDetected(0)
    trackedFacesRef.current = []
    await loadModel()
  }, [loadModel])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': [] },
    maxFiles: 1,
    noClick: !!file,
  })

  /* Preview playback */
  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true) }
    else { videoRef.current.pause(); setIsPlaying(false) }
  }

  /* Live preview overlay */
  useEffect(() => {
    if (!videoURL || !canvasRef.current || !videoRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!

    // Create an offscreen buffer so the screen never flashes unblurred frames during await
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')!

    const renderOnce = async () => {
      if (!video.videoWidth) return
      canvas.width  = video.videoWidth  || 640
      canvas.height = video.videoHeight || 360
      tempCanvas.width = canvas.width
      tempCanvas.height = canvas.height
      
      tempCtx.drawImage(video, 0, 0, canvas.width, canvas.height)

      let preds: any[] = []
      // Detect faces live
      if (modelRef.current) {
        try {
          preds = await modelRef.current.estimateFaces(tempCanvas, false)
        } catch { /* skip */ }
      }

      // Synchronous render to visible canvas to avoid flashing
      ctx.drawImage(tempCanvas, 0, 0)
      
      const smoothed = smoothFaces(preds, trackedFacesRef.current)
      trackedFacesRef.current = smoothed
      
      setFacesDetected(smoothed.filter(s => s.missedFrames === 0).length)
      for (const face of smoothed) {
        const box: FaceBox = { x: face.x - padding, y: face.y - padding, w: face.w + padding * 2, h: face.h + padding * 2 }
        applyBlurEffect(ctx, box, mode, intensity, false)
      }

      // Manual zones
      for (const z of manualZones) applyBlurEffect(ctx, z, mode, intensity, true)

      const isPro = localStorage.getItem('pixelguard_pro') === 'true'
      if (!isPro) {
        drawWatermark(ctx, canvas.width, canvas.height)
      }
    }

    const drawFrame = async () => {
      if (video.paused || video.ended) return
      await renderOnce()
      animRef.current = requestAnimationFrame(drawFrame)
    }

    if (video.paused) {
      renderOnce()
    }

    video.addEventListener('play',  () => { animRef.current = requestAnimationFrame(drawFrame) })
    video.addEventListener('pause', () => cancelAnimationFrame(animRef.current))
    const handleSeek = () => { trackedFacesRef.current = []; renderOnce(); }
    video.addEventListener('seeked', handleSeek)

    return () => { 
      cancelAnimationFrame(animRef.current)
      video.removeEventListener('seeked', handleSeek)
    }
  }, [videoURL, mode, intensity, padding, manualZones, modelLoaded])

  /* Manual zone drawing */
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = overlayRef.current!.getBoundingClientRect()
    const scaleX = (overlayRef.current!.width)  / rect.width
    const scaleY = (overlayRef.current!.height) / rect.height
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!showManualMode) return
    const { x, y } = getCanvasCoords(e)
    setDrawStart({ x, y })
    setIsDrawing(true)
  }
  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart) return
    const { x, y } = getCanvasCoords(e)
    setCurrentDraw({ x: Math.min(x, drawStart.x), y: Math.min(y, drawStart.y), w: Math.abs(x - drawStart.x), h: Math.abs(y - drawStart.y) })
  }
  const onMouseUp = () => {
    if (!isDrawing || !currentDraw || currentDraw.w < 10) { setIsDrawing(false); setCurrentDraw(null); return }
    setManualZones(prev => [...prev, { ...currentDraw!, id: Date.now().toString() }])
    setIsDrawing(false)
    setCurrentDraw(null)
    setDrawStart(null)
  }

  /* Draw overlay rect */
  useEffect(() => {
    if (!overlayRef.current) return
    const ctx = overlayRef.current.getContext('2d')!
    const canvas = overlayRef.current
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (currentDraw && isDrawing) {
      ctx.strokeStyle = 'rgba(108,99,255,0.9)'
      ctx.lineWidth   = 2
      ctx.setLineDash([6, 3])
      ctx.strokeRect(currentDraw.x, currentDraw.y, currentDraw.w, currentDraw.h)
      ctx.fillStyle = 'rgba(108,99,255,0.1)'
      ctx.fillRect(currentDraw.x, currentDraw.y, currentDraw.w, currentDraw.h)
    }
    for (const z of manualZones) {
      ctx.strokeStyle = 'rgba(255,101,132,0.8)'
      ctx.lineWidth   = 1.5
      ctx.setLineDash([4, 2])
      ctx.strokeRect(z.x, z.y, z.w, z.h)
    }
  }, [currentDraw, isDrawing, manualZones])

  /* Process video */
  const processVideo = async () => {
    if (!file || !videoRef.current) return
    setError('')
    setDownloadURL('')
    setProgress(0)

    await loadModel()
    setStatus('processing')

    // Create a hidden video element for processing
    const bgVideo = document.createElement('video')
    bgVideo.src = videoURL
    bgVideo.playsInline = true
    bgVideo.muted = true // We don't need audio from here anymore!
    
    await new Promise<void>(resolve => {
      bgVideo.onloadedmetadata = () => resolve()
    })

    const canvas = document.createElement('canvas')
    canvas.width  = bgVideo.videoWidth  || 640
    canvas.height = bgVideo.videoHeight || 360
    const ctx = canvas.getContext('2d')!
    
    // Hidden temp canvas for safe async rendering without exposing unblurred frames to MediaRecorder
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    const tempCtx = tempCanvas.getContext('2d')!

    // Record canvas
    let stream: MediaStream
    try { stream = (canvas as any).captureStream(30) } catch { stream = (canvas as any).captureStream() }

    // Silently capture audio using decodeAudioData (Bulletproof across all browsers)
    let audioCtx: AudioContext | null = null;
    let audioSource: AudioBufferSourceNode | null = null;
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      
      const dest = audioCtx.createMediaStreamDestination();
      audioSource = audioCtx.createBufferSource();
      audioSource.buffer = audioBuffer;
      audioSource.connect(dest);
      
      dest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
    } catch (e) {
      console.warn('Audio extraction failed:', e);
    }

    // Explicitly demand AAC audio encoding in MP4 so Mac QuickLook/QuickTime doesn't corrupt it
    const mimeType = MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')
      ? 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
      : MediaRecorder.isTypeSupported('video/mp4')
        ? 'video/mp4'
        : MediaRecorder.isTypeSupported('video/webm;codecs=h264')
          ? 'video/webm;codecs=h264'
          : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : MediaRecorder.isTypeSupported('video/webm')
              ? 'video/webm' : ''

    chunksRef.current = []
    const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    mediaRecorderRef.current = mr
    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }

    const duration = bgVideo.duration || 0

    const processFinished = new Promise<void>(resolve => {
      mr.onstop = () => {
        if (audioCtx) audioCtx.close()
        const blob = new Blob(chunksRef.current, { type: mimeType || 'video/mp4' })
        setDownloadURL(URL.createObjectURL(blob))
        setStatus('done')
        setProgress(100)
        
        const isPro = localStorage.getItem('pixelguard_pro') === 'true'
        if (!isPro) {
          const currentCount = parseInt(localStorage.getItem('pixelguard_processed_count') || '0', 10)
          localStorage.setItem('pixelguard_processed_count', (currentCount + 1).toString())
        }

        resolve()
      }
    })

    mr.start(100)

    // Play the background video in real-time to capture with audio sync
    let detected = 0
    await bgVideo.play()
    
    if (audioCtx && audioCtx.state === 'suspended') {
      try { await audioCtx.resume() } catch (e) { console.warn('Could not resume audio ctx', e) }
    }
    if (audioSource) {
      try { audioSource.start(0) } catch (e) { console.warn('Could not start audio', e) }
    }

    trackedFacesRef.current = []; // Reset for export
    const drawAndDetect = async () => {
      if (bgVideo.paused || bgVideo.ended) {
        setFacesDetected(detected)
        mr.stop()
        if (audioSource) { try { audioSource.stop() } catch {} }
        return
      }

      tempCtx.drawImage(bgVideo, 0, 0, canvas.width, canvas.height)
      
      let preds: any[] = []
      if (modelRef.current) {
        try {
          preds = await modelRef.current.estimateFaces(tempCanvas, false)
        } catch {}
      }

      // 100% synchronous drawing to the recording canvas ensures MediaRecorder never captures a frame without blur
      ctx.drawImage(tempCanvas, 0, 0)
      
      const smoothed = smoothFaces(preds, trackedFacesRef.current)
      trackedFacesRef.current = smoothed
      
      detected = Math.max(detected, smoothed.filter(s => s.missedFrames === 0).length)
      for (const face of smoothed) {
        const box: FaceBox = { x: face.x - padding, y: face.y - padding, w: face.w + padding * 2, h: face.h + padding * 2 }
        applyBlurEffect(ctx, box, mode, intensity, false)
      }
      
      for (const z of manualZones) applyBlurEffect(ctx, z, mode, intensity, true)

      const isPro = localStorage.getItem('pixelguard_pro') === 'true'
      if (!isPro) {
        drawWatermark(ctx, canvas.width, canvas.height)
      }

      setProgress(Math.round((bgVideo.currentTime / duration) * 95))
      requestAnimationFrame(drawAndDetect)
    }

    drawAndDetect()
    await processFinished
  }

  const reset = () => {
    setFile(null)
    setVideoURL('')
    setDownloadURL('')
    setStatus('idle')
    setProgress(0)
    setError('')
    setManualZones([])
    setFacesDetected(0)
    setIsPlaying(false)
    cancelAnimationFrame(animRef.current)
  }

  const isBusy = status === 'loading-model' || status === 'processing'

  return (
    <div className="apppage">

      {/* ── HEADER ── */}
      <div className="app-header">
        <div className="container">
          <div className="badge badge-accent mb-12">
            <Shield size={12}/> Privacy-First Tool
          </div>
          <h1 className="app-title">Face Blur <span className="gradient-text">Studio</span></h1>
          <p className="app-sub">Upload a video, AI detects every face, you download the blurred result. 100% in-browser.</p>
        </div>
      </div>

      <div className="container app-layout">

        {/* ── LEFT: CONTROLS ── */}
        <aside className="app-sidebar">

          {/* Blur Mode */}
          <div className="ctrl-panel glass">
            <h3 className="panel-title"><Eye size={16}/> Blur Mode</h3>
            <div className="mode-grid">
              {BLUR_MODES.map(m => (
                <button
                  key={m.id}
                  className={`mode-btn ${mode === m.id ? 'active' : ''}`}
                  onClick={() => setMode(m.id)}
                  disabled={isBusy}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Intensity */}
          <div className="ctrl-panel glass">
            <h3 className="panel-title"><Sliders size={16}/> Settings</h3>
            <div className="ctrl-row">
              <label className="ctrl-label">Intensity <span className="ctrl-value">{intensity}</span></label>
              <input type="range" title="Intensity" placeholder="Intensity" min={5} max={40} value={intensity} onChange={e => setIntensity(+e.target.value)} disabled={isBusy}/>
            </div>
            <div className="ctrl-row">
              <label className="ctrl-label">Face Padding <span className="ctrl-value">{padding}px</span></label>
              <input type="range" title="Face Padding" placeholder="Face Padding" min={0} max={100} value={padding} onChange={e => setPadding(+e.target.value)} disabled={isBusy}/>
            </div>
          </div>

          {/* Manual Zones */}
          <div className="ctrl-panel glass">
            <div className="panel-header-row">
              <h3 className="panel-title m-0">✏️ Manual Zones</h3>
              <label className="toggle">
                <input type="checkbox" title="Toggle Manual Mode" placeholder="Toggle Manual Mode" checked={showManualMode} onChange={e => setShowManualMode(e.target.checked)} disabled={isBusy || !file}/>
                <span className="toggle-slider"/>
              </label>
            </div>
            {showManualMode && (
              <p className="panel-hint">Click and drag on the video preview to add manual blur zones.</p>
            )}
            {manualZones.length > 0 && (
              <div className="zone-list">
                {manualZones.map((z, i) => (
                  <div key={z.id} className="zone-item">
                    <span>Zone {i + 1} ({Math.round(z.w)}×{Math.round(z.h)}px)</span>
                    <button
                      className="zone-del"
                      onClick={() => setManualZones(prev => prev.filter(m => m.id !== z.id))}
                    >✕</button>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm mt-6" onClick={() => setManualZones([])}>
                  <RotateCcw size={12}/> Clear All
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          {(facesDetected > 0 || status === 'done') && (
            <div className="ctrl-panel glass stats-panel">
              <div className="stat-row">
                <span className="stat-label-sm">Faces Detected</span>
                <span className="stat-val">{facesDetected}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label-sm">Manual Zones</span>
                <span className="stat-val">{manualZones.length}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label-sm">Blur Mode</span>
                <span className="stat-val">{mode}</span>
              </div>
            </div>
          )}
        </aside>

        {/* ── RIGHT: PREVIEW & ACTIONS ── */}
        <div className="app-main">

          {/* Dropzone / Preview */}
          <div className="preview-panel glass">
            {!file ? (
              <div {...getRootProps()} className={`dropzone ${isDragActive ? 'drag-active' : ''}`}>
                <input {...getInputProps()} id="video-upload-input"/>
                <div className="drop-icon"><Upload size={36}/></div>
                <h3 className="drop-title">{isDragActive ? 'Drop it here!' : 'Upload Your Video'}</h3>
                <p className="drop-sub">Drag & drop or click to browse</p>
                <div className="drop-formats">
                  <span className="badge badge-teal">MP4</span>
                  <span className="badge badge-teal">MOV</span>
                  <span className="badge badge-teal">WebM</span>
                  <span className="badge badge-teal">AVI</span>
                </div>
                <p className="drop-limit">Free tier: up to 100MB</p>
              </div>
            ) : (
              <div className="video-preview-wrap">
                <div className="video-container">
                  <video
                    ref={videoRef}
                    src={videoURL}
                    className="hidden-video"
                    playsInline
                    onLoadedMetadata={e => {
                      const v = e.target as HTMLVideoElement
                      if (canvasRef.current) { canvasRef.current.width = v.videoWidth; canvasRef.current.height = v.videoHeight }
                      if (overlayRef.current) { overlayRef.current.width = v.videoWidth; overlayRef.current.height = v.videoHeight }
                    }}
                    onEnded={() => setIsPlaying(false)}
                    muted
                  />
                  <div className="canvas-wrapper">
                    <canvas ref={canvasRef} className="main-canvas"/>
                    <canvas
                      ref={overlayRef}
                      className={`overlay-canvas ${showManualMode ? 'cursor-crosshair' : 'cursor-default'}`}
                      onMouseDown={onMouseDown}
                      onMouseMove={onMouseMove}
                      onMouseUp={onMouseUp}
                    />
                  </div>
                </div>

                {/* Video controls */}
                <div className="video-controls">
                  <button className="btn btn-outline btn-sm" onClick={togglePlay} disabled={isBusy} id="play-pause-btn">
                    {isPlaying ? <Pause size={14}/> : <Play size={14}/>}
                    {isPlaying ? 'Pause' : 'Preview'}
                  </button>
                  <span className="file-name">{file.name}</span>
                  <button className="btn btn-ghost btn-sm" onClick={reset} disabled={isBusy} id="reset-btn">
                    <Trash2 size={14}/> Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Status / Progress */}
          {status === 'loading-model' && (
            <div className="notification notification-info">
              <Loader size={16} className="animate-spin"/>
              <span>Loading AI face detection model… (one-time download)</span>
            </div>
          )}
          {status === 'processing' && (
            <div className="notification notification-info notification-processing">
              <div className="processing-header">
                <Loader size={16} className="animate-spin"/>
                <span>Processing video… {progress}%</span>
              </div>
              <div className="progress-bar progress-bar-full">
                <div className="progress-fill" ref={progressRef}/>
              </div>
            </div>
          )}
          {status === 'done' && (
            <div className="notification notification-success">
              <CheckCircle size={16}/>
              <span>Done! {facesDetected > 0 ? `${facesDetected} face${facesDetected > 1 ? 's' : ''} detected and blurred.` : 'Video processed successfully.'}</span>
            </div>
          )}
          {error && (
            <div className="notification notification-error">
              <AlertCircle size={16}/>
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-row">
            <button
              id="process-btn"
              className="btn btn-primary btn-lg flex-1"
              onClick={processVideo}
              disabled={!file || isBusy}
            >
              {isBusy
                ? <><Loader size={18} className="animate-spin"/> Processing…</>
                : <><ZoomIn size={18}/> Process Video</>
              }
            </button>

            {downloadURL && (
              <a
                id="download-btn"
                href={downloadURL}
                download={`pixelguard-${file?.name ? file.name.split('.').slice(0, -1).join('.') : 'video'}.${(mediaRecorderRef.current?.mimeType || '').includes('mp4') ? 'mp4' : 'webm'}`}
                className="btn btn-outline btn-lg flex-1 justify-center"
              >
                <Download size={18}/> Download Result
              </a>
            )}
          </div>

          {/* Free tier note */}
          <div className="tier-note">
            <ZoomOut size={13}/>
            <span>Free tier: 1 video/month · 100MB limit · watermarked output. <a href="/pricing">Upgrade for unlimited →</a></span>
          </div>
        </div>
      </div>
    </div>
  )
}
