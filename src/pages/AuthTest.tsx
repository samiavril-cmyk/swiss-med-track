import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthTest: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Login versucht...');
    
    // Simuliere Login
    setTimeout(() => {
      setMessage('Login erfolgreich! Weiterleitung...');
      navigate('/fmh');
    }, 1000);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Login Test</h1>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label><br />
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label><br />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
          />
        </div>
        <button 
          type="submit"
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
      </form>
      {message && <p style={{ marginTop: '10px', color: '#007bff' }}>{message}</p>}
    </div>
  );
};
