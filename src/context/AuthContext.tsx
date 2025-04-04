import React, { createContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
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
    } catch (error) {
      console.error("Error de login:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setAuth({ token: null, userId: null, loading: false });
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};