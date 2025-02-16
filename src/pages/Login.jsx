import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('https://auth-w1cf.onrender.com/api/auth/login', {
        correo,
        password
      });
      const { token } = response.data;
      // Guarda el token en localStorage o en tu gestor de estado (Context, Redux, etc.)
      localStorage.setItem('authToken', token);
      // Redirige al dashboard o donde desees
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      setError('Credenciales inválidas. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={styles.container}>
      <h2 style={styles.title}>Iniciar Sesión</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Correo</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            style={styles.input}
            placeholder="juanperez@example.com"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="123456"
          />
        </div>
        {error && <div style={styles.error}>{error}</div>}
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Ingresando...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '100px auto',
    padding: '2rem',
    background: 'rgba(0,0,0,0.7)',
    borderRadius: '8px',
    color: '#fff',
    boxShadow: '0 0 15px rgba(0,0,0,0.5)'
  },
  title: {
    textAlign: 'center',
    marginBottom: '1.5rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  field: {
    marginBottom: '1rem'
  },
  label: {
    marginBottom: '.5rem',
    fontWeight: 'bold'
  },
  input: {
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem'
  },
  error: {
    color: 'red',
    marginBottom: '1rem',
    textAlign: 'center'
  },
  button: {
    padding: '0.75rem',
    borderRadius: '50px',
    border: '2px solid #00ff99',
    background: 'transparent',
    color: '#00ff99',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

export default Login;
