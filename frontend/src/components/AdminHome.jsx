import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './css/AdminHomemodule.css';
import logo from './img/logo.png';
import newSeasonImg from './img/newSeason.png';
import newCollectionImg from './img/newCollection.png';
import betterPricesImg from './img/betterPrices.png';

export default function AdminHome() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const imagenesCarrusel = [newSeasonImg, newCollectionImg, betterPricesImg];
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const [openMenu, setOpenMenu] = useState(null);
  const navRef = useRef(null);

  const [contacto, setContacto] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    const stored = localStorage.getItem('usuarioLogueado');
    const user = stored ? JSON.parse(stored) : null;
    const rol = user ? (user.role || user.tipo) : null;

    if (!user || rol !== 'ADMIN') {
      navigate('/Login');
      return;
    }
    setIsAdmin(true);

    const cargarDatos = async () => {
      try {
        // Usamos /api/products (el mismo que el cliente) para que sí cargue el catálogo
        const dataResponse = await fetch('/api/products', { credentials: 'include' });
        if (dataResponse.ok) {
          const data = await dataResponse.json();
          const activos = Array.isArray(data)
            ? data.filter((p) => p.active === true || p.active === undefined)
            : [];
          setProductos(activos);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (menu) => setOpenMenu((prev) => (prev === menu ? null : menu));

  const nextSlide = () =>
    setCurrentImgIndex((prev) => (prev + 1) % imagenesCarrusel.length);
  const prevSlide = () =>
    setCurrentImgIndex((prev) => (prev - 1 + imagenesCarrusel.length) % imagenesCarrusel.length);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (_) {}
    localStorage.removeItem('usuarioLogueado');
    window.location.href = '/';
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contacto)
      });
      if (res.ok) {
        alert('Mensaje enviado correctamente');
        setContacto({ name: '', email: '', message: '' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="estado-vacio">
        <p>Verificando credenciales de administrador...</p>
      </div>
    );
  }

  return (
    <div className="bodyContainer">
      {/* ================= HEADER ================= */}
      <header className="mainHeader" ref={navRef} style={{ position: 'relative', zIndex: 9999, overflow: 'visible' }}>
        <h1 className="marca">
          <img src={logo} alt="GlowGlam Logo" className="logo" />
        </h1>
        <nav className="mainNav" style={{ overflow: 'visible' }}>
          <ul style={{ overflow: 'visible' }}>
            <li className="dropdown" style={{ position: 'relative', overflow: 'visible' }}>
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
            <li className="dropdown" style={{ position: 'relative', overflow: 'visible' }}>
              <Link to="#" onClick={(e) => { e.preventDefault(); toggleMenu('categorias'); }}>
                Categorías <i className="fas fa-chevron-down"></i>
              </Link>
              <ul className="dropdown-content" style={{ display: openMenu === 'categorias' ? 'block' : 'none', position: 'absolute', zIndex: 99999 }}>
                <li><Link to="/addCategory" onClick={() => setOpenMenu(null)}><i className="fas fa-folder-plus"></i> Crear Categoría</Link></li>
                <li><Link to="/modifyCategory" onClick={() => setOpenMenu(null)}><i className="fas fa-folder-minus"></i> Modificar Categoría</Link></li>
              </ul>
            </li>
            <li><a href="#" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Cerrar sesión</a></li>
          </ul>
        </nav>
      </header>

      {/* ================= CARRUSEL ================= */}
      <section id="inicio">
        <div className="imagen-container">
          <img id="imagen-temporada" src={imagenesCarrusel[currentImgIndex]} alt="Nueva Temporada" />
          <button id="btn-prev" className="btn-move" onClick={prevSlide} aria-label="Anterior">
            <i className="fas fa-chevron-left"></i>
          </button>
          <button id="btn-next" className="btn-move" onClick={nextSlide} aria-label="Siguiente">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </section>

      {/* ================= PRODUCTOS ================= */}
      <section id="productos" className="seccionProductosContenedor">
        <h2>¡Productos pensados para ti!</h2>
        {productos.length === 0 ? (
          <div className="estado-vacio">
            <p>No hay productos disponibles en este momento. ¡Vuelve pronto!</p>
          </div>
        ) : (
          <div className="productos-grid">
            {productos.map((producto) => {
              const urlImagen =
                producto.images && producto.images.length > 0
                  ? producto.images[0].imageUrl
                  : '/img/default-product.png';
              return (
                <div key={producto.idBarcode} className={`producto ${!producto.active ? 'inactivo' : ''}`}>
                  <img src={urlImagen} alt={producto.name} />
                  <h3>{producto.name}</h3>
                  {!producto.active && (<span className="badge-estado badge-inactivo">Agotado</span>)}
                  <p>{`$${Number(producto.price).toLocaleString('es-CO', { minimumFractionDigits: 0 })} COP`}</p>
                  <Link className="boton-comprar" to={`/producto/detalle?barcode=${producto.idBarcode}`}>
                    Ver Detalle
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= ACERCA DE ================= */}
      <section id="acerca">
        <div className="contenedor-acerca">
          <h2>¡Conócenos!</h2>
          <p>En <strong>Glow &amp; Glam</strong> somos una tienda dedicada a ofrecer productos de maquillaje de alta calidad.</p>
        </div>
      </section>

      {/* ================= CONTACTO ================= */}
      <section id="contacto" className="contenedor-formulario">
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2>¿Tienes alguna pregunta?</h2>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Escríbenos y nuestro equipo te responderá en breve.</p>
        </div>
        <form onSubmit={handleContactSubmit}>
          <label htmlFor="name">Nombre:</label>
          <input id="name" type="text" required placeholder="Tu nombre completo" value={contacto.name} onChange={(e) => setContacto({ ...contacto, name: e.target.value })} />
          <label htmlFor="email">Correo Electrónico:</label>
          <input id="email" type="email" required placeholder="ejemplo@correo.com" value={contacto.email} onChange={(e) => setContacto({ ...contacto, email: e.target.value })} />
          <label htmlFor="message">Mensaje:</label>
          <textarea id="message" rows="5" required placeholder="¿En qué podemos ayudarte?" value={contacto.message} onChange={(e) => setContacto({ ...contacto, message: e.target.value })} />
          <button type="submit" style={{ marginTop: '15px' }}>Enviar Mensaje</button>
        </form>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <p>&copy; 2026 Glow &amp; Glam</p>
      </footer>

      <button id="btn-arriba" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>
    </div>
  );
}
