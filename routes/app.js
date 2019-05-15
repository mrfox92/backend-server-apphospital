/* importamos express */
var express = require('express');
/* levantamos la app con express */
var app = express();

/* Rutas */
app.get('/', (request, response, next) => {
    response.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});
/* exportamos nuestro archivo de rutas */
module.exports = app;