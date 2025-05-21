// components/common/LoadingScreen.js
import React from "react";
import "./LoadingScreen.css"; // para animaciones personalizadas

const LoadingScreen = () => {
  return (
    <div className="container">
      <div className="ball-container">
        <div className="ball" />
        <div className="shadow" />
      </div>
      <p className="loading-text">
        Cargando datos... Gracias por tu paciencia 🕐<br />
        Esta app está en <strong>Beta</strong>, la carga puede tardar unos segundos.
      </p>
    </div>
  );
};

export default LoadingScreen;
