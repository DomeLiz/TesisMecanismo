import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate


const PersonsList = () => {
  const [persons, setPersons] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Inicializar useNavigate

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const token = localStorage.getItem('token'); // Obtener el token del localStorage
        const response = await axios.get('http://localhost:3000/api/v1/persons', {
          headers: {
            Authorization: `Bearer ${token}` // Incluir el token en los headers
          }
        });
        setPersons(response.data);
      } catch (error) {
        if (error.response) {
          // La solicitud fue realizada y el servidor respondió con un código de estado
          // que está fuera del rango de 2xx
          setError(`Error: ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
          // La solicitud fue realizada pero no se recibió respuesta
          setError('Error: No se recibió respuesta del servidor.');
        } else {
          // Algo ocurrió al configurar la solicitud
          setError(`Error: ${error.message}`);
        }
        console.error(error);
      }
    };

    fetchPersons();
  }, []);

  const handleLogout = () => {
    // Elimina el token del almacenamiento local
    localStorage.removeItem('token');
    // Redirige al usuario a la página de login
    navigate('/login');
  };

  return (
    <div>
      <h2>Lista de Personas</h2>
      {error && <p>{error}</p>}
      <ul>
        {persons.map(person => (
          <li key={person.id}>
            {person.name} - {person.address} - {person.phone}
          </li>
        ))}
      </ul>
      <button onClick={handleLogout}>Cerrar sesión</button> {/* Agrega el botón */}
    </div>
  );
};

export default PersonsList;
