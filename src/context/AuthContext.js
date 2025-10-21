// src/context/AuthContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { esperarYDespertarBackend } from '../utils/backendUtils';

const AuthContext = createContext();
export { AuthContext }; // <-- 👈 NECESARIO para usar useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [token, setToken] = useState(null); // <-- nuevo estado

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        try {
          // Intentar obtener un token fresco
          const token = await user.getIdToken(true); // forceRefresh = true
          setToken(token);
          localStorage.setItem('token', token);

          // Verificar que el token funcione
          const res = await fetch('https://overtime-ddyl.onrender.com/api/usuarios/mi-perfil', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            setRol(data.rol);
          } else {
            // Si el token no funciona, intentar refrescar
            console.warn('Token inválido, intentando refrescar...');
            const freshToken = await user.getIdToken(true);
            setToken(freshToken);
            localStorage.setItem('token', freshToken);

            // Reintentar con token fresco
            const retryRes = await fetch('https://overtime-ddyl.onrender.com/api/usuarios/mi-perfil', {
              headers: {
                Authorization: `Bearer ${freshToken}`,
              },
            });

            if (retryRes.ok) {
              const data = await retryRes.json();
              setRol(data.rol);
            } else {
              throw new Error('Token fresco también inválido');
            }
          }
        } catch (error) {
          console.error('Error al obtener el rol del usuario:', error);
          // Limpiar tokens inválidos
          setToken(null);
          setRol(null);
          localStorage.removeItem('token');
        }
      } else {
        setToken(null);
        setRol(null);
        localStorage.removeItem('token');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      esperarYDespertarBackend();
    }
  }, [user]);


  return (
    <AuthContext.Provider value={{ user, rol, token }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}
