import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import Swal from 'sweetalert2';

const Navbar: React.FC = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const isAuthenticated = !!auth.token;

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro que deseas cerrar tu sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#00ff99',
      cancelButtonColor: '#ff0066',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      background: 'rgba(30, 41, 59, 0.9)',
      color: '#fff'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login');
      }
    });
  };

  return (
    <nav className="futuristic-navbar">
      <div className="futuristic-navbar-container">
        <div className="futuristic-nav-brand">
          <Link to={isAuthenticated ? "/dashboard" : "/"}>STARLINK EQUIPOS</Link>
        </div>
        
        <ul className="futuristic-nav-links">
          {isAuthenticated ? (
            // Menú para usuarios autenticados
            <>
              <li>
                <Link to="/dashboard" className="nav-link">
                  <i className="fas fa-tachometer-alt"></i> Panel de Control
                </Link>
              </li>
              <li>
                <Link to="/stats" className="nav-link">
                  <i className="fas fa-chart-bar"></i> Estadísticas
                </Link>
              </li>
              <li>
                <Link to="/equipos" className="nav-link">
                  <i className="fas fa-list"></i> Lista de Equipos
                </Link>
              </li>
              <li>
                <Link to="/add-equipo" className="nav-link">
                  <i className="fas fa-plus-circle"></i> Agregar Equipo
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout} 
                  className="logout-button"
                >
                  <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            // Menú para usuarios no autenticados
            <li>
              <Link to="/login" className="login-button">
                <i className="fas fa-sign-in-alt"></i> Iniciar Sesión
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;