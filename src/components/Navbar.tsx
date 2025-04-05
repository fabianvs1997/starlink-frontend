import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return (
    <nav className="futuristic-navbar">
      <div className="futuristic-navbar-container">
        <div className="futuristic-nav-brand">
          <Link to="/dashboard">STARLINK EQUIPOS</Link>
        </div>
        
        <ul className="futuristic-nav-links">
          <li>
            <Link to="/dashboard">
              Panel de Control
            </Link>
          </li>
          <li>
            <Link to="/stats">
              Estadísticas
            </Link>
          </li>
          <li>
            <Link to="/equipos">
              Lista de Equipos
            </Link>
          </li>
          <li>
            <Link to="/add-equipo">
              Agregar Equipo
            </Link>
          </li>
          <li>
            <button 
              onClick={handleLogout} 
              style={{
                background: 'transparent',
                border: '2px solid #ff3366',
                color: '#ff3366',
                borderRadius: '50px',
                padding: '0.45rem 1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Cerrar Sesión
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;