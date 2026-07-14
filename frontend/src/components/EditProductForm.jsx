import React, { useState, useEffect } from 'react';
// Importar Link para la navegación interna de manera nativa
import { Link } from 'react-router-dom'; 
import './css/EditProductmodule.css';
import logo from './img/logo.png';

export default function EditProductForm({ barcodeParam }) {
  const [product, setProduct] = useState({
    idBarcode: '',
    name: '',
    category: '',
    brand: '',
    description: '', // Aseguramos que inicie como string vacío
    price: 0,
    active: true
  });

  const [imagesUrls, setImagesUrls] = useState(['']);
  const [categories, setCategories] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. Cargar Categorías
        const respCat = await fetch('/api/categories'); 
        if (respCat.ok) {
          const catData = await respCat.json();
          setCategories(catData);
        }

        // 2. Obtener el código de barras desde la URL de la página (?barcode=)
        const barcode = barcodeParam || new URLSearchParams(window.location.search).get('barcode') || '';
        if (barcode) {
          const respProd = await fetch(`/api/products/barcode/${encodeURIComponent(barcode)}`);
          if (respProd.ok) {
            const prodData = await respProd.json();
            
            // Extraer de forma segura el nombre de la categoría si viene como objeto
            let categoryName = '';
            if (prodData.category) {
              categoryName = typeof prodData.category === 'object' 
                ? (prodData.category.name || '') 
                : prodData.category;
            }

            setProduct({
              idBarcode: prodData.idBarcode || '',
              name: prodData.name || '',
              category: categoryName, 
              brand: prodData.brand || '',
              description: prodData.description || '', 
              price: prodData.price || 0,
              active: prodData.active ?? true
            });

            if (prodData.images && prodData.images.length > 0) {
              setImagesUrls(prodData.images.map(img => img.imageUrl));
            }
          }
        }
      } catch (err) {
        console.error('Error cargando los datos del producto:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [barcodeParam]);

  // Manejar el cambio de valores de los inputs normales
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setProduct(prev => ({ ...prev, [id]: value }));
  };

  const toggleActiveStatus = () => {
    setProduct(prev => ({ ...prev, active: !prev.active }));
  };

  const handleUrlInputChange = (index, value) => {
    const updatedUrls = [...imagesUrls];
    updatedUrls[index] = value;
    setImagesUrls(updatedUrls);
  };

  const addUrlField = () => {
    setImagesUrls([...imagesUrls, '']);
  };

  const removeUrlField = (indexToRemove) => {
    setImagesUrls(imagesUrls.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      product: {
        idBarcode: product.idBarcode,
        name: product.name,
        brand: product.brand,
        description: product.description,
        price: parseFloat(product.price),
        active: product.active,
        category: { 
          name: product.category,
          active: true 
        } 
      },
      imageUrls: imagesUrls.filter(url => url.trim() !== '')
    };

    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        alert('Hubo un error al procesar la actualización del producto.');
      }
    } catch (err) {
      console.error('Error en el submit:', err);
    }
  };

  if (loading) {
    return <div className="estadoVacio">Cargando datos del producto...</div>;
  }

  return (
    <div className="bodyWrapper" style={{ position: 'relative', minHeight: '100vh' }}>
      
      {/* ================= HEADER & NAV GLOBAL COMPORTAMIENTO FORZADO ================= */}
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
              <ul className="dropdown-content" style={{ display: 'none', position: 'absolute', zIndex: 99999 }}>
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
              <ul className="dropdown-content" style={{ display: 'none', position: 'absolute', zIndex: 99999 }}>
                <li><Link to="/addCategory"><i className="fas fa-folder-plus"></i> Crear Categoría</Link></li>
                <li><Link to="/modifyCategory"><i className="fas fa-folder-minus"></i> Modificar Categoría</Link></li>
              </ul>
            </li>

            <li><Link to="/"><i className="fas fa-sign-out-alt"></i> Cerrar sesión</Link></li>
          </ul>
        </nav>
      </header>

      {/* ================= PANEL DE EDICIÓN (BAJAMOS EL CAPA Z-INDEX) ================= */}
      <main className="contenedorFormulario" style={{ position: 'relative', zIndex: 1 }}>
        <div className="panelEdicion">
          <h3>
            Editando: <span className="productNameHighlight">{product.name || 'Nombre Producto'}</span>
          </h3>

          <form onSubmit={handleSubmit}>
            <label htmlFor="idBarcode">Código de Barras:</label>
            <input
              type="text"
              id="idBarcode"
              value={product.idBarcode}
              readOnly
              className="inputReadOnly"
            />

            <label htmlFor="category">Categoría:</label>
            <select
              id="category"
              value={product.category}
              onChange={handleInputChange}
              required
              className="selectCategory"
            >
              <option value="">-- Selecciona una categoría --</option>
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
              value={product.name}
              onChange={handleInputChange}
              required
            />

            <label htmlFor="brand">Marca:</label>
            <input
              type="text"
              id="brand"
              value={product.brand}
              onChange={handleInputChange}
              required
            />

            <label htmlFor="description">Descripción:</label>
            <textarea
              id="description"
              value={product.description || ''} 
              onChange={handleInputChange}
              rows="4"
              required
            ></textarea>

            <label htmlFor="price">Precio ($):</label>
            <input
              type="number"
              id="price"
              value={product.price}
              onChange={handleInputChange}
              step="0.01"
              min="0.01"
              required
            />

            <div className="estadoControl">
              <span>
                Estado actual:{' '}
                <strong className={product.active ? "txtActivo" : "txtInactivo"}>
                  {product.active ? 'Activo' : 'Inactivo'}
                </strong>
              </span>
              <button type="button" className="btnEstado" onClick={toggleActiveStatus}>
                Cambiar Estado
              </button>
            </div>

            <label>URLs de las imágenes del Producto:</label>
            <div className="urlInputsContainer">
              {imagesUrls.map((url, index) => (
                <div key={index} className="urlInputGroup">
                  <input
                    type="url"
                    name="imageUrlInput"
                    value={url}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    onChange={(e) => handleUrlInputChange(index, e.target.value)}
                    required={index === 0}
                  />
                  {index === 0 ? (
                    <button type="button" onClick={addUrlField} className="btnAddUrl">+</button>
                  ) : (
                    <button type="button" onClick={() => removeUrlField(index)} className="btnRemoveUrl">×</button>
                  )}
                </div>
              ))}
            </div>

            <div className="imagenesHorizontalPreview">
              {imagesUrls.map((url, idx) => {
                if (!url.trim()) return null;
                return (
                  <img
                    key={idx}
                    src={url.trim()}
                    alt={`Preview ${idx + 1}`}
                    onError={(e) => { e.target.style.display = 'none'; }}
                    className="previewImageItem"
                  />
                );
              })}
            </div>

            <div className="accionesEdicion">
              <Link to="/admin/all" className="btnCancelar">Cancelar</Link>
              <button type="submit" className="btnGuardar">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="mainFooter" style={{ position: 'relative', zIndex: 1 }}>
        <p>&copy; 2026 GlowGlam S.A. Todos los derechos reservados.</p>
      </footer>

      {/* ================= MODAL DE ÉXITO FORZADO ARRIBA ================= */}
      {showSuccessModal && (
        <div className="modalConfirmacionContainer" style={{ zIndex: 100000 }}>
          <div className="modalConfirmacionContenido">
            <div className="iconoExito">✓</div>
            <h3>¡Actualización Exitosa!</h3>
            <p>Los datos del producto han sido actualizados correctamente.</p>
            <Link to="/adminHome" className="btnVolverInicio">Volver al inicio</Link>
            <br />
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="btnVolverInicio btnSeguirModificando"
            >
              Seguir modificando productos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
