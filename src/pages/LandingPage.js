// src/pages/LandingPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NAVBAR_HEIGHT = '140px'; // Using string for CSS variable calculation if needed

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col justify-center items-center bg-gray-100 p-5 text-center"
      style={{ minHeight: `calc(100vh - ${NAVBAR_HEIGHT})` }}
    >
      <h1 className="text-5xl font-extrabold text-gray-800 mb-2 sm:text-6xl md:text-7xl">
        Bienvenido a OVERTIME
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto sm:text-xl md:text-2xl">
        La forma más fácil de anotar y seguir tus partidos de dodgeball.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Registrarse Button */}
        <button
          onClick={() => navigate('/registro')}
          className="px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 transform hover:scale-105"
        >
          Registrarse
        </button>

        {/* Iniciar sesión Button */}
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105"
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  );
};

export default LandingPage;