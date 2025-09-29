import React, { useState } from 'react';

const fadeIn = {
  animation: 'fadeIn 0.8s ease forwards',
  opacity: 0,
};

const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
  },
  box: {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '30px 40px',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    width: '350px',
    maxWidth: '90vw',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
  },
  title: {
    marginBottom: '20px',
    fontWeight: '700',
    fontSize: '1.8rem',
  },
  input: {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    borderRadius: '8px',
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
  },
  button: {
    marginTop: '20px',
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: '#764ba2',
    color: '#fff',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
  buttonHover: {
    background: '#667eea',
  },
  toggleText: {
    marginTop: '15px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    color: '#ddd',
  },
  error: {
    color: '#ff6b6b',
    marginTop: '10px',
    fontWeight: '600',
  },
  success: {
    color: '#4ade80',
    marginTop: '10px',
    fontWeight: '600',
  }
};

const animationStyle = `
@keyframes fadeIn {
  to {opacity: 1;}
}
`;

function Register({ onSwitch }) {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Registration failed' });
      } else {
        setMessage({ type: 'success', text: `Welcome, ${data.user.username}!` });
        setForm({ username: '', email: '', password: '' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Server error' });
    }
    setLoading(false);
  };

  return (
    <div style={{ ...styles.box, ...fadeIn }}>
      <h2 style={styles.title}>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={styles.input}
          required
          minLength={6}
        />
        <button style={styles.button} disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {message && (
        <p style={message.type === 'error' ? styles.error : styles.success}>{message.text}</p>
      )}
      <p style={styles.toggleText} onClick={onSwitch}>
        Already have an account? <b>Login</b>
      </p>
    </div>
  );
}

function Login({ onSwitch }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:7000/api/login', { // สมมติ backend มี /api/login
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Login failed' });
      } else {
        setMessage({ type: 'success', text: `Welcome back!` });
        // ทำอะไรต่อ เช่น save token, redirect ฯลฯ
      }
    } catch {
      setMessage({ type: 'error', text: 'Server error' });
    }
    setLoading(false);
  };

  return (
    <div style={{ ...styles.box, ...fadeIn }}>
      <h2 style={styles.title}>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <button style={styles.button} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {message && (
        <p style={message.type === 'error' ? styles.error : styles.success}>{message.text}</p>
      )}
      <p style={styles.toggleText} onClick={onSwitch}>
        Don't have an account? <b>Register</b>
      </p>
    </div>
  );
}

export default function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      <style>{animationStyle}</style>
      <div style={styles.container}>
        {isLogin ? (
          <Login onSwitch={() => setIsLogin(false)} />
        ) : (
          <Register onSwitch={() => setIsLogin(true)} />
        )}
      </div>
    </>
  );
}
