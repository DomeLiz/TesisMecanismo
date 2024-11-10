const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuario.controller');

router
    .post('/register', UsuarioController.crearUsuario)
    .get('/', UsuarioController.find)
    .get('/:id', UsuarioController.findOne)
    .get('/cedula/:cedula', UsuarioController.findByCedula);

module.exports = router;
