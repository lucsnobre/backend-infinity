const MESSAGE = require('../../Módulos/config')
const playlistsDAO = require('../../Models/DAO/Playlists/playlists')

const criarPlaylist = async function (dados, contentType) {
    try {
        if (String(contentType).toLowerCase() !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE
        }

        const {nome, descricao, id_usuario, e_publica, url_capa} = dados

        if (!nome || nome.length > 100 ||
            !id_usuario || isNaN(id_usuario) ||
            (descricao && descricao.length > 500) ||
            (url_capa && url_capa.length > 255)
        ) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const result = await playlistsDAO.criarPlaylist(dados)
        return result ? MESSAGE.SUCCESS_CREATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const atualizarPlaylist = async function (id_playlist, dados, contentType) {
    try {
        if (String(contentType).toLowerCase() !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE
        }

        if (!id_playlist || isNaN(id_playlist)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const {nome, descricao, e_publica, url_capa} = dados

        if (!nome || nome.length > 100 ||
            (descricao && descricao.length > 500) ||
            (url_capa && url_capa.length > 255)
        ) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const result = await playlistsDAO.atualizarPlaylist(id_playlist, dados)
        return result ? MESSAGE.SUCCESS_UPDATED_ITEM : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const excluirPlaylist = async function (id_playlist) {
    try {
        if (!id_playlist || isNaN(id_playlist)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const result = await playlistsDAO.excluirPlaylist(id_playlist)
        return result ? MESSAGE.SUCCESS_DELETED_ITEM : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarPlaylistsUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const playlists = await playlistsDAO.listarPlaylistsUsuario(id_usuario)
        return playlists ? playlists : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarPlaylistPorID = async function (id_playlist) {
    try {
        if (!id_playlist || isNaN(id_playlist)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const playlist = await playlistsDAO.listarPlaylistPorID(id_playlist)
        return playlist ? playlist : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarPlaylistsPublicas = async function () {
    try {
        const playlists = await playlistsDAO.listarPlaylistsPublicas()
        return playlists ? playlists : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const adicionarMusicaPlaylist = async function (id_playlist, id_musica, id_usuario) {
    try {
        if (!id_playlist || isNaN(id_playlist) || !id_musica || isNaN(id_musica) || !id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const jaExiste = await playlistsDAO.verificarMusicaNaPlaylist(id_playlist, id_musica)
        if (jaExiste) {
            return {status: false, status_code: 409, message: 'Esta música já está na playlist'}
        }

        const result = await playlistsDAO.adicionarMusicaPlaylist(id_playlist, id_musica, id_usuario)
        return result ? MESSAGE.SUCCESS_CREATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const removerMusicaPlaylist = async function (id_playlist, id_musica) {
    try {
        if (!id_playlist || isNaN(id_playlist) || !id_musica || isNaN(id_musica)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const result = await playlistsDAO.removerMusicaPlaylist(id_playlist, id_musica)
        return result ? MESSAGE.SUCCESS_DELETED_ITEM : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarMusicasPlaylist = async function (id_playlist) {
    try {
        if (!id_playlist || isNaN(id_playlist)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const musicas = await playlistsDAO.listarMusicasPlaylist(id_playlist)
        return musicas ? musicas : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const verificarMusicaNaPlaylist = async function (id_playlist, id_musica) {
    try {
        if (!id_playlist || isNaN(id_playlist) || !id_musica || isNaN(id_musica)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const result = await playlistsDAO.verificarMusicaNaPlaylist(id_playlist, id_musica)
        return {status: true, esta_na_playlist: result}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const moverMusicaPlaylist = async function (id_playlist, id_musica, nova_posicao) {
    try {
        if (!id_playlist || isNaN(id_playlist) || !id_musica || isNaN(id_musica) || nova_posicao === undefined || isNaN(nova_posicao)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        if (nova_posicao < 0) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const result = await playlistsDAO.moverMusicaPlaylist(id_playlist, id_musica, nova_posicao)
        return result ? MESSAGE.SUCCESS_UPDATED_ITEM : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const buscarPlaylistsPorNome = async function (termo_busca) {
    try {
        if (!termo_busca || termo_busca.length < 2) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        let sql = `
            SELECT p.*, 
                   COUNT(pm.id_musica) as total_musicas,
                   u.nome_usuario as nome_criador
            FROM playlists p
            LEFT JOIN playlist_musicas pm ON p.id = pm.id_playlist
            JOIN usuarios u ON p.id_usuario = u.id
            WHERE p.e_publica = true AND p.nome LIKE ?
            GROUP BY p.id
            ORDER BY p.contador_curtidas DESC
        `
        
        const result = await prisma.$queryRawUnsafe(sql, `%${termo_busca}%`)
        return result && result.length > 0 ? result : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

module.exports = {
    criarPlaylist,
    atualizarPlaylist,
    excluirPlaylist,
    listarPlaylistsUsuario,
    listarPlaylistPorID,
    listarPlaylistsPublicas,
    adicionarMusicaPlaylist,
    removerMusicaPlaylist,
    listarMusicasPlaylist,
    verificarMusicaNaPlaylist,
    moverMusicaPlaylist,
    buscarPlaylistsPorNome
}
