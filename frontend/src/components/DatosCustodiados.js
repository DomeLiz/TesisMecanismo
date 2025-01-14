import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DatosCustodiados = () => {
    const [personData, setPersonData] = useState(null);
    const [custodiados, setCustodiados] = useState([]); // Estado para almacenar los datos de los custodiados
    const token = localStorage.getItem('token'); // Obtener el token desde localStorage
    const custodioCedula = localStorage.getItem('cedula'); // Obtener la cédula del custodio de localStorage
    const navigate = useNavigate(); // Usar useNavigate para la navegación

    useEffect(() => {
        // Fetch para obtener los datos de la persona
        const fetchPersonData = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/v1/usuarios/cedula/${custodioCedula}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setPersonData(response.data);
            } catch (error) {
                console.error('Error al obtener los datos de la persona:', error);
            }
        };

        // Fetch para obtener los custodiados del custodio
        const fetchCustodiadosData = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/v1/usuarios/custodiados/${custodioCedula}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Verificar si la respuesta contiene la propiedad 'custodiados' y asignar esos datos
                if (response.data && Array.isArray(response.data.custodiados)) {
                    setCustodiados(response.data.custodiados);
                } else {
                    console.error('No se encontraron custodiados o la respuesta tiene formato incorrecto');
                    setCustodiados([]); // Si no hay custodiados o la respuesta tiene un formato inesperado
                }
            } catch (error) {
                console.error('Error al obtener los custodiados:', error);
            }
        };

        fetchPersonData();
        fetchCustodiadosData(); // Verificar los custodiados del custodio
    }, [token, custodioCedula]);

    // Función para cerrar sesión
    const handleLogout = () => {
        // Eliminar el token y cédula de localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('cedula');
        // Redirigir al login
        navigate('/login');
    };

    // Función para manejar la edición de los datos de un custodiado
    const handleEditClick = (custodiado) => {
        // Navegar a la página de edición, pasando los datos del custodiado
        navigate('/editar-datos-custodiados', { state: { custodiado } });
    };

    return (
        <div className="datos-container">
            <nav className="menu-lateral">
                <h2>Menú</h2>
                <ul>
                    <li><button onClick={() => navigate('/inicio')}>Inicio</button></li>
                    <li><button onClick={() => navigate('/datos')}>Datos</button></li>
                    <li><button onClick={() => navigate('/asignacion-custodio')}>Asignación de Custodio</button></li>
                    <li><button onClick={() => navigate('/datos-custodiados')}>Datos Custodiados</button></li>
                    <li><button onClick={() => navigate('/eliminar-datos')}>Eliminar Datos Custodiados</button></li>
                    <li><button onClick={handleLogout}>Cerrar sesión</button></li>
                </ul>
            </nav>
            <main className="contenido-principal">
                <h1>Datos de la Persona</h1>
                {personData ? (
                    <div>
                        <p><strong>ID:</strong> {personData.usuario_id}</p>
                        <p><strong>Nombre:</strong> {personData.nombre}</p>
                        <p><strong>Apellido:</strong> {personData.apellido}</p>
                    </div>
                ) : (
                    <p>Cargando datos...</p>
                )}

                <h2>Custodiados</h2>
                {custodiados.length > 0 ? (
                    custodiados.map(custodiado => (
                        <div key={custodiado.cedula} className="custodiado-datos">
                            <br />
                            <p><strong>Nombre:</strong> {custodiado.nombre}</p>
                            <p><strong>Dirección:</strong> {custodiado.direccion}</p>
                            <p><strong>Teléfono:</strong> {custodiado.telefono}</p>
                            <p><strong>Correo:</strong> {custodiado.email}</p>
                            <p><strong>Cédula:</strong> {custodiado.cedula}</p>
                            <button onClick={() => handleEditClick(custodiado)}>Editar Datos</button>
                            <br />
                        </div>
                    ))
                ) : (
                    <p>Usted no es custodio de ningún usuario.</p>
                )}
            </main>
        </div>
    );
};

export default DatosCustodiados;
