// src/pages/LandingPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/FormComponents/Button';

const NAVBAR_HEIGHT = 140; // ajustá según la altura real de tu navbar

const LandingPage = () => {
  const navigate = useNavigate();

  // Estilos comunes para los botones
  const baseBtnStyle = {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    cursor: 'pointer',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  };

  return (
    <div
      style={{
        height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f5f5f5',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Bienvenido a OVERTIME</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        La forma más fácil de anotar y seguir tus partidos de dodgeball.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button
          onClick={() => navigate('/registro')}
          variant='success'
        >
          Registrarse
        </Button>

        <Button
          onClick={() => navigate('/login')}
          variant='primary'
        >
          Iniciar sesión
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
