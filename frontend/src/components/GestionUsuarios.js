import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GestionUsuarios = () => {
  const [persons, setPersons] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ name: '', address: '', phone: '', email: '', cedula: '', password: '' });
  const [editingId, setEditingId] = useState(null); // ID de la persona que está siendo editada
  const navigate = useNavigate();

  const fetchPersons = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/v1/persons', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPersons(response.data);
    } catch (error) {
      setError(error.response ? `Error: ${error.response.status} - ${error.response.statusText}` : 'Error al obtener datos');
    }
  };

  useEffect(() => {
    fetchPersons();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/v1/persons', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Usuario registrado correctamente');
      setFormData({ name: '', address: '', phone: '', email: '', cedula: '', password: '' });
      fetchPersons(); // Actualiza la lista de personas
    } catch (error) {
      setError(error.response ? error.response.data.message : 'Error al registrar usuario');
    }
  };

  const handleEdit = (person) => {
    setEditingId(person.id);
    setFormData(person);
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/api/v1/persons/${editingId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Usuario actualizado correctamente');
      setEditingId(null);
      setFormData({ name: '', address: '', phone: '', email: '', cedula: '', password: '' });
      fetchPersons(); // Actualiza la lista de personas
    } catch (error) {
      setError(error.response ? error.response.data.message : 'Error al actualizar usuario');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/v1/persons/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Usuario eliminado correctamente');
        fetchPersons(); // Actualiza la lista de personas
      } catch (error) {
        setError(error.response ? error.response.data.message : 'Error al eliminar usuario');
      }
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
          <li><button onClick={() => navigate('/inicio-admin')}>Inicio</button></li>
          <li><button onClick={() => navigate('/gestion-usuario')}>Gestión de usuarios</button></li>
          <li><button onClick={() => navigate('/auditoria')}>Registro de auditoria</button></li>
          <li><button onClick={handleLogout}>Cerrar sesión</button></li>
        </ul>
      </nav>
      <main className="contenido-principal">
        <h2>Lista de Personas</h2>
        {error && <p>{error}</p>}
        <ul>
          {persons.map(person => (
            <li key={person.id}>
              {person.name} - {person.address} - {person.phone} - {person.email} - {person.cedula}
              <button onClick={() => handleEdit(person)}>Editar</button>
              <button onClick={() => handleDelete(person.id)}>Eliminar</button>
            </li>
          ))}
        </ul>

        <h3>{editingId ? 'Modificar Usuario' : 'Registrar Usuario'}</h3>
        <form onSubmit={(e) => { e.preventDefault(); editingId ? handleUpdate() : handleCreate(); }}>
          <input type="text" name="name" placeholder="Nombre" value={formData.name} onChange={handleInputChange} required />
          <input type="text" name="address" placeholder="Dirección" value={formData.address} onChange={handleInputChange} required />
          <input type="text" name="phone" placeholder="Teléfono" value={formData.phone} onChange={handleInputChange} required />
          <input type="email" name="email" placeholder="Correo" value={formData.email} onChange={handleInputChange} required />
          <input type="text" name="cedula" placeholder="Cédula" value={formData.cedula} onChange={handleInputChange} required />
          <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleInputChange} required={!editingId} />
          <button type="submit">{editingId ? 'Modificar' : 'Registrar'}</button>
        </form>
      </main>
    </div>
  );
};

export default GestionUsuarios;
