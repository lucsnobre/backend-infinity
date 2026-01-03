const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const criarPlaylist = async function (playlist) {
    try {
        let sql = "INSERT INTO playlists (nome, descricao, id_usuario, e_publica, url_capa) VALUES (?, ?, ?, ?, ?)"
        let params = [
            playlist.nome,
            playlist.descricao || null,
            playlist.id_usuario,
            playlist.e_publica || false,
            playlist.url_capa || null
        ]
        let result = await prisma.$queryRawUnsafe(sql, ...params)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const atualizarPlaylist = async function (id_playlist, playlist) {
    try {
        let sql = "UPDATE playlists SET nome = ?, descricao = ?, e_publica = ?, url_capa = ?, atualizado_em = ? WHERE id = ?"
        let params = [
            playlist.nome,
            playlist.descricao || null,
            playlist.e_publica,
            playlist.url_capa || null,
            new Date(),
            id_playlist
        ]
        let result = await prisma.$queryRawUnsafe(sql, ...params)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const excluirPlaylist = async function (id_playlist) {
    try {
        let sql = "DELETE FROM playlists WHERE id = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_playlist)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarPlaylistsUsuario = async function (id_usuario) {
    try {
        let sql = `
            SELECT p.*, 
                   COUNT(pm.id_musica) as total_musicas,
                   SUM(m.duracao_segundos) as duracao_total
            FROM playlists p
            LEFT JOIN playlist_musicas pm ON p.id = pm.id_playlist
            LEFT JOIN musicas m ON pm.id_musica = m.id
            WHERE p.id_usuario = ?
            GROUP BY p.id
            ORDER BY p.criado_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarPlaylistPorID = async function (id_playlist) {
    try {
        let sql = `
            SELECT p.*, 
                   COUNT(pm.id_musica) as total_musicas,
                   SUM(m.duracao_segundos) as duracao_total,
                   u.nome_usuario as nome_criador
            FROM playlists p
            LEFT JOIN playlist_musicas pm ON p.id = pm.id_playlist
            LEFT JOIN musicas m ON pm.id_musica = m.id
            JOIN usuarios u ON p.id_usuario = u.id
            WHERE p.id = ?
            GROUP BY p.id
        `
        let result = await prisma.$queryRawUnsafe(sql, id_playlist)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarPlaylistsPublicas = async function () {
    try {
        let sql = `
            SELECT p.*, 
                   COUNT(pm.id_musica) as total_musicas,
                   u.nome_usuario as nome_criador
            FROM playlists p
            LEFT JOIN playlist_musicas pm ON p.id = pm.id_playlist
            JOIN usuarios u ON p.id_usuario = u.id
            WHERE p.e_publica = true
            GROUP BY p.id
            ORDER BY p.contador_curtidas DESC, p.criado_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const adicionarMusicaPlaylist = async function (id_playlist, id_musica, id_usuario) {
    try {
        let sql = "SELECT COALESCE(MAX(posicao), 0) + 1 as proxima_posicao FROM playlist_musicas WHERE id_playlist = ?"
        let resultPosicao = await prisma.$queryRawUnsafe(sql, id_playlist)
        let proximaPosicao = resultPosicao && resultPosicao.length > 0 ? resultPosicao[0].proxima_posicao : 1

        let sqlInsert = "INSERT INTO playlist_musicas (id_playlist, id_musica, posicao, adicionada_por) VALUES (?, ?, ?, ?)"
        let result = await prisma.$queryRawUnsafe(sqlInsert, id_playlist, id_musica, proximaPosicao, id_usuario)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const removerMusicaPlaylist = async function (id_playlist, id_musica) {
    try {
        let sql = "DELETE FROM playlist_musicas WHERE id_playlist = ? AND id_musica = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_playlist, id_musica)
        
        if (result) {
            await reorganizarPosicoesPlaylist(id_playlist)
        }
        
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const reorganizarPosicoesPlaylist = async function (id_playlist) {
    try {
        let sql = `
            UPDATE playlist_musicas 
            SET posicao = (
                SELECT ROW_NUMBER() OVER (ORDER BY adicionada_em) - 1
                FROM playlist_musicas pm2
                WHERE pm2.id_playlist = playlist_musicas.id_playlist
            )
            WHERE id_playlist = ?
        `
        await prisma.$queryRawUnsafe(sql, id_playlist)
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarMusicasPlaylist = async function (id_playlist) {
    try {
        let sql = `
            SELECT pm.*, m.titulo, m.duracao_segundos, a.nome as nome_artista, al.titulo as titulo_album, al.url_capa
            FROM playlist_musicas pm
            JOIN musicas m ON pm.id_musica = m.id
            JOIN artistas a ON m.id_artista = a.id
            LEFT JOIN albuns al ON m.id_album = al.id
            WHERE pm.id_playlist = ?
            ORDER BY pm.posicao ASC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_playlist)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const verificarMusicaNaPlaylist = async function (id_playlist, id_musica) {
    try {
        let sql = "SELECT * FROM playlist_musicas WHERE id_playlist = ? AND id_musica = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_playlist, id_musica)
        return result && result.length > 0 ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const moverMusicaPlaylist = async function (id_playlist, id_musica, nova_posicao) {
    try {
        let sql = "UPDATE playlist_musicas SET posicao = ? WHERE id_playlist = ? AND id_musica = ?"
        let result = await prisma.$queryRawUnsafe(sql, nova_posicao, id_playlist, id_musica)
        
        if (result) {
            await reorganizarPosicoesPlaylist(id_playlist)
        }
        
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
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
    moverMusicaPlaylist
}
