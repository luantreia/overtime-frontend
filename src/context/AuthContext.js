// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { esperarYDespertarBackend } from '../utils/backendUtils';
import { fetchWithAuth, setAuthTokens, getAuthTokens } from '../utils/apiClient';

const AuthContext = createContext();
export { AuthContext }; // <-- 👈 NECESARIO para usar useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [token, setToken] = useState(null);

  // Decodificar JWT (simple base64) para extraer sub (id)
  function decodeJwt(token) {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  // Inicialización: cargar tokens de storage y obtener perfil
  useEffect(() => {
    const init = async () => {
      const { accessToken } = getAuthTokens();
      if (!accessToken) {
        setUser(null);
        setRol(null);
        setToken(null);
        return;
      }
      setToken(accessToken);
      try {
        const res = await fetchWithAuth('/api/usuarios/mi-perfil');
        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();
        const decoded = decodeJwt(accessToken) || {};
        setRol(data.rol || null);
        // Formar un objeto user compatible con el resto de la app
        setUser({
          uid: decoded.sub,
          id: decoded.sub,
          email: data.email,
          nombre: data.nombre,
        });
      } catch (e) {
        // Limpiar si el token no sirve
        setAuthTokens({ accessToken: null, refreshToken: null });
        setUser(null);
        setRol(null);
        setToken(null);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (user) {
      esperarYDespertarBackend();
    }
  }, [user]);

  // Login
  const login = async (email, password) => {
    const res = await fetch('https://overtime-ddyl.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'No se pudo iniciar sesión');
    }
    const data = await res.json();
    setAuthTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    setToken(data.accessToken);
    // Cargar perfil
    const perfilRes = await fetchWithAuth('/api/usuarios/mi-perfil');
    const perfil = await perfilRes.json();
    const decoded = decodeJwt(data.accessToken) || {};
    setRol(perfil.rol || null);
    setUser({ uid: decoded.sub, id: decoded.sub, email: perfil.email, nombre: perfil.nombre });
    return true;
  };

  // Registro
  const register = async (nombre, email, password) => {
    const res = await fetch('https://overtime-ddyl.onrender.com/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'No se pudo registrar');
    }
    const data = await res.json();
    setAuthTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    setToken(data.accessToken);
    // Cargar perfil
    const perfilRes = await fetchWithAuth('/api/usuarios/mi-perfil');
    const perfil = await perfilRes.json();
    const decoded = decodeJwt(data.accessToken) || {};
    setRol(perfil.rol || null);
    setUser({ uid: decoded.sub, id: decoded.sub, email: perfil.email, nombre: perfil.nombre });
    return true;
  };

  const logout = () => {
    setAuthTokens({ accessToken: null, refreshToken: null });
    setUser(null);
    setRol(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, rol, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}
