const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const registrarFeedback = async function (id_recomendacao, id_usuario, tipo_feedback) {
    try {
        let sql = "INSERT INTO feedback_recomendacoes (id_recomendacao, id_usuario, tipo_feedback) VALUES (?, ?, ?)"
        let result = await prisma.$queryRawUnsafe(sql, id_recomendacao, id_usuario, tipo_feedback)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarFeedbackUsuario = async function (id_usuario, limite = 50) {
    try {
        let sql = `
            SELECT 
                fr.*,
                ri.tipo_recomendacao,
                ri.pontuacao_confianca,
                ri.criada_em as recomendacao_criada_em,
                m.titulo as musica_titulo,
                a.nome as nome_artista,
                al.titulo as titulo_album,
                al.url_capa
            FROM feedback_recomendacoes fr
            JOIN recomendacoes_ia ri ON fr.id_recomendacao = ri.id
            JOIN musicas m ON ri.id_musica = m.id
            JOIN artistas a ON m.id_artista = a.id
            LEFT JOIN albuns al ON m.id_album = al.id
            WHERE fr.id_usuario = ?
            ORDER BY fr.timestamp_feedback DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarFeedbackPorRecomendacao = async function (id_recomendacao, limite = 50) {
    try {
        let sql = `
            SELECT 
                fr.*,
                u.nome_usuario,
                u.url_avatar,
                u.esta_ativo,
                u.e_premium
            FROM feedback_recomendacoes fr
            JOIN usuarios u ON fr.id_usuario = u.id
            WHERE fr.id_recomendacao = ?
            ORDER BY fr.timestamp_feedback DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_recomendacao, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarFeedbackPorTipo = async function (id_usuario, tipo_feedback, limite = 50) {
    try {
        let sql = `
            SELECT 
                fr.*,
                ri.tipo_recomendacao,
                ri.pontuacao_confianca,
                m.titulo as musica_titulo,
                a.nome as nome_artista
            FROM feedback_recomendacoes fr
            JOIN recomendacoes_ia ri ON fr.id_recomendacao = ri.id
            JOIN musicas m ON ri.id_musica = m.id
            JOIN artistas a ON m.id_artista = a.id
            WHERE fr.id_usuario = ? AND fr.tipo_feedback = ?
            ORDER BY fr.timestamp_feedback DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, tipo_feedback, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterEstatisticasFeedbackUsuario = async function (id_usuario, dias = 30) {
    try {
        let sql = `
            SELECT 
                COUNT(*) as total_feedback,
                COUNT(DISTINCT fr.id_recomendacao) as total_recomendacoes_unicas,
                COUNT(DISTINCT fr.tipo_feedback) as total_tipos_feedback,
                COUNT(CASE WHEN fr.tipo_feedback = 'curtir' THEN 1 END) as total_curtidas,
                COUNT(CASE WHEN fr.tipo_feedback = 'nao_curtir' THEN 1 END) as total_nao_curtidas,
                COUNT(CASE WHEN fr.tipo_feedback = 'reproduzir' THEN 1 END) as total_reproducoes,
                COUNT(CASE WHEN fr.tipo_feedback = 'pular' THEN 1 END) as total_pulos,
                COUNT(CASE WHEN fr.tipo_feedback = 'adicionar_playlist' THEN 1 END) as total_adicionadas_playlist,
                AVG(ri.pontuacao_confianca) as media_confianca_feedback
            FROM feedback_recomendacoes fr
            JOIN recomendacoes_ia ri ON fr.id_recomendacao = ri.id
            WHERE fr.id_usuario = ? AND fr.timestamp_feedback >= DATE_SUB(NOW(), INTERVAL ? DAY)
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterDistribuicaoFeedbackUsuario = async function (id_usuario, dias = 30) {
    try {
        let sql = `
            SELECT 
                fr.tipo_feedback,
                COUNT(*) as total_feedback,
                COUNT(DISTINCT fr.id_recomendacao) as recomendacoes_unicas,
                AVG(ri.pontuacao_confianca) as media_confianca_tipo,
                MAX(fr.timestamp_feedback) as ultimo_feedback_tipo
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

const obterFeedbackPorTipoRecomendacao = async function (tipo_recomendacao, dias = 30) {
    try {
        let sql = `
            SELECT 
                fr.tipo_feedback,
                COUNT(*) as total_feedback,
                COUNT(DISTINCT fr.id_usuario) as usuarios_unicos,
                AVG(ri.pontuacao_confianca) as media_confianca_tipo,
                MAX(fr.timestamp_feedback) as ultimo_feedback_tipo
            FROM feedback_recomendacoes fr
            JOIN recomendacoes_ia ri ON fr.id_recomendacao = ri.id
            WHERE ri.tipo_recomendacao = ? AND fr.timestamp_feedback >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY fr.tipo_feedback
            ORDER BY total_feedback DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, tipo_recomendacao, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterTaxaAprovacaoRecomendacoes = async function (id_usuario, dias = 30) {
    try {
        let sql = `
            SELECT 
                ri.tipo_recomendacao,
                COUNT(*) as total_recomendacoes,
                COUNT(CASE WHEN fr.tipo_feedback IN ('curtir', 'reproduzir', 'adicionar_playlist') THEN 1 END) as total_aprovacoes,
                COUNT(CASE WHEN fr.tipo_feedback IN ('nao_curtir', 'pular') THEN 1 END) as total_reprovacoes,
                AVG(ri.pontuacao_confianca) as media_confianca_tipo
            FROM recomendacoes_ia ri
            LEFT JOIN feedback_recomendacoes fr ON ri.id = fr.id_recomendacao AND fr.id_usuario = ?
            WHERE ri.id_usuario = ? AND ri.criada_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY ri.tipo_recomendacao
            ORDER BY total_recomendacoes DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_usuario, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterFeedbackRecente = async function (id_usuario, id_recomendacao) {
    try {
        let sql = `
            SELECT * FROM feedback_recomendacoes 
            WHERE id_usuario = ? AND id_recomendacao = ?
            ORDER BY timestamp_feedback DESC
            LIMIT 1
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_recomendacao)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const verificarFeedbackExistente = async function (id_usuario, id_recomendacao) {
    try {
        let sql = "SELECT COUNT(*) as total FROM feedback_recomendacoes WHERE id_usuario = ? AND id_recomendacao = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_recomendacao)
        return result && result.length > 0 && result[0].total > 0
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterEvolucaoFeedback = async function (id_usuario, dias = 7) {
    try {
        let sql = `
            SELECT 
                DATE(fr.timestamp_feedback) as data,
                COUNT(*) as total_feedback_dia,
                COUNT(DISTINCT fr.id_recomendacao) as recomendacoes_unicas_dia,
                COUNT(CASE WHEN fr.tipo_feedback = 'curtir' THEN 1 END) as curtidas_dia,
                COUNT(CASE WHEN fr.tipo_feedback = 'reproduzir' THEN 1 END) as reproducoes_dia,
                COUNT(CASE WHEN fr.tipo_feedback = 'pular' THEN 1 END) as pulos_dia,
                AVG(ri.pontuacao_confianca) as media_confianca_dia
            FROM feedback_recomendacoes fr
            JOIN recomendacoes_ia ri ON fr.id_recomendacao = ri.id
            WHERE fr.id_usuario = ? AND fr.timestamp_feedback >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(fr.timestamp_feedback)
            ORDER BY data DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterFeedbackPorPeriodo = async function (id_usuario, data_inicio, data_fim) {
    try {
        let sql = `
            SELECT 
                fr.*,
                ri.tipo_recomendacao,
                ri.pontuacao_confianca,
                m.titulo as musica_titulo,
                a.nome as nome_artista
            FROM feedback_recomendacoes fr
            JOIN recomendacoes_ia ri ON fr.id_recomendacao = ri.id
            JOIN musicas m ON ri.id_musica = m.id
            JOIN artistas a ON m.id_artista = a.id
            WHERE fr.id_usuario = ? AND fr.timestamp_feedback BETWEEN ? AND ?
            ORDER BY fr.timestamp_feedback DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, data_inicio, data_fim)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterPadraoFeedbackPorHora = async function (id_usuario, dias = 30) {
    try {
        let sql = `
            SELECT 
                HOUR(fr.timestamp_feedback) as hora,
                COUNT(*) as total_feedback_hora,
                COUNT(DISTINCT fr.id_recomendacao) as recomendacoes_unicas_hora,
                GROUP_CONCAT(DISTINCT fr.tipo_feedback) as tipos_feedback_hora,
                AVG(ri.pontuacao_confianca) as media_confianca_hora
            FROM feedback_recomendacoes fr
            JOIN recomendacoes_ia ri ON fr.id_recomendacao = ri.id
            WHERE fr.id_usuario = ? AND fr.timestamp_feedback >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY HOUR(fr.timestamp_feedback)
            ORDER BY hora
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterDesempenhoTiposRecomendacao = async function (dias = 30) {
    try {
        let sql = `
            SELECT 
                ri.tipo_recomendacao,
                COUNT(*) as total_gerada,
                COUNT(fr.id) as total_feedback,
                COUNT(DISTINCT fr.id_usuario) as usuarios_feedback,
                COUNT(CASE WHEN fr.tipo_feedback IN ('curtir', 'reproduzir', 'adicionar_playlist') THEN 1 END) as total_positivo,
                COUNT(CASE WHEN fr.tipo_feedback IN ('nao_curtir', 'pular') THEN 1 END) as total_negativo,
                AVG(ri.pontuacao_confianca) as media_confianca_geral,
                AVG(fr.tipo_feedback = 'curtir') as taxa_curtida,
                AVG(fr.tipo_feedback = 'reproduzir') as taxa_reproducao
            FROM recomendacoes_ia ri
            LEFT JOIN feedback_recomendacoes fr ON ri.id = fr.id_recomendacao
            WHERE ri.criada_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY ri.tipo_recomendacao
            ORDER BY total_gerada DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const limparFeedbackAntigo = async function (dias_manter = 365) {
    try {
        let sql = "DELETE FROM feedback_recomendacoes WHERE timestamp_feedback < DATE_SUB(NOW(), INTERVAL ? DAY)"
        let result = await prisma.$queryRawUnsafe(sql, dias_manter)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterResumoFeedbackUsuario = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                COUNT(*) as total_feedback_geral,
                COUNT(DISTINCT fr.id_recomendacao) as total_recomendacoes_unicas,
                COUNT(CASE WHEN fr.tipo_feedback = 'curtir' THEN 1 END) as total_curtidas,
                COUNT(CASE WHEN fr.tipo_feedback = 'reproduzir' THEN 1 END) as total_reproducoes,
                COUNT(CASE WHEN fr.tipo_feedback = 'adicionar_playlist' THEN 1 END) as total_adicionadas,
                COUNT(CASE WHEN fr.tipo_feedback = 'pular' THEN 1 END) as total_pulos,
                COUNT(CASE WHEN fr.tipo_feedback = 'nao_curtir' THEN 1 END) as total_nao_curtidas,
                MAX(fr.timestamp_feedback) as ultimo_feedback,
                MIN(fr.timestamp_feedback) as primeiro_feedback
            FROM feedback_recomendacoes fr
            WHERE fr.id_usuario = ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

module.exports = {
    registrarFeedback,
    listarFeedbackUsuario,
    listarFeedbackPorRecomendacao,
    listarFeedbackPorTipo,
    obterEstatisticasFeedbackUsuario,
    obterDistribuicaoFeedbackUsuario,
    obterFeedbackPorTipoRecomendacao,
    obterTaxaAprovacaoRecomendacoes,
    obterFeedbackRecente,
    verificarFeedbackExistente,
    obterEvolucaoFeedback,
    obterFeedbackPorPeriodo,
    obterPadraoFeedbackPorHora,
    obterDesempenhoTiposRecomendacao,
    limparFeedbackAntigo,
    obterResumoFeedbackUsuario
}
