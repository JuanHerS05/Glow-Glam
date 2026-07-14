import React, { useState, useEffect, useMemo } from 'react';
// CORRECCIÓN: Importamos Link para evitar recargas completas de la SPA
import { Link } from 'react-router-dom'; 
import './css/AdminAllProductsmodule.css'; 
import logo from './img/logo.png';
    
export default function Inventario() {
  // Estados para almacenar la información de la API
  const [productsList, setProductsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Estados de los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [selectedStatus, setSelectedStatus] = useState('TODOS');

  // Cargar categorías y productos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);

        // Petición de categorías
        const respCat = await fetch('/api/categories');
        if (respCat.ok) {
          const catData = await respCat.json();
          setCategories(Array.isArray(catData) ? catData : []);
        } else {
          console.error('Error al mapear categorías:', respCat.status);
        }

        // Petición de productos con rol ADMIN
        const respProd = await fetch('/api/products/admin/all?role=ADMIN');
        if (!respProd.ok) {
          throw new Error('Error al conectar con el inventario del servidor');
        }
        
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

  // Lógica del Filtro Combinado Reactivo en memoria
  const filteredProducts = useMemo(() => {
    const searchNormalized = searchTerm.toLowerCase().trim();
    if (!Array.isArray(productsList)) return [];

    return productsList.filter((product) => {
      if (!product) return false;
      
      // Extraer y validar Nombre y Marca
      const name = product.name ? product.name.toLowerCase() : '';
      const brand = product.brand ? product.brand.toLowerCase() : '';
      const matchesText = name.includes(searchNormalized) || brand.includes(searchNormalized);

      // Comprobar Filtro de Categoría
      const matchesCategory =
        selectedCategory === 'TODAS' ||
        (product.category && product.category.name === selectedCategory) ||
        product.categoryName === selectedCategory;

      // Comprobar Filtro de Estado
      let matchesStatus = true;
      if (selectedStatus === 'ACTIVO') matchesStatus = product.active === true;
      if (selectedStatus === 'INACTIVO') matchesStatus = product.active === false;

      return matchesText && matchesCategory && matchesStatus;
    });
  }, [productsList, searchTerm, selectedCategory, selectedStatus]);

  return (
    <div className="bodyWrapper" style={{ position: 'relative', minHeight: '100vh' }}>
      
      {/* ================= HEADER & NAV GLOBAL COMPORTAMIENTO FORZADO ================= */}
      <header className="mainHeader" style={{ position: 'relative', zIndex: 9999, overflow: 'visible' }}>
        <h1 className="marca">
          <img src={logo} alt="GlowGlam Logo" className="logo" />
        </h1>
        <nav className="mainNav" style={{ overflow: 'visible' }}>
          <ul style={{ overflow: 'visible' }}>
            <li><a href="/#acerca">Nosotros</a></li>
            
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

      {/* ================= CONTENEDOR PRINCIPAL (Z-INDEX BAJO) ================= */}
      <main className="contenedorFormularioCustom" style={{ position: 'relative', zIndex: 1 }}>
        <div className="contenedorAcerca">
          <h2>Control de Inventario General</h2>
          <p>Visualiza, filtra y gestiona todo el catálogo de productos de la tienda.</p>
        </div>

        {/* SECCIÓN DE FILTRADO */}
        <div className="panelFiltros">
          <div className="filtroBusqueda">
            <label htmlFor="search-input">Buscar por Nombre o Marca:</label>
            <input
              type="text"
              id="search-input"
              placeholder="Ej: Corrector, Atenea..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filtroCategory">
            <label htmlFor="filter-category">Categoría:</label>
            <select
              id="filter-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="TODAS">-- Todas las Categorías --</option>
              {categories.map((cat) => (
                <option key={cat.id || cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filtroEstado">
            <label htmlFor="filter-status">Estado:</label>
            <select
              id="filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="TODOS">Todos</option>
              <option value="ACTIVO">Activos</option>
              <option value="INACTIVO">Inactivos</option>
            </select>
          </div>
        </div>

        {/* SECCIÓN DE LISTADO GENERAL */}
        <div className="listaProductosHorizontal">
          {loading && <p className="estadoVacio">Sincronizando inventario...</p>}

          {error && !loading && (
            <p className="estadoVacio errorColor">
              ✖ Error de conexión con el inventario de la base de datos.
            </p>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <p className="estadoVacio">
              No se encontraron productos que coincidan con los filtros aplicados.
            </p>
          )}

          {!loading && !error && filteredProducts.map((p) => {
            if (!p) return null;
            const urlImagen = p.images && p.images.length > 0 ? p.images[0].imageUrl : 'https://via.placeholder.com/60?text=Glam';
            
            return (
              <div
                key={p.idBarcode}
                className={`productoFila ${!p.active ? 'inactivo' : ''}`}
              >
                <div className="infoColumna">
                  <img
                    src={urlImagen}
                    alt={p.name || 'Producto'}
                    onError={(e) => { 
                      e.currentTarget.onerror = null; 
                      e.currentTarget.src = 'https://via.placeholder.com/60?text=Glam'; 
                    }}
                    className="imagenProducto"
                  />

                  <div className="detallesTextuales">
                    <h4>{p.name}</h4>
                    <div className="metaInfoContainer">
                      <span><strong>Marca:</strong> {p.brand}</span>
                      <span>
                        <strong>Código:</strong> <code>{p.idBarcode}</code>
                      </span>
                      <span>
                        <strong>Categoría:</strong> {p.categoryName || (p.category ? p.category.name : 'Sin categoría')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="accionesColumna">
                  <span className="precioTexto">
                    ${Number(p.price || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })} COP
                  </span>

                  <span className={`badgeEstado ${p.active ? 'badgeActivo' : 'badgeInactivo'}`}>
                    {p.active ? 'Activo' : 'Inactivo'}
                  </span>

                  {/* CORRECCIÓN: Ruta de redirección unificada con la barra de navegación (/modifyProduct) */}
                  <Link
                    to={`/modifyProduct?barcode=${encodeURIComponent(p.idBarcode || '')}`}
                    className="btnModificarFila"
                  >
                    <i className="fas fa-edit"></i> Modificar
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="mainFooter" style={{ position: 'relative', zIndex: 1 }}>
        <p>&copy; 2026 GlowGlam S.A. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
