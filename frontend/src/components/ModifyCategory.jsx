import React, { useState, useEffect } from 'react';
// CORRECCIÓN: Importamos Link para mantener la navegación fluida de la SPA
import { Link } from 'react-router-dom'; 
import './css/ModifyCategorymodule.css'; // Mismo archivo de estilos por clases planas
import logo from './img/logo.png';

export default function ModifyCategory() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(false);
  
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar las categorías desde la API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories'); 
        if (response.ok) {
          const data = await response.json();
          setCategories(Array.isArray(data) ? data : []);
        } else {
          setError('No se pudieron cargar las categorías.');
        }
      } catch (err) {
        console.error('Error al traer categorías:', err);
        setError('Error de conexión con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();

    const params = new URLSearchParams(window.location.search);
    if (params.get('success') !== null) {
      setShowSuccessModal(true);
    }
  }, []);

  // Efecto para autocompletar al cambiar la selección
  useEffect(() => {
    const currentCategory = categories.find(cat => cat.name === selectedCategoryName);
    
    if (currentCategory) {
      setDescription(currentCategory.description || '');
      setIsActive(currentCategory.active ?? false);
    } else {
      setDescription('');
      setIsActive(false);
    }
  }, [selectedCategoryName, categories]);

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name: selectedCategoryName,
      description: description,
      active: isActive
    };

    try {
      const response = await fetch('/api/categories', {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        const errText = await response.text();
        setError(errText || 'Hubo un problema al actualizar la categoría.');
      }
    } catch (err) {
      console.error('Error en el submit:', err);
      setError('Error de red al intentar guardar los cambios.');
    }
  };

  const cerrarModal = () => {
    setShowSuccessModal(false);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  return (
    <div className="bodyWrapper" style={{ position: 'relative', minHeight: '100vh' }}>
      
      {/* ================= HEADER & NAV GLOBAL (Mismo formato exacto que Inventario) ================= */}
      <header className="mainHeader" style={{ position: 'relative', zIndex: 9999, overflow: 'visible' }}>
        <h1 className="marca">
          <img src={logo} alt="GlowGlam Logo" className="logo" />
        </h1>
        <nav className="mainNav" style={{ overflow: 'visible' }}>
          <ul style={{ overflow: 'visible' }}>
            
            <li className="dropdown" style={{ position: 'relative', overflow: 'visible' }}>
              <Link to="#" onClick={(e) => e.preventDefault()}>
                Productos <i className="fas fa-chevron-down"></i>
              </Link>
              <ul className="dropdownContent" style={{ display: 'none', position: 'absolute', zIndex: 99999 }}>
                <li><Link to="/adminHome"><i className="fas fa-th-list"></i> Ver Catálogo</Link></li>
                <li><Link to="/admin/all"><i className="fas fa-boxes"></i> Inventario </Link></li>
                <li><Link to="/addProduct"><i className="fas fa-plus-circle"></i> Añadir Producto</Link></li>
                <li><Link to="/modifyProduct"><i className="fas fa-edit"></i> Modificar Producto</Link></li>
              </ul>
            </li>

            <li className="dropdown" style={{ position: 'relative', overflow: 'visible' }}>
              <Link to="#" onClick={(e) => e.preventDefault()}>
                Categorías <i className="fas fa-chevron-down"></i>
              </Link>
              <ul className="dropdownContent" style={{ display: 'none', position: 'absolute', zIndex: 99999 }}>
                <li><Link to="/addCategory"><i className="fas fa-folder-plus"></i> Crear Categoría</Link></li>
                <li><Link to="/modifyCategory"><i className="fas fa-folder-minus"></i> Modificar Categoría</Link></li>
              </ul>
            </li>

            <li><a href="/#contacto">Contacto</a></li>
            <li><Link to="/"><i className="fas fa-sign-out-alt"></i> Volver a Inicio</Link></li>
          </ul>
        </nav>
      </header>

      {/* ================= CONTENEDOR PRINCIPAL ================= */}
      <main className="contenedorFormulario" style={{ position: 'relative', zIndex: 1 }}>
        <div className="cabeceraFormulario">
          <h2>Modificar Categoría</h2>
          <p>Selecciona una categoría existente para actualizar sus propiedades.</p>
        </div>

        {error && (
          <div className="alertError">
            <i className="fas fa-exclamation-circle"></i> <span>{error}</span>
          </div>
        )}

        {loading ? (
          <p className="textoCargando">Cargando categorías...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="category-selector">Selecciona la Categoría a editar:</label>
            <select
              id="category-selector"
              value={selectedCategoryName}
              onChange={(e) => setSelectedCategoryName(e.target.value)}
              required
              className="selectCategorias"
            >
              <option value="">-- Elige una categoría --</option>
              {categories.map((cat) => (
                <option key={cat.id || cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            <label htmlFor="description">Descripción Actualizada:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              required
              placeholder="Selecciona una categoría para ver su descripción..."
              className="textareaDescripcion"
            ></textarea>

            <div className="checkboxContainer">
              <input
                type="checkbox"
                id="active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="inputCheckbox"
              />
              <label htmlFor="active" className="labelCheckbox">
                Categoría Habilitada (Activa)
              </label>
            </div>

            <button type="submit" className="btnSubmit">
              Guardar Cambios
            </button>
          </form>
        )}
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="mainFooter" style={{ position: 'relative', zIndex: 1 }}>
        <p>&copy; 2026 Glow &amp; Glam. Todos los derechos reservados.</p>
      </footer>

      {/* ================= MODAL DE CONFIRMACIÓN ================= */}
      {showSuccessModal && (
        <div className="modalConfirmacionContainer" onClick={cerrarModal}>
          <div className="modalConfirmacionContenido" onClick={(e) => e.stopPropagation()}>
            <div className="iconoExito">✓</div>
            <h3>¡Cambios Guardados!</h3>
            <p>La categoría ha sido actualizada correctamente.</p>
            <a href="/adminHome" className="btnVolverInicio">
              Volver al inicio
            </a>
            <br />
            <button type="button" onClick={cerrarModal} className="btnCerrarModal">
              Seguir modificando categorías
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
