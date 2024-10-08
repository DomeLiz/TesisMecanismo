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
      // Verificar las credenciales para determinar el rol
      if (form.cedula === '1750691111' && form.password === 'adminadmin') {
        // Guarda el token en el localStorage (suponiendo que tu backend retorna un token)
        localStorage.setItem('token', 'fake-token-for-admin'); // Sustituye con el token real si lo tienes

        // Redirigir a la página de verificación OTP
        navigate('/verify-otp', { state: { isAdmin: true } }); // Indicar que es un admin
      } else {
        // Realiza la petición de login al backend para otros usuarios
        const response = await axios.post('http://localhost:3000/api/v1/auth/login', form);

        // Guarda el token en el localStorage (suponiendo que tu backend retorna un token)
        localStorage.setItem('token', response.data.token);

        // Redirigir a la página de verificación OTP
        navigate('/verify-otp', { state: { isAdmin: false } }); // Indicar que no es un admin
      }
    } catch (error) {
      console.error(error);
      setError('Error en el login');
    }
  };

  const handleRegister = () => {
    navigate('/register'); // Redirige a la página de registro
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Iniciar sesión</button>
        {error && <p>{error}</p>}
      </form>
      <button onClick={handleRegister}>Registrarse</button> {/* Botón de registro */}
    </div>
  );
};

export default Login;
