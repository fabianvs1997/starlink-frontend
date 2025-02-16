// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  // Al enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!window.grecaptcha) {
      alert("reCAPTCHA no está listo. Revisa si cargó el script en index.html");
      return;
    }

    try {
      // 1) Esperar a que grecaptcha esté listo
      window.grecaptcha.enterprise.ready(async () => {
        // 2) Ejecutar con tu site key y la acción
        const tokenRecaptcha = await window.grecaptcha.enterprise.execute("6LcPB9kqAAAAAEg_Llt4ejSvsdGeAoyzmwB3Ms2x", {
          action: "LOGIN"
        });

        // 3) Llamar a la función login con (correo, password, tokenRecaptcha)
        await login(correo, password, tokenRecaptcha);
        navigate('/');
      });
    } catch (error) {
      console.error('Error de login:', error);
      alert('Credenciales inválidas o reCAPTCHA fallido.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <label>Correo</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="juanperez@example.com"
            required
          />

          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="123456"
            required
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}


