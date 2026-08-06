import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    return (
        <div className="card">
            <h1>Raji's Dashboard</h1>
            <p className="muted">Welcome to your mental health metrics and insights.</p>
            <div style={{ marginTop: 16 }}>
                <Link to="/rppg"><button>Open RPPG Camera & Analysis</button></Link>
            </div>
            <div style={{ marginTop: 12 }}>
                <Link to="/patient/1"><button className="secondary">View Sample Patient Profile</button></Link>
            </div>
        </div>
    );
};

export default Dashboard;