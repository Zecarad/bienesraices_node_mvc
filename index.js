import express from 'express'
import csfr from 'csurf'
import cookieParser from 'cookie-parser'
import usuarioRoutes from './routes/usuarioRoutes.js'
import propiedadesRoutes from './routes/propiedadesRoutes.js'
import appRoutes from './routes/appRoutes.js'
import apiRoutes from './routes/apiRoutes.js'
import db from './config/db.js'

//Crear la app
const app = express()

//Habilitar lectura de datos de formulario
app.use( express.urlencoded({extended: true}) );    
 
//Habilitar cookie parser
app.use( cookieParser() )

//Habilitar CSFR
app.use( csfr({cookie: true}) )

//conexion a la base de datos
try {
    await db.authenticate();
    db.sync()
    console.log('Conexion correcta a la base de datos')
} catch (error) {
    console.log(error)
}

//Habilitar Pug
app.set('view engine', 'pug')
app.set('views', './views')

//Carpeta publica

app.use( express.static('public') )

//Routing   
app.use ('/', appRoutes)
app.use ('/auth', usuarioRoutes)
app.use ('/', propiedadesRoutes)
app.use ('/api', apiRoutes)

//Puerto de arranque, definicion
const port = process.env.PORT || 3000;
app.listen(port, ()=> {
    console.log(`El servidor funciona en el puerto ${port}`)
});

