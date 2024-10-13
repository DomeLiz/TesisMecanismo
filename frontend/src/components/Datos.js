import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Datos = () => {
    const [personData, setPersonData] = useState(null);
    const cedula = localStorage.getItem('cedula'); // Obtener la cédula desde localStorage
    const token = localStorage.getItem('token'); // Obtener el token desde localStorage
    const navigate = useNavigate(); // Usar useNavigate para la navegación

    useEffect(() => {
        const fetchPersonData = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/v1/persons/cedula/${cedula}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setPersonData(response.data);
            } catch (error) {
                console.error('Error al obtener los datos de la persona:', error);
            }
        };

        if (cedula) {
            fetchPersonData();
        }
    }, [cedula, token]);

    const handleLogout = () => {
        // Eliminar el token y cédula de localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('cedula');
        // Redirigir al login
        navigate('/login');
    };

    return (
        <div className="datos-container">
            <nav className="menu-lateral">
                <h2>Menú</h2>
                <ul>
                <li><button onClick={() => navigate('/inicio')}>Inicio</button></li>
                <li><button onClick={() => navigate('/datos')}>Datos</button></li>
                <li><button onClick={() => navigate('/asignacion-custodio')}>Asignación de Custodio</button></li>
                <li><button onClick={handleLogout}>Cerrar sesión</button></li>
                </ul>
            </nav>
            <main className="contenido-principal">
                <h1>Datos de la Persona</h1>
                {personData ? (
                    <div>
                        <p><strong>Nombre:</strong> {personData.name}</p>
                        <p><strong>Dirección:</strong> {personData.address}</p>
                        <p><strong>Teléfono:</strong> {personData.phone}</p>
                        <p><strong>Correo:</strong> {personData.email}</p>
                        <p><strong>Cédula:</strong> {personData.cedula}</p>
                    </div>
                ) : (
                    <p>Cargando datos...</p>
                )}
            </main>
        </div>
    );
};

export default Datos;
