import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GestionUsuarios = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cedula: '',
    direccion: '',
    fecha_nacimiento: '',
    username: '',
    password: '',
    rol: '',
    nivel_confidencialidad: '',
  });
  const [successMessage, setSuccessMessage] = useState(''); // Estado para el mensaje de éxito
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/v1/usuarios/register', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage('Usuario registrado con éxito'); // Establece el mensaje de éxito
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        cedula: '',
        direccion: '',
        fecha_nacimiento: '',
        username: '',
        password: '',
        rol: '',
        nivel_confidencialidad: '',
      });
      setError(null); // Limpia cualquier error previo
    } catch (error) {
      setError(error.response ? error.response.data.message : 'Error al registrar usuario');
      setSuccessMessage(''); // Limpia el mensaje de éxito en caso de error
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="inicio-container">
      <nav className="menu-lateral">
        <h2>Menú</h2>
        <ul>
          <li>
            <button onClick={() => navigate('/inicio-admin')}>Inicio</button>
          </li>
          <li>
            <button onClick={() => navigate('/gestion-usuario')}>Gestión de usuarios</button>
          </li>
          <li>
            <button onClick={() => navigate('/actualizar-datos')}>Actualizar Datos</button>
          </li>
         
          <li>
            <button onClick={handleLogout}>Cerrar sesión</button>
          </li>
        </ul>
      </nav>
      <main className="contenido-principal">
        <h3>Registrar Usuario</h3>
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>} {/* Mensaje de éxito */}
        {error && <p style={{ color: 'red' }}>{error}</p>} {/* Mensaje de error */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleInputChange} required />
          <input type="text" name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleInputChange} required />
          <input type="email" name="email" placeholder="Correo" value={formData.email} onChange={handleInputChange} required />
          <input type="text" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleInputChange} required />
          <input type="text" name="cedula" placeholder="Cédula" value={formData.cedula} onChange={handleInputChange} required />
          <input type="text" name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleInputChange} required />
          <input type="date" name="fecha_nacimiento" placeholder="Fecha de Nacimiento" value={formData.fecha_nacimiento} onChange={handleInputChange} required />
                   
          <select name="rol" value={formData.rol} onChange={handleInputChange} required>
            <option value="">Seleccione un Rol</option>
            <option value="admin">Administrador</option>
            <option value="user">Usuario</option>
          </select>
          
          <button type="submit">Registrar</button>
        </form>
      </main>
    </div>
  );
};

export default GestionUsuarios;
