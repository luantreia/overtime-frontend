import React, { useState } from 'react';
import logo from '../../logo.png';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../context/Authcontext';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
  const { user } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log('Usuario desconectado');
        navigate('/login');
      })
      .catch((error) => console.error('Error al desconectar', error));
    setMenuAbierto(false);
  };

  const toggleMenu = () => setMenuAbierto(!menuAbierto);

  // Cambia ruta y cierra menú
  const onSelect = (ruta) => {
    navigate(ruta);
    setMenuAbierto(false);
  };

  const renderBotones = () => (
    <>
      <button className="button" onClick={() => onSelect('/')}>Jugadores</button>
      <button className="button" onClick={() => onSelect('/equipos')}>Equipos</button>

      {user ? (
        <>
          <button className="button" onClick={() => onSelect('/agregar-jugadores-multiple')}>Anotar jugador</button>
          <button className="button" onClick={() => onSelect('/agregar-equipo')}>Anotar Equipo</button>
          <button className="button" onClick={() => onSelect('/perfil')}>Mi perfil</button>

          <button
            className="button"
            style={{ backgroundColor: 'var(--color-error)' }}
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </>
      ) : (
        <>
          <button className="button" onClick={() => onSelect('/login')}>Iniciar sesión</button>
          <button className="button" onClick={() => onSelect('/registro')}>Registrarse</button>
        </>
      )}
    </>
  );

  return (
    <header className="App-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <img src={logo} alt="logo" className="App-logo" />
      </div>

      <div
        className="menu-icon"
        onClick={toggleMenu}
        aria-label="Toggle menu"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && toggleMenu()}
      >
        <div className={`bar ${menuAbierto ? 'bar1' : ''}`}></div>
        <div className={`bar ${menuAbierto ? 'bar2' : ''}`}></div>
        <div className={`bar ${menuAbierto ? 'bar3' : ''}`}></div>
      </div>

      <nav className={`navbar ${menuAbierto ? 'open' : ''}`}>
        {renderBotones()}
      </nav>
    </header>
  );
};

export default NavBar;
