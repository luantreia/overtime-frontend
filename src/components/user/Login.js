// src/components/auth/Login.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import ErrorMessage from '../ui/FormComponents/ErrorMessage';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      let errorMessage = 'Ocurrió un error al iniciar sesión.';
      if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(error.code)) {
        errorMessage = '❌ Correo electrónico o contraseña incorrectos.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '❌ El formato del correo electrónico no es válido.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = '❌ Demasiados intentos fallidos. Por favor, inténtalo más tarde.';
      }
      setMensaje(errorMessage);
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/dodgeball-hero.jpg')" }}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Contenido del formulario */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-2">
          Bienvenido de nuevo 👋
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Iniciá sesión para continuar con tu equipo
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 text-lg bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 transform hover:scale-[1.02]"
          >
            Ingresar
          </button>

          {mensaje && <ErrorMessage mensaje={mensaje} className="mt-4 text-center" />}
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            ¿No tenés cuenta?{' '}
            <button
              onClick={() => navigate('/registro')}
              className="text-blue-600 font-semibold hover:underline"
            >
              Registrate gratis
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
