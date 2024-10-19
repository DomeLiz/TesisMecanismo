//metodos para cceder a la base
const PersonsService = require('../service/persona.service');
const service = new PersonsService();

const create = async (req, res) => {
    try {
        const response = await service.create(req.body);
        res.json({ success: true, data: response});
    } catch ( error) {
        res.status(500).send({ success: false, message: error.message});
    }
}

const get = async (req, res) => {
    try {
        const response = await service.find();
        res.json(response);
    } catch ( error) {
        res.status(500).send({ success: false, message: error.message});
    }
}

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await service.findOne(id);
        res.json(response);
    } catch ( error) {
        res.status(500).send({ success: false, message: error.message});
    }
}

const getByCedula = async (req, res) => {
    try {
        const { cedula } = req.params; // Asegúrate de que estás obteniendo la cédula de los parámetros
        if (!cedula) {
            return res.status(400).send({ success: false, message: 'Cédula es requerida.' });
        }

        const response = await service.findByCedula(cedula); // Llama al método correcto
        res.json(response); // Devuelve la respuesta
    } catch (error) {
        console.error('Error en getByCedula:', error.message); // Mensaje de error más detallado
        res.status(500).send({ success: false, message: error.message });
    }
}



const update= async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const response = await service.update(id, body);
        res.json(response);
    } catch ( error) {
        res.status(500).send({ success: false, message: error.message});
    }
}

const _delete= async (req, res) => {
    try {
        const { id } = req.params;
        const response = await service.delete(id);
        res.json(response);
    } catch ( error) {
        res.status(500).send({ success: false, message: error.message});
    }
}

const assignCustodian = async (req, res) => {
    try {
        const { personId, custodianId } = req.body;

        // Verificar que no se asigna a sí mismo como custodio
        if (personId === custodianId) {
            return res.status(400).send({ success: false, message: 'No puedes asignarte a ti mismo como custodio.' });
        }

        // Lógica para asignar custodio (puedes guardar la relación en una tabla adicional si es necesario)
        const response = await service.assignCustodian(personId, custodianId);
        res.json({ success: true, data: response });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const getCustodian = async (req, res) => {
    const cedula = req.params.cedula;

    try {
        const custodio = await service.findCustodianByCedula(cedula);
        if (!custodio) {
            return res.status(404).json({ message: 'No hay custodio asignado para esta persona.' });
        }
        res.json({
            custodian: true,
            custodianName: custodio.name,
            custodianCedula: custodio.cedula,
        });
    } catch (error) {
        console.error('Error en getCustodian:', error.message); // Agregar logging para depuración
        res.status(500).json({ message: 'Error al obtener custodio: ' + error.message });
    }
};

const removeCustodian = async (req, res) => {
    try {
        const { cedula } = req.params;
        // Llamar al servicio para eliminar el custodio
        const response = await service.removeCustodian(cedula);
        res.json({ success: true, message: 'Custodio eliminado exitosamente', data: response });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};


module.exports = {
    create,
    get,
    getById,
    update,
    _delete,
    getByCedula,
    assignCustodian, 
    getCustodian,
    removeCustodian
};

