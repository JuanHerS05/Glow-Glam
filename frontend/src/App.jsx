import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Principal from './components/Principal';
import Login from './components/Login';
import Register from './components/Register';
import AdminHome from './components/AdminHome';
import AddProduct from './components/AddProduct';      
import EditProductForm from './components/EditProductForm';    
import ModifyProduct from './components/ModifyProduct'; 
import AddCategory from './components/AddCategory';
import ModifyCategory from './components/ModifyCategory';
import Inventariu from './components/Inventariu';
import DetalleProducto from './components/DetalleProducto';
import { Wishlist } from './components/Wishlist';

function App() {
  // Obtenemos los datos guardados de la sesión (si existen)
  const user = JSON.parse(localStorage.getItem('usuarioLogueado'));
  const sessionData = user ? { usuarioLogueado: user } : null;

  return (
    <Router>
      <Routes>
        {/* Pasamos la sesión actual al componente Principal */}
        <Route path="/" element={<Principal session={sessionData} />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/producto/detalle" element={<DetalleProducto session={sessionData} />} />
        <Route path="/wishlist" element={<Wishlist />} />
        
        {/* Rutas de administración */}
        <Route path="/adminHome" element={<AdminHome />} />
        <Route path="/admin/all" element={<Inventariu />} /> 
        
        {/* CRUD de Productos */}
        <Route path="/addProduct" element={<AddProduct />} />
        
        {/* 🔥 CORRECCIÓN: Cada componente ahora tiene su ruta única y exclusiva */}
        <Route path="/modifyProduct" element={<ModifyProduct />} />
        <Route path="/updateProduct" element={<EditProductForm />} />

        {/* CRUD de Categorías */}
        <Route path="/addCategory" element={<AddCategory />} />
        <Route path="/modifyCategory" element={<ModifyCategory />} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;