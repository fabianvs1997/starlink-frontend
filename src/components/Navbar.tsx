import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="futuristic-navbar">
      <div className="futuristic-navbar-container">
        <div className="futuristic-nav-brand">
          <Link to="/">STARLINK EQUIPOS</Link>
        </div>
        <ul className="futuristic-nav-links">
          <li>
            <Link to="/dashboard">Panel de Control</Link>
          </li>
          <li>
            <Link to="/stats">Estadísticas</Link>
          </li>
          <li>
            <Link to="/add-equipo">Agregar Equipo</Link>
          </li>
          <li>
            <Link to="/equipos">Lista de Equipos</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;