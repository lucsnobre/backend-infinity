const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const registrarHumor = async function (id_usuario, tipo_humor, intensidade, origem) {
    try {
        let sql = "INSERT INTO humor_usuario (id_usuario, tipo_humor, intensidade, origem) VALUES (?, ?, ?, ?)"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, tipo_humor, intensidade, origem)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarHumorUsuario = async function (id_usuario, limite = 50) {
    try {
        let sql = `
            SELECT * FROM humor_usuario 
            WHERE id_usuario = ? 
            ORDER BY registrado_em DESC 
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarHumorPorPeriodo = async function (id_usuario, data_inicio, data_fim) {
    try {
        let sql = `
            SELECT * FROM humor_usuario 
            WHERE id_usuario = ? AND registrado_em BETWEEN ? AND ?
            ORDER BY registrado_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, data_inicio, data_fim)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterHumorRecente = async function (id_usuario, horas = 24) {
    try {
        let sql = `
            SELECT * FROM humor_usuario 
            WHERE id_usuario = ? AND registrado_em >= DATE_SUB(NOW(), INTERVAL ? HOUR)
            ORDER BY registrado_em DESC
            LIMIT 1
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, horas)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterHumorPorTipo = async function (id_usuario, tipo_humor, dias = 30) {
    try {
        let sql = `
            SELECT * FROM humor_usuario 
            WHERE id_usuario = ? AND tipo_humor = ? 
            AND registrado_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY registrado_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, tipo_humor, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterEstatisticasHumor = async function (id_usuario, dias = 30) {
    try {
        let sql = `
            SELECT 
                COUNT(*) as total_registros,
                COUNT(DISTINCT tipo_humor) as total_tipos,
                AVG(intensidade) as media_intensidade,
                MAX(intensidade) as max_intensidade,
                MIN(intensidade) as min_intensidade,
                COUNT(DISTINCT origem) as total_origens
            FROM humor_usuario 
            WHERE id_usuario = ? AND registrado_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterHumoresFrequentes = async function (id_usuario, dias = 30) {
    try {
        let sql = `
            SELECT 
                tipo_humor,
                COUNT(*) as frequencia,
                AVG(intensidade) as media_intensidade_humor,
                MAX(intensidade) as max_intensidade_humor,
                MIN(intensidade) as min_intensidade_humor
            FROM humor_usuario 
            WHERE id_usuario = ? AND registrado_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY tipo_humor
            ORDER BY frequencia DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterPadraoHumorPorHora = async function (id_usuario, dias = 30) {
    try {
        let sql = `
            SELECT 
                HOUR(registrado_em) as hora,
                AVG(intensidade) as media_intensidade_hora,
                COUNT(*) as total_registros_hora,
                GROUP_CONCAT(DISTINCT tipo_humor) as humores_hora
            FROM humor_usuario 
            WHERE id_usuario = ? AND registrado_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY HOUR(registrado_em)
            ORDER BY hora
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterEvolucaoHumorDiaria = async function (id_usuario, dias = 7) {
    try {
        let sql = `
            SELECT 
                DATE(registrado_em) as data,
                AVG(intensidade) as media_intensidade_dia,
                MIN(intensidade) as min_intensidade_dia,
                MAX(intensidade) as max_intensidade_dia,
                COUNT(*) as total_registros_dia,
                GROUP_CONCAT(DISTINCT tipo_humor) as humores_dia
            FROM humor_usuario 
            WHERE id_usuario = ? AND registrado_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(registrado_em)
            ORDER BY data DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterDistribuicaoOrigens = async function (id_usuario, dias = 30) {
    try {
        let sql = `
            SELECT 
                origem,
                COUNT(*) as total_registros,
                AVG(intensidade) as media_intensidade_origem,
                COUNT(DISTINCT tipo_humor) as total_tipos_origem
            FROM humor_usuario 
            WHERE id_usuario = ? AND registrado_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY origem
            ORDER BY total_registros DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterHumoresPorIntensidade = async function (id_usuario, intensidade_min, intensidade_max, dias = 30) {
    try {
        let sql = `
            SELECT * FROM humor_usuario 
            WHERE id_usuario = ? 
            AND intensidade BETWEEN ? AND ?
            AND registrado_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY registrado_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, intensidade_min, intensidade_max, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const limparHumorAntigo = async function (id_usuario, dias_manter = 90) {
    try {
        let sql = "DELETE FROM humor_usuario WHERE id_usuario = ? AND registrado_em < DATE_SUB(NOW(), INTERVAL ? DAY)"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias_manter)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const verificarHumorExistente = async function (id_usuario, horas = 2) {
    try {
        let sql = `
            SELECT COUNT(*) as total 
            FROM humor_usuario 
            WHERE id_usuario = ? AND registrado_em >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, horas)
        return result && result.length > 0 && result[0].total > 0
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterTendenciaHumor = async function (id_usuario, dias = 7) {
    try {
        let sql = `
            SELECT 
                tipo_humor,
                AVG(intensidade) as media_intensidade,
                COUNT(*) as total_registros,
                DATE(registrado_em) as data
            FROM humor_usuario 
            WHERE id_usuario = ? AND registrado_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY tipo_humor, DATE(registrado_em)
            ORDER BY data DESC, total_registros DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterResumoHumorAtual = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                tipo_humor,
                intensidade,
                origem,
                registrado_em
            FROM humor_usuario 
            WHERE id_usuario = ? 
            ORDER BY registrado_em DESC 
            LIMIT 1
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterAnaliseEmocional = async function (id_usuario, dias = 30) {
    try {
        let sql = `
            SELECT 
                tipo_humor,
                COUNT(*) as frequencia,
                AVG(intensidade) as media_intensidade,
                SUM(CASE WHEN intensidade >= 0.7 THEN 1 ELSE 0 END) as total_alta_intensidade,
                SUM(CASE WHEN intensidade <= 0.3 THEN 1 ELSE 0 END) as total_baixa_intensidade,
                MAX(registrado_em) as ultimo_registro
            FROM humor_usuario 
            WHERE id_usuario = ? AND registrado_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY tipo_humor
            ORDER BY frequencia DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterCorrelacaoHumorMusica = async function (id_usuario, dias = 30) {
    try {
        let sql = `
            SELECT 
                hu.tipo_humor,
                hu.intensidade as intensidade_humor,
                m.titulo as musica_titulo,
                a.nome as artista_nome,
                hr.reproduzida_em,
                TIMESTAMPDIFF(MINUTE, hu.registrado_em, hr.reproduzida_em) as diferenca_minutos
            FROM humor_usuario hu
            JOIN historico_reproducao hr ON hu.id_usuario = hr.id_usuario
            JOIN musicas m ON hr.id_musica = m.id
            JOIN artistas a ON m.id_artista = a.id
            WHERE hu.id_usuario = ? 
            AND hu.registrado_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
            AND hr.reproduzida_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
            AND ABS(TIMESTAMPDIFF(MINUTE, hu.registrado_em, hr.reproduzida_em)) <= 60
            ORDER BY hr.reproduzida_em DESC
            LIMIT 50
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

module.exports = {
    registrarHumor,
    listarHumorUsuario,
    listarHumorPorPeriodo,
    obterHumorRecente,
    obterHumorPorTipo,
    obterEstatisticasHumor,
    obterHumoresFrequentes,
    obterPadraoHumorPorHora,
    obterEvolucaoHumorDiaria,
    obterDistribuicaoOrigens,
    obterHumoresPorIntensidade,
    limparHumorAntigo,
    verificarHumorExistente,
    obterTendenciaHumor,
    obterResumoHumorAtual,
    obterAnaliseEmocional,
    obterCorrelacaoHumorMusica
}
