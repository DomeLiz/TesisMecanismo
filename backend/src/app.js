const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const routerApi = require('./routes');

dotenv.config();
const app = express();

// Configuración de CORS
app.use(cors({
    origin: ['http://localhost:3001', 'https://controlpii.surge.sh'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const port = process.env.PORT || 3000;

// Middleware para manejar JSON
app.use(express.json());

// Middleware para manejar archivos
app.use(fileUpload({
    createParentPath: true
}));

// Ruta principal
app.get('/', (req, res) => {
    res.send('Backend con NodeJs - Express + CRUD API REST + SQL');
});

// Cargar rutas
routerApi(app);

// Iniciar servidor
app.listen(port, () => {
    console.log("Port ==> ", port);
});
