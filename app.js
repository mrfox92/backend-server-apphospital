/* Requires: es una librería de terceros que se utiliza para ciertas funcionalidades */

var express = require('express');

/* hacemos referencia a la libreria mongoose */
var mongoose = require('mongoose');

/* inicializar variables */

var app = express();

/* Conexión a la base de datos */

mongoose.connection.openUri('mongodb://localhost:27017/hospiralDB', (err, res) => {
    if (err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

/* Rutas */

app.get('/', (request, response, next) => {
    response.status(403).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});

/* Escuchar peticiones */

app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', ' online');
});