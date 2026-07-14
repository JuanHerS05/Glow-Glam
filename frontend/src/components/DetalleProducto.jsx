import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './css/DetalleProducto.css'; 
import logo from './img/logo.png';

export default function DetalleProducto({ session }) {
    const location = useLocation();
    const navigate = useNavigate();

    // --- LECTURA DEL BARCODE DESDE LA URL ---
    const barcodeQuery = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('barcode');
    }, [location.search]);

    // --- ESTADOS INTERNOS DEL PRODUCTO ---
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [promedioRating, setPromedioRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);

    // Estados de Galería de Imágenes
    const [indiceActualImg, setIndiceActualImg] = useState(0);

    // Estados de Wishlist (Favoritos)
    const [isInWishlist, setIsInWishlist] = useState(false);

    // Estados de Calificación e Interfaz
    const [score, setScore] = useState(5); 
    const [comment, setComment] = useState('');
    const [alertSuccess, setAlertSuccess] = useState('');
    const [alertError, setAlertError] = useState('');

    // --- 📦 INYECCIÓN DE FONT AWESOME ---
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

    // --- 🔄 CARGA INICIAL DEL PRODUCTO Y ESTADO DE WISHLIST ---
    useEffect(() => {
        if (!barcodeQuery) return;

        const cargarDetalleProducto = async () => {
            setLoading(true);
            try {
                // Se agrega credentials: 'include' para que Spring Boot lea la sesión y asigne 'inWishlist' correctamente
                const res = await fetch(`/api/products/barcode/${barcodeQuery}`, {
                    credentials: 'include'
                });
                
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);
                    setPromedioRating(data.averageRating || 0);
                    setTotalRatings(data.totalRatings || 0);
                    
                    // Sincroniza directamente la propiedad calculada por tu ProductController
                    setIsInWishlist(!!data.inWishlist);
                } else {
                    console.error("El servidor respondió con un error al buscar el producto");
                    setProduct(null);
                }
            } catch (error) {
                console.error("Error de red al conectar con el backend:", error);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        cargarDetalleProducto();
    }, [barcodeQuery, session]);

    // --- 🎠 NAVEGACIÓN DE LA GALERÍA DE IMÁGENES ---
    const imagenesList = useMemo(() => {
        if (product && product.images && product.images.length > 0) {
            return product.images.map(img => img.imageUrl);
        }
        return ['https://via.placeholder.com/450?text=Glam+Product'];
    }, [product]);

    const navegarImagen = (direccion) => {
        if (imagenesList.length <= 1) return;
        setIndiceActualImg((prevIndex) => {
            let nuevoIndex = prevIndex + direccion;
            if (nuevoIndex < 0) return imagenesList.length - 1;
            if (nuevoIndex >= imagenesList.length) return 0;
            return nuevoIndex;
        });
    };

    // --- 🛒 INTEGRACIÓN ASÍNCRONA DE WISHLIST ---
    const handleInteractuarWishlist = async () => {
        if (!session?.usuarioLogueado) {
            navigate('/Login');
            return;
        }

        try {
            const response = await fetch('/api/wishlist/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    barcode: barcodeQuery
                })
            });

            if (response.status === 401) {
                navigate('/Login');
                return;
            }

            const data = await response.json();

            // Modifica el estado según el estado devuelto por tu WishlistController
            if (data.status === 'added') {
                setIsInWishlist(true);
            } else if (data.status === 'removed') {
                setIsInWishlist(false);
            }

        } catch (err) {
            console.error('Error al actualizar Wishlist:', err);
            setAlertError("Error al actualizar favoritos.");
        }
    };

    // --- ⭐ ENVÍO DE CALIFICACIÓN ---
    const handleEnviarCalificacion = async (e) => {
        e.preventDefault();
        setAlertSuccess('');
        setAlertError('');

        const payload = {
            productBarcode: barcodeQuery,
            score: parseInt(score, 10),
            comment: comment,
            client: session?.usuarioLogueado 
        };

        try {
            const response = await fetch('/api/ratings/rate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) { 
                setAlertSuccess(data.message);
                setComment('');
                if (data.nuevoPromedio !== undefined && data.nuevoPromedio !== null) {
                    setPromedioRating(data.nuevoPromedio);
                }
                if (data.nuevoTotal !== undefined && data.nuevoTotal !== null) {
                    setTotalRatings(data.nuevoTotal);
                }
            } else {
                setAlertError(data.message || 'Ocurrió un inconveniente al procesar tu calificación.');
            }
        } catch (err) {
            console.error('Error al procesar la calificación:', err);
            setAlertError('Hubo un problema de conexión al enviar tu calificación.');
        }
    };

    const renderEstrellas = (rating) => {
        const ratingRedondeado = Math.round(rating);
        return (
            <div className="contenedor-estrellas">
                {[1, 2, 3, 4, 5].map((i) => (
                    <i key={i} className={i <= ratingRedondeado ? 'fas fa-star' : 'far fa-star'}></i>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="loadingSpinner" style={{ textAlign: 'center', padding: '5rem', color: '#666' }}>
                <p>Cargando detalles del producto cosmético...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ textAlign: 'center', padding: '5rem' }}>
                <h3>Producto no encontrado</h3>
                <Link to="/" className="btn-volver">Regresar al inicio</Link>
            </div>
        );
    }

    return (
        <div className="bodyWrapper">
            <header className="mainHeader">
                <h1 className="marca">
                    <img src={logo} alt="GlowGlam Logo" className="logo" />
                </h1>
                <nav className="mainNav">
                    <ul>
                        <li><Link to="/#productos">Productos</Link></li>
                        {session?.usuarioLogueado ? (
                            <>
                                <li className="userGreeting" style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', color: '#333' }}>
                                    <i className="fas fa-smile" style={{ marginRight: '5px', color: '#AF1740' }}></i>
                                    ¡Hola, <span>{session.usuarioLogueado.name}</span>!
                                </li>
                                <li>
                                    <Link to="/logout" style={{ color: '#AF1740', fontWeight: 'bold' }}>
                                        <i className="fas fa-sign-out-alt"></i> Salir
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <li>
                                <Link to="/Login"><i className="fas fa-user"></i> Iniciar sesión</Link>
                            </li>
                        )}
                    </ul>
                </nav>
            </header>

            <div className="main-wrapper">
                <div className="detalle-container">
                    
                    {/* Bloque Izquierdo: Galería */}
                    <div className="bloque-imagen">
                        <div className="visor-principal">
                            <button type="button" className="btn-nav-img prev" onClick={() => navegarImagen(-1)} aria-label="Anterior">
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <img 
                                id="imagenPrincipal" 
                                src={imagenesList[indiceActualImg]} 
                                alt={product.name}
                                onError={(e) => { 
                                    e.currentTarget.onerror = null; 
                                    e.currentTarget.src = 'https://via.placeholder.com/450?text=Glam+Product'; 
                                }}
                            />
                            <button type="button" className="btn-nav-img next" onClick={() => navegarImagen(1)} aria-label="Siguiente">
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>

                        {imagenesList.length > 1 && (
                            <div className="galeria-miniaturas">
                                {imagenesList.map((imgUrl, index) => (
                                    <div 
                                        key={index} 
                                        className={`miniatura-item ${index === indiceActualImg ? 'activa' : ''}`}
                                        style={{ border: `2px solid ${index === indiceActualImg ? '#AF1740' : '#ddd'}` }}
                                        onClick={() => setIndiceActualImg(index)}
                                    >
                                        <img 
                                            src={imgUrl} 
                                            alt={`Miniatura ${index}`} 
                                            onError={(e) => { 
                                                e.currentTarget.onerror = null; 
                                                e.currentTarget.src = 'https://via.placeholder.com/70?text=Glam'; 
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bloque Derecho: Info */}
                    <div className="bloque-info">
                        <span className="marca-tag">{product.brand}</span>
                        <h2 className="producto-titulo">{product.name}</h2>
                        
                        <div className="rating-resumen">
                            {renderEstrellas(promedioRating)}
                            <span className="rating-valor" id="uiPromedio">{Number(promedioRating).toFixed(1)}</span>
                            <span className="rating-contador" id="uiTotal">({totalRatings} calificaciones)</span>
                        </div>

                        <div className="producto-precio-detalle">
                            {Number(product.price).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                        </div>
                        
                        <p className="producto-descripcion">
                            {product.description || "¡Descubre el secreto para resaltar tu belleza única! Este producto de alta gama ha sido seleccionado minuciosamente para ofrecerte la mejor pigmentación, durabilidad y acabado profesional en tu rutina diaria."}
                        </p>

                        {/* Botón sincronizado */}
                        <button 
                            type="button" 
                            id="btnWishlist" 
                            className={`btn-wishlist ${isInWishlist ? 'active-wishlist' : ''}`} 
                            onClick={handleInteractuarWishlist}
                        >
                            <i className={isInWishlist ? 'fas fa-heart' : 'far fa-heart'}></i>
                            <span id="textWishlist">
                                {isInWishlist ? 'Eliminar de wishlist' : 'Añadir a lista de deseos'}
                            </span>
                        </button>

                        <div className="seccion-calificar">
                            {alertSuccess && <div className="alert-box alert-success" style={{ display: 'block' }}>{alertSuccess}</div>}
                            {alertError && <div className="alert-box alert-error" style={{ display: 'block' }}>{alertError}</div>}

                            {!session?.usuarioLogueado ? (
                                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                                    <i className="fas fa-lock" style={{ marginRight: '5px' }}></i> 
                                    Debes iniciar sesión para calificar este producto. 
                                    <Link to="/Login" style={{ color: '#AF1740', fontWeight: 'bold', textDecoration: 'none', marginLeft: '4px' }}>Iniciar Sesión</Link>
                                </div>
                            ) : (
                                <form onSubmit={handleEnviarCalificacion}>
                                    <h4>Califica tu experiencia:</h4>
                                    <select 
                                        id="selectScore" 
                                        className="select-score" 
                                        value={score} 
                                        onChange={(e) => setScore(e.target.value)}
                                    >
                                        <option value="5">⭐⭐⭐⭐⭐ (5 - Excelente)</option>
                                        <option value="4">⭐⭐⭐⭐ (4 - Bueno)</option>
                                        <option value="3">⭐⭐⭐ (3 - Regular)</option>
                                        <option value="2">⭐⭐ (2 - Malo)</option>
                                        <option value="1">⭐ (1 - Pésimo)</option>
                                    </select>
                                    <textarea 
                                        id="txtComment" 
                                        className="txt-comment" 
                                        rows="3" 
                                        placeholder="Deja un comentario sobre tu producto..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    ></textarea>
                                    <button type="submit" className="btn-submit-rating">Enviar Calificación</button>
                                </form>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <footer>
                <p>&copy; 2026 Glow & Glam. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}