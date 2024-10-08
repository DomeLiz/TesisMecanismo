import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import PersonsList from './components/PersonsList'; // Asegúrate de que esta línea esté presente
import VerifyOTP from './components/VerifyOTP'; // Asegúrate de que esta línea esté presente
import Inicio from './components/Inicio';
import InicioAdmin from './components/InicioAdmin';
import Auditoria from './components/Auditoria';
import GestionUsuarios from './components/GestionUsuarios';
import AsignacionCustodio from './components/AsignacionCustodio';
import Datos from './components/Datos';
import AdminVerifyOTP from './components/AdminVerifyOTP';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          {/* Redirigir la ruta principal "/" a la página de login */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Rutas específicas */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/persons" element={<PersonsList />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/datos" element={<Datos />} />
          <Route path="/asignacion-custodio" element={<AsignacionCustodio />} />
          <Route path="/gestion-usuario" element={<GestionUsuarios />} />
          <Route path="/auditoria" element={<Auditoria />} />
          <Route path="/inicio-admin" element={<InicioAdmin />} />
          <Route path="//admin-verify-otp" element={<AdminVerifyOTP />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
