var express = require('express');

var app = express();
/* importamos path: para el manejo de rutas entre directorios */
const path = require('path');
const fs = require('fs');
app.get('/:tipo/:img', (req, res, next) => {
    var tipo = req.params.tipo;
    var img = req.params.img;
    /* nos ayuda a resolver el path de la imagen por defecto, para que dicho path
    siempre quede correcto. Finalmente debemos especificar toda la ruta de la imagen
    1)__dirname: me obtiene el directorio donde estoy actualmente posicionado.
    2) hacemos referencia a la ruta relativa de la coleccion y la imagen  buscada*/
    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        var pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImage);
    }
});
/* exportamos nuestro archivo de rutas */
module.exports = app;