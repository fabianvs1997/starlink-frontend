import React, { createContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContextType, AuthState, LoginCredentials } from '@/types';
import Swal from 'sweetalert2';

export const AuthContext = createContext<AuthContextType>({
  auth: { token: null, userId: null, loading: true },
  login: async () => {},
  logout: () => {}
});

// Función para verificar si el token está expirado
const isTokenExpired = (token: string): boolean => {
  try {
    // Decodificar la parte del payload del token (la segunda parte)
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    
    // Verificar si hay una fecha de expiración
    if (!decodedPayload.exp) return true;
    
    // Comparar la fecha de expiración con la fecha actual
    const expirationDate = new Date(decodedPayload.exp * 1000);
    return expirationDate < new Date();
  } catch (error) {
    console.error('Error al verificar expiración del token:', error);
    return true; // Si hay algún error, consideramos que el token ha expirado
  }
};

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
      console.log("Token encontrado en localStorage");
      
      // Verificar si el token ha expirado
      if (isTokenExpired(storedToken)) {
        console.log('Token expirado, redirigiendo a login');
        logout();
      } else {
        console.log("Validando token con el servidor...");
        validateAndRefreshToken(storedToken);
      }
    } else {
      console.log("No se encontró token en localStorage");
      setAuth({ token: null, userId: null, loading: false });
      if (location.pathname !== "/login") {
        navigate("/login");
      }
    }
  }, []);

  const validateAndRefreshToken = async (token: string) => {
    try {
      console.log("Enviando solicitud de validación de token...");
      const validateResponse = await axios.post(
        "https://auth-w1cf.onrender.com/api/auth/validate",
        { token },
        { timeout: 10000 } // Aumentar el timeout para evitar problemas de red
      );

      console.log("Respuesta de validación:", validateResponse.data);

      if (validateResponse.data.message === "Token válido") {
        const userId = validateResponse.data.userId;
        
        try {
          console.log("Solicitando renovación de token...");
          const refreshResponse = await axios.post(
            "https://auth-w1cf.onrender.com/api/tokens/refresh",
            { token },
            { timeout: 10000 }
          );
          
          console.log("Token renovado exitosamente");
          const newToken = refreshResponse.data.token;
          localStorage.setItem("authToken", newToken);
          setAuth({ token: newToken, userId, loading: false });
        } catch (refreshError) {
          console.error("Error al refrescar token:", refreshError);
          // Si no se puede renovar pero el token es válido, continuar con el token actual
          setAuth({ token, userId, loading: false });
        }
      } else {
        console.log("Token no válido según el servidor");
        logout();
      }
    } catch (error) {
      console.error("Error validando o refrescando token:", error);
      
      // Si el error es por timeout o problemas de red, permitir continuar con el token actual
      // en lugar de forzar el logout
      if (axios.isAxiosError(error) && (error.code === 'ECONNABORTED' || !error.response)) {
        console.log("Error de conexión, usando token almacenado temporalmente");
        
        try {
          // Intentar extraer el userId del token
          const payload = token.split('.')[1];
          const decodedPayload = JSON.parse(atob(payload));
          const userId = decodedPayload.id || decodedPayload.userId || decodedPayload.sub;
          
          setAuth({ token, userId, loading: false });
          
          // Mostrar una advertencia al usuario
          Swal.fire({
            icon: 'warning',
            title: 'Problemas de conexión',
            text: 'No se pudo verificar tu sesión. Algunas funciones podrían estar limitadas.'
          });
        } catch (e) {
          logout();
        }
      } else {
        logout();
      }
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log("Intentando iniciar sesión con:", credentials.correo);
      
      // Verificar si estamos en modo de desarrollo o mockeo
      if (import.meta.env.VITE_USE_MOCK === 'true') {
        console.log("Usando mock de autenticación para desarrollo");
        // Token temporal para desarrollo
        const mockToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdGFybGluay1lcXVpcG9zIiwiaWF0IjoxNjgwMDAwMDAwLCJleHAiOjE4MDAwMDAwMDAsImF1ZCI6Ind3dy5zdGFybGluay1lcXVpcG9zLmNvbSIsInN1YiI6ImRldkB0ZXN0LmNvbSIsImlkIjoiMTIzNDU2Nzg5MCJ9.SomeRandomSignature";
        localStorage.setItem("authToken", mockToken);
        setAuth({ token: mockToken, userId: "123456789", loading: false });
        navigate("/dashboard");
        return;
      }
      
      const response = await axios.post(
        "https://auth-w1cf.onrender.com/api/auth/login", 
        credentials,
        { timeout: 15000 } // Aumentar timeout para login
      );
      
      console.log("Respuesta de login:", response.data);
      
      const token = response.data.token;
      if (!token) {
        throw new Error("No se recibió un token de autenticación");
      }
      
      await validateAndRefreshToken(token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error de login:", error);
      
      // Extraer mensaje de error más detallado
      let errorMessage = "Error al iniciar sesión. Por favor, intenta nuevamente.";
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          errorMessage = "Tiempo de espera agotado. El servidor no responde.";
        } else if (error.response) {
          errorMessage = error.response.data.message || error.message;
        } else if (error.request) {
          errorMessage = "No se pudo conectar con el servidor de autenticación.";
        }
      }
      
      throw new Error(errorMessage);
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