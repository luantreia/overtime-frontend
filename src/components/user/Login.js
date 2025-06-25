import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import ErrorMessage from '../common/FormComponents/ErrorMessage'; // Assuming ErrorMessage will remain a component


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje(''); // Clear previous messages
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMensaje('✅ Inicio de sesión exitoso');
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <form className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm space-y-6" onSubmit={handleLogin}>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Iniciar Sesión</h2>
        
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="sr-only">Correo electrónico</label> {/* Accessible label, visually hidden */}
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

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="sr-only">Contraseña</label> {/* Accessible label, visually hidden */}
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
        
        {/* Submit Button */}
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