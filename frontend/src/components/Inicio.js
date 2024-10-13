import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../estilos/inicio.css';

const Inicio = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Eliminar el token de localStorage
    localStorage.removeItem('token');
    // Redirigir al login
    navigate('/login');
  };

  return (
    <div className="inicio-container">
      <nav className="menu-lateral">
        <h2>Menú</h2>
        <ul>
          <li><button onClick={() => navigate('/inicio')}>Inicio</button></li>
          <li><button onClick={() => navigate('/datos')}>Datos</button></li>
          <li><button onClick={() => navigate('/asignacion-custodio')}>Asignación de Custodio</button></li>
          <li><button onClick={() => navigate('/datos-custodiados')}>Datos Custodiados</button></li>
          <li><button onClick={handleLogout}>Cerrar sesión</button></li>
        </ul>
      </nav>
      <main className="contenido-principal">
        <h1>Bienvenidos</h1>
        <p>Esta es la página de inicio.</p>
      </main>
    </div>
  );
};

export default Inicio;
