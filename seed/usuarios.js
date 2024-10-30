import bcrypt from 'bcrypt'

const usuarios = [
    {
        nombre: 'Jose',
        email: 'jose@hotmail.com',
        confirmado: 1,
        password: bcrypt.hashSync('123456', 10)
    }
]

export default usuarios 