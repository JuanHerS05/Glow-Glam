import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import './css/AdminAllProductsmodule.css';
import logo from './img/logo.png';

export default function Inventario() {
  const [productsList, setProductsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [selectedStatus, setSelectedStatus] = useState('TODOS');
  const [openMenu, setOpenMenu] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);
        const respCat = await fetch('/api/categories', { credentials: 'include' });
        if (respCat.ok) {
          const catData = await respCat.json();
          setCategories(Array.isArray(catData) ? catData : []);
        }
        const respProd = await fetch('/api/products/admin/all?role=ADMIN', { credentials: 'include' });
        if (!respProd.ok) throw new Error('Error al conectar con el inventario del servidor');
        const prodData = await respProd.json();
        setProductsList(Array.isArray(prodData) ? prodData : []);
      } catch (err) {
        console.error('Error en la carga de datos:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (menu) => setOpenMenu((prev) => (prev === menu ? null : menu));

  const filteredProducts = useMemo(() => {
    const searchNormalized = searchTerm.toLowerCase().trim();
    if (!Array.isArray(productsList)) return [];
    return productsList.filter((product) => {
      if (!product) return false;
      const name = product.name ? product.name.toLowerCase() : '';
      const brand = product.brand ? product.brand.toLowerCase() : '';
      const matchesText = name.includes(searchNormalized) || brand.includes(searchNormalized);
      const matchesCategory =
        selectedCategory === 'TODAS' ||
        (product.category && product.category.name === selectedCategory) ||
        product.categoryName === selectedCategory;
      let matchesStatus = true;
      if (selectedStatus === 'ACTIVO') matchesStatus = product.active === true;
      if (selectedStatus === 'INACTIVO') matchesStatus = product.active === false;
      return matchesText && matchesCategory && matchesStatus;
    });
  }, [productsList, searchTerm, selectedCategory, selectedStatus]);

  return (
    <div className="bodyWrapper" style={{ position: 'relative', minHeight: '100vh' }}>
      <header className="mainHeader" style={{ position: 'relative', zIndex: 9999, overflow: 'visible' }}>
        <h1 className="marca">
          <img src={logo} alt="GlowGlam Logo" className="logo" />
        </h1>
        <nav className="mainNav" ref={navRef} style={{ overflow: 'visible' }}>
          <ul style={{ overflow: 'visible' }}>
            <li className="dropdown" style={{ position: 'relative', overflow: 'visible' }}>
              <Link to="#" onClick={(e) => { e.preventDefault(); toggleMenu('productos'); }}>
                Productos <i className="fas fa-chevron-down"></i>
              </Link>
              <ul className="dropdownContent" style={{ display: openMenu === 'productos' ? 'block' : 'none', position: 'absolute', zIndex: 99999 }}>
                <li><Link to="/adminHome" onClick={() => setOpenMenu(null)}><i className="fas fa-th-list"></i> Ver Catálogo</Link></li>
                <li><Link to="/admin/all" onClick={() => setOpenMenu(null)}><i className="fas fa-boxes"></i> Inventario</Link></li>
                <li><Link to="/addProduct" onClick={() => setOpenMenu(null)}><i className="fas fa-plus-circle"></i> Añadir Producto</Link></li>
                <li><Link to="/modifyProduct" onClick={() => setOpenMenu(null)}><i className="fas fa-edit"></i> Modificar Producto</Link></li>
              </ul>
            </li>
            <li className="dropdown" style={{ position: 'relative', overflow: 'visible' }}>
              <Link to="#" onClick={(e) => { e.preventDefault(); toggleMenu('categorias'); }}>
                Categorías <i className="fas fa-chevron-down"></i>
              </Link>
              <ul className="dropdownContent" style={{ display: openMenu === 'categorias' ? 'block' : 'none', position: 'absolute', zIndex: 99999 }}>
                <li><Link to="/addCategory" onClick={() => setOpenMenu(null)}><i className="fas fa-folder-plus"></i> Crear Categoría</Link></li>
                <li><Link to="/modifyCategory" onClick={() => setOpenMenu(null)}><i className="fas fa-folder-minus"></i> Modificar Categoría</Link></li>
              </ul>
            </li>
            <li><Link to="/adminHome"><i className="fas fa-th-list"></i> Volver a Inicio</Link></li>
          </ul>
        </nav>
      </header>

      <main className="contenedorFormularioCustom" style={{ position: 'relative', zIndex: 1 }}>
        <div className="contenedorAcerca">
          <h2>Control de Inventario General</h2>
          <p>Visualiza, filtra y gestiona todo el catálogo de productos de la tienda.</p>
        </div>
        <div className="panelFiltros">
          <div className="filtroBusqueda">
            <label htmlFor="search-input">Buscar por Nombre o Marca:</label>
            <input type="text" id="search-input" placeholder="Ej: Corrector, Atenea..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="filtroCategory">
            <label htmlFor="filter-category">Categoría:</label>
            <select id="filter-category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="TODAS">-- Todas las Categorías --</option>
              {categories.map((cat) => (<option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>))}
            </select>
          </div>
          <div className="filtroEstado">
            <label htmlFor="filter-status">Estado:</label>
            <select id="filter-status" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="TODOS">Todos</option>
              <option value="ACTIVO">Activos</option>
              <option value="INACTIVO">Inactivos</option>
            </select>
          </div>
        </div>
        <div className="listaProductosHorizontal">
          {loading && <p className="estadoVacio">Sincronizando inventario...</p>}
          {error && !loading && (<p className="estadoVacio errorColor">✖ Error de conexión con el inventario de la base de datos.</p>)}
          {!loading && !error && filteredProducts.length === 0 && (<p className="estadoVacio">No se encontraron productos que coincidan con los filtros aplicados.</p>)}
          {!loading && !error && filteredProducts.map((p) => {
            if (!p) return null;
            const urlImagen = p.images && p.images.length > 0 ? p.images[0].imageUrl : 'https://via.placeholder.com/60?text=Glam';
            return (
              <div key={p.idBarcode} className={`productoFila ${!p.active ? 'inactivo' : ''}`}>
                <div className="infoColumna">
                  <img src={urlImagen} alt={p.name || 'Producto'} className="imagenProducto" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/60?text=Glam'; }} />
                  <div className="detallesTextuales">
                    <h4>{p.name}</h4>
                    <div className="metaInfoContainer">
                      <span><strong>Marca:</strong> {p.brand}</span>
                      <span><strong>Código:</strong> <code>{p.idBarcode}</code></span>
                      <span><strong>Categoría:</strong> {p.categoryName || (p.category ? p.category.name : 'Sin categoría')}</span>
                    </div>
                  </div>
                </div>
                <div className="accionesColumna">
                  <span className="precioTexto">${Number(p.price || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })} COP</span>
                  <span className={`badgeEstado ${p.active ? 'badgeActivo' : 'badgeInactivo'}`}>{p.active ? 'Activo' : 'Inactivo'}</span>
                  <Link to={`/updateProduct?barcode=${encodeURIComponent(p.idBarcode || '')}`} className="btnModificarFila"><i className="fas fa-edit"></i> Modificar</Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="mainFooter" style={{ position: 'relative', zIndex: 1 }}>
        <p>&copy; 2026 GlowGlam S.A. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
