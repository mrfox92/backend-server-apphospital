/* JWT */
var jwt = require('jsonwebtoken');
/* recibimos el SEED desde nuestro archivo de configuraciones */
var SEED = require('../config/config').SEED;

/* verificacion del token: 
leemos el token que recibimos desde la url.
lo procesamos(vemos si es válido y si no ha expirado).
una vez validado continuamos. Todo esto lo realizamos por medio
de un middleware  */
exports.verificarToken = function(req, res, next) {
    /* recibimos el toquen */
    var token = req.query.token;
    /* realizamos la comprobacion */
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
        /* hacer que la informacion del usuario esté disponible en cualquier peticion.
        luego de esto podremos disponer del usuario en nuestro request */
        req.usuario = decoded.usuario;
        next();
        /* return res.status(200).json({
            ok: true,
            decoded: decoded
        }); */
    });
};