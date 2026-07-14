import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import newSeasonImg from './img/newSeason.png';
import newCollectionImg from './img/newCollection.png';
import betterPricesImg from './img/betterPrices.png';
import logo from './img/logo.png';
import "./css/Principalmodule.css";

export default function Principal({ session }) {
    // --- ESTADOS INTERNOS CONECTADOS A TU BACKEND ---
    const [allCategories, setAllCategories] = useState([]);
    const [activeProducts, setActiveProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados de interfaz y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);

    // --- NUEVOS ESTADOS Y REFERENCIAS PARA EL BUSCADOR DESPLEGABLE ---
    const [searchActive, setSearchActive] = useState(false);
    const buscadorRef = useRef(null);

    // Estado local para manejar de forma reactiva los favoritos sin recargar la página
    const [wishlistBarcodes, setWishlistBarcodes] = useState([]);

    // Datos para el formulario de contacto
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

    // Referencia para scroll suave hacia la sección de productos
    const productosSectionRef = useRef(null);

    // --- 📦 INYECCIÓN DINÁMICA DE FONT AWESOME ---
    useEffect(() => {
        const linkId = 'font-awesome-cdn';
        if (!document.getElementById(linkId)) {
            const link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css';
            document.head.appendChild(link);
        }
    }, []);

    // --- EFECTO PARA CERRAR EL DROPDOWN AL HACER CLIC AFUERA ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (buscadorRef.current && !buscadorRef.current.contains(event.target)) {
                setSearchActive(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- 🔄 EFECTO SEGURO E INDEPENDIENTE PARA TU BACKEND ---
    useEffect(() => {
        const cargarDatosDeBaseDeDatos = async () => {
            setLoading(true);

            // 1. INTENTAR CARGAR CATEGORÍAS
            try {
                const resCat = await fetch('/api/categories');
                if (resCat.ok) {
                    const categoriasData = await resCat.json();
                    console.log("🔍 [DEBUG] Categorías recibidas del backend:", categoriasData);
                    if (Array.isArray(categoriasData)) {
                        const categoriasActivas = categoriasData.filter(c => c.active === true || c.active === undefined);
                        setAllCategories(categoriasActivas);
                    }
                } else {
                    console.error("❌ El backend respondió con error en /api/categories. Código:", resCat.status);
                }
            } catch (error) {
                console.error("❌ Error de red o conexión al buscar categorías (/api/categories):", error);
            }

            // 2. INTENTAR CARGAR PRODUCTOS
            try {
                const resProd = await fetch('/api/products');
                if (resProd.ok) {
                    const productosData = await resProd.json();

                    // ALERTA DE DIAGNÓSTICO: Ver qué está llegando exactamente del Servidor
                    console.log("🔍 [DEBUG] Productos recibidas del backend:", productosData);

                    if (Array.isArray(productosData)) {
                        // Ojo con el filtro de p.active. Asegúrate de que en tu Base de datos no estén como falsos.
                        const activos = productosData.filter(p => p.active === true || p.active === undefined);
                        console.log("🔍 [DEBUG] Productos activos tras filtrar:", activos);
                        setActiveProducts(activos);
                    } else {
                        console.warn("⚠️ El backend no devolvió un Arreglo (Array) en /api/products.");
                    }
                } else {
                    console.error("❌ El backend respondió con error en /api/products. Código:", resProd.status);
                }
            } catch (error) {
                console.error("❌ Error de red o conexión al buscar productos (/api/products):", error);
            }

            // 3. INTENTAR CARGAR EL ESTADO INICIAL DE LA WISHLIST (¡CORREGIDO Y SEGURO!)
            if (session?.usuarioLogueado) {
                try {
                    const resWish = await fetch('/api/wishlist', {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include'
                    });

                    if (resWish.ok) {
                        const wishlistData = await resWish.json();

                        if (Array.isArray(wishlistData)) {
                            // Mapea los barcodes admitiendo tanto estructuras planas como anidadas (ej. item.product.idBarcode)
                            const barcodesValidos = wishlistData
                                .filter(item => item && (item.product?.idBarcode || item.idBarcode))
                                .map(item => item.product ? item.product.idBarcode : item.idBarcode);

                            setWishlistBarcodes(barcodesValidos);
                        }
                    } else {
                        console.error("❌ El backend respondió con error en /api/wishlist. Código:", resWish.status);
                        setWishlistBarcodes([]);
                    }
                } catch (error) {
                    console.error("❌ Error al procesar o parsear el flujo de la wishlist:", error);
                    setWishlistBarcodes([]);
                }
            }

            setLoading(false);
        };

        cargarDatosDeBaseDeDatos();
    }, [session]);

    // --- 🎠 MOTOR DEL BANNER ROTATIVO (CAROUSEL) ---
    const slides = useMemo(() => [newSeasonImg, newCollectionImg, betterPricesImg], []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    const handlePrevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    const handleNextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    // --- 🔍 LÓGICA DE FILTRADO EN TIEMPO REAL ---
    const normalizeText = (text) => {
        return text
            ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
            : '';
    };

    const filteredProducts = useMemo(() => {
        const term = normalizeText(searchTerm);
        if (!term) return activeProducts;

        return activeProducts.filter((p) => {
            const name = normalizeText(p.name);
            const brand = normalizeText(p.brand);
            const category = normalizeText(p.category?.name || p.category);
            return name.includes(term) || brand.includes(term) || category.includes(term);
        });
    }, [searchTerm, activeProducts]);

    // --- LÓGICA EXCLUSIVA PARA EL DESPLEGABLE (Evita cargar todos si no hay búsqueda) ---
    const dropdownProducts = useMemo(() => {
        const term = normalizeText(searchTerm);
        if (!term) return [];
        return filteredProducts;
    }, [searchTerm, filteredProducts]);

    const handleCategoryClick = (categoryName) => {
        if (searchTerm === categoryName) {
            setSearchTerm('');
        } else {
            setSearchTerm(categoryName);
        }

        if (productosSectionRef.current) {
            productosSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // --- 🛒 LÓGICA DE WISHLIST DINÁMICA ---
    const handleInteractuarWishlist = async (barcode) => {
        if (!session?.usuarioLogueado) {
            window.location.href = '/Login';
            return;
        }

        try {
            const response = await fetch('/api/wishlist/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ barcode })
            });

            if (response.status === 401) {
                window.location.href = '/Login';
                return;
            }

            const data = response.status === 204 ? {} : await response.json();

            if (data.status === 'added') {
                setWishlistBarcodes(prev => [...prev, barcode]);
            } else if (data.status === 'removed') {
                setWishlistBarcodes(prev => prev.filter(id => id !== barcode));
            }

        } catch (err) {
            console.error('Error wishlist:', err);
        }
    };

    // --- MANEJADORES DE EVENTOS ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setContactForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (res.ok) {
                localStorage.removeItem('usuarioLogueado');
                window.location.href = '/';
            } else {
                console.error("Error al cerrar sesión en el servidor");
            }
        } catch (error) {
            console.error("Error de red al intentar hacer logout:", error);
        }
    };

    const renderStars = (averageRating) => {
        const ratingRedondeado = Math.round(averageRating || 0);

        return (
            <div className="starsWrapper" style={{ color: '#FFD700', display: 'inline-flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((starIndex) => (
                    <i
                        key={starIndex}
                        className={starIndex <= ratingRedondeado ? 'fa-solid fa-star' : 'fa-regular fa-star'}
                    ></i>
                ))}
            </div>
        );
    };

    return (
        <div className="bodyWrapper">
            {/* ================= HEADER & NAV ================= */}
            <header className="mainHeader">
                <h1 className="marca">
                    <img src={logo} alt="GlowGlam Logo" className="logo" />
                </h1>
                <nav className="mainNav">
                    <ul>
                        <li><a href="#acerca">Nosotros</a></li>
                        <li><a href="#productos" className="activeLink">Products</a></li>
                        <li><a href="#contacto">Contacto</a></li>

                        {/* Buscador Integrado con Dropdown Flotante */}
                        <li style={{ position: 'relative' }} ref={buscadorRef}>
                            <div className="contenedorBuscadorHeader">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setSearchActive(true);
                                    }}
                                    onFocus={() => setSearchActive(true)}
                                    placeholder="Buscar productos, marcas..."
                                />
                                <i className="fas fa-search"></i>
                            </div>

                            {/* DROPDOWN DE RESULTADOS FLOTANTE */}
                            {searchActive && searchTerm.trim() !== '' && (
                                <div className="buscadorDropdown">
                                    {dropdownProducts.length > 0 ? (
                                        dropdownProducts.map((p) => {
                                            const imgSrc = p.images && p.images.length > 0
                                                ? p.images[0].imageUrl
                                                : (p.imageUrl || 'https://via.placeholder.com/50?text=Glam');
                                            return (
                                                <div key={p.idBarcode} className="buscadorDropdownItem">
                                                    <img src={imgSrc} alt={p.name} className="dropdownItemImg" />
                                                    <div className="dropdownItemInfo">
                                                        <span className="dropdownItemBrand">{p.brand}</span>
                                                        <p className="dropdownItemName">{p.name}</p>
                                                        <span className="dropdownItemPrice">
                                                            {Number(p.price).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                                                        </span>
                                                    </div>
                                                    <Link 
                                                        to={`/producto/detalle?barcode=${p.idBarcode}`} 
                                                        className="dropdownDetailBtn"
                                                        onClick={() => setSearchActive(false)}
                                                    >
                                                        Ver detalle
                                                    </Link>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="dropdownNoResults">
                                            Sin resultados para "{searchTerm}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </li>

                        {/* Control de Sesión Dinámico */}
                        {!session?.usuarioLogueado ? (
                            <>
                                <li>
                                    <Link to="/Login"><i className="fas fa-user"></i> Iniciar sesión</Link>
                                </li>
                                <li>
                                    <Link to="/Register"><i className="fas fa-user-plus"></i> Registrarse</Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="userGreeting" style={{ fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center' }}>
                                    <i className="fas fa-smile" style={{ marginRight: '5px', color: '#AF1740' }}></i>
                                    ¡Hola, <span>{session.usuarioLogueado.name}</span>!
                                </li>

                                <li>
                                    <Link to="/wishlist" style={{ color: '#AF1740', fontWeight: 'bold' }}>
                                        <i className="fas fa-heart"></i> Mi Wishlist
                                    </Link>
                                </li>

                                <li>
                                    <button onClick={handleLogout} className="logoutBtn" style={{ background: 'none', border: 'none', color: '#AF1740', fontWeight: 'bold', cursor: 'pointer' }}>
                                        <i className="fas fa-sign-out-alt"></i> Salir
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </header>

            {/* ================= CAROUSEL / BANNER ROTATIVO ================= */}
            <section id="inicio" className="carouselSection">
                <div className="imagenContainer">
                    {slides.map((src, index) => (
                        <img
                            key={src}
                            src={src}
                            alt={`Slide ${index}`}
                            className={`slide ${index === currentSlide ? 'activeSlide' : ''}`}
                        />
                    ))}

                    <button onClick={handlePrevSlide} className="btnMove btnPrev" aria-label="Anterior">
                        <i className="fas fa-chevron-left"></i>
                    </button>

                    <button onClick={handleNextSlide} className="btnMove btnNext" aria-label="Siguiente">
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            </section>

            {/* Pantalla de carga */}
            {loading && (
                <div className="loadingSpinner" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>Cargando catálogo de Glow & Glam...</p>
                </div>
            )}

            {!loading && (
                <>
                    {/* ================= CATEGORÍAS CIRCULARES BURBUJA ================= */}
                    <section className="seccionCategorias" style={{ backgroundColor: '#fcfaf7', padding: '40px 20px', textAlign: 'center' }}>
                        <div className="categoriasScroll">
                            {allCategories.map((cat) => {
                                const productosFiltrados = activeProducts.filter(p => (p.category?.name || p.category) === cat.name);
                                const tieneImagen = productosFiltrados.length > 0 && productosFiltrados[0].images?.length > 0;
                                const srcImagen = tieneImagen ? productosFiltrados[0].images[0].imageUrl : 'https://via.placeholder.com/100?text=Glow';

                                return (
                                    <div
                                        key={cat.id || cat.name}
                                        className={`categoriaBurbuja ${searchTerm === cat.name ? 'selectedCategory' : ''}`}
                                        onClick={() => handleCategoryClick(cat.name)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="burbujaImgContainer">
                                            <img
                                                src={srcImagen}
                                                alt={cat.name}
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Glam'; }}
                                            />
                                        </div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{cat.name.toUpperCase()}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* ================= GRILLA DE PRODUCTOS INTEGRADA ================= */}
                    <section id="productos" ref={productosSectionRef} className="contenedorProductosGrid">
                        <div className="cabeceraSeccion">
                            <h2>¡Productos pensados para ti!</h2>
                            <p>Descubre nuestra selección exclusiva de belleza y cuidado.</p>
                        </div>

                        {/* Banner sin Resultados de Búsqueda */}
                        {filteredProducts.length === 0 && activeProducts.length > 0 && (
                            <div className="sinResultados" style={{ textAlign: 'center', padding: '30px', color: '#666', fontStyle: 'italic', width: '100%' }}>
                                <i className="fas fa-search-minus" style={{ fontSize: '2rem', color: '#AF1740', marginBottom: '10px', display: 'block' }}></i>
                                No se encontraron productos que coincidan con tu búsqueda.
                            </div>
                        )}

                        <div className="productosGrid">
                            {filteredProducts.map((p) => {
                                const imgSrc = p.images && p.images.length > 0
                                    ? p.images[0].imageUrl
                                    : (p.imageUrl || 'https://via.placeholder.com/250?text=Glam+Product');
                                const isInWishlist = wishlistBarcodes.includes(p.idBarcode);

                                return (
                                    <div key={p.idBarcode} className="productoCard">
                                        <div className="productoImgContainer">
                                            <img
                                                src={imgSrc}
                                                alt={p.name}
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/250?text=Glam+Product'; }}
                                            />
                                        </div>
                                        <div className="productoInfo">
                                            <span className="productoMarca">{p.brand}</span>
                                            <h3>{p.name}</h3>
                                            <p className="productoPrecio">
                                                {Number(p.price).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                                            </p>

                                            {/* Sección del Rating en la Grilla */}
                                            <div className="producto-rating" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', marginBottom: '12px' }}>
                                                {renderStars(p.averageRating)}
                                                <span style={{ color: '#333', fontWeight: 'bold', marginLeft: '2px' }}>
                                                    {Number(p.averageRating || 0).toFixed(1)}
                                                </span>
                                                <span style={{ color: '#888', fontSize: '0.85rem' }}>
                                                    {` (${p.totalRatings || 0})`}
                                                </span>
                                            </div>

                                            {/* Acciones del Footer */}
                                            <div className="producto-acciones-footer" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', width: '100%' }}>
                                                <Link to={`/producto/detalle?barcode=${p.idBarcode}`} className="botonComprar" style={{ flexGrow: 1, margin: 0, textAlign: 'center' }}>
                                                    Ver Detalles
                                                </Link>

                                                <button
                                                    className="btn-card-wishlist"
                                                    onClick={() => handleInteractuarWishlist(p.idBarcode)}
                                                    title="Añadir a Wishlist"
                                                    style={{ background: '#f0ebf4', border: 'none', color: '#AF1740', width: '40px', height: '40px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}
                                                >
                                                    <i className={isInWishlist ? 'fas fa-heart' : 'far fa-heart'}></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Fallback de error o base de datos vacía */}
                            {activeProducts.length === 0 && (
                                <div className="productoCard" style={{ border: '1px dashed #ccc', opacity: 0.7 }}>
                                    <div className="productoImgContainer">
                                        <img src="https://via.placeholder.com/250?text=GlowGlam+Inventario" alt="Modo Espera" />
                                    </div>
                                    <div className="productoInfo">
                                        <span className="productoMarca">Atenea</span>
                                        <h3>Modo de espera de inventario (Sin productos en Base de Datos)</h3>
                                        <p className="productoPrecio">$0</p>

                                        <div className="producto-rating" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', marginBottom: '12px' }}>
                                            {renderStars(4.0)}
                                            <span style={{ color: '#333', fontWeight: 'bold', marginLeft: '3px' }}>4.0</span>
                                        </div>
                                        <div className="producto-acciones-footer" style={{ width: '100%' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'red', display: 'block', textAlign: 'center' }}>
                                                Revisa la consola F12: /api/products vino vacío.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </>
            )}

            {/* ================= SECCIÓN ACERCA DE ================= */}
            <section id="acerca" className="seccionAcerca">
                <div className="contenedorAcerca">
                    <h2>¡Conócenos!</h2>
                    <p>
                        En <strong>Glow & Glam</strong> somos una tienda dedicada a ofrecer
                        productos de maquillaje de alta calidad que resaltan tu brillo único.
                    </p>
                </div>
            </section>

            {/* ================= FORMULARIO DE CONTACTO ================= */}
            <section id="contacto" className="contenedorFormularioBase">
                <div className="cabeceraContacto">
                    <h2>¿Tienes alguna pregunta?</h2>
                    <p>Escríbenos y nuestro equipo te responderá en breve.</p>
                </div>
                <form action="/api/contact" method="post">
                    <label htmlFor="name">Nombre:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={contactForm.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Tu nombre completo"
                    />

                    <label htmlFor="email">Correo Electrónico:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={contactForm.email}
                        onChange={handleInputChange}
                        required
                        placeholder="ejemplo@correo.com"
                    />

                    <label htmlFor="message">Mensaje:</label>
                    <textarea
                        id="message"
                        name="message"
                        rows="5"
                        value={contactForm.message}
                        onChange={handleInputChange}
                        required
                        placeholder="¿En qué podemos ayudarte?"
                    ></textarea>

                    <button type="submit">Enviar Mensaje</button>
                </form>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="mainFooter">
                <p>&copy; 2026 Glow & Glam. Todos los derechos reservados.</p>
            </footer>

            <button onClick={handleScrollToTop} className="btnArriba" aria-label="Subir al inicio">↑</button>
        </div>
    );
}