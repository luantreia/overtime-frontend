import React, { useState } from 'react';
import logo from '../../logo.png';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const NavBar = ({ setActivo }) => {
  const { user } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = () => {
    signOut(auth)
      .then(() => console.log('Usuario desconectado'))
      .catch((error) => console.error('Error al desconectar', error));
    setMenuAbierto(false);
  };

  const toggleMenu = () => setMenuAbierto(!menuAbierto);

  // Cierra menú al elegir opción y cambia pantalla
  const onSelect = (seccion) => {
    setActivo(seccion);
    setMenuAbierto(false);
  };

  const renderBotones = () => (
    <>
      <button className="button" onClick={() => onSelect('jugadores')}>Jugadores</button>
      <button className="button" onClick={() => onSelect('equipos')}>Equipos</button>

      {user ? (
        <>
          
          <button className="button" onClick={() => onSelect('AgregarJugadoresMultiple')}>Anotar jugador</button>
          <button className="button" onClick={() => onSelect('AgregarEquipo')}>Anotar Equipo</button>
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
          <button className="button" onClick={() => onSelect('login')}>Iniciar sesión</button>
          <button className="button" onClick={() => onSelect('registro')}>Registrarse</button>
        </>
      )}
    </>
  );

  return (
    <header className="App-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <img src={logo} alt="logo" className="App-logo" />
      </div>

      <div className="menu-icon" onClick={toggleMenu} aria-label="Toggle menu" role="button" tabIndex={0}
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
