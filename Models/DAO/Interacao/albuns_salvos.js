const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const salvarAlbum = async function (id_usuario, id_album) {
    try {
        let sql = "INSERT INTO albuns_salvos (id_usuario, id_album) VALUES (?, ?)"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_album)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const removerAlbumSalvo = async function (id_usuario, id_album) {
    try {
        let sql = "DELETE FROM albuns_salvos WHERE id_usuario = ? AND id_album = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_album)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarAlbunsSalvosUsuario = async function (id_usuario, limite = 50) {
    try {
        let sql = `
            SELECT 
                als.*,
                al.titulo, al.url_capa, al.data_lancamento, al.duracao_minutos,
                al.total_faixas, al.pontuacao_popularidade, al.gravadora,
                a.nome as nome_artista,
                COUNT(DISTINCT m.id) as musicas_disponiveis,
                SUM(m.duracao_segundos) as duracao_total_segundos
            FROM albuns_salvos als
            JOIN albuns al ON als.id_album = al.id
            JOIN artistas a ON al.id_artista = a.id
            LEFT JOIN musicas m ON al.id = m.id_album
            WHERE als.id_usuario = ?
            GROUP BY als.id, al.id, a.id
            ORDER BY als.salvo_em DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const verificarAlbumSalvo = async function (id_usuario, id_album) {
    try {
        let sql = "SELECT * FROM albuns_salvos WHERE id_usuario = ? AND id_album = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_album)
        return result && result.length > 0 ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const contarAlbunsSalvosUsuario = async function (id_usuario) {
    try {
        let sql = "SELECT COUNT(*) as total FROM albuns_salvos WHERE id_usuario = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result[0].total : 0
    } catch (error) {
        console.log(error)
        return 0
    }
}

const listarAlbunsSalvosPorPeriodo = async function (id_usuario, data_inicio, data_fim) {
    try {
        let sql = `
            SELECT 
                als.*,
                al.titulo, al.url_capa, al.data_lancamento,
                a.nome as nome_artista
            FROM albuns_salvos als
            JOIN albuns al ON als.id_album = al.id
            JOIN artistas a ON al.id_artista = a.id
            WHERE als.id_usuario = ? AND als.salvo_em BETWEEN ? AND ?
            ORDER BY als.salvo_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, data_inicio, data_fim)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarAlbunsMaisSalvos = async function (limite = 10) {
    try {
        let sql = `
            SELECT 
                al.id, al.titulo, al.url_capa, al.data_lancamento, al.total_faixas,
                al.pontuacao_popularidade, al.duracao_minutos,
                a.nome as nome_artista,
                COUNT(als.id_usuario) as total_salvos,
                MAX(als.salvo_em) as ultimo_salvo_em
            FROM albuns al
            JOIN artistas a ON al.id_artista = a.id
            JOIN albuns_salvos als ON al.id = als.id_album
            GROUP BY al.id, a.id
            HAVING total_salvos > 0
            ORDER BY total_salvos DESC, al.pontuacao_popularidade DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarUsuariosPorAlbumSalvo = async function (id_album, limite = 50) {
    try {
        let sql = `
            SELECT 
                als.id_usuario,
                u.nome_usuario,
                u.url_avatar,
                u.esta_ativo,
                u.e_premium,
                als.salvo_em
            FROM albuns_salvos als
            JOIN usuarios u ON als.id_usuario = u.id
            WHERE als.id_album = ?
            ORDER BY als.salvo_em DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_album, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterAlbunsSalvosRecentes = async function (id_usuario, dias = 7) {
    try {
        let sql = `
            SELECT 
                als.*,
                al.titulo, al.url_capa, al.data_lancamento, al.total_faixas,
                a.nome as nome_artista
            FROM albuns_salvos als
            JOIN albuns al ON als.id_album = al.id
            JOIN artistas a ON al.id_artista = a.id
            WHERE als.id_usuario = ? AND als.salvo_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY als.salvo_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterEstatisticasAlbunsSalvos = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                COUNT(*) as total_albuns_salvos,
                COUNT(DISTINCT al.id_artista) as total_artistas_diferentes,
                AVG(al.total_faixas) as media_faixas_album,
                SUM(al.total_faixas) as total_faixas_geral,
                AVG(al.duracao_minutos) as media_duracao_album,
                SUM(al.duracao_minutos) as total_duracao_minutos,
                MAX(al.pontuacao_popularidade) as max_popularidade,
                MIN(al.pontuacao_popularidade) as min_popularidade,
                AVG(al.pontuacao_popularidade) as media_popularidade,
                MIN(als.salvo_em) as primeiro_salvo_em,
                MAX(als.salvo_em) as ultimo_salvo_em
            FROM albuns_salvos als
            JOIN albuns al ON als.id_album = al.id
            WHERE als.id_usuario = ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterDistribuicaoArtistasSalvos = async function (id_usuario, limite = 10) {
    try {
        let sql = `
            SELECT 
                a.id, a.nome, a.url_imagem, a.verificado,
                COUNT(als.id_album) as total_albuns_salvos,
                SUM(al.total_faixas) as total_musicas_salvas,
                AVG(al.pontuacao_popularidade) as media_popularidade_artista,
                MAX(als.salvo_em) as ultimo_salvo_em
            FROM albuns_salvos als
            JOIN albuns al ON als.id_album = al.id
            JOIN artistas a ON al.id_artista = a.id
            WHERE als.id_usuario = ?
            GROUP BY a.id, a.nome, a.url_imagem, a.verificado
            ORDER BY total_albuns_salvos DESC, total_musicas_salvas DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterAlbunsSalvosPorArtista = async function (id_usuario, id_artista) {
    try {
        let sql = `
            SELECT 
                als.*,
                al.titulo, al.url_capa, al.data_lancamento, al.total_faixas,
                al.duracao_minutos, al.pontuacao_popularidade, al.gravadora
            FROM albuns_salvos als
            JOIN albuns al ON als.id_album = al.id
            WHERE als.id_usuario = ? AND al.id_artista = ?
            ORDER BY al.data_lancamento DESC, als.salvo_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_artista)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterAlbunsSalvosPorGenero = async function (id_usuario, id_genero) {
    try {
        let sql = `
            SELECT 
                als.*,
                al.titulo, al.url_capa, al.data_lancamento, al.total_faixas,
                al.duracao_minutos, al.pontuacao_popularidade,
                a.nome as nome_artista
            FROM albuns_salvos als
            JOIN albuns al ON als.id_album = al.id
            JOIN artistas a ON al.id_artista = a.id
            JOIN musicas_generos mg ON al.id = mg.id_album
            WHERE als.id_usuario = ? AND mg.id_genero = ?
            GROUP BY als.id, al.id, a.id
            ORDER BY al.data_lancamento DESC, als.salvo_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_genero)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterAlbunsSalvosPorDecada = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                FLOOR(al.data_lancamento / 10) * 10 as decada,
                COUNT(*) as total_albuns_decada,
                AVG(al.total_faixas) as media_faixas_decada,
                AVG(al.pontuacao_popularidade) as media_popularidade_decada,
                GROUP_CONCAT(DISTINCT a.nome) as artistas_decada
            FROM albuns_salvos als
            JOIN albuns al ON als.id_album = al.id
            JOIN artistas a ON al.id_artista = a.id
            WHERE als.id_usuario = ? AND al.data_lancamento IS NOT NULL
            GROUP BY decada
            ORDER BY decada DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const buscarAlbunsSalvosPorNome = async function (id_usuario, termo_busca) {
    try {
        let sql = `
            SELECT 
                als.*,
                al.titulo, al.url_capa, al.data_lancamento, al.total_faixas,
                a.nome as nome_artista
            FROM albuns_salvos als
            JOIN albuns al ON als.id_album = al.id
            JOIN artistas a ON al.id_artista = a.id
            WHERE als.id_usuario = ? 
            AND (al.titulo LIKE ? OR a.nome LIKE ?)
            ORDER BY als.salvo_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, `%${termo_busca}%`, `%${termo_busca}%`)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterRecomendacoesAlbunsSimilares = async function (id_usuario, limite = 5) {
    try {
        let sql = `
            SELECT 
                al.id, al.titulo, al.url_capa, al.data_lancamento, al.total_faixas,
                al.duracao_minutos, al.pontuacao_popularidade,
                a.nome as nome_artista,
                COUNT(DISTINCT als2.id_usuario) as usuarios_em_comum,
                AVG(al.pontuacao_popularidade) as media_popularidade
            FROM albuns al
            JOIN artistas a ON al.id_artista = a.id
            JOIN albuns_salvos als1 ON al.id = als1.id_album
            JOIN albuns_salvos als2 ON al.id = als2.id_album AND als2.id_usuario != als1.id_usuario
            WHERE als1.id_usuario = ? 
            AND al.id NOT IN (SELECT id_album FROM albuns_salvos WHERE id_usuario = ?)
            GROUP BY al.id, a.id
            HAVING usuarios_em_comum >= 2
            ORDER BY usuarios_em_comum DESC, media_popularidade DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_usuario, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

module.exports = {
    salvarAlbum,
    removerAlbumSalvo,
    listarAlbunsSalvosUsuario,
    verificarAlbumSalvo,
    contarAlbunsSalvosUsuario,
    listarAlbunsSalvosPorPeriodo,
    listarAlbunsMaisSalvos,
    listarUsuariosPorAlbumSalvo,
    obterAlbunsSalvosRecentes,
    obterEstatisticasAlbunsSalvos,
    obterDistribuicaoArtistasSalvos,
    obterAlbunsSalvosPorArtista,
    obterAlbunsSalvosPorGenero,
    obterAlbunsSalvosPorDecada,
    buscarAlbunsSalvosPorNome,
    obterRecomendacoesAlbunsSimilares
}
