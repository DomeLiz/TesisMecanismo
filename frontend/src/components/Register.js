import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate para la navegación
import axios from 'axios';

const Register = () => {
  const [form, setForm] = useState({
    cedula: '',
    password: '',
    name: '',
    address: '',
    phone: '',
    email: '',
  });
  const navigate = useNavigate(); // Hook para la navegación

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/v1/auth/register', form);
      alert('Registro exitoso');
      navigate('/login'); // Redirigir al login después de un registro exitoso
    } catch (error) {
      console.error(error);
      alert('Error en el registro');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        placeholder="Nombre"
        value={form.name}
        onChange={handleChange}
        required
      />
      <input
        name="address"
        placeholder="Dirección"
        value={form.address}
        onChange={handleChange}
        required
      />
      <input
        name="phone"
        placeholder="Teléfono"
        value={form.phone}
        onChange={handleChange}
      />
      <input
        name="email"
        placeholder="Correo"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        name="cedula"
        placeholder="Cédula"
        value={form.cedula}
        onChange={handleChange}
        required
      />
      <input
        name="password"
        placeholder="Contraseña"
        type="password"
        value={form.password}
        onChange={handleChange}
        required
      />
      <button type="submit">Registrarse</button>
    </form>
  );
};

export default Register;
