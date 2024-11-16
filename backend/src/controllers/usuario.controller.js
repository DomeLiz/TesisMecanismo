const UsuarioService = require('../service/usuario.service');

class UsuarioController {
  async crearUsuario(req, res) {
    try {
      const usuarioData = req.body;
      const newUsuario = await UsuarioService.crearUsuario(usuarioData);
      res.status(201).json(newUsuario);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async find(req, res) {
    try {
      const usuarios = await UsuarioService.find();
      res.status(200).json(usuarios);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Buscar un usuario por ID
  async findOne(req, res) {
    try {
      const { id } = req.params; // Obtener el ID de los parámetros de la ruta
      const usuario = await UsuarioService.findOne(id);
      res.status(200).json(usuario);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Buscar un usuario por cédula
  async findByCedula(req, res) {
    try {
      const { cedula } = req.params; // Obtener la cédula de los parámetros de la ruta
      const usuario = await UsuarioService.findByCedula(cedula);
      res.status(200).json(usuario);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Actualizar un usuario por cédula
  async update(req, res) {
    try {
      const { cedula } = req.params; // Obtener la cédula de los parámetros de la ruta
      const usuarioData = req.body; // Obtener los datos a actualizar desde el cuerpo de la solicitud
      const updatedUsuario = await UsuarioService.update(cedula, usuarioData);
      res.status(200).json(updatedUsuario);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Eliminar un usuario por ID
  async delete(req, res) {
    try {
      const { id } = req.params; // Obtener el ID de los parámetros de la ruta
      await UsuarioService.delete(id);
      res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async assignCustodian(req, res) {
    try {
      const { personaId, custodioId } = req.body;

      // Llama al servicio para asignar el custodio
      const result = await UsuarioService.assignCustodian(personaId, custodioId);

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getCustodian(req, res) {
    try {
      const { personaId } = req.params; // Recibimos el ID de la persona desde los parámetros de la URL

      // Llamamos al servicio para obtener el custodio
      const result = await UsuarioService.getCustodian(personaId);

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async eliminarCustodio(req, res) {
    try {
      const { personaId } = req.params; // Recibimos el ID de la persona desde los parámetros de la URL

      // Llamamos al servicio para eliminar el custodio
      const result = await UsuarioService.eliminarCustodio(personaId);

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async obtenerCustodiadosPorId(req, res) {
    try {
      const { idCustodio } = req.params; // Recibimos el ID del custodio desde los parámetros de la URL

      // Llamamos al servicio para obtener los custodiados
      const result = await UsuarioService.obtenerCustodiadosPorId(idCustodio);

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
   
}

module.exports = new UsuarioController();
