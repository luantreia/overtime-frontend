import React, { useState } from "react";
import logo from "../../logo.png";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const NavBar = () => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully.");
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
    setMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const baseNavItems = [
    { text: "Jugadores", path: "/jugadores" },
    { text: "Equipos", path: "/equipos" },
    { text: "Partidos", path: "/partidos" },
  ];

  const userNavItems = user
    ? [
        { text: "Anotar jugador", path: "/agregar-jugadores-multiple" },
        { text: "Anotar Equipo", path: "/agregar-equipo" },
        { text: "Agregar Partido", path: "/agregar-partido" },
        { text: "Mi perfil", path: "/perfil" },
      ]
    : [
        { text: "Iniciar sesión", path: "/login" },
        { text: "Registrarse", path: "/registro" },
      ];

  const allNavItems = [...baseNavItems, ...userNavItems];

  // Common button styles for navigation items
  const navButtonBaseClasses = "block w-full text-white text-lg font-medium px-4 py-3 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-800";

  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <img
          src={logo}
          alt="Overtime Logo"
          className="h-16 w-auto cursor-pointer object-contain transform hover:scale-105 transition-transform duration-200"
          onClick={() => handleNavigation("/")}
        />

        {/* Hamburger Menu Button - Always visible, refined animation */}
        <button
          onClick={toggleMenu}
          className="flex flex-col justify-center items-center gap-1.5 w-10 h-10 focus:outline-none focus:ring-2 focus:ring-slate-300 rounded-md transition-all duration-300 z-50"
          aria-label="Toggle navigation menu"
        >
          <span
            className={`block h-1 w-8 bg-white rounded-full transition-transform duration-300 ease-in-out ${
              menuOpen ? "rotate-45 translate-y-2.5" : ""
            }`}
          />
          <span
            className={`block h-1 w-8 bg-white rounded-full transition-opacity duration-300 ease-in-out ${
              menuOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`block h-1 w-8 bg-white rounded-full transition-transform duration-300 ease-in-out ${
              menuOpen ? "-rotate-45 -translate-y-2.5" : ""
            }`}
          />
        </button>

        {/* Mobile Menu Overlay - Smooth fade-in, now solely responsible for blur */}
        {menuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md z-40 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in" // Adjusted opacity to 60%, blur to md
            onClick={toggleMenu}
            aria-hidden="true"
          ></div>
        )}

        {/* Navigation - Sidebar only, elevated styling. NO BLUR HERE. */}
        <nav
          className={`
            fixed inset-y-0 right-0 w-72 transform transition-transform duration-300 ease-in-out 
            bg-slate-800 // Removed backdrop-blur-md and opacity from here
            py-10 px-8 flex flex-col space-y-5 
            ${menuOpen ? "translate-x-0 z-50" : "translate-x-full"} 
            shadow-2xl rounded-l-lg
          `}
        >
          {allNavItems.map(({ text, path }) => (
            <button
              key={path}
              onClick={() => handleNavigation(path)}
              className={`
                ${navButtonBaseClasses} 
                text-left relative overflow-hidden group 
                ${location.pathname === path ? "bg-slate-700 shadow-md transform scale-105" : "hover:bg-slate-700"}
              `}
              aria-current={location.pathname === path ? "page" : undefined}
            >
              {text}
              {/* Animated underline for non-active links */}
              {location.pathname !== path && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
              )}
            </button>
          ))}

          {user && (
            <button
              onClick={handleLogout}
              className="block w-full mt-8 p-3 bg-red-600 text-white text-lg font-medium rounded-lg hover:bg-red-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-800 text-left transform hover:scale-105"
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