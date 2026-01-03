const MESSAGE = require('../../Módulos/config')
const dadosClimaDAO = require('../../Models/DAO/Context/dados_clima')

const registrarDadosClima = async function (id_usuario, dados_clima, contentType) {
    try {
        if (String(contentType).toLowerCase() !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE
        }

        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const {localizacao, temperatura, umidade, condicao_climatica} = dados_clima

        if (!localizacao || localizacao.length > 100 ||
            temperatura === undefined || isNaN(temperatura) || temperatura < -50 || temperatura > 60 ||
            umidade === undefined || isNaN(umidade) || umidade < 0 || umidade > 100 ||
            !condicao_climatica || condicao_climatica.length > 50
        ) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const condicoesValidas = ['ensolarado', 'chuvoso', 'nublado', 'parcialmente_nublado', 'tempestuoso', 'nevando', 'neblina', 'ventoso']
        if (!condicoesValidas.includes(condicao_climatica.toLowerCase())) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const dadosExistentes = await dadosClimaDAO.verificarDadosClimaExistentes(id_usuario, 1)
        if (dadosExistentes) {
            return {status: false, status_code: 409, message: 'Dados de clima já registrados na última hora'}
        }

        const result = await dadosClimaDAO.registrarDadosClima(id_usuario, localizacao, temperatura, umidade, condicao_climatica)
        return result ? MESSAGE.SUCCESS_CREATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarDadosClimaUsuario = async function (id_usuario, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 100 ? parseInt(limite) : 50
        const dados = await dadosClimaDAO.listarDadosClimaUsuario(id_usuario, limiteValidado)
        return dados ? dados : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarDadosClimaPorPeriodo = async function (id_usuario, data_inicio, data_fim) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !data_inicio || !data_fim) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const inicio = new Date(data_inicio)
        const fim = new Date(data_fim)

        if (isNaN(inicio.getTime()) || isNaN(fim.getTime()) || inicio >= fim) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const dados = await dadosClimaDAO.listarDadosClimaPorPeriodo(id_usuario, data_inicio, data_fim)
        return dados ? dados : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterDadosClimaRecentes = async function (id_usuario, horas) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const horasValidadas = horas && !isNaN(horas) && horas > 0 && horas <= 168 ? parseInt(horas) : 24
        const dados = await dadosClimaDAO.obterDadosClimaRecentes(id_usuario, horasValidadas)
        return dados ? dados : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterDadosClimaPorLocalizacao = async function (id_usuario, localizacao, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !localizacao || localizacao.length < 2) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const dados = await dadosClimaDAO.obterDadosClimaPorLocalizacao(id_usuario, localizacao, diasValidados)
        return dados ? dados : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterEstatisticasClimaUsuario = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const estatisticas = await dadosClimaDAO.obterEstatisticasClimaUsuario(id_usuario, diasValidados)
        
        if (!estatisticas) {
            return {
                status: true,
                total_registros: 0,
                total_localizacoes: 0,
                media_temperatura: 0,
                max_temperatura: 0,
                min_temperatura: 0,
                media_umidade: 0,
                max_umidade: 0,
                min_umidade: 0,
                total_condicoes: 0
            }
        }

        return {
            status: true,
            total_registros: parseInt(estatisticas.total_registros) || 0,
            total_localizacoes: parseInt(estatisticas.total_localizacoes) || 0,
            media_temperatura: Math.round((parseFloat(estatisticas.media_temperatura) || 0) * 10) / 10,
            max_temperatura: Math.round((parseFloat(estatisticas.max_temperatura) || 0) * 10) / 10,
            min_temperatura: Math.round((parseFloat(estatisticas.min_temperatura) || 0) * 10) / 10,
            media_umidade: Math.round(parseFloat(estatisticas.media_umidade) || 0),
            max_umidade: Math.round(parseFloat(estatisticas.max_umidade) || 0),
            min_umidade: Math.round(parseFloat(estatisticas.min_umidade) || 0),
            total_condicoes: parseInt(estatisticas.total_condicoes) || 0
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterCondicoesClimaticasFrequentes = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const condicoes = await dadosClimaDAO.obterCondicoesClimaticasFrequentes(id_usuario, diasValidados)
        
        if (!condicoes) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return condicoes.map(item => ({
            ...item,
            media_temperatura_condicao: Math.round((parseFloat(item.media_temperatura_condicao) || 0) * 10) / 10,
            media_umidade_condicao: Math.round(parseFloat(item.media_umidade_condicao) || 0)
        }))
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterLocalizacoesVisitadas = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const localizacoes = await dadosClimaDAO.obterLocalizacoesVisitadas(id_usuario, diasValidados)
        
        if (!localizacoes) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return localizacoes.map(item => ({
            ...item,
            media_temperatura_local: Math.round((parseFloat(item.media_temperatura_local) || 0) * 10) / 10,
            media_umidade_local: Math.round(parseFloat(item.media_umidade_local) || 0)
        }))
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterPadraoClimaticoPorHora = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const padroes = await dadosClimaDAO.obterPadraoClimaticoPorHora(id_usuario, diasValidados)
        
        if (!padroes) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return padroes.map(item => ({
            ...item,
            media_temperatura_hora: Math.round((parseFloat(item.media_temperatura_hora) || 0) * 10) / 10,
            media_umidade_hora: Math.round(parseFloat(item.media_umidade_hora) || 0),
            condicoes_hora: item.condicoes_hora ? item.condicoes_hora.split(',') : []
        }))
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const limparDadosClimaAntigos = async function (id_usuario, dias_manter) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias_manter && !isNaN(dias_manter) && dias_manter >= 30 && dias_manter <= 365 ? parseInt(dias_manter) : 90
        const result = await dadosClimaDAO.limparDadosClimaAntigos(id_usuario, diasValidados)
        return result ? MESSAGE.SUCCESS_DELETED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterDadosClimaPorCondicao = async function (id_usuario, condicao_climatica, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !condicao_climatica) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const condicoesValidas = ['ensolarado', 'chuvoso', 'nublado', 'parcialmente_nublado', 'tempestuoso', 'nevando', 'neblina', 'ventoso']
        if (!condicoesValidas.includes(condicao_climatica.toLowerCase())) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const dados = await dadosClimaDAO.obterDadosClimaPorCondicao(id_usuario, condicao_climatica, diasValidados)
        return dados ? dados : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterTemperaturaExtremas = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const extremas = await dadosClimaDAO.obterTemperaturaExtremas(id_usuario, diasValidados)
        
        if (!extremas) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return {
            status: true,
            temperatura_maxima: Math.round((parseFloat(extremas.temp_max) || 0) * 10) / 10,
            temperatura_minima: Math.round((parseFloat(extremas.temp_min) || 0) * 10) / 10,
            timestamp_maxima: extremas.timestamp_max,
            timestamp_minima: extremas.timestamp_min
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterEvolucaoClimatica = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 30 ? parseInt(dias) : 7
        const evolucao = await dadosClimaDAO.obterEvolucaoClimatica(id_usuario, diasValidados)
        
        if (!evolucao) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return evolucao.map(item => ({
            ...item,
            media_temperatura_dia: Math.round((parseFloat(item.media_temperatura_dia) || 0) * 10) / 10,
            min_temperatura_dia: Math.round((parseFloat(item.min_temperatura_dia) || 0) * 10) / 10,
            max_temperatura_dia: Math.round((parseFloat(item.max_temperatura_dia) || 0) * 10) / 10,
            media_umidade_dia: Math.round(parseFloat(item.media_umidade_dia) || 0),
            condicoes_dia: item.condicoes_dia ? item.condicoes_dia.split(',') : []
        }))
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterResumoClimaAtual = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const resumo = await dadosClimaDAO.obterResumoClimaAtual(id_usuario)
        return resumo ? {
            status: true,
            ...resumo,
            temperatura: Math.round((parseFloat(resumo.temperatura) || 0) * 10) / 10,
            umidade: Math.round(parseFloat(resumo.umidade) || 0)
        } : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterDadosClimaPorTemperatura = async function (id_usuario, temp_min, temp_max, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario) || temp_min === undefined || temp_max === undefined || isNaN(temp_min) || isNaN(temp_max)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        if (temp_min < -50 || temp_max > 60 || temp_min >= temp_max) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const dados = await dadosClimaDAO.obterDadosClimaPorTemperatura(id_usuario, temp_min, temp_max, diasValidados)
        return dados ? dados : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterDashboardClima = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const [resumoAtual, estatisticas, condicoesFrequentes, localizacoes, extremas] = await Promise.all([
            dadosClimaDAO.obterResumoClimaAtual(id_usuario),
            dadosClimaDAO.obterEstatisticasClimaUsuario(id_usuario, 7),
            dadosClimaDAO.obterCondicoesClimaticasFrequentes(id_usuario, 7),
            dadosClimaDAO.obterLocalizacoesVisitadas(id_usuario, 7),
            dadosClimaDAO.obterTemperaturaExtremas(id_usuario, 7)
        ])

        return {
            status: true,
            clima_atual: resumoAtual ? {
                ...resumoAtual,
                temperatura: Math.round((parseFloat(resumoAtual.temperatura) || 0) * 10) / 10,
                umidade: Math.round(parseFloat(resumoAtual.umidade) || 0)
            } : null,
            estatisticas_semanais: estatisticas ? {
                total_registros: parseInt(estatisticas.total_registros) || 0,
                media_temperatura: Math.round((parseFloat(estatisticas.media_temperatura) || 0) * 10) / 10,
                total_localizacoes: parseInt(estatisticas.total_localizacoes) || 0
            } : null,
            condicoes_frequentes: condicoesFrequentes ? condicoesFrequentes.slice(0, 3).map(item => ({
                condicao: item.condicao_climatica,
                frequencia: parseInt(item.frequencia) || 0
            })) : [],
            localizacoes_visitadas: localizacoes ? localizacoes.slice(0, 3).map(item => ({
                localizacao: item.localizacao,
                total_visitas: parseInt(item.total_visitas) || 0
            })) : [],
            extremas_semana: extremas ? {
                temp_max: Math.round((parseFloat(extremas.temp_max) || 0) * 10) / 10,
                temp_min: Math.round((parseFloat(extremas.temp_min) || 0) * 10) / 10
            } : null
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
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
    obterResumoClimaAtual,
    obterDadosClimaPorTemperatura,
    obterDashboardClima
}
