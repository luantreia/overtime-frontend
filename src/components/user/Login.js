// src/components/auth/Login.js

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import ErrorMessage from '../common/FormComponents/ErrorMessage';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMensaje('✅ Inicio de sesión exitoso');
      setTimeout(() => navigate('/inicio'), 1000); // Redirigir tras 1 segundo
    } catch (error) {
      let errorMessage = 'Ocurrió un error al iniciar sesión.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = '❌ Correo electrónico o contraseña incorrectos.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '❌ El formato del correo electrónico no es válido.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = '❌ Demasiados intentos fallidos. Por favor, inténtalo de nuevo más tarde.';
      }
      setMensaje(errorMessage);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Iniciar Sesión</h2>

        <div>
          <label htmlFor="email" className="sr-only">Correo electrónico</label>
          <input
            type="email"
            id="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="sr-only">Contraseña</label>
          <input
            type="password"
            id="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 text-lg bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Ingresar
        </button>

        {mensaje && <ErrorMessage mensaje={mensaje} className="mt-4 text-center" />}
      </form>
    </div>
  );
};

export default Login;
