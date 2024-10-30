import {check, validationResult} from 'express-validator'
import bcrypt from 'bcrypt'
import Usuario from '../models/Usuario.js'
import { generarJWT, generarId} from '../helpers/tokens.js'
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js'  

const formularioLogin = (req, res) =>{       
    res.render('auth/login', {
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken()
    });
}

const autenticar = async(req, res) =>{
    //validacion
    await check('email').isEmail().withMessage('Debe ingresar un correo electronico').run(req)
    await check('password').notEmpty().withMessage('Debe ingresar un password').run(req)

    let resultado = validationResult(req) 

    //Verificar resultado vacio 
    if(!resultado.isEmpty()) {
        //Errores 
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken : req.csrfToken(),     
            errores: resultado.array()  
        })
    }

    const { email, password } = req.body

    //Comprobar si existe el usuario
    const usuario = await Usuario.findOne({ where: {email}})
    if(!usuario) {
        //Errores 
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken : req.csrfToken(),     
            errores: [{msg: 'El usuario no existe'}]  
        })
    }

    //Comprobar si el usuario está confirmado   
    if(!usuario.confirmado) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken : req.csrfToken(),     
            errores: [{msg: 'El usuario no está confirmado'}]  
        })
    }

    //Revisar password
    if(!usuario.verificarPassword(password)) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken : req.csrfToken(),     
            errores: [{msg: 'El Password es incorrecto'}]  
        })
    }

    //Autenticar usuario

    const token = generarJWT({id: usuario.id, nombre: usuario.nombre})
    

    //Almacenar en cookie

    return res.cookie('_token', token, {
        httpOnly: true,
        //secure: true
    }).redirect('/mis-propiedades')
}

const cerrarSesion = (req, res) => {
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}

const formularioRegistro = (req, res) =>    {       
    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken : req.csrfToken()
    })
}

const registrar = async (req, res) =>{    

    console.log(req.body)

    //validacion
    await check('nombre').notEmpty().withMessage('Debe ingresar un nombre').run(req)
    await check('email').isEmail().withMessage('Debe ingresar un correo electronico').run(req)
    await check('password').isLength({min: 6}).withMessage('La contraseña debe tener 6 caracteres como minimo').run(req)
    await check('repetir_password')
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Los passwords no coinciden');
        }
        return true;
    }).run(req);

    let resultado = validationResult(req) 

        //Verificar resultado vacio 
    if(!resultado.isEmpty()) {
        //Errores 
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken : req.csrfToken(),     
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email   
            }            
        })
    }

    //Extraer datos
    const { nombre, email, password } = req.body

    //verificar cuentas duplicadas
    const existeUsuario = await Usuario.findOne( { where : { email } })

    if(existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken : req.csrfToken(),     
            errores: [{msg: 'El usuario ya se encuentra registrado'}],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }            
        })

    }

    //Almacenar usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })
    
    //Envia email de confirmacion
    emailRegistro({
        nombre:usuario.nombre,
        email:usuario.email,    
        token:usuario.token
    })

    //Mostrar mensaje de confirmacion
    res.render('templates/mensaje', {
        pagina: 'Su cuenta se ha creado correctamente',
        mensaje: 'Hemos enviado un email de confirmacion, abre el enlase para continuar'
    })
}

//Funcio que comprueba una cuenta
const confirmar = async (req, res) => {
    
    const { token } = req.params;

    //Verifica si el token es valido
    const usuario = await Usuario.findOne({ where: {token}})

    if (!usuario) {
            return res.render('auth/confirmar-cuenta', {
                pagina: 'Error al confirmar cuenta',
                mensaje: 'Ocurrio un error al confirmar tu cuenta, intentalo de nuevo',
                error: true
            })
    }

    //Confirmar cuenta
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    res.render('auth/confirmar-cuenta', {
    pagina: 'Cuenta Confirmada',
    mensaje: 'La cuenta se confirmó correctamente'
    })

}

const formularioOlvidePassword = (req, res) =>{       
    res.render('auth/olvide-password', {
        pagina: 'Recuperar acceso a Bienes Raices',
        csrfToken : req.csrfToken() 

    })
}   

const resetPassword = async (req,res) =>{
    
    //validacion
    await check('email').isEmail().withMessage('Debe ingresar un correo electronico').run(req)

    let resultado = validationResult(req) 

        //Verificar resultado vacio 
    if(!resultado.isEmpty()) {
        //Errores 
        return res.render('auth/olvide-password', {
            pagina: 'Recuperar acceso a Bienes Raices',
            csrfToken : req.csrfToken(),
            errores: resultado.array()       
        })
    }

    //Buscar el usuario
    const {email} =req.body

    const usuario =await Usuario.findOne({where: {email}} )

    if (!usuario) {
        return res.render('auth/olvide-password', {
            pagina: 'Recuperar acceso a Bienes Raices',
            csrfToken : req.csrfToken(),
            errores: [{msg: 'El email no se encuentra registrado'}] 
        })
    }

    //Generar token de inicio
    usuario.token = generarId();
    await usuario.save();

    //Enviar un email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    //Renderizar mensaje
    res.render('templates/mensaje', {
        pagina: 'Reestablece tu Password',
        mensaje: 'Hemos enviado un email con las instrucciones'
    })

}

const comprobarToken = async (req, res) => {

    const {token} = req.params;

    const usuario = await Usuario.findOne({where: {token}})

    if(!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Restablece tu Password',
            mensaje: 'Ocurrio un error al confirmar tu cuenta, intentalo de nuevo',
            error: true
        })
    }

    //Mostrar formulario para modificar password

    res.render('auth/reset-password', {
        pagina: 'Restablece tu Password',
        csrfToken: req.csrfToken()
    })
}

const nuevoPassword = async (req, res) => {
    //Validar Password
    await check('password').isLength({min: 6}).withMessage('La contraseña debe tener 6 caracteres como minimo').run(req)

    let resultado = validationResult(req) 

    //Verificar resultado vacio 
    if(!resultado.isEmpty()) {
    //Errores 
        return res.render('auth/reset-password', {
            pagina: 'Reestablece tu Password',
            csrfToken : req.csrfToken(),     
            errores: resultado.array()                     
        })
    }

    const { token } = req.params
    const { password } = req.body; 
    //Identificar quien hace el cambio
    const usuario =await Usuario.findOne({where: {token}})

    //Hashear el nuevo password
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null;

    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Password Reestablecido',
        mensaje: 'Se ha establecido el nuevo Password'
    })
}

export {
    formularioLogin,
    autenticar,
    cerrarSesion,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,      
    comprobarToken,
    nuevoPassword
}