import express from "express";
import {formularioLogin, autenticar,cerrarSesion, formularioRegistro, registrar, confirmar,
     formularioOlvidePassword, resetPassword, comprobarToken, nuevoPassword} from '../controllers/usuarioController.js'

const router = express.Router();

//Routing
router.get('/login', formularioLogin); 
router.post('/login', autenticar); 

//Cerrar sesion
router.post('/cerrar-sesion', cerrarSesion)

router.get('/registro', formularioRegistro)
router.post('/registro', registrar)

router.get('/confirmar/:token', confirmar)

router.get('/olvidepassword', formularioOlvidePassword)
router.post('/olvidepassword', resetPassword)

//Almacenar nuevo password
router.get('/olvidepassword/:token', comprobarToken);
router.post('/olvidepassword/:token', nuevoPassword);




export default router   