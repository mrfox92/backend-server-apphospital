/* importamos express */
var express = require('express');
/* bcryptjs */
var bcrypt = require('bcryptjs');
/* JWT */
var jwt = require('jsonwebtoken');
/* recibimos el SEED desde nuestro archivo de configuraciones */
var SEED = require('../config/config').SEED;
/* levantamos la app con express */
var app = express();

/* importamos nuestro esquema de usuario */
var Usuario = require('../models/usuario');
/* método de login */
app.post('/', (req, res) => {
    var body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al busca usuario',
                errors: err
            });
        }
        /* verificando email */
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        /* verificando password */
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        /* Crear un token!! */
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

        return res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id
        });
    });
});

/* exportamos nuestro archivo */
module.exports = app;