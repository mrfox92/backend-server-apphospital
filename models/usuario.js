/* importamos la libreria mongoose */
var mongoose = require('mongoose');

/* mongoose unique validator */
var uniqueValidator = require('mongoose-unique-validator');

/* definimos nuestro schema */
var Schema = mongoose.Schema;

/* controlando los roles permitidos */
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un role permitido'
};
/* definimos nuestro schema para usuarios */
var usuarioSchema = new Schema({

    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'El correo es necesario'] },
    password: { type: String, required: [true, 'La contraseña es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
    google: { type: Boolean, default: false }

});

/* le decimosa mongoose en que lugar estará nuestro unique validator */
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

/* exportamos el modelo usuarios. Mongoose asume por defecto que el nombre de la colección
será el plural del nombre del modelo. En nuestro caso el modelo se llama 'usuario', mongoose
asume que la colección es 'usuarios'  */
module.exports = mongoose.model('Usuario', usuarioSchema);