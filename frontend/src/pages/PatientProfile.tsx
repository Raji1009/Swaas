import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPatientProfile } from '../services/api';

type Sample = {
    timestamp: string;
    anxiety: number;
    depression: number;
    stress: number;
};

const Chart: React.FC<{ data: number[]; color: string; height?: number; maxWidth?: number }> = ({ data, color, height = 120, maxWidth = 480 }) => {
    if (!data || data.length === 0) return <div>No data</div>;
    // Use a fixed viewBox and allow SVG to scale to container width
    const vw = maxWidth;
    const vh = height;
    const max = Math.max(...data) + 1;
    const min = Math.min(...data) - 1;
    const range = max - min || 1;
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * vw;
        const y = vh - ((v - min) / range) * vh;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="chart-wrapper chart-responsive" style={{ width: '100%', maxWidth: `${maxWidth}px` }}>
            <svg viewBox={`0 0 ${vw} ${vh}`} preserveAspectRatio="none" style={{ width: '100%', height: `${vh}px`, background: '#fff', display: 'block' }}>
                <polyline fill="none" stroke={color} strokeWidth={2} points={points} />
            </svg>
        </div>
    );
};

const PatientProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [patientData, setPatientData] = React.useState<any | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const getPatientProfile = async () => {
            try {
                const data = await fetchPatientProfile(id);
                setPatientData(data);
            } catch (err) {
                setError('Failed to fetch patient profile');
            } finally {
                setLoading(false);
            }
        };

        getPatientProfile();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!patientData) return <div>No patient data found.</div>;

    const samples: Sample[] = patientData.samples || [];
    const timestamps = samples.map(s => new Date(s.timestamp).toLocaleDateString());
    const anxietySeries = samples.map(s => s.anxiety);
    const depressionSeries = samples.map(s => s.depression);
    const stressSeries = samples.map(s => s.stress);

    const title = id === '1' ? "Raji's profile" : `${patientData.name}'s Dashboard`;

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>{title}</h1>
                <Link to="/dashboard"><button>Back to Dashboard</button></Link>
            </div>

            <p>Age: {patientData.age} — Last visit: {new Date(patientData.lastVisit).toLocaleString()}</p>
            <p>{patientData.notes}</p>

            <h2>Historical Mental Health Metrics</h2>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h4>Anxiety</h4>
                    <Chart data={anxietySeries} color="#e74c3c" maxWidth={360} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>{timestamps.map((t, i) => (<div key={i} style={{ fontSize: 11 }}>{t}</div>))}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h4>Depression</h4>
                    <Chart data={depressionSeries} color="#3498db" maxWidth={360} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h4>Stress</h4>
                    <Chart data={stressSeries} color="#f1c40f" maxWidth={360} />
                </div>
            </div>

            <h3 style={{ marginTop: 20 }}>Current Metrics</h3>
            <ul>
                <li>Anxiety: {patientData.mentalHealthMetrics.anxietyLevel}</li>
                <li>Depression: {patientData.mentalHealthMetrics.depressionLevel}</li>
                <li>Stress: {patientData.mentalHealthMetrics.stressLevel}</li>
            </ul>
        </div>
    );
};

export default PatientProfile;