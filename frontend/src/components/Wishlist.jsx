import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import "./css/Wishlistmodule.css";
import logo from './img/logo.png';

export const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist', {
        credentials: 'include'
      });

      if (response.status === 401) {
        throw new Error('Debes iniciar sesión para ver tu lista.');
      }

      const data = await response.json();
      setWishlistItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

const handleRemove = async (barcode, name) => {
  const confirmDelete = window.confirm(`¿Eliminar "${name}" de favoritos?`);
  if (!confirmDelete) return;

  try {
    const response = await fetch('/api/wishlist/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ barcode })
    });

    const result = await response.json();

    if (result.status === 'removed') {
      const element = document.getElementById(`prod-${barcode}`);
      if (element) {
        element.classList.add('fade-out');

        setTimeout(() => {
          setWishlistItems(prev =>
            prev.filter(item => item.product.idBarcode !== barcode)
          );
        }, 300);
      }
    }

  } catch (err) {
    console.error(err);
  }
};

  if (loading) return <p className="loadingText">Cargando tus favoritos 💄...</p>;
  if (error) return <div className="errorBox">{error}</div>;

return (
  <div className="bodyWrapper">

    {/* 🔝 HEADER GLOBAL */}
    <header className="mainHeader">
      <h1 className="marca">
        {/* ¡ESTO ES LO CORRECTO! */}
                            <img src={logo} alt="GlowGlam Logo" className="logo" />
      </h1>

      <nav className="mainNav">
        <ul>
          <li><Link to="/">Productos</Link></li>

          {true ? ( // puedes luego meter session
            <>
              <li>
                <a href="/logout" style={{ color: '#AF1740', fontWeight: 'bold' }}>
                  <i className="fas fa-sign-out-alt"></i> Salir
                </a>
              </li>
            </>
          ) : (
            <li>
              <Link to="/Login">
                <i className="fas fa-user"></i> Iniciar sesión
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>

    {/* CONTENIDO */}
    <div className="wishlistWrapper">

      <div className="wishlistHeader">
        <h2><i className="fas fa-heart"></i> Mi Lista de Deseos</h2>
        <p>Productos guardados para ti 💖</p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="emptyWishlist">
          <i className="far fa-heart"></i>
          <p>Tu lista está vacía</p>
          <Link to="/" className="btnExplore">Explorar Productos</Link>
        </div>
      ) : (
        <div className="wishlistGrid">
          {wishlistItems.map(item => {
            const product = item.product;

            const image =
              product.images?.[0]?.imageUrl ||
              "https://via.placeholder.com/250?text=Glam+Product";

            return (
              <div
                key={product.idBarcode}
                id={`prod-${product.idBarcode}`}
                className="wishlistCard"
              >

                {/* ❌ BOTÓN ELIMINAR */}
                <button
                  className="btnRemoveX"
                  onClick={() => handleRemove(product.idBarcode, product.name)}
                >
                  <i className="fas fa-times"></i>
                </button>

                {/* 🖼 IMAGEN */}
                <div className="imgContainer">
                  <img src={image} alt={product.name} />
                </div>

                {/* INFO */}
                <div className="info">
                  <span className="brand">{product.brand}</span>
                  <h3>{product.name}</h3>

                  <p className="price">
                    ${Number(product.price).toLocaleString()}
                  </p>

                  <Link
                    to={`/producto/detalle?barcode=${product.idBarcode}`}
                    className="btnDetails"
                  >
                    Ver Detalles
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>

    {/* FOOTER */}
    <footer>
      <p>&copy; 2026 Glow & Glam</p>
    </footer>

  </div>
);
};