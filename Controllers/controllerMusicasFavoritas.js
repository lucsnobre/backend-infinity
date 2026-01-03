const MESSAGE = require('../../Módulos/config')
const musicasFavoritasDAO = require('../../Models/DAO/Musicas/musicas_favoritas')

const adicionarMusicaFavorita = async function (id_usuario, id_musica) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_musica || isNaN(id_musica)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const jaFavoritada = await musicasFavoritasDAO.verificarMusicaFavorita(id_usuario, id_musica)
        if (jaFavoritada) {
            return {status: false, status_code: 409, message: 'Esta música já está nos favoritos'}
        }

        const result = await musicasFavoritasDAO.adicionarMusicaFavorita(id_usuario, id_musica)
        return result ? MESSAGE.SUCCESS_CREATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const removerMusicaFavorita = async function (id_usuario, id_musica) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_musica || isNaN(id_musica)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const result = await musicasFavoritasDAO.removerMusicaFavorita(id_usuario, id_musica)
        return result ? MESSAGE.SUCCESS_DELETED_ITEM : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarMusicasFavoritasUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const musicas = await musicasFavoritasDAO.listarMusicasFavoritasUsuario(id_usuario)
        return musicas ? musicas : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const verificarMusicaFavorita = async function (id_usuario, id_musica) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_musica || isNaN(id_musica)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const result = await musicasFavoritasDAO.verificarMusicaFavorita(id_usuario, id_musica)
        return {status: true, is_favorita: result}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarUsuariosPorMusicaFavorita = async function (id_musica) {
    try {
        if (!id_musica || isNaN(id_musica)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const usuarios = await musicasFavoritasDAO.listarUsuariosPorMusicaFavorita(id_musica)
        return usuarios ? usuarios : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const getEstatisticasFavoritosUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const total = await musicasFavoritasDAO.contarMusicasFavoritasUsuario(id_usuario)
        return {status: true, total_favoritos: total}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const getEstatisticasFavoritosMusica = async function (id_musica) {
    try {
        if (!id_musica || isNaN(id_musica)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const total = await musicasFavoritasDAO.contarFavoritosPorMusica(id_musica)
        return {status: true, total_favoritos: total}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

module.exports = {
    adicionarMusicaFavorita,
    removerMusicaFavorita,
    listarMusicasFavoritasUsuario,
    verificarMusicaFavorita,
    listarUsuariosPorMusicaFavorita,
    getEstatisticasFavoritosUsuario,
    getEstatisticasFavoritosMusica
}
