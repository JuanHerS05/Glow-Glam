import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import './css/Loginmodule.css'; 
import logo from './img/logo.png';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') !== null) {
      setHasError(true);
    }
    if (params.get('registered') !== null) {
      setIsRegistered(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasError(false);
    setErrorMessage('');


    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, userpass: password })
      });
    

      if (response.ok) {
        const userData = await response.json(); 
        localStorage.setItem('usuarioLogueado', JSON.stringify(userData));

        if (userData.role === 'ADMIN' || userData.tipo === 'ADMIN') {
          
          window.location.href = '/adminHome';
        } else {
          window.location.href = '/';
        }
      } else {
        setHasError(true);
        const errorText = await response.text();
        setErrorMessage(errorText || 'Credenciales incorrectas.');
      }
    } catch (error) {
      console.error("Error de red al intentar iniciar sesión:", error);
      setHasError(true);
      setErrorMessage('No se pudo conectar con el servidor.');
    }
  };

  return (
    <div className="bodyWrapper">
      {/* ================= HEADER & NAV ================= */}
      <header className="mainHeader">
        <h1 className="marca">
          <img src={logo} alt="GlowGlam Logo" className="logo" />
        </h1>
        <nav className="mainNav">
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/addProduct">Añadir Producto</Link></li>
          </ul>
        </nav>
      </header>

      {/* ================= CONTENEDOR LOGIN ================= */}
      <main className="loginContainer">
        <div className="loginCard">
          <h2>Iniciar Sesión</h2>

          {hasError && (
            <p className="errorMessage">
              {errorMessage || 'Correo o contraseña incorrectos.'}
            </p>
          )}

          {isRegistered && (
            <p className="successMessage">
              ¡Registro exitoso! Ya puedes iniciar sesión.
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Correo Electrónico:</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="password">Contraseña:</label>
            {/* 🔥 CONTENEDOR LIMPIO: Controla el margen inferior desde el CSS directamente */}
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'} 
                id="password"
                name="userpass"
                className="input-password" 
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {/* 🔥 BOTÓN DEL OJO: Centrado dinámico perfecto */}
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
              </button>
            </div>

            <div className="opcionesEnlaces">
              <a href="#" className="olvidoPassword">
                ¿Olvidaste tu contraseña?
              </a>
              <Link to="/Register" className="olvidoPassword crearCuentaLink">
                Crear cuenta
              </Link>
            </div>

            <button type="submit" className="btnIngresar">
              Ingresar
            </button>
          </form>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="mainFooter">
        <p>&copy; 2026 GlowGlam S.A. All rights reserved.</p>
      </footer>
    </div>
  );
}
