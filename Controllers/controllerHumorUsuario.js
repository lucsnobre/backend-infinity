const MESSAGE = require('../../Módulos/config')
const humorUsuarioDAO = require('../../Models/DAO/Context/humor_usuario')

const registrarHumor = async function (id_usuario, dados_humor, contentType) {
    try {
        if (String(contentType).toLowerCase() !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE
        }

        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const {tipo_humor, intensidade, origem} = dados_humor

        if (!tipo_humor || tipo_humor.length > 50 ||
            intensidade === undefined || isNaN(intensidade) || intensidade < 0 || intensidade > 1 ||
            !origem || origem.length > 50
        ) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const humoresValidos = ['feliz', 'triste', 'energetico', 'relaxado', 'ansioso', 'calmo', 'excitado', 'cansado', 'motivado', 'estressado', 'contente', 'melancolico']
        if (!humoresValidos.includes(tipo_humor.toLowerCase())) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const origensValidas = ['manual', 'detectado', 'automatico']
        if (!origensValidas.includes(origem.toLowerCase())) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const humorExistente = await humorUsuarioDAO.verificarHumorExistente(id_usuario, 2)
        if (humorExistente) {
            return {status: false, status_code: 409, message: 'Humor já registrado nas últimas 2 horas'}
        }

        const result = await humorUsuarioDAO.registrarHumor(id_usuario, tipo_humor, intensidade, origem)
        return result ? MESSAGE.SUCCESS_CREATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarHumorUsuario = async function (id_usuario, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 100 ? parseInt(limite) : 50
        const humor = await humorUsuarioDAO.listarHumorUsuario(id_usuario, limiteValidado)
        return humor ? humor : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarHumorPorPeriodo = async function (id_usuario, data_inicio, data_fim) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !data_inicio || !data_fim) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const inicio = new Date(data_inicio)
        const fim = new Date(data_fim)

        if (isNaN(inicio.getTime()) || isNaN(fim.getTime()) || inicio >= fim) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const humor = await humorUsuarioDAO.listarHumorPorPeriodo(id_usuario, data_inicio, data_fim)
        return humor ? humor : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterHumorRecente = async function (id_usuario, horas) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const horasValidadas = horas && !isNaN(horas) && horas > 0 && horas <= 168 ? parseInt(horas) : 24
        const humor = await humorUsuarioDAO.obterHumorRecente(id_usuario, horasValidadas)
        return humor ? humor : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterHumorPorTipo = async function (id_usuario, tipo_humor, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !tipo_humor) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const humoresValidos = ['feliz', 'triste', 'energetico', 'relaxado', 'ansioso', 'calmo', 'excitado', 'cansado', 'motivado', 'estressado', 'contente', 'melancolico']
        if (!humoresValidos.includes(tipo_humor.toLowerCase())) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const humor = await humorUsuarioDAO.obterHumorPorTipo(id_usuario, tipo_humor, diasValidados)
        return humor ? humor : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterEstatisticasHumor = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const estatisticas = await humorUsuarioDAO.obterEstatisticasHumor(id_usuario, diasValidados)
        
        if (!estatisticas) {
            return {
                status: true,
                total_registros: 0,
                total_tipos: 0,
                media_intensidade: 0,
                max_intensidade: 0,
                min_intensidade: 0,
                total_origens: 0
            }
        }

        return {
            status: true,
            total_registros: parseInt(estatisticas.total_registros) || 0,
            total_tipos: parseInt(estatisticas.total_tipos) || 0,
            media_intensidade: Math.round((parseFloat(estatisticas.media_intensidade) || 0) * 100),
            max_intensidade: Math.round((parseFloat(estatisticas.max_intensidade) || 0) * 100),
            min_intensidade: Math.round((parseFloat(estatisticas.min_intensidade) || 0) * 100),
            total_origens: parseInt(estatisticas.total_origens) || 0
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterHumoresFrequentes = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const humores = await humorUsuarioDAO.obterHumoresFrequentes(id_usuario, diasValidados)
        
        if (!humores) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return humores.map(item => ({
            ...item,
            media_intensidade_humor: Math.round((parseFloat(item.media_intensidade_humor) || 0) * 100),
            max_intensidade_humor: Math.round((parseFloat(item.max_intensidade_humor) || 0) * 100),
            min_intensidade_humor: Math.round((parseFloat(item.min_intensidade_humor) || 0) * 100)
        }))
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterPadraoHumorPorHora = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const padroes = await humorUsuarioDAO.obterPadraoHumorPorHora(id_usuario, diasValidados)
        
        if (!padroes) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return padroes.map(item => ({
            ...item,
            media_intensidade_hora: Math.round((parseFloat(item.media_intensidade_hora) || 0) * 100),
            humores_hora: item.humores_hora ? item.humores_hora.split(',') : []
        }))
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterEvolucaoHumorDiaria = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 30 ? parseInt(dias) : 7
        const evolucao = await humorUsuarioDAO.obterEvolucaoHumorDiaria(id_usuario, diasValidados)
        
        if (!evolucao) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return evolucao.map(item => ({
            ...item,
            media_intensidade_dia: Math.round((parseFloat(item.media_intensidade_dia) || 0) * 100),
            min_intensidade_dia: Math.round((parseFloat(item.min_intensidade_dia) || 0) * 100),
            max_intensidade_dia: Math.round((parseFloat(item.max_intensidade_dia) || 0) * 100),
            humores_dia: item.humores_dia ? item.humores_dia.split(',') : []
        }))
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterDistribuicaoOrigens = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const distribuicao = await humorUsuarioDAO.obterDistribuicaoOrigens(id_usuario, diasValidados)
        
        if (!distribuicao) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return distribuicao.map(item => ({
            ...item,
            media_intensidade_origem: Math.round((parseFloat(item.media_intensidade_origem) || 0) * 100)
        }))
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterHumoresPorIntensidade = async function (id_usuario, intensidade_min, intensidade_max, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario) || intensidade_min === undefined || intensidade_max === undefined || isNaN(intensidade_min) || isNaN(intensidade_max)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        if (intensidade_min < 0 || intensidade_max > 1 || intensidade_min >= intensidade_max) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const humores = await humorUsuarioDAO.obterHumoresPorIntensidade(id_usuario, intensidade_min, intensidade_max, diasValidados)
        return humores ? humores : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const limparHumorAntigo = async function (id_usuario, dias_manter) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias_manter && !isNaN(dias_manter) && dias_manter >= 30 && dias_manter <= 365 ? parseInt(dias_manter) : 90
        const result = await humorUsuarioDAO.limparHumorAntigo(id_usuario, diasValidados)
        return result ? MESSAGE.SUCCESS_DELETED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterTendenciaHumor = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 30 ? parseInt(dias) : 7
        const tendencia = await humorUsuarioDAO.obterTendenciaHumor(id_usuario, diasValidados)
        return tendencia ? tendencia : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterResumoHumorAtual = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const resumo = await humorUsuarioDAO.obterResumoHumorAtual(id_usuario)
        return resumo ? {
            status: true,
            ...resumo,
            intensidade: Math.round((parseFloat(resumo.intensidade) || 0) * 100)
        } : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterAnaliseEmocional = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const analise = await humorUsuarioDAO.obterAnaliseEmocional(id_usuario, diasValidados)
        
        if (!analise) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return analise.map(item => ({
            ...item,
            media_intensidade: Math.round((parseFloat(item.media_intensidade) || 0) * 100),
            percentual_alta_intensidade: item.frequencia > 0 ? Math.round(((parseInt(item.total_alta_intensidade) || 0) / item.frequencia) * 100) : 0,
            percentual_baixa_intensidade: item.frequencia > 0 ? Math.round(((parseInt(item.total_baixa_intensidade) || 0) / item.frequencia) * 100) : 0
        }))
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterCorrelacaoHumorMusica = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 30 ? parseInt(dias) : 30
        const correlacao = await humorUsuarioDAO.obterCorrelacaoHumorMusica(id_usuario, diasValidados)
        
        if (!correlacao) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return correlacao.map(item => ({
            ...item,
            intensidade_humor: Math.round((parseFloat(item.intensidade_humor) || 0) * 100)
        }))
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterDashboardHumor = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const [resumoAtual, estatisticas, humoresFrequentes, padroesHora] = await Promise.all([
            humorUsuarioDAO.obterResumoHumorAtual(id_usuario),
            humorUsuarioDAO.obterEstatisticasHumor(id_usuario, 7),
            humorUsuarioDAO.obterHumoresFrequentes(id_usuario, 7),
            humorUsuarioDAO.obterPadraoHumorPorHora(id_usuario, 7)
        ])

        return {
            status: true,
            humor_atual: resumoAtual ? {
                ...resumoAtual,
                intensidade: Math.round((parseFloat(resumoAtual.intensidade) || 0) * 100)
            } : null,
            estatisticas_semanais: estatisticas ? {
                total_registros: parseInt(estatisticas.total_registros) || 0,
                media_intensidade: Math.round((parseFloat(estatisticas.media_intensidade) || 0) * 100),
                total_tipos: parseInt(estatisticas.total_tipos) || 0
            } : null,
            humores_frequentes: humoresFrequentes ? humoresFrequentes.slice(0, 3).map(item => ({
                tipo_humor: item.tipo_humor,
                frequencia: parseInt(item.frequencia) || 0,
                media_intensidade: Math.round((parseFloat(item.media_intensidade_humor) || 0) * 100)
            })) : [],
            padroes_horarios: padroesHora ? padroesHora.slice(0, 5).map(item => ({
                hora: parseInt(item.hora) || 0,
                media_intensidade: Math.round((parseFloat(item.media_intensidade_hora) || 0) * 100),
                total_registros: parseInt(item.total_registros_hora) || 0
            })) : []
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
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
    obterTendenciaHumor,
    obterResumoHumorAtual,
    obterAnaliseEmocional,
    obterCorrelacaoHumorMusica,
    obterDashboardHumor
}
