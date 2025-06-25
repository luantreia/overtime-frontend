import React, { useState } from "react";
import logo from "../../logo.png";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const { user } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Usuario desconectado");
      navigate("/login");
    } catch (error) {
      console.error("Error al desconectar", error);
    }
    setMenuAbierto(false);
  };

  const onSelect = (ruta) => {
    navigate(ruta);
    setMenuAbierto(false);
  };

  const toggleMenu = () => setMenuAbierto(!menuAbierto);

  const botonesBase = [
    { texto: "Jugadores", ruta: "/jugadores" },
    { texto: "Equipos", ruta: "/equipos" },
    { texto: "Partidos", ruta: "/partidos" },
  ];

  const botonesUsuario = user
    ? [
        { texto: "Anotar jugador", ruta: "/agregar-jugadores-multiple" },
        { texto: "Anotar Equipo", ruta: "/agregar-equipo" },
        { texto: "Agregar Partido", ruta: "/agregar-partido" },
        { texto: "Mi perfil", ruta: "/perfil" },
      ]
    : [
        { texto: "Iniciar sesión", ruta: "/login" },
        { texto: "Registrarse", ruta: "/registro" },
      ];

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <img
          src={logo}
          alt="Logo Overtime"
          className="h-12 w-auto cursor-pointer"
          onClick={() => navigate("/")}
        />

        {/* Menú hamburguesa - solo en móvil */}
        <button
          onClick={toggleMenu}
          className="md:hidden flex flex-col justify-center items-center gap-1 w-8 h-8 focus:outline-none"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-1 w-full bg-white rounded transition-transform duration-300 ${
              menuAbierto ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block h-1 w-full bg-white rounded transition-opacity duration-300 ${
              menuAbierto ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`block h-1 w-full bg-white rounded transition-transform duration-300 ${
              menuAbierto ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>

        {/* Navegación */}
        <nav
          className={`flex-col md:flex-row md:flex md:items-center md:gap-6 absolute md:static top-full left-0 w-full md:w-auto bg-slate-900 md:bg-transparent transition-all duration-300 ease-in-out overflow-hidden md:overflow-visible ${
            menuAbierto ? "max-h-96 py-4 md:max-h-full" : "max-h-0"
          }`}
        >
          {[...botonesBase, ...botonesUsuario].map(({ texto, ruta }) => (
            <button
              key={ruta}
              onClick={() => onSelect(ruta)}
              className="block w-full md:w-auto text-left px-6 py-2 md:px-3 rounded hover:bg-slate-700 transition-colors duration-200"
            >
              {texto}
            </button>
          ))}

          {user && (
            <button
              onClick={handleLogout}
              className="w-full md:w-auto mt-2 md:mt-0 px-6 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors duration-200"
            >
              Cerrar sesión
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
