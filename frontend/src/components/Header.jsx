import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { getStoredSession } from '../services/api';

const Header = () => {
  const history = useHistory();
  const isLoggedIn = Boolean(localStorage.getItem('token') || getStoredSession());

  const onLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('swaas-auth-session');
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
        {isLoggedIn && (
          <nav className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/rppg">RPPG</Link>
          </nav>
        )}
        {isLoggedIn ? <button onClick={onLogout} className="secondary">Logout</button> : <Link to="/">Login</Link>}
      </div>
    </header>
  );
};

export default Header;
