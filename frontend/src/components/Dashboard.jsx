import React from 'react';
import { Link } from 'react-router-dom';
import { getStoredSession } from '../services/api';

const Dashboard = () => {
    const session = getStoredSession();
    const patient = session?.patient;
    const patientId = patient?.id || '1';

    return (
        <div className="card">
            <h1>{patient?.name ? `${patient.name}'s Dashboard` : 'Patient Dashboard'}</h1>
            <p className="muted">Welcome back. Choose an action below.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
                <Link to="/rppg"><button>Open RPPG Camera</button></Link>
                <Link to={`/patient/${patientId}`}><button className="secondary">Patients Dashboard</button></Link>
            </div>
        </div>
    );
};

export default Dashboard;