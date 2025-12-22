import React from 'react';
import { Link, useHistory } from 'react-router-dom';

const Header: React.FC = () => {
  const history = useHistory();

  const onLogout = () => {
    try {
      localStorage.removeItem('token');
    } catch (e) {
      // ignore
    }
    history.push('/');
  };

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="brand">Swaas</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <nav className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/rppg">RPPG</Link>
        </nav>
        <button onClick={onLogout} className="secondary">Logout</button>
      </div>
    </header>
  );
};

export default Header;
