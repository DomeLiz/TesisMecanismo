const express = require('express');
const personsRouter = require('./persons.routes');
const authRouter = require('./auth.routes'); 
const usuarioRouter = require('./usuario.routes'); 

function routerApi(app) {
    const router = express.Router();
    app.use('/api/v1', router);
    router.use('/persons', personsRouter);
    router.use('/auth', authRouter); 
    router.use('/usuarios', usuarioRouter);
}

module.exports = routerApi;