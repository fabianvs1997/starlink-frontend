import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Swal from 'sweetalert2';

const ProtectedRoute: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Verificar si existe un token
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    
    // Opcionalmente, podrías validar el token con el backend
    // pero por ahora solo verificamos que exista
    setIsAuthenticated(true);
    
    // Mostrar un mensaje en la consola para debug
    console.log('Token encontrado:', token);
  }, []);

  // Mientras se verifica el estado de autenticación
  if (isAuthenticated === null) {
    return <div>Verificando sesión...</div>;
  }

  // Si está autenticado, muestra las rutas protegidas
  if (isAuthenticated) {
    return <Outlet />;
  }
  
  // Si no está autenticado, redirige al login
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;