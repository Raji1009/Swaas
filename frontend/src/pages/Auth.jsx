import React from 'react';
import { useHistory } from 'react-router-dom';
import { login, register, resetPassword } from '../services/api';

const Auth = () => {
  const [isLogin, setIsLogin] = React.useState(true);
  const [name, setName] = React.useState('');
  const [age, setAge] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [showReset, setShowReset] = React.useState(false);
  const [message, setMessage] = React.useState(null);
  const history = useHistory();

  const submit = async e => {
    e.preventDefault();
    setMessage(null);
    try {
      if (showReset) {
        const data = await resetPassword({ email, newPassword });
        setMessage(data.message || 'Password reset successful');
        setShowReset(false);
        setNewPassword('');
        return;
      }

      const authenticate = isLogin ? login : register;
      const payload = isLogin ? { email, password } : { email, password, name, age };
      const data = await authenticate(payload);
      if (data && data.token) {
        localStorage.setItem('token', data.token);
      }
      setMessage(isLogin ? 'Login successful' : 'Registration successful');
      history.push('/dashboard');
    } catch (err) {
      setMessage(err.message || 'Error');
    }
  };

  return (
    <div className="card auth-card">
      <h2>{showReset ? 'Reset Password' : isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={submit}>
        {!isLogin && (
          <>
            <div style={{ marginBottom: 8 }}>
              <label>Full name</label>
              <input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>Age</label>
              <input value={age} onChange={e => setAge(e.target.value)} type="number" min="1" max="120" required />
            </div>
          </>
        )}
        <div style={{ marginBottom: 8 }}>
          <label>Email / Login ID</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required />
        </div>
        {!showReset && (
          <div style={{ marginBottom: 8 }}>
            <label>Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required />
          </div>
        )}
        {showReset && (
          <div style={{ marginBottom: 8 }}>
            <label>New password</label>
            <input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" required />
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">{showReset ? 'Reset Password' : isLogin ? 'Login' : 'Register'}</button>
          {!showReset && (
            <button type="button" className="secondary" onClick={() => setIsLogin(s => !s)}>{isLogin ? 'Switch to Register' : 'Switch to Login'}</button>
          )}
        </div>
        {isLogin && !showReset && (
          <p style={{ marginTop: 8 }}>
            <button type="button" className="secondary" onClick={() => setShowReset(true)}>Forgot password?</button>
          </p>
        )}
        {showReset && (
          <p style={{ marginTop: 8 }}>
            <button type="button" className="secondary" onClick={() => setShowReset(false)}>Back to login</button>
          </p>
        )}
      </form>
      {message && <p className="muted">{message}</p>}
    </div>
  );
};

export default Auth;
