import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({ cedula: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/v1/auth/login', form);
      navigate('/verify-otp', { state: { cedula: form.cedula } });
    } catch (error) {
      console.error(error);
      setError('Error en el login');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="cedula" placeholder="Cédula" value={form.cedula} onChange={handleChange} required />
      <input name="password" placeholder="Contraseña" type="password" value={form.password} onChange={handleChange} required />
      <button type="submit">Iniciar sesión</button>
      {error && <p>{error}</p>}
    </form>
  );
};

export default Login;
