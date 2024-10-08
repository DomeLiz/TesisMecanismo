import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../estilos/inicio.css'; // Archivo de estilos para la página de inicio

const InicioAdmin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpiar token del localStorage y redirigir al login
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="inicio-container">
      <aside className="menu-lateral">
        <ul>
          <li><Link to="/inicio-admin">Inicio</Link></li>
          <li><Link to="/gestion-usuario">Gestión de usuarios</Link></li>
          <li><Link to="/auditoria">Registro de auditoria</Link></li>
          <li><button onClick={handleLogout}>Cerrar Sesión</button></li>
        </ul>
      </aside>
      <main className="contenido-principal">
        <h1>Bienvenidos</h1>
        <p>Seleccione una opción en el menú de la izquierda para continuar.</p>
      </main>
    </div>
  );
};

export default InicioAdmin;
