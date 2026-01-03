const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const registrarDadosClima = async function (id_usuario, localizacao, temperatura, umidade, condicao_climatica) {
    try {
        let sql = "INSERT INTO dados_clima (id_usuario, localizacao, temperatura, umidade, condicao_climatica) VALUES (?, ?, ?, ?, ?)"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, localizacao, temperatura, umidade, condicao_climatica)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarDadosClimaUsuario = async function (id_usuario, limite = 50) {
    try {
        let sql = `
            SELECT * FROM dados_clima 
            WHERE id_usuario = ? 
            ORDER BY timestamp DESC 
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarDadosClimaPorPeriodo = async function (id_usuario, data_inicio, data_fim) {
    try {
        let sql = `
            SELECT * FROM dados_clima 
            WHERE id_usuario = ? AND timestamp BETWEEN ? AND ?
            ORDER BY timestamp DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, data_inicio, data_fim)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterDadosClimaRecentes = async function (id_usuario, horas = 24) {
    try {
        let sql = `
            SELECT * FROM dados_clima 
            WHERE id_usuario = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
            ORDER BY timestamp DESC
            LIMIT 1
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, horas)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterDadosClimaPorLocalizacao = async function (id_usuario, localizacao, dias = 7) {
    try {
        let sql = `
            SELECT * FROM dados_clima 
            WHERE id_usuario = ? AND localizacao = ? 
            AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY timestamp DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, localizacao, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterEstatisticasClimaUsuario = async function (id_usuario, dias = 30) {
    try {
        let sql = `
            SELECT 
                COUNT(*) as total_registros,
                COUNT(DISTINCT localizacao) as total_localizacoes,
                AVG(temperatura) as media_temperatura,
                MAX(temperatura) as max_temperatura,
                MIN(temperatura) as min_temperatura,
                AVG(umidade) as media_umidade,
                MAX(umidade) as max_umidade,
                MIN(umidade) as min_umidade,
                COUNT(DISTINCT condicao_climatica) as total_condicoes
            FROM dados_clima 
            WHERE id_usuario = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterCondicoesClimaticasFrequentes = async function (id_usuario, dias = 30) {
    try {
        let sql = `
            SELECT 
                condicao_climatica,
                COUNT(*) as frequencia,
                AVG(temperatura) as media_temperatura_condicao,
                AVG(umidade) as media_umidade_condicao
            FROM dados_clima 
            WHERE id_usuario = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY condicao_climatica
            ORDER BY frequencia DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterLocalizacoesVisitadas = async function (id_usuario, dias = 30) {
    try {
        let sql = `
            SELECT 
                localizacao,
                COUNT(*) as total_visitas,
                AVG(temperatura) as media_temperatura_local,
                AVG(umidade) as media_umidade_local,
                MAX(timestamp) as ultima_visita,
                MIN(timestamp) as primeira_visita
            FROM dados_clima 
            WHERE id_usuario = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY localizacao
            ORDER BY total_visitas DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterPadraoClimaticoPorHora = async function (id_usuario, dias = 30) {
    try {
        let sql = `
            SELECT 
                HOUR(timestamp) as hora,
                AVG(temperatura) as media_temperatura_hora,
                AVG(umidade) as media_umidade_hora,
                COUNT(*) as total_registros_hora,
                GROUP_CONCAT(DISTINCT condicao_climatica) as condicoes_hora
            FROM dados_clima 
            WHERE id_usuario = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY HOUR(timestamp)
            ORDER BY hora
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const limparDadosClimaAntigos = async function (id_usuario, dias_manter = 90) {
    try {
        let sql = "DELETE FROM dados_clima WHERE id_usuario = ? AND timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias_manter)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterDadosClimaPorCondicao = async function (id_usuario, condicao_climatica, dias = 30) {
    try {
        let sql = `
            SELECT * FROM dados_clima 
            WHERE id_usuario = ? AND condicao_climatica = ? 
            AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY timestamp DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, condicao_climatica, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterTemperaturaExtremas = async function (id_usuario, dias = 30) {
    try {
        let sql = `
            SELECT 
                (SELECT temperatura FROM dados_clima WHERE id_usuario = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY) ORDER BY temperatura DESC LIMIT 1) as temp_max,
                (SELECT temperatura FROM dados_clima WHERE id_usuario = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY) ORDER BY temperatura ASC LIMIT 1) as temp_min,
                (SELECT timestamp FROM dados_clima WHERE id_usuario = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY) ORDER BY temperatura DESC LIMIT 1) as timestamp_max,
                (SELECT timestamp FROM dados_clima WHERE id_usuario = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY) ORDER BY temperatura ASC LIMIT 1) as timestamp_min
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias, id_usuario, dias, id_usuario, dias, id_usuario, dias)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterEvolucaoClimatica = async function (id_usuario, dias = 7) {
    try {
        let sql = `
            SELECT 
                DATE(timestamp) as data,
                AVG(temperatura) as media_temperatura_dia,
                MIN(temperatura) as min_temperatura_dia,
                MAX(temperatura) as max_temperatura_dia,
                AVG(umidade) as media_umidade_dia,
                COUNT(*) as total_registros_dia,
                GROUP_CONCAT(DISTINCT condicao_climatica) as condicoes_dia
            FROM dados_clima 
            WHERE id_usuario = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(timestamp)
            ORDER BY data DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const verificarDadosClimaExistentes = async function (id_usuario, horas = 1) {
    try {
        let sql = `
            SELECT COUNT(*) as total 
            FROM dados_clima 
            WHERE id_usuario = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, horas)
        return result && result.length > 0 && result[0].total > 0
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterResumoClimaAtual = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                localizacao,
                temperatura,
                umidade,
                condicao_climatica,
                timestamp
            FROM dados_clima 
            WHERE id_usuario = ? 
            ORDER BY timestamp DESC 
            LIMIT 1
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterDadosClimaPorTemperatura = async function (id_usuario, temp_min, temp_max, dias = 30) {
    try {
        let sql = `
            SELECT * FROM dados_clima 
            WHERE id_usuario = ? 
            AND temperatura BETWEEN ? AND ?
            AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY timestamp DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, temp_min, temp_max, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

module.exports = {
    registrarDadosClima,
    listarDadosClimaUsuario,
    listarDadosClimaPorPeriodo,
    obterDadosClimaRecentes,
    obterDadosClimaPorLocalizacao,
    obterEstatisticasClimaUsuario,
    obterCondicoesClimaticasFrequentes,
    obterLocalizacoesVisitadas,
    obterPadraoClimaticoPorHora,
    limparDadosClimaAntigos,
    obterDadosClimaPorCondicao,
    obterTemperaturaExtremas,
    obterEvolucaoClimatica,
    verificarDadosClimaExistentes,
    obterResumoClimaAtual,
    obterDadosClimaPorTemperatura
}
