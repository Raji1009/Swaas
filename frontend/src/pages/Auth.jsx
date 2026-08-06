import React from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api' });

const Auth = () => {
  const [isLogin, setIsLogin] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [message, setMessage] = React.useState(null);
  const history = useHistory();

  const submit = async e => {
    e.preventDefault();
    setMessage(null);
    try {
      const route = isLogin ? '/login' : '/register';
      const res = await api.post(route, { email, password });
      // store token (mock)
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      setMessage('Success');
      // redirect to dashboard
      history.push('/dashboard');
    } catch (err) {
      setMessage(err?.response?.data?.message || err.message || 'Error');
    }
  };

  return (
    <div className="card auth-card">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 8 }}>
          <label>Email</label>
          <input className="" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
          <button type="button" className="secondary" onClick={() => setIsLogin(s => !s)}>{isLogin ? 'Switch to Register' : 'Switch to Login'}</button>
        </div>
      </form>
      {message && <p className="muted">{message}</p>}
    </div>
  );
};

export default Auth;
