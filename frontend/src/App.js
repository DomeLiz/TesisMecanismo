import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import PersonsList from './components/PersonsList'; // Asegúrate de que esta línea esté presente
import VerifyOTP from './components/VerifyOTP'; // Asegúrate de que esta línea esté presente


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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
