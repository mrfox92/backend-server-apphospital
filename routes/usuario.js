/* importamos express */
var express = require('express');
/* levantamos la app con express */
var app = express();
/* bcryptjs */
var bcrypt = require('bcryptjs');
/* JWT */
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autenticacion');
/* recibimos el SEED desde nuestro archivo de configuraciones */
/* var SEED = require('../config/config').SEED; */
/* importamos nuestro esquema de usuario */
var Usuario = require('../models/usuario');

/* Rutas */

/* obtener todos los usuarios */

app.get('/', (request, response, next) => {
    /* la función find es propia de mongoose*/
    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                return response.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });

            });
});


/* verificaci?n de token*/

/* Actualizar usuario */

app.put('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;

    var body = req.body;
    /* verificamos si es un id v?lido */
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario con el id ${ id } no existe`,
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        /* si todo marcha bien hasta aqu?, entonces actualizamos nuestro usuario */
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        /* grabamos los datos */
        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            return res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});

/* crear nuevo usuario */
/* a?adimos el middleware de verificacion de token */
app.post('/', mdAutenticacion.verificarToken, (req, res) => {
    var body = req.body;
    /* creo una nueva instancia del esquema Usuario para crear un
    nuevo usuario */
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });
    /* guardamos nuestro nuevo usuario */
    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        return res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });
});

/* borrar un usuario */

app.delete('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        return res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

/* exportamos nuestro archivo de rutas */
module.exports = app;