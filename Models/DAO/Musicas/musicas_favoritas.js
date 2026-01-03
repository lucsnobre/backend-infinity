const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const adicionarMusicaFavorita = async function (id_usuario, id_musica) {
    try {
        let sql = "INSERT INTO musicas_favoritas (id_usuario, id_musica) VALUES (?, ?)"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_musica)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const removerMusicaFavorita = async function (id_usuario, id_musica) {
    try {
        let sql = "DELETE FROM musicas_favoritas WHERE id_usuario = ? AND id_musica = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_musica)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarMusicasFavoritasUsuario = async function (id_usuario) {
    try {
        let sql = `
            SELECT mf.*, m.titulo, m.duracao_segundos, a.nome as nome_artista, al.titulo as titulo_album, al.url_capa
            FROM musicas_favoritas mf
            JOIN musicas m ON mf.id_musica = m.id
            JOIN artistas a ON m.id_artista = a.id
            LEFT JOIN albuns al ON m.id_album = al.id
            WHERE mf.id_usuario = ?
            ORDER BY mf.favoritada_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const verificarMusicaFavorita = async function (id_usuario, id_musica) {
    try {
        let sql = "SELECT * FROM musicas_favoritas WHERE id_usuario = ? AND id_musica = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_musica)
        return result && result.length > 0 ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarUsuariosPorMusicaFavorita = async function (id_musica) {
    try {
        let sql = `
            SELECT mf.id_usuario, u.nome_usuario, u.url_avatar, mf.favoritada_em
            FROM musicas_favoritas mf
            JOIN usuarios u ON mf.id_usuario = u.id
            WHERE mf.id_musica = ?
            ORDER BY mf.favoritada_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_musica)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const contarMusicasFavoritasUsuario = async function (id_usuario) {
    try {
        let sql = "SELECT COUNT(*) as total FROM musicas_favoritas WHERE id_usuario = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result[0].total : 0
    } catch (error) {
        console.log(error)
        return 0
    }
}

const contarFavoritosPorMusica = async function (id_musica) {
    try {
        let sql = "SELECT COUNT(*) as total FROM musicas_favoritas WHERE id_musica = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_musica)
        return result && result.length > 0 ? result[0].total : 0
    } catch (error) {
        console.log(error)
        return 0
    }
}

module.exports = {
    adicionarMusicaFavorita,
    removerMusicaFavorita,
    listarMusicasFavoritasUsuario,
    verificarMusicaFavorita,
    listarUsuariosPorMusicaFavorita,
    contarMusicasFavoritasUsuario,
    contarFavoritosPorMusica
}
