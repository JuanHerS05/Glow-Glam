import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './css/AdminHomemodule.css';
import logo from './img/logo.png';

// CORRECCIÓN: Importación correcta de imágenes para que Vite las procese
import newSeasonImg from './img/newSeason.png';
import banner2Img from './img/newCollection.png'; // O tu banner2.png correspondiente
import banner3Img from './img/betterPrices.png';  // O tu banner3.png correspondiente

export default function AdminHome() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // CORRECCIÓN: Usamos las referencias importadas
  const imagenesCarrusel = [newSeasonImg, banner2Img, banner3Img];
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const [contacto, setContacto] = useState({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    const verificarYValidarAdmin = async () => {
      try {
        const checkResponse = await fetch('/api/check-admin', {
          credentials: 'include'
        });

        if (!checkResponse.ok) {
          navigate('/Login');
          return;
        }

        setIsAdmin(true);

        const dataResponse = await fetch('/api/home', {
          credentials: 'include'
        });
        if (dataResponse.ok) {
          const data = await dataResponse.json();
          setProductos(data.activeProducts || []);
        }
      } catch (error) {
        console.error(error);
        navigate('/Login');
      } finally {
        setLoading(false);
      }
    };

    verificarYValidarAdmin();
  }, [navigate]);

  const nextSlide = () => {
    setCurrentImgIndex((prev) => (prev + 1) % imagenesCarrusel.length);
  };

  const prevSlide = () => {
    setCurrentImgIndex(
      (prev) => (prev - 1 + imagenesCarrusel.length) % imagenesCarrusel.length
    );
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        localStorage.removeItem('usuarioLogueado');
        window.location.href = '/'; // Redirección limpia al home
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
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
      <header className="header">
        <h1 className="marca">
          <img src={logo} alt="GlowGlam Logo" className="logo" />
        </h1>
        <nav>
          <ul className="menuList">
            <li className="menuItem">
              <a href="#acerca" className="menuLink">Nosotros</a>
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
              <a href="#contacto" className="menuLink">Contacto</a>
            </li>
            <li className="menuItem">
              <a href="#" className="menuLink" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Cerrar sesión
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {/* ================= CARRUSEL ================= */}
      <section id="inicio">
        <div className="imagen-container">
          <img
            id="imagen-temporada"
            src={imagenesCarrusel[currentImgIndex]}
            alt="Nueva Temporada"
          />
          <button id="btn-prev" className="btn-move" onClick={prevSlide}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <button id="btn-next" className="btn-move" onClick={nextSlide}>
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
                <div
                  key={producto.idBarcode}
                  className={`producto ${!producto.active ? 'inactivo' : ''}`}
                >
                  <img src={urlImagen} alt={producto.name} />
                  <h3>{producto.name}</h3>
                  {!producto.active && (
                    <span className="badge-estado badge-inactivo">Agotado</span>
                  )}
                  <p>
                    {`$${Number(producto.price).toLocaleString('es-CO', {
                      minimumFractionDigits: 0
                    })} COP`}
                  </p>
                  <Link
                    className="boton-comprar"
                    to={`/producto/detalle?barcode=${producto.idBarcode}`}
                  >
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
          <p>
            En <strong>Glow &amp; Glam</strong> somos una tienda dedicada a
            ofrecer productos de maquillaje de alta calidad.
          </p>
        </div>
      </section>

      {/* ================= CONTACTO ================= */}
      <section id="contacto" className="contenedor-formulario">
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2>¿Tienes alguna pregunta?</h2>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Escríbenos y nuestro equipo te responderá en breve.
          </p>
        </div>
        <form onSubmit={handleContactSubmit}>
          <label htmlFor="name">Nombre:</label>
          <input
            id="name"
            type="text"
            required
            placeholder="Tu nombre completo"
            value={contacto.name}
            onChange={(e) => setContacto({ ...contacto, name: e.target.value })}
          />
          <label htmlFor="email">Correo Electrónico:</label>
          <input
            id="email"
            type="email"
            required
            placeholder="ejemplo@correo.com"
            value={contacto.email}
            onChange={(e) => setContacto({ ...contacto, email: e.target.value })}
          />
          <label htmlFor="message">Mensaje:</label>
          <textarea
            id="message"
            rows="5"
            required
            placeholder="¿En qué podemos ayudarte?"
            value={contacto.message}
            onChange={(e) => setContacto({ ...contacto, message: e.target.value })}
          />
          <button type="submit" style={{ marginTop: '15px' }}>
            Enviar Mensaje
          </button>
        </form>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <p>&copy; 2026 Glow &amp; Glam</p>
      </footer>

      <button
        id="btn-arriba"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑
      </button>
    </div>
  );
}
