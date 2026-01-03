const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const salvarPlaylist = async function (id_usuario, id_playlist) {
    try {
        let sql = "INSERT INTO playlists_salvas (id_usuario, id_playlist) VALUES (?, ?)"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_playlist)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const removerPlaylistSalva = async function (id_usuario, id_playlist) {
    try {
        let sql = "DELETE FROM playlists_salvas WHERE id_usuario = ? AND id_playlist = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_playlist)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarPlaylistsSalvasUsuario = async function (id_usuario, limite = 50) {
    try {
        let sql = `
            SELECT 
                ps.*,
                p.nome, p.descricao, p.url_capa, p.e_publica,
                p.total_musicas, p.duracao_total, p.contador_curtidas,
                p.criada_em, p.atualizada_em,
                u.nome_usuario as nome_criador,
                u.url_avatar as avatar_criador,
                COUNT(DISTINCT pm.id_musica) as musicas_disponiveis,
                SUM(m.duracao_segundos) as duracao_total_segundos
            FROM playlists_salvas ps
            JOIN playlists p ON ps.id_playlist = p.id
            JOIN usuarios u ON p.id_usuario = u.id
            LEFT JOIN playlist_musicas pm ON p.id = pm.id_playlist
            LEFT JOIN musicas m ON pm.id_musica = m.id
            WHERE ps.id_usuario = ?
            GROUP BY ps.id, p.id, u.id
            ORDER BY ps.salva_em DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const verificarPlaylistSalva = async function (id_usuario, id_playlist) {
    try {
        let sql = "SELECT * FROM playlists_salvas WHERE id_usuario = ? AND id_playlist = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_playlist)
        return result && result.length > 0 ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const contarPlaylistsSalvasUsuario = async function (id_usuario) {
    try {
        let sql = "SELECT COUNT(*) as total FROM playlists_salvas WHERE id_usuario = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result[0].total : 0
    } catch (error) {
        console.log(error)
        return 0
    }
}

const listarPlaylistsSalvasPorPeriodo = async function (id_usuario, data_inicio, data_fim) {
    try {
        let sql = `
            SELECT 
                ps.*,
                p.nome, p.url_capa, p.e_publica, p.total_musicas,
                u.nome_usuario as nome_criador
            FROM playlists_salvas ps
            JOIN playlists p ON ps.id_playlist = p.id
            JOIN usuarios u ON p.id_usuario = u.id
            WHERE ps.id_usuario = ? AND ps.salva_em BETWEEN ? AND ?
            ORDER BY ps.salva_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, data_inicio, data_fim)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarPlaylistsMaisSalvas = async function (limite = 10) {
    try {
        let sql = `
            SELECT 
                p.id, p.nome, p.url_capa, p.e_publica, p.total_musicas,
                p.duracao_total, p.contador_curtidas, p.criada_em,
                u.nome_usuario as nome_criador,
                COUNT(ps.id_usuario) as total_salvos,
                MAX(ps.salva_em) as ultimo_salvo_em
            FROM playlists p
            JOIN usuarios u ON p.id_usuario = u.id
            JOIN playlists_salvas ps ON p.id = ps.id_playlist
            GROUP BY p.id, u.id
            HAVING total_salvos > 0
            ORDER BY total_salvos DESC, p.contador_curtidas DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarUsuariosPorPlaylistSalva = async function (id_playlist, limite = 50) {
    try {
        let sql = `
            SELECT 
                ps.id_usuario,
                u.nome_usuario,
                u.url_avatar,
                u.esta_ativo,
                u.e_premium,
                ps.salva_em
            FROM playlists_salvas ps
            JOIN usuarios u ON ps.id_usuario = u.id
            WHERE ps.id_playlist = ?
            ORDER BY ps.salva_em DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_playlist, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterPlaylistsSalvasRecentes = async function (id_usuario, dias = 7) {
    try {
        let sql = `
            SELECT 
                ps.*,
                p.nome, p.url_capa, p.e_publica, p.total_musicas,
                p.duracao_total, p.contador_curtidas,
                u.nome_usuario as nome_criador
            FROM playlists_salvas ps
            JOIN playlists p ON ps.id_playlist = p.id
            JOIN usuarios u ON p.id_usuario = u.id
            WHERE ps.id_usuario = ? AND ps.salva_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY ps.salva_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterEstatisticasPlaylistsSalvas = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                COUNT(*) as total_playlists_salvas,
                COUNT(DISTINCT p.id_usuario) as total_criadores_diferentes,
                AVG(p.total_musicas) as media_musicas_playlist,
                SUM(p.total_musicas) as total_musicas_geral,
                AVG(p.duracao_total) as media_duracao_playlist,
                SUM(p.duracao_total) as total_duracao_segundos,
                MAX(p.contador_curtidas) as max_curtidas,
                MIN(p.contador_curtidas) as min_curtidas,
                AVG(p.contador_curtidas) as media_curtidas,
                COUNT(DISTINCT CASE WHEN p.e_publica = true THEN 1 END) as total_playlists_publicas,
                MIN(ps.salva_em) as primeira_salva_em,
                MAX(ps.salva_em) as ultima_salva_em
            FROM playlists_salvas ps
            JOIN playlists p ON ps.id_playlist = p.id
            WHERE ps.id_usuario = ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterDistribuicaoCriadoresSalvos = async function (id_usuario, limite = 10) {
    try {
        let sql = `
            SELECT 
                u.id, u.nome_usuario, u.url_avatar, u.esta_ativo, u.e_premium,
                COUNT(ps.id_playlist) as total_playlists_salvas,
                SUM(p.total_musicas) as total_musicas_salvas,
                AVG(p.contador_curtidas) as media_curtidas_criador,
                MAX(ps.salva_em) as ultimo_salvo_em
            FROM playlists_salvas ps
            JOIN playlists p ON ps.id_playlist = p.id
            JOIN usuarios u ON p.id_usuario = u.id
            WHERE ps.id_usuario = ?
            GROUP BY u.id, u.nome_usuario, u.url_avatar, u.esta_ativo, u.e_premium
            ORDER BY total_playlists_salvas DESC, total_musicas_salvas DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterPlaylistsSalvasPorCriador = async function (id_usuario, id_criador) {
    try {
        let sql = `
            SELECT 
                ps.*,
                p.nome, p.url_capa, p.e_publica, p.total_musicas,
                p.duracao_total, p.contador_curtidas, p.descricao,
                p.criada_em, p.atualizada_em
            FROM playlists_salvas ps
            JOIN playlists p ON ps.id_playlist = p.id
            WHERE ps.id_usuario = ? AND p.id_usuario = ?
            ORDER BY p.criada_em DESC, ps.salva_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_criador)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterPlaylistsSalvasPublicas = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                ps.*,
                p.nome, p.url_capa, p.total_musicas, p.duracao_total,
                p.contador_curtidas, p.descricao, p.criada_em,
                u.nome_usuario as nome_criador,
                u.url_avatar as avatar_criador
            FROM playlists_salvas ps
            JOIN playlists p ON ps.id_playlist = p.id
            JOIN usuarios u ON p.id_usuario = u.id
            WHERE ps.id_usuario = ? AND p.e_publica = true
            ORDER BY ps.salva_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterPlaylistsSalvasPorTamanho = async function (id_usuario, min_musicas, max_musicas) {
    try {
        let sql = `
            SELECT 
                ps.*,
                p.nome, p.url_capa, p.e_publica, p.total_musicas,
                p.duracao_total, p.contador_curtidas,
                u.nome_usuario as nome_criador
            FROM playlists_salvas ps
            JOIN playlists p ON ps.id_playlist = p.id
            JOIN usuarios u ON p.id_usuario = u.id
            WHERE ps.id_usuario = ? AND p.total_musicas BETWEEN ? AND ?
            ORDER BY p.total_musicas DESC, ps.salva_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, min_musicas, max_musicas)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const buscarPlaylistsSalvasPorNome = async function (id_usuario, termo_busca) {
    try {
        let sql = `
            SELECT 
                ps.*,
                p.nome, p.url_capa, p.e_publica, p.total_musicas,
                p.duracao_total, p.contador_curtidas,
                u.nome_usuario as nome_criador
            FROM playlists_salvas ps
            JOIN playlists p ON ps.id_playlist = p.id
            JOIN usuarios u ON p.id_usuario = u.id
            WHERE ps.id_usuario = ? 
            AND (p.nome LIKE ? OR p.descricao LIKE ?)
            ORDER BY ps.salva_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, `%${termo_busca}%`, `%${termo_busca}%`)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterRecomendacoesPlaylistsSimilares = async function (id_usuario, limite = 5) {
    try {
        let sql = `
            SELECT 
                p.id, p.nome, p.url_capa, p.e_publica, p.total_musicas,
                p.duracao_total, p.contador_curtidas, p.descricao,
                u.nome_usuario as nome_criador,
                COUNT(DISTINCT ps2.id_usuario) as usuarios_em_comum,
                AVG(p.contador_curtidas) as media_curtidas
            FROM playlists p
            JOIN usuarios u ON p.id_usuario = u.id
            JOIN playlists_salvas ps1 ON p.id = ps1.id_playlist
            JOIN playlists_salvas ps2 ON p.id = ps2.id_playlist AND ps2.id_usuario != ps1.id_usuario
            WHERE ps1.id_usuario = ? 
            AND p.id NOT IN (SELECT id_playlist FROM playlists_salvas WHERE id_usuario = ?)
            GROUP BY p.id, u.id
            HAVING usuarios_em_comum >= 2
            ORDER BY usuarios_em_comum DESC, media_curtidas DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_usuario, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterPlaylistsSalvasPorDuracao = async function (id_usuario, duracao_min, duracao_max) {
    try {
        let sql = `
            SELECT 
                ps.*,
                p.nome, p.url_capa, p.e_publica, p.total_musicas,
                p.duracao_total, p.contador_curtidas,
                u.nome_usuario as nome_criador
            FROM playlists_salvas ps
            JOIN playlists p ON ps.id_playlist = p.id
            JOIN usuarios u ON p.id_usuario = u.id
            WHERE ps.id_usuario = ? AND p.duracao_total BETWEEN ? AND ?
            ORDER BY p.duracao_total DESC, ps.salva_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, duracao_min, duracao_max)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

module.exports = {
    salvarPlaylist,
    removerPlaylistSalva,
    listarPlaylistsSalvasUsuario,
    verificarPlaylistSalva,
    contarPlaylistsSalvasUsuario,
    listarPlaylistsSalvasPorPeriodo,
    listarPlaylistsMaisSalvas,
    listarUsuariosPorPlaylistSalva,
    obterPlaylistsSalvasRecentes,
    obterEstatisticasPlaylistsSalvas,
    obterDistribuicaoCriadoresSalvos,
    obterPlaylistsSalvasPorCriador,
    obterPlaylistsSalvasPublicas,
    obterPlaylistsSalvasPorTamanho,
    obterPlaylistsSalvasPorDuracao,
    buscarPlaylistsSalvasPorNome,
    obterRecomendacoesPlaylistsSimilares
}
