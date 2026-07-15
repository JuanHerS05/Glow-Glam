import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './css/ModifyProductmodule.css';
import logo from './img/logo.png';

export default function ModifyProduct() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const resp = await fetch('/api/categories', { credentials: 'include' });
        if (!resp.ok) throw new Error();
        const data = await resp.json();
        setCategories(data);
      } catch (e) {
        console.error('Error cargando categorías', e);
      } finally {
        setLoadingCategories(false);
      }
    };
    cargarCategorias();
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') !== null) setShowSuccessModal(true);
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    const cargarProductos = async () => {
      setLoadingProducts(true);
      setErrorProducts(false);
      try {
        const resp = await fetch(`/api/products/category?name=${encodeURIComponent(selectedCategory)}`, { credentials: 'include' });
        if (!resp.ok) throw new Error();
        const data = await resp.json();
        setProducts(data);
      } catch (e) {
        console.error('Error al cargar los productos por categoría:', e);
        setErrorProducts(true);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    cargarProductos();
  }, [selectedCategory]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (menu) => setOpenMenu((prev) => (prev === menu ? null : menu));

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (_) {}
    localStorage.removeItem('usuarioLogueado');
    window.location.href = '/';
  };

  const cerrarModal = () => {
    setShowSuccessModal(false);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  return (
    <div className="bodyWrapper" style={{ position: 'relative', minHeight: '100vh' }}>
      <header className="mainHeader" style={{ position: 'relative', zIndex: 9999, overflow: 'visible' }}>
        <h1 className="marca">
          <img src={logo} alt="GlowGlam Logo" className="logo" />
        </h1>
        <nav className="mainNav" ref={navRef} style={{ overflow: 'visible' }}>
          <ul style={{ overflow: 'visible' }}>
            <li className="menuItem dropdown" style={{ position: 'relative', overflow: 'visible' }}>
              <Link to="#" onClick={(e) => { e.preventDefault(); toggleMenu('productos'); }}>
                Productos <i className="fas fa-chevron-down"></i>
              </Link>
              <ul className="dropdown-content" style={{ display: openMenu === 'productos' ? 'block' : 'none', position: 'absolute', zIndex: 99999 }}>
                <li><Link to="/adminHome" onClick={() => setOpenMenu(null)}><i className="fas fa-th-list"></i> Ver Catálogo</Link></li>
                <li><Link to="/admin/all" onClick={() => setOpenMenu(null)}><i className="fas fa-boxes"></i> Inventario</Link></li>
                <li><Link to="/addProduct" onClick={() => setOpenMenu(null)}><i className="fas fa-plus-circle"></i> Añadir Producto</Link></li>
                <li><Link to="/modifyProduct" onClick={() => setOpenMenu(null)}><i className="fas fa-edit"></i> Modificar Producto</Link></li>
              </ul>
            </li>
            <li className="menuItem dropdown" style={{ position: 'relative', overflow: 'visible' }}>
              <Link to="#" onClick={(e) => { e.preventDefault(); toggleMenu('categorias'); }}>
                Categorías <i className="fas fa-chevron-down"></i>
              </Link>
              <ul className="dropdown-content" style={{ display: openMenu === 'categorias' ? 'block' : 'none', position: 'absolute', zIndex: 99999 }}>
                <li><Link to="/addCategory" onClick={() => setOpenMenu(null)}><i className="fas fa-folder-plus"></i> Crear Categoría</Link></li>
                <li><Link to="/modifyCategory" onClick={() => setOpenMenu(null)}><i className="fas fa-folder-minus"></i> Modificar Categoría</Link></li>
              </ul>
            </li>
            <li><Link to="/adminHome"><i className="fas fa-sign-out-alt"></i> Volver a Inicio</Link></li>
          </ul>
        </nav>
      </header>

      <main className="contenedorFormulario" style={{ position: 'relative', zIndex: 1 }}>
        <div className="cabeceraSeccion">
          <h2>Modificar Producto</h2>
          <p>Seleccione una categoría para buscar y editar un producto específico.</p>
        </div>
        <div className="filtroCategoria">
          <label htmlFor="filtro-cat">Filtrar por categoría:</label>
          <select id="filtro-cat" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} disabled={loadingCategories}>
            <option value="" disabled>-- Seleccione una categoría --</option>
            {categories.map((cat) => (<option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>))}
          </select>
        </div>
        <div id="lista" className="listaProductosHorizontal">
          {!selectedCategory && !loadingProducts && <p className="estadoVacio">Elija una categoría para empezar...</p>}
          {loadingProducts && <p className="estadoVacio">Cargando productos...</p>}
          {errorProducts && <p className="estadoVacio">No se pudieron cargar los productos.</p>}
          {!loadingProducts && !errorProducts && selectedCategory && products.length === 0 && (
            <p className="estadoVacio">No hay productos en esta categoría.</p>
          )}
          {!loadingProducts && !errorProducts && products.map((p) => {
            const primeraImagenUrl = p.images && p.images.length > 0 ? p.images[0].imageUrl : 'https://via.placeholder.com/80?text=Glam';
            return (
              <div key={p.idBarcode} className={`productoFila ${!p.active ? 'inactivo' : ''}`}>
                <div className="imgWrapper">
                  <img src={primeraImagenUrl} alt={p.name} className="imagenProducto" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/80?text=Glam'; }} />
                </div>
                <div className="infoBloque">
                  <h4>{p.name}</h4>
                  <div className="detallesMeta">
                    <span><strong>Marca:</strong> {p.brand}</span>
                    <span className="separador">·</span>
                    <span className="barcodeTag">{p.idBarcode}</span>
                  </div>
                </div>
                <div className="accionBloque">
                  <span className={`badgeEstado ${p.active ? 'badgeActivo' : 'badgeInactivo'}`}>{p.active ? 'Activo' : 'Inactivo'}</span>
                  <span className="precioTag">{Number(p.price).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</span>
                  <Link to={`/updateProduct?barcode=${encodeURIComponent(p.idBarcode)}`} className="btnModificarFila">Modificar</Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="mainFooter" style={{ position: 'relative', zIndex: 1 }}>
        <p>&copy; 2026 GlowGlam S.A. Todos los derechos reservados.</p>
      </footer>

      {showSuccessModal && (
        <div className="modalConfirmacionContainer" style={{ zIndex: 100000 }} onClick={cerrarModal}>
          <div className="modalConfirmacionContenido" onClick={(e) => e.stopPropagation()}>
            <div className="iconoExito">✓</div>
            <h3>¡Cambios Guardados!</h3>
            <p>El producto ha sido actualizado correctamente.</p>
            <Link to="/adminHome" className="btnVolverInicio">Volver al inicio</Link>
            <br />
            <button type="button" onClick={cerrarModal} className="btnCerrarModal">Seguir modificando productos</button>
          </div>
        </div>
      )}
    </div>
  );
}
