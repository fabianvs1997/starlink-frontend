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
  const [errorMessage, setErrorMessage] = useState(''); // Estado para el error

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!window.grecaptcha) {
      setErrorMessage("reCAPTCHA no está listo. Revisa si cargó el script en index.html");
      return;
    }

    try {
      window.grecaptcha.enterprise.ready(async () => {
        const tokenRecaptcha = await window.grecaptcha.enterprise.execute(
          "6LcPB9kqAAAAAEg_Llt4ejSvsdGeAoyzmwB3Ms2x",
          { action: "LOGIN" }
        );

        // Llamamos a la función login con (correo, password, tokenRecaptcha)
        await login(correo, password, tokenRecaptcha);
        navigate('/');
      });
    } catch (error) {
      console.error('Error de login:', error);

      // Si el backend retorna un status 401, 400, etc., podemos detectarlo así:
      if (error.response) {
        if (error.response.status === 401) {
          setErrorMessage("Credenciales inválidas");
        } else if (error.response.status === 400) {
          setErrorMessage("Faltan credenciales o petición inválida");
        } else {
          setErrorMessage(`Error ${error.response.status}: ${error.response.data}`);
        }
      } else {
        setErrorMessage('Error de login o reCAPTCHA fallido.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>

        {/* Si hay un mensaje de error, lo mostramos */}
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}

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
