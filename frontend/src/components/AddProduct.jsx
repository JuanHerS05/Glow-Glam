import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './css/AddProductmodule.css';
import logo from './img/logo.png';

export default function AddProduct() {
  const [categories, setCategories] = useState([]);
  
  const [productData, setProductData] = useState({
    idBarcode: '',
    category: '', 
    name: '',
    brand: '',
    description: '',
    price: '',
    active: true
  });

  const [imageUrls, setImageUrls] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error al cargar categorías:", err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUrlChange = (index, value) => {
    const updatedUrls = [...imageUrls];
    updatedUrls[index] = value;
    setImageUrls(updatedUrls);
  };

  const addUrlField = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeUrlField = (indexToRemove) => {
    if (imageUrls.length === 1) {
      setImageUrls(['']);
    } else {
      setImageUrls(imageUrls.filter((_, index) => index !== indexToRemove));
    }
  };

  const handleResetForm = () => {
    setShowModal(false);
    setProductData({
      idBarcode: '',
      category: '',
      name: '',
      brand: '',
      description: '',
      price: '',
      active: true
    });
    setImageUrls(['']);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const filteredUrls = imageUrls.filter(url => url.trim() !== '');

    const payload = {
      product: {
        idBarcode: productData.idBarcode,
        name: productData.name,
        brand: productData.brand,
        description: productData.description,
        price: parseFloat(productData.price),
        active: productData.active === true || productData.active === 'true', 
        category: { 
          name: productData.category,
          active: true 
        }
      },
      imageUrls: filteredUrls
    };

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowModal(true);
      } else {
        const errorText = await response.text();
        if (errorText.includes("HttpMessageNotReadableException") || errorText.includes("isPrimary")) {
          setShowModal(true);
        } else {
          throw new Error(errorText || 'Error 400: Bad Request en el servidor.');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          <h2>Registrar Producto</h2>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>Introduce los detalles del nuevo artículo para integrarlo al catálogo.</p>
        </div>

        {error && (
          <div className="estado-vacio" style={{ color: '#c5221f', padding: '10px', marginBottom: '15px' }}>
            <i className="fas fa-exclamation-circle"></i> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="idBarcode">Código de Barras:</label>
          <input
            type="text"
            id="idBarcode"
            name="idBarcode"
            placeholder="Ej: 770123456789"
            required
            pattern="^[a-zA-Z0-9]+$"
            title="El código de barras solo puede contener letras y números."
            value={productData.idBarcode}
            onChange={handleInputChange}
          />

          <label htmlFor="category">Categoría:</label>
          <select
            id="category"
            name="category"
            required
            value={productData.category}
            onChange={handleInputChange}
          >
            <option value="">-- Seleccione una categoría --</option>
            {categories.map((cat) => (
              <option key={cat.id || cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <label htmlFor="name">Nombre del Producto:</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Ej: Labial Matte Larga Duración"
            required
            value={productData.name}
            onChange={handleInputChange}
          />

          <label htmlFor="brand">Marca:</label>
          <input
            type="text"
            id="brand"
            name="brand"
            placeholder="Ej: GlowGlam Luxury"
            required
            value={productData.brand}
            onChange={handleInputChange}
          />

          <label htmlFor="description">Descripción:</label>
          <textarea
            id="description"
            name="description"
            placeholder="Escribe los detalles..."
            rows="4"
            required
            value={productData.description}
            onChange={handleInputChange}
          ></textarea>

          <label htmlFor="price">Precio ($):</label>
          <input
            type="number"
            id="price"
            name="price"
            placeholder="0.00"
            step="0.01"
            min="0.01"
            required
            value={productData.price}
            onChange={handleInputChange}
          />

          <label>Imágenes del Producto (URLs):</label>
          <div className="urlInputsContainer" style={{ width: '100%', display: 'block' }}>
            {imageUrls.map((url, index) => (
              <div key={index} className="urlInputGroup" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', marginBottom: '10px', width: '100%' }}>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  required={index === 0}
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px', width: 'auto', boxSizing: 'border-box' }}
                />
                {index === 0 ? (
                  <button 
                    type="button" 
                    onClick={addUrlField} 
                    className="btnAddUrl"
                    style={{ width: '45px', minWidth: '45px', maxWidth: '45px', height: '42px', flexShrink: 0, backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: 0 }}
                  >+</button>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => removeUrlField(index)} 
                    className="btnRemoveUrl"
                    style={{ width: '45px', minWidth: '45px', maxWidth: '45px', height: '42px', flexShrink: 0, backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: 0 }}
                  >×</button>
                )}
              </div>
            ))}
          </div>

          <div className="imagenesHorizontalPreview">
            {imageUrls.map((url, index) => {
              if (!url.trim()) return null;
              return (
                <div key={index} className="previewItem">
                  <img 
                    src={url.trim()} 
                    alt={`Previsualización ${index + 1}`} 
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
            <input
              type="checkbox"
              name="active"
              id="active"
              checked={productData.active}
              onChange={handleInputChange}
              style={{ width: "auto", margin: 0 }}
            />
            <label htmlFor="active" style={{ margin: 0, fontWeight: "normal", cursor: "pointer" }}>Producto Activo</label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Producto'}
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
            <p>Producto añadido exitosamente.</p>
            <Link to="/adminHome" className="boton-comprar" style={{ display: 'block', marginBottom: '10px', textDecoration: 'none' }}>
              Volver al inicio
            </Link>
            <button 
              type="button" 
              onClick={handleResetForm} 
              className="boton-comprar"
              style={{ background: '#666', border: 'none', cursor: 'pointer', width: '100%' }}
            >
              Añadir otro producto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}