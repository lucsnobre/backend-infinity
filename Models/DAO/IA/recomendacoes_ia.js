const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const gerarRecomendacao = async function (id_usuario, id_musica, tipo_recomendacao, pontuacao_confianca, dados_contexto) {
    try {
        let sql = `
            INSERT INTO recomendacoes_ia 
            (id_usuario, id_musica, tipo_recomendacao, pontuacao_confianca, dados_contexto, expira_em) 
            VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))
        `
        let params = [
            id_usuario,
            id_musica,
            tipo_recomendacao,
            pontuacao_confianca,
            dados_contexto ? JSON.stringify(dados_contexto) : null
        ]
        let result = await prisma.$queryRawUnsafe(sql, ...params)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarRecomendacoesUsuario = async function (id_usuario, limite = 20) {
    try {
        let sql = `
            SELECT 
                ri.*,
                m.titulo, m.duracao_segundos, m.explicito,
                a.nome as nome_artista,
                al.titulo as titulo_album,
                al.url_capa,
                g.nome as nome_genero
            FROM recomendacoes_ia ri
            JOIN musicas m ON ri.id_musica = m.id
            JOIN artistas a ON m.id_artista = a.id
            LEFT JOIN albuns al ON m.id_album = al.id
            LEFT JOIN musicas_generos mg ON m.id = mg.id_musica
            LEFT JOIN generos g ON mg.id_genero = g.id
            WHERE ri.id_usuario = ? AND ri.foi_reproduzida = false AND ri.expira_em > NOW()
            ORDER BY ri.pontuacao_confianca DESC, ri.criada_em DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarRecomendacoesPorTipo = async function (id_usuario, tipo_recomendacao, limite = 10) {
    try {
        let sql = `
            SELECT 
                ri.*,
                m.titulo, m.duracao_segundos,
                a.nome as nome_artista,
                al.titulo as titulo_album,
                al.url_capa
            FROM recomendacoes_ia ri
            JOIN musicas m ON ri.id_musica = m.id
            JOIN artistas a ON m.id_artista = a.id
            LEFT JOIN albuns al ON m.id_album = al.id
            WHERE ri.id_usuario = ? AND ri.tipo_recomendacao = ? AND ri.foi_reproduzida = false AND ri.expira_em > NOW()
            ORDER BY ri.pontuacao_confianca DESC, ri.criada_em DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, tipo_recomendacao, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const marcarComoReproduzida = async function (id_recomendacao) {
    try {
        let sql = "UPDATE recomendacoes_ia SET foi_reproduzida = true WHERE id = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_recomendacao)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const adicionarFeedbackRecomendacao = async function (id_recomendacao, id_usuario, tipo_feedback) {
    try {
        let sql = `
            INSERT INTO feedback_recomendacoes 
            (id_recomendacao, id_usuario, tipo_feedback) 
            VALUES (?, ?, ?)
        `
        let result = await prisma.$queryRawUnsafe(sql, id_recomendacao, id_usuario, tipo_feedback)
        
        if (result) {
            await marcarComoReproduzida(id_recomendacao)
        }
        
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarRecomendacoesExpiradas = async function (limite = 100) {
    try {
        let sql = `
            SELECT ri.*, u.nome_usuario
            FROM recomendacoes_ia ri
            JOIN usuarios u ON ri.id_usuario = u.id
            WHERE ri.expira_em <= NOW() AND ri.foi_reproduzida = false
            ORDER BY ri.expira_em ASC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const limparRecomendacoesExpiradas = async function () {
    try {
        let sql = "DELETE FROM recomendacoes_ia WHERE expira_em <= NOW()"
        let result = await prisma.$queryRawUnsafe(sql)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterEstatisticasRecomendacoesUsuario = async function (id_usuario, dias = 30) {
    try {
        let sql = `
            SELECT 
                COUNT(*) as total_recomendacoes,
                COUNT(CASE WHEN foi_reproduzida = true THEN 1 END) as total_reproduzidas,
                COUNT(CASE WHEN foi_curtida = true THEN 1 END) as total_curtidas,
                AVG(pontuacao_confianca) as media_confianca,
                MAX(pontuacao_confianca) as max_confianca,
                MIN(pontuacao_confianca) as min_confianca,
                COUNT(DISTINCT tipo_recomendacao) as total_tipos
            FROM recomendacoes_ia 
            WHERE id_usuario = ? AND criada_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterFeedbackRecomendacoesUsuario = async function (id_usuario, dias = 30) {
    try {
        let sql = `
            SELECT 
                fr.tipo_feedback,
                COUNT(*) as total_feedback,
                AVG(ri.pontuacao_confianca) as media_confianca_feedback
            FROM feedback_recomendacoes fr
            JOIN recomendacoes_ia ri ON fr.id_recomendacao = ri.id
            WHERE fr.id_usuario = ? AND fr.timestamp_feedback >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY fr.tipo_feedback
            ORDER BY total_feedback DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterRecomendacoesPorContexto = async function (id_usuario, contexto, limite = 10) {
    try {
        let sql = `
            SELECT 
                ri.*,
                m.titulo, m.duracao_segundos,
                a.nome as nome_artista,
                al.titulo as titulo_album,
                al.url_capa
            FROM recomendacoes_ia ri
            JOIN musicas m ON ri.id_musica = m.id
            JOIN artistas a ON m.id_artista = a.id
            LEFT JOIN albuns al ON m.id_album = al.id
            WHERE ri.id_usuario = ? 
            AND JSON_CONTAINS(ri.dados_contexto, ?)
            AND ri.foi_reproduzida = false 
            AND ri.expira_em > NOW()
            ORDER BY ri.pontuacao_confianca DESC, ri.criada_em DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, JSON.stringify(contexto), limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const atualizarConfiancaRecomendacao = async function (id_recomendacao, nova_pontuacao) {
    try {
        let sql = "UPDATE recomendacoes_ia SET pontuacao_confianca = ? WHERE id = ?"
        let result = await prisma.$queryRawUnsafe(sql, nova_pontuacao, id_recomendacao)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterMusicasRecomendadasUsuario = async function (id_usuario, dias = 7) {
    try {
        let sql = `
            SELECT DISTINCT ri.id_musica
            FROM recomendacoes_ia ri
            WHERE ri.id_usuario = ? 
            AND ri.foi_reproduzida = true
            AND ri.criada_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result.map(r => r.id_musica) : []
    } catch (error) {
        console.log(error)
        return []
    }
}

const verificarMusicaRecomendadaRecentemente = async function (id_usuario, id_musica, horas = 24) {
    try {
        let sql = `
            SELECT COUNT(*) as total
            FROM recomendacoes_ia 
            WHERE id_usuario = ? AND id_musica = ? 
            AND criada_em >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_musica, horas)
        return result && result.length > 0 && result[0].total > 0
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterDesempenhoTiposRecomendacao = async function (id_usuario, dias = 30) {
    try {
        let sql = `
            SELECT 
                ri.tipo_recomendacao,
                COUNT(*) as total_geradas,
                COUNT(CASE WHEN ri.foi_reproduzida = true THEN 1 END) as total_reproduzidas,
                COUNT(CASE WHEN ri.foi_curtida = true THEN 1 END) as total_curtidas,
                AVG(ri.pontuacao_confianca) as media_confianca,
                (COUNT(CASE WHEN ri.foi_reproduzida = true THEN 1 END) / COUNT(*)) * 100 as taxa_reproducao
            FROM recomendacoes_ia ri
            WHERE ri.id_usuario = ? AND ri.criada_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY ri.tipo_recomendacao
            ORDER BY taxa_reproducao DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterRecomendacoesSimilares = async function (id_usuario, id_musica_referencia, limite = 5) {
    try {
        let sql = `
            SELECT 
                ri.*,
                m.titulo, m.duracao_segundos,
                a.nome as nome_artista,
                al.titulo as titulo_album,
                al.url_capa,
                (
                    SELECT COUNT(*) 
                    FROM feedback_recomendacoes fr2 
                    JOIN recomendacoes_ia ri2 ON fr2.id_recomendacao = ri2.id
                    WHERE fr2.tipo_feedback = 'curtir' 
                    AND ri2.id_musica = ri.id_musica
                ) as curtidas_totais
            FROM recomendacoes_ia ri
            JOIN musicas m ON ri.id_musica = m.id
            JOIN artistas a ON m.id_artista = a.id
            LEFT JOIN albuns al ON m.id_album = al.id
            WHERE ri.id_usuario = ? 
            AND ri.id_musica != ?
            AND ri.tipo_recomendacao = 'similar'
            AND ri.foi_reproduzida = false 
            AND ri.expira_em > NOW()
            ORDER BY ri.pontuacao_confianca DESC, curtidas_totais DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_musica_referencia, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

module.exports = {
    gerarRecomendacao,
    listarRecomendacoesUsuario,
    listarRecomendacoesPorTipo,
    marcarComoReproduzida,
    adicionarFeedbackRecomendacao,
    listarRecomendacoesExpiradas,
    limparRecomendacoesExpiradas,
    obterEstatisticasRecomendacoesUsuario,
    obterFeedbackRecomendacoesUsuario,
    obterRecomendacoesPorContexto,
    atualizarConfiancaRecomendacao,
    obterMusicasRecomendadasUsuario,
    verificarMusicaRecomendadaRecentemente,
    obterDesempenhoTiposRecomendacao,
    obterRecomendacoesSimilares
}
