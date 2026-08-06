/* eslint-disable */
import React from 'react';
import { Link } from 'react-router-dom';

const RppgCamera = () => {
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [running, setRunning] = React.useState(false);
  const [signal, setSignal] = React.useState([]);
  const rafRef = React.useRef(null);

  const start = async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setRunning(true);
      captureLoop();
    } catch (err) {
      console.error('Camera error', err);
    }
  };

  const stop = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const mediaStream = videoRef.current.srcObject;
      const tracks = mediaStream.getTracks ? mediaStream.getTracks() : [];
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setRunning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const captureLoop = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 160;
    const h = 120;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h);
    // compute mean green channel
    let sum = 0;
    for (let i = 0; i < img.data.length; i += 4) {
      sum += img.data[i + 1];
    }
    const avg = sum / (img.data.length / 4);
    setSignal(prev => {
      const next = [...prev, avg].slice(-300);
      return next;
    });

    rafRef.current = requestAnimationFrame(captureLoop);
  };

  React.useEffect(() => {
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // naive BPM estimate using peak detection on signal
  const estimateBPM = React.useMemo(() => {
    if (signal.length < 60) return 0;
    // normalize
    const arr = signal.slice(-300);
    const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
    const std = Math.sqrt(arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length) || 1;
    // find peaks
    const peaks = [];
    for (let i = 1; i < arr.length - 1; i++) {
      if (arr[i] > arr[i - 1] && arr[i] > arr[i + 1] && arr[i] > mean + 0.5 * std) {
        peaks.push(i);
      }
    }
    if (peaks.length < 2) return 0;
    // compute average interval (samples) between peaks and convert to BPM
    const intervals = [];
    for (let i = 1; i < peaks.length; i++) intervals.push(peaks[i] - peaks[i - 1]);
    const avgInterval = intervals.reduce((s, v) => s + v, 0) / intervals.length;
    // sampling rate is ~30 fps (captureLoop runs at camera fps) — approximate
    const fps = 30;
    const bpm = (fps * 60) / avgInterval;
    return Math.round(bpm);
  }, [signal]);

  return (
    <div className="card">
      <h2>RPPG Camera</h2>
      <div style={{ display: 'flex', gap: 16 }}>
        <div>
          <video ref={videoRef} style={{ width: 320, height: 240, background: '#000', borderRadius: 6 }} />
          <div className="rppg-controls">
            <button onClick={start} disabled={running}>Start</button>
            <button onClick={stop} disabled={!running} className="secondary">Stop</button>
            <Link to="/dashboard"><button className="secondary">Back to Dashboard</button></Link>
          </div>
        </div>
        <div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div style={{ width: 360, height: 240, overflow: 'auto', border: '1px solid #ddd', padding: 8 }}>
            <p className="small">Live signal (last {signal.length} samples)</p>
            <div style={{ height: 120, width: 320, background: '#111' }}>
              <svg width="320" height="120">
                <polyline
                  fill="none"
                  stroke="#0f0"
                  strokeWidth={1}
                  points={signal.map((v, i) => `${(i / Math.max(1, signal.length - 1)) * 320},${120 - ((v - 50) * 2)}`).join(' ')}
                />
              </svg>
            </div>
            <p style={{ marginTop: 8 }} className="small">Estimated BPM: <strong>{estimateBPM || '—'}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RppgCamera;
