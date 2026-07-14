import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './css/AddCategorymodule.css'; 
import logo from './img/logo.png';

export default function AddCategory() {
  // Estados para manejar el formulario y los componentes de UI
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Manejador de cambios en los inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Manejo del envío del formulario (Conexión API REST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', 
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(true);
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'No se pudo registrar la categoría.');
      }
    } catch (err) {
      setError(err.message || 'Hubo un error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  // Manejo del Logout
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST'
      });

      if (res.ok) {
        localStorage.removeItem('usuarioLogueado');
        window.location.href = '/';
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Restablecer el formulario para agregar otra categoría
  const handleResetForm = () => {
    setShowModal(false);
    setFormData({
      name: '',
      description: '',
      active: true
    });
  };

  return (
    <div className="bodyContainer">
      {/* ================= HEADER & NAV CORREGIDO ================= */}
      <header className="header">
        <h1 className="marca">
          <img src={logo} alt="GlowGlam Logo" className="logo" />
        </h1>
        <nav>
          <ul className="menuList">
            <li className="menuItem">
              <Link to="/adminHome#acerca" className="menuLink">Nosotros</Link>
            </li>
            
            <li className="menuItem dropdown">
              <Link className="menuLink" to="#" onClick={(e) => e.preventDefault()}>
                Productos <i className="fas fa-chevron-down"></i>
              </Link>
              <ul className="dropdown-content">
                <li className="dropdownItem">
                  <Link className="dropdownLink" to="/adminHome">
                    <i className="fas fa-th-list"></i> Ver Catálogo
                  </Link>
                </li>
                <li className="dropdownItem">
                  <Link className="dropdownLink" to="/admin/all">
                    <i className="fas fa-boxes"></i> Inventario
                  </Link>
                </li>
                <li className="dropdownItem">
                  <Link className="dropdownLink" to="/addProduct">
                    <i className="fas fa-plus-circle"></i> Añadir Producto
                  </Link>
                </li>
                <li className="dropdownItem">
                  <Link className="dropdownLink" to="/modifyProduct">
                    <i className="fas fa-edit"></i> Modificar Producto
                  </Link>
                </li>
              </ul>
            </li>

            <li className="menuItem dropdown">
              <Link className="menuLink" to="#" onClick={(e) => e.preventDefault()}>
                Categorías <i className="fas fa-chevron-down"></i>
              </Link>
              <ul className="dropdown-content">
                <li className="dropdownItem">
                  <Link className="dropdownLink" to="/addCategory">
                    <i className="fas fa-folder-plus"></i> Crear Categoría
                  </Link>
                </li>
                <li className="dropdownItem">
                  <Link className="dropdownLink" to="/modifyCategory">
                    <i className="fas fa-folder-minus"></i> Modificar Categoría
                  </Link>
                </li>
              </ul>
            </li>

            <li className="menuItem">
              <Link to="/adminHome#contacto" className="menuLink">Contacto</Link>
            </li>
            <li className="menuItem">
              <Link to="#" className="menuLink" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Cerrar sesión
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* ================= MAIN FORMULARIO ================= */}
      <main className="contenedor-formulario">
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <h2>Crear Nueva Categoría</h2>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>
            Registra un nuevo criterio para clasificar los productos del catálogo.
          </p>
        </div>

        {error && (
          <div className="estado-vacio" style={{ color: '#c5221f', padding: '10px', marginBottom: '15px' }}>
            <i className="fas fa-exclamation-circle"></i> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Nombre de la Categoría:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Ej: Labiales, Cuidado Facial..."
          />

          <label htmlFor="description">Descripción:</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Describe brevemente los productos de esta sección..."
          ></textarea>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              style={{ width: "auto", margin: 0 }}
            />
            <label htmlFor="active" style={{ margin: 0, fontWeight: "normal", cursor: "pointer" }}>
              Habilitar categoría inmediatamente (Activo)
            </label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Procesando...' : 'Registrar Categoría'}
          </button>
        </form>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <p>&copy; 2026 Glow &amp; Glam. Todos los derechos reservados.</p>
      </footer>

      {/* ================= VENTANA MODAL DE CONFIRMACIÓN ================= */}
      {showModal && (
        <div 
          className="estado-vacio" 
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 2000
          }}
          onClick={(e) => e.target === e.currentTarget && handleResetForm()}
        >
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', maxWidth: '400px', width: '100%' }}>
            <div style={{ fontSize: '2rem', color: '#AF1740', marginBottom: '15px' }}>✓</div>
            <h3>¡Operación Exitosa!</h3>
            <p>La categoría ha sido añadida correctamente al sistema.</p>
            <Link to="/adminHome" className="boton-comprar" style={{ display: 'block', marginBottom: '10px' }}>
              Volver al inicio
            </Link>
            <button 
              type="button" 
              onClick={handleResetForm}
              className="boton-comprar"
              style={{ background: '#666' }}
            >
              Añadir otra categoría
            </button>
          </div>
        </div>
      )}
    </div>
  );
}