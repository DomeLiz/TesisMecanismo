import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Asegúrate de incluir Link aquí

const ActualizarUsuario = () => {
  const [cedula, setCedula] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    fecha_nacimiento: '',
    username: '',
    rol: '',
    nivel_confidencialidad: '',
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/v1/usuarios/cedula/${cedula}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuario(response.data);
      setFormData({
        nombre: response.data.nombre || '',
        apellido: response.data.apellido || '',
        email: response.data.email || '',
        telefono: response.data.telefono || '',
        direccion: response.data.direccion || '',
        fecha_nacimiento: response.data.fecha_nacimiento || '',
        username: response.data.username || '',
        rol: response.data.rol || '',
        nivel_confidencialidad: response.data.nivel_confidencialidad || '',
      });
      setError(null);
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Error al buscar usuario');
      setUsuario(null);
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/api/v1/usuarios/cedula/${cedula}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage('Usuario actualizado correctamente');
      setError(null);
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Error al actualizar usuario');
      setSuccessMessage('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="inicio-container">
      <aside className="menu-lateral">
        <ul>
          <li><Link to="/inicio-admin">Inicio</Link></li>
          <li><Link to="/gestion-usuario">Gestión de usuarios</Link></li>
          <li><Link to="/actualizar-datos">Actualizar Datos</Link></li>
          <li><Link to="/auditoria">Registro de auditoria</Link></li>
          <li><button onClick={handleLogout}>Cerrar Sesión</button></li>
        </ul>
      </aside>
      <main className="contenido-principal">
        <h3>Actualizar Usuario</h3>
        <div>
          <input
            type="text"
            placeholder="Ingrese la cédula del usuario"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
          />
          <button onClick={handleSearch}>Buscar</button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        {usuario && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdate();
            }}
          >
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="apellido"
              placeholder="Apellido"
              value={formData.apellido}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Correo"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="telefono"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="direccion"
              placeholder="Dirección"
              value={formData.direccion}
              onChange={handleInputChange}
              required
            />
            <input
              type="date"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleInputChange}
              required
            />
            <select
              name="rol"
              value={formData.rol}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione un Rol</option>
              <option value="admin">Administrador</option>
              <option value="user">Usuario</option>
            </select>
            <button type="submit">Actualizar</button>
          </form>
        )}
      </main>
    </div>
  );
};

export default ActualizarUsuario;
