import React, { useState } from 'react';
import logo from '../../logo.png';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../common/FormComponents/Button';

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
  const onSelect = (ruta) => {
    navigate(ruta);
    setMenuAbierto(false);
  };

  const renderBotones = () => (
    <>
      <button className="button" onClick={() => onSelect('/jugadores')}>Jugadores</button>
      <button className="button" onClick={() => onSelect('/equipos')}>Equipos</button>
      <button className="button" onClick={() => onSelect('/partidos')}>Partidos</button>

      {user ? (
        <>
          <button className="button" onClick={() => onSelect('/agregar-jugadores-multiple')}>Anotar jugador</button>
          <button className="button" onClick={() => onSelect('/agregar-equipo')}>Anotar Equipo</button>
          <button className="button" onClick={() => onSelect('/agregar-partido')}>Agregar Partido</button>
          <button className="button" onClick={() => onSelect('/perfil')}>Mi perfil</button>

          <Button
            className="button"
            variant="danger"
            onClick={handleLogout}
          >
            Cerrar sesión
          </Button>
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
      <div className="nav-left">
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
