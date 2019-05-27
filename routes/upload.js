/* importamos express */
var express = require('express');
/* importamos la librería express-fileupload para subir archivos al servidor*/
var fileUpload = require('express-fileupload');
/* importamos librería file system */
var fs = require('fs');
/* levantamos la app con express */
var app = express();

// default options: middleware
app.use(fileUpload());

/* importamos modelos */
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

/* Rutas */
app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    /* tipos de colección */
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    /* comprobamos que lo que viene por url es un tipo de colección válida */
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valida',
            error: { message: 'Tipo de coleccion no valida' }
        });
    }
    /* si no vienen ningun archivo */
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No ha seleccionado archivo',
            error: { message: 'Debe seleccionar un archivo' }
        });
    }

    /* obtener el archivo */
    var archivo = req.files.imagen;
    /* dividimos por los puntos nuestra imagen para luego 
    obtener del array devuelto la extension del archivo */
    var nombreCortado = archivo.name.split('.');
    /* obtenemos la extensión del archivo */
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];
    /* validando archivos segun su extension */
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    /* evaluamos si el archivo posee una extensión válida */
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'extensión no válida',
            error: { message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') }
        });
    }

    /* Nombre archivo personalizado: usuario._id-numRand.ext(jpj, png, jpeg, gif) */
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;
    /* creamos el path donde se guardaran los archivos subidos al servidor */
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;
    /* movemos el archivo del temporal al path */
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }
        /* llamamos a la función para subir por tipo de coleccion de la DB*/
        subirPorTipo(tipo, id, nombreArchivo, res);
        /* si hay archivo seleccionado entonces lo subimos */
        /* return res.status(200).json({
            ok: true,
            mensaje: 'Archivo movido exitosamente',
            extensionArchivo: extensionArchivo
        }); */

    });
});



function subirPorTipo(tipo, id, nombreArchivo, res) {
    /* retornamos respuesta en formato json */
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }
            var oldPath = `./uploads/usuarios/${ usuario.img }`;
            if (fs.existsSync(oldPath)) {
                /* si existe lo borramos */
                fs.unlinkSync(oldPath);
            }
            /* actualizamos el campo img del usuario */
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Medico no existe',
                    errors: { message: 'Medico no existe' }
                });
            }
            var oldPath = `./uploads/medicos/${ medico.img }`;
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }
            var oldPath = `./uploads/hospitales/${ hospital.img }`;
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }
}
/* exportamos nuestro archivo de rutas */
module.exports = app;