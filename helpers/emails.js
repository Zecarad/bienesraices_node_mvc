import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    
    const {email, nombre, token} = datos

    //Enviar email
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Confirma tu cuenta en BienesRaices.com',
        text: 'Confirma tu cuenta en BienesRaices.com',
        html: `
            <p> Hola ${nombre}, comprueba tu cuenta en BienesRaices.com</p>

            <p> Su cuenta está casi lista, solo debes iniciar sesion en el siguiente enlace:
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar Cuenta</a> </p>

            <p>Si usted no creó la cuenta favor ignorar el mensaje</p>
        `
    })
    
}

const emailOlvidePassword = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const {email, nombre, token} = datos

    //Enviar email
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Reestablece tu password en BienesRaices.com',
        text: 'Reestablece tu password en BienesRaices.com',
        html: `
            <p> Hola ${nombre}, has solicitado tu cambio de contraseña en BienesRaices.com</p>

            <p> Sigue el siguiente enlace para crear un nuevo password:
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvidepassword/${token}">Reestablecer Password</a> </p>

            <p>Si usted no solicitó el cambio de password, puede ignorar el correo</p>
        `
    })
}

export {
    emailRegistro,
    emailOlvidePassword
}