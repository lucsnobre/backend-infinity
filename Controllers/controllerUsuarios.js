const MESSAGE = require('../Módulos/config')
const usuariosDAO = require('../Models/DAO/Usuários/usuarios')

//Criar conta(usuário)

const inserirNovoUsuario = async function (dados, contentType) {
    try {
        if (String(contentType).toLowerCase() !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE
        }

        const {nome_usuario, senha_hash, email, nome_completo, biografia, url_avatar, data_nascimento, pais} = dados

        if (!nome_usuario || nome_usuario.length > 100 ||
            !senha_hash || senha_hash.length < 8 ||
            !email || email.length > 100 ||
            !email.includes('@') ||
            (nome_completo && nome_completo.length > 100) ||
            (biografia && biografia.length > 500) ||
            (url_avatar && url_avatar.length > 255) ||
            (pais && pais.length > 50)
        ) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const result = await usuariosDAO.inserirNovoUsuario(dados)
        return result ? MESSAGE.SUCCESS_CREATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

//Listar os users

const listarTodosUsuarios = async function () {
    try {
        const dado = await usuariosDAO.listarTodosUsuarios()
        return dado ? dado : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarUsuarioPorID = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) return MESSAGE.ERROR_INVALID_ID
        
        const dado = await usuariosDAO.listarUsuarioPorID(id_usuario)
        return dado ? dado : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const atualizarPerfilUsuario = async function (id_usuario, dados, contentType) {
    try {
        if (String(contentType).toLowerCase() !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE
        }

        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const {nome_usuario, email, nome_completo, biografia, url_avatar, data_nascimento, pais} = dados

        if ((nome_usuario && nome_usuario.length > 100) ||
            (email && (email.length > 100 || !email.includes('@'))) ||
            (nome_completo && nome_completo.length > 100) ||
            (biografia && biografia.length > 500) ||
            (url_avatar && url_avatar.length > 255) ||
            (pais && pais.length > 50)
        ) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const result = await usuariosDAO.atualizarPerfilUsuario(id_usuario, dados)
        return result ? MESSAGE.SUCCESS_UPDATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const excluirContaUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const result = await usuariosDAO.excluirContaUsuario(id_usuario)
        return result ? MESSAGE.SUCCESS_DELETED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

module.exports = {
    inserirNovoUsuario,
    listarTodosUsuarios,
    listarUsuarioPorID,
    atualizarPerfilUsuario,
    excluirContaUsuario
}