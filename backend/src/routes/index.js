const express = require('express');

const personsRouter = require('./persons.routes');

const authRouter = require('./auth.routes'); // Importa las rutas de autenticación

function routerApi(app) {
    const router = express.Router();
    app.use('/api/v1', router);
    router.use('/persons', personsRouter);
    router.use('/auth', authRouter); // Usa las rutas de autenticación
}

module.exports = routerApi;