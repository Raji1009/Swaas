import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPatientProfile, getStoredSession } from '../services/api';

const formatValue = (value, fallback = 'No data yet') => {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }
    return value;
};

const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString();
};

const buildHistory = (patient) => {
    const samples = Array.isArray(patient?.samples) ? patient.samples : [];
    if (samples.length > 0) {
        return samples.map(sample => ({
            ...sample,
            timestamp: sample.timestamp || patient?.lastVisit,
            anxiety: sample.anxiety ?? patient?.mentalHealthMetrics?.anxietyLevel ?? null,
            depression: sample.depression ?? patient?.mentalHealthMetrics?.depressionLevel ?? null,
            stress: sample.stress ?? patient?.mentalHealthMetrics?.stressLevel ?? null,
            bpm: sample.bpm ?? patient?.bpm ?? null,
        }));
    }

    const metrics = patient?.mentalHealthMetrics || {};
    return [{
        timestamp: patient?.lastVisit || new Date().toISOString(),
        anxiety: metrics.anxietyLevel ?? null,
        depression: metrics.depressionLevel ?? null,
        stress: metrics.stressLevel ?? null,
        bpm: patient?.bpm ?? null,
    }].filter(sample => sample.anxiety !== null || sample.depression !== null || sample.stress !== null || sample.bpm !== null);
};

const Chart = ({ data, color, height = 120, maxWidth = 360 }) => {
    const validData = (data || []).filter(value => value !== null && value !== undefined && Number.isFinite(value));
    if (validData.length === 0) return <div style={{ color: '#888', padding: '12px 0' }}>No data</div>;

    const vw = maxWidth;
    const vh = height;
    const max = Math.max(...validData) + 1;
    const min = Math.min(...validData) - 1;
    const range = max - min || 1;
    const points = validData.map((value, index) => {
        const x = (index / Math.max(1, validData.length - 1)) * vw;
        const y = vh - ((value - min) / range) * vh;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="chart-wrapper chart-responsive" style={{ width: '100%', maxWidth: `${maxWidth}px` }}>
            <svg viewBox={`0 0 ${vw} ${vh}`} preserveAspectRatio="none" style={{ width: '100%', height: `${vh}px`, background: '#fff', display: 'block', borderRadius: 6 }}>
                <polyline fill="none" stroke={color} strokeWidth={2.2} points={points} />
            </svg>
        </div>
    );
};

const PatientProfile = () => {
    const { id } = useParams();
    const session = getStoredSession();
    const [patientData, setPatientData] = React.useState(session?.patient || null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const profileId = id || session?.patient?.id || '1';

    React.useEffect(() => {
        const getPatientProfile = async () => {
            try {
                const data = await fetchPatientProfile(profileId);
                setPatientData(data || session?.patient || null);
            } catch (err) {
                setError('Failed to fetch patient profile');
            } finally {
                setLoading(false);
            }
        };

        getPatientProfile();
    }, [profileId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!patientData) return <div>No patient data found.</div>;

    const history = buildHistory(patientData);
    const latestSample = history[history.length - 1] || {};
    const currentMetrics = {
        anxiety: patientData?.mentalHealthMetrics?.anxietyLevel ?? latestSample.anxiety ?? null,
        depression: patientData?.mentalHealthMetrics?.depressionLevel ?? latestSample.depression ?? null,
        stress: patientData?.mentalHealthMetrics?.stressLevel ?? latestSample.stress ?? null,
        bpm: patientData?.bpm ?? latestSample.bpm ?? null,
    };

    const title = patientData.name ? `${patientData.name}'s Profile` : 'Patient Profile';

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <h1>{title}</h1>
                <Link to="/dashboard"><button>Back to Dashboard</button></Link>
            </div>

            <div style={{ padding: '12px 0', borderBottom: '1px solid #eaeaea', marginBottom: 12 }}>
                <p style={{ margin: '4px 0' }}><strong>Name:</strong> {formatValue(patientData.name, 'Unnamed patient')}</p>
                <p style={{ margin: '4px 0' }}><strong>Age:</strong> {formatValue(patientData.age, '—')} </p>
                <p style={{ margin: '4px 0' }}><strong>Email:</strong> {formatValue(patientData.email, '—')}</p>
                <p style={{ margin: '4px 0' }}><strong>Last visit:</strong> {formatDate(patientData.lastVisit)}</p>
            </div>

            <div style={{ marginBottom: 16 }}>
                <h3 style={{ marginBottom: 6 }}>Notes</h3>
                <p style={{ margin: 0, color: '#555' }}>{patientData.notes ? patientData.notes : 'No notes provided.'}</p>
            </div>

            <h2>Historical Mental Health Metrics</h2>
            <p className="muted">The timeline below uses the dates from each reading so changes can be compared over time.</p>
            {history.length > 0 ? (
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                        <h4>Anxiety</h4>
                        <Chart data={history.map(sample => sample.anxiety)} color="#e74c3c" maxWidth={320} />
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                            {history.map(sample => formatDate(sample.timestamp)).join(' • ')}
                        </div>
                    </div>
                    <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                        <h4>Depression</h4>
                        <Chart data={history.map(sample => sample.depression)} color="#3498db" maxWidth={320} />
                    </div>
                    <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                        <h4>Stress</h4>
                        <Chart data={history.map(sample => sample.stress)} color="#f1c40f" maxWidth={320} />
                    </div>
                </div>
            ) : (
                <p>No history yet. Capture a reading from the RPPG page to start building the timeline.</p>
            )}

            <h3 style={{ marginTop: 20 }}>Current Metrics</h3>
            <ul>
                <li><strong>Anxiety:</strong> {formatValue(currentMetrics.anxiety, 'No data yet')}</li>
                <li><strong>Depression:</strong> {formatValue(currentMetrics.depression, 'No data yet')}</li>
                <li><strong>Stress:</strong> {formatValue(currentMetrics.stress, 'No data yet')}</li>
                <li><strong>BPM:</strong> {formatValue(currentMetrics.bpm, 'No data yet')}</li>
            </ul>
        </div>
    );
};

export default PatientProfile;