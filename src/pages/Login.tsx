import React, { useState, useContext, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import Swal from 'sweetalert2';
import './Login.css';

const Login: React.FC = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    correo: 'admin@starlink.com',
    password: 'admin123'
  });
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://www.google.com/recaptcha/enterprise.js?render=6LcPB9kqAAAAAEg_Llt4ejSvsdGeAoyzmwB3Ms2x";
    script.async = true;
    script.onload = () => setRecaptchaLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!recaptchaLoaded) {
      Swal.fire({
        icon: 'error',
        title: 'reCAPTCHA no está listo',
        text: 'Por favor, espera a que se cargue reCAPTCHA',
        background: 'rgba(0,0,0,0.8)',
        color: '#fff'
      });
      return;
    }

    try {
      const recaptchaToken = await new Promise<string>((resolve, reject) => {
        (window as any).grecaptcha.enterprise.ready(() => {
          (window as any).grecaptcha.enterprise
            .execute('6LcPB9kqAAAAAEg_Llt4ejSvsdGeAoyzmwB3Ms2x', { action: 'LOGIN' })
            .then(resolve)
            .catch(reject);
        });
      });

      await login({
        ...credentials,
        recaptchaToken
      });

      navigate('/dashboard');
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error de Inicio de Sesión',
        text: error.message || 'Ocurrió un error al iniciar sesión',
        background: 'rgba(0,0,0,0.8)',
        color: '#fff'
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Starlink Equipos</h2>
        {!recaptchaLoaded && (
          <div className="error-message">
            Cargando reCAPTCHA...
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <label>Correo Electrónico</label>
          <input
            type="email"
            name="correo"
            value={credentials.correo}
            onChange={handleChange}
            placeholder="Ingrese su correo"
            required
          />

          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Ingrese su contraseña"
            required
          />

          <button 
            type="submit" 
            disabled={!recaptchaLoaded}
          >
            {recaptchaLoaded ? 'Iniciar Sesión' : 'Cargando...'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;