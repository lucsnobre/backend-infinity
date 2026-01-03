const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const inserirNovoUsuario = async function (usuario){
    try {
     let sql = "INSERT INTO usuarios (nome_usuario, email, senha_hash, nome_completo, biografia, url_avatar, data_nascimento, pais, criado_em, atualizado_em, esta_ativo, e_premium, ultimo_login, tempo_total_reproducao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
     let params = [
        usuario.nome_usuario,
        usuario.email,
        usuario.senha_hash,
        usuario.nome_completo || null,
        usuario.biografia || null,
        usuario.url_avatar || null,
        usuario.data_nascimento || null,
        usuario.pais || null,
        new Date(),
        new Date(),
        true,
        false,
        null,
        0
     ]
     let result = await prisma.$queryRawUnsafe(sql, ...params)    
     return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const atualizarPerfilUsuario = async function (id_usuario, usuario){
    try {
        let sql = "UPDATE usuarios SET nome_usuario = ?, email = ?, nome_completo = ?, biografia = ?, url_avatar = ?, data_nascimento = ?, pais = ?, atualizado_em = ? WHERE id = ?"
        let params = [
            usuario.nome_usuario,
            usuario.email,
            usuario.nome_completo || null,
            usuario.biografia || null,
            usuario.url_avatar || null,
            usuario.data_nascimento || null,
            usuario.pais || null,
            new Date(),
            id_usuario
        ]
        let result = await prisma.$queryRawUnsafe(sql, ...params)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const excluirContaUsuario = async function (id_usuario){
    try {
        let sql = "DELETE FROM usuarios WHERE id = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarTodosUsuarios = async function () {
    try {
        let sql = "SELECT * FROM usuarios"
        let result = await prisma.$queryRawUnsafe(sql)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarUsuarioPorID = async function (id_usuario) {
    try {
        let sql = "SELECT * FROM usuarios WHERE id = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

module.exports = {
    inserirNovoUsuario,
    atualizarPerfilUsuario,
    excluirContaUsuario,
    listarTodosUsuarios,
    listarUsuarioPorID
}