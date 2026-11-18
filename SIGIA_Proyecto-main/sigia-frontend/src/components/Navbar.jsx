import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/dashboard" className="navbar-brand">
        📦 SIGIA
        <span className="brand-sub">Patrones de Diseño</span>
      </NavLink>
      <div className="navbar-links">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
        >
          🏠 Dashboard
        </NavLink>
        <NavLink
          to="/pedidos"
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
        >
          📋 Pedidos
        </NavLink>
        <NavLink
          to="/alertas"
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
        >
          🔔 Alertas
        </NavLink>
      </div>
    </nav>
  );
}
