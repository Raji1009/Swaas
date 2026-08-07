/* eslint-disable */
import React from 'react';
import { Link } from 'react-router-dom';
import { getStoredSession, submitMentalHealthData } from '../services/api';

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
    let sum = 0;
    for (let i = 0; i < img.data.length; i += 4) {
      sum += img.data[i + 1];
    }
    const avg = sum / (img.data.length / 4);
    setSignal(prev => [...prev, avg].slice(-220));

    rafRef.current = requestAnimationFrame(captureLoop);
  };

  React.useEffect(() => {
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metrics = React.useMemo(() => {
    if (signal.length < 20) {
      return { bpm: 0 };
    }

    const arr = signal.slice(-180);
    const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
    const centered = arr.map(v => v - mean);
    const std = Math.sqrt(centered.reduce((s, v) => s + v * v, 0) / centered.length) || 1;
    const normalized = centered.map(v => v / (std * 2));

    const smoothed = normalized.map((value, index) => {
      const prev = normalized[index - 1] || value;
      const next = normalized[index + 1] || value;
      return (value + prev + next) / 3;
    });

    const window = 8;
    const peaks = [];
    for (let i = window; i < smoothed.length - window; i++) {
      const current = smoothed[i];
      const isPeak = current > smoothed[i - 1] && current > smoothed[i + 1] && current > 0.25;
      if (isPeak) peaks.push(i);
    }

    let bpm = 0;
    if (peaks.length >= 2) {
      const intervals = [];
      for (let i = 1; i < peaks.length; i++) intervals.push(peaks[i] - peaks[i - 1]);
      const avgInterval = intervals.reduce((s, v) => s + v, 0) / intervals.length;
      const fps = 18;
      bpm = Math.round(Math.max(40, Math.min(180, (fps * 60) / avgInterval)));
    }

    return { bpm };
  }, [signal]);

  const waveformPoints = React.useMemo(() => {
    const values = signal.length > 1 ? signal.slice(-120) : [60, 62];
    const width = 300;
    const height = 140;
    const mid = height / 2;
    return values.map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * width;
      const normalized = (value - 50) / 35;
      const y = mid - normalized * 32;
      return `${x},${y}`;
    }).join(' ');
  }, [signal]);

  React.useEffect(() => {
    if (!metrics.bpm) return;
    const storedSession = getStoredSession();
    if (!storedSession?.patient) return;

    const updatedSession = {
      ...storedSession,
      patient: {
        ...storedSession.patient,
        bpm: metrics.bpm,
        mentalHealthMetrics: {
          anxietyLevel: storedSession.patient.mentalHealthMetrics?.anxietyLevel ?? 0,
          depressionLevel: storedSession.patient.mentalHealthMetrics?.depressionLevel ?? 0,
          stressLevel: storedSession.patient.mentalHealthMetrics?.stressLevel ?? 0,
        },
      },
    };
    localStorage.setItem('swaas-auth-session', JSON.stringify(updatedSession));

    if (storedSession.patient.id) {
      submitMentalHealthData(storedSession.patient.id, {
        bpm: metrics.bpm,
        timestamp: new Date().toISOString(),
      }).catch(() => undefined);
    }
  }, [metrics]);

  return (
    <div className="card">
      <h2>RPPG Camera</h2>
      <p className="muted">The waveform rises and falls with the signal so you can see the pulse clearly. The full trend stays in the patient profile.</p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
        <div style={{ minWidth: 280 }}>
          <video ref={videoRef} style={{ width: 320, height: 240, background: '#000', borderRadius: 8 }} />
          <div className="rppg-controls" style={{ marginTop: 8 }}>
            <button onClick={start} disabled={running}>Start</button>
            <button onClick={stop} disabled={!running} className="secondary">Stop</button>
            <Link to="/dashboard"><button className="secondary">Back to Dashboard</button></Link>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div style={{ width: '100%', maxWidth: 360, background: '#111', color: '#fff', borderRadius: 10, padding: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1' }}>Live pulse waveform</p>
            <div style={{ height: 150, marginTop: 10, background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)', borderRadius: 8, overflow: 'hidden' }}>
              <svg width="100%" height="150" viewBox="0 0 300 140" preserveAspectRatio="none">
                <polyline fill="none" stroke="#22c55e" strokeWidth={2} points={waveformPoints} />
              </svg>
            </div>
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 700 }}>{metrics.bpm || '—'}</div>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94a3b8' }}>Estimated BPM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RppgCamera;
