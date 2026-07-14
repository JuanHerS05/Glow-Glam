import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// IMPORTACIÓN CORREGIDA: Importación global sin la variable 'styles' para que no se rompa la vista
import './css/Registermodule.css'; 
import logo from './img/logo.png';

export default function Register() {
  const navigate = useNavigate();

  // Estado para capturar los valores del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userpass: ''
  });

  // Estado para manejar errores del servidor
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // FUNCIÓN NUEVA: Maneja el envío de datos en formato JSON hacia Spring Boot
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Limpiar errores previos

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Registro exitoso, redirigimos al Login usando React Router
        navigate('/Login');
      } else {
        // Si el backend responde con un error (ej. el correo ya existe)
        const errorText = await response.text();
        setErrorMessage(errorText || 'Ocurrió un error al registrar el usuario.');
      }
    } catch (error) {
      console.error("Error de red al intentar registrarse:", error);
      setErrorMessage('No se pudo conectar con el servidor. Inténtalo más tarde.');
    }
  };

  return (
    <div className="bodyWrapper">
      {/* ================= HEADER ================= */}
      <header className="mainHeader">
        <h1 className="marca">
          {/* ¡ESTO ES LO CORRECTO! */}
                              <img src={logo} alt="GlowGlam Logo" className="logo" />
        </h1>
        <nav className="mainNav">
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/Login">Iniciar Sesión</Link></li>
          </ul>
        </nav>
      </header>

      {/* ================= CONTENEDOR PRINCIPAL ================= */}
      <main className="loginContainer">
        <div className="loginCard">
          <h2>Crear Cuenta</h2>

          {/* Renderizado condicional del error proveniente del backend */}
          {errorMessage && (
            <p className="errorMessage" style={{ color: 'red', marginBottom: '1rem' }}>
              {errorMessage}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Nombre Completo:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              required
            />

            <label htmlFor="email">Correo Electrónico:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
              title="Por favor, introduce un correo válido (ejemplo@correo.com)"
              required
            />

            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              name="userpass"
              value={formData.userpass}
              onChange={handleChange}
              placeholder="Crea una contraseña segura"
              required
            />

            <button type="submit">Registrarse</button>
          </form>

          <p className="switchViewText">
            ¿Ya tienes una cuenta? <Link to="/Login">Inicia sesión aquí</Link>
          </p>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="mainFooter">
        <p>&copy; 2026 GlowGlam S.A. All rights reserved.</p>
      </footer>
    </div>
  );
}