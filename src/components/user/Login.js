import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import InputText from '../common/FormComponents/InputText';
import Button from '../common/FormComponents/Button';
import ErrorMessage from '../common/FormComponents/ErrorMessage';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMensaje('✅ Inicio de sesión exitoso');
    } catch (error) {
      setMensaje('❌ ' + error.message);
    }
  };

  return (
    <div className="wrapper">
      <form className="form" onSubmit={handleLogin}>
        <h2>Iniciar Sesión</h2>
        <InputText
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <InputText
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit">Ingresar</Button>
        <ErrorMessage mensaje={mensaje} />
      </form>
    </div>
  );
};

export default Login;
