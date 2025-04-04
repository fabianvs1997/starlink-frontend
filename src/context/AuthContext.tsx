
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AuthContextType, AuthState, LoginCredentials } from '@/types';

export const AuthContext = createContext<AuthContextType>({
  auth: { token: null, userId: null, loading: true },
  login: async () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ 
    token: null, 
    userId: null, 
    loading: true 
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      validateAndRefreshToken(storedToken);
    } else {
      setAuth({ token: null, userId: null, loading: false });
      if (location.pathname !== "/login") {
        navigate("/login");
      }
    }
  }, []);

  const validateAndRefreshToken = async (token: string) => {
    try {
      const validateResponse = await axios.post(
        "https://auth-w1cf.onrender.com/api/auth/validate",
        { token }
      );

      if (validateResponse.data.message === "Token válido") {
        const userId = validateResponse.data.userId;
        const refreshResponse = await axios.post(
          "https://auth-w1cf.onrender.com/api/tokens/refresh",
          { token }
        );
        const newToken = refreshResponse.data.token;
        localStorage.setItem("authToken", newToken);
        setAuth({ token: newToken, userId, loading: false });
      } else {
        logout();
      }
    } catch (error) {
      console.error("Error validando o refrescando token:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error de Sesión',
        text: 'No se pudo validar tu sesión. Inicia sesión de nuevo.',
        background: 'rgba(0,0,0,0.8)',
        color: '#fff'
      });
      logout();
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await axios.post(
        "https://auth-w1cf.onrender.com/api/auth/login", 
        credentials
      );
      const token = response.data.token;
      await validateAndRefreshToken(token);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error de login:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error de Inicio de Sesión',
        text: error?.response?.data?.message || error.message || 'Ocurrió un error al iniciar sesión',
        background: 'rgba(0,0,0,0.8)',
        color: '#fff'
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setAuth({ token: null, userId: null, loading: false });
    Swal.fire({
      icon: 'info',
      title: 'Sesión cerrada',
      text: 'Has sido desconectado',
      background: 'rgba(0,0,0,0.8)',
      color: '#fff',
      timer: 2000,
      showConfirmButton: false
    });
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};