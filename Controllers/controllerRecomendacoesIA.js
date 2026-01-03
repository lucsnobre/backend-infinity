const MESSAGE = require('../../Módulos/config')
const recomendacoesIADAO = require('../../Models/DAO/IA/recomendacoes_ia')

const gerarRecomendacao = async function (id_usuario, id_musica, tipo_recomendacao, pontuacao_confianca, dados_contexto) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_musica || isNaN(id_musica) || !tipo_recomendacao) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const tiposValidos = ['diaria', 'clima', 'horario', 'humor', 'similar', 'descoberta']
        if (!tiposValidos.includes(tipo_recomendacao)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        if (!pontuacao_confianca || isNaN(pontuacao_confianca) || pontuacao_confianca < 0 || pontuacao_confianca > 1) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const jaRecomendada = await recomendacoesIADAO.verificarMusicaRecomendadaRecentemente(id_usuario, id_musica, 24)
        if (jaRecomendada) {
            return {status: false, status_code: 409, message: 'Música já recomendada recentemente'}
        }

        const contextoValidado = dados_contexto && typeof dados_contexto === 'object' ? dados_contexto : null
        const result = await recomendacoesIADAO.gerarRecomendacao(id_usuario, id_musica, tipo_recomendacao, pontuacao_confianca, contextoValidado)
        return result ? MESSAGE.SUCCESS_CREATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarRecomendacoesUsuario = async function (id_usuario, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 50 ? parseInt(limite) : 20
        const recomendacoes = await recomendacoesIADAO.listarRecomendacoesUsuario(id_usuario, limiteValidado)
        return recomendacoes ? recomendacoes : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarRecomendacoesPorTipo = async function (id_usuario, tipo_recomendacao, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !tipo_recomendacao) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const tiposValidos = ['diaria', 'clima', 'horario', 'humor', 'similar', 'descoberta']
        if (!tiposValidos.includes(tipo_recomendacao)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 30 ? parseInt(limite) : 10
        const recomendacoes = await recomendacoesIADAO.listarRecomendacoesPorTipo(id_usuario, tipo_recomendacao, limiteValidado)
        return recomendacoes ? recomendacoes : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const marcarComoReproduzida = async function (id_recomendacao) {
    try {
        if (!id_recomendacao || isNaN(id_recomendacao)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const result = await recomendacoesIADAO.marcarComoReproduzida(id_recomendacao)
        return result ? MESSAGE.SUCCESS_UPDATED_ITEM : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const adicionarFeedbackRecomendacao = async function (id_recomendacao, id_usuario, tipo_feedback) {
    try {
        if (!id_recomendacao || isNaN(id_recomendacao) || !id_usuario || isNaN(id_usuario) || !tipo_feedback) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const feedbackValidos = ['reproduzir', 'curtir', 'pular', 'nao_curtir', 'adicionar_playlist']
        if (!feedbackValidos.includes(tipo_feedback)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const result = await recomendacoesIADAO.adicionarFeedbackRecomendacao(id_recomendacao, id_usuario, tipo_feedback)
        return result ? MESSAGE.SUCCESS_CREATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarRecomendacoesExpiradas = async function (limite) {
    try {
        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 500 ? parseInt(limite) : 100
        const recomendacoes = await recomendacoesIADAO.listarRecomendacoesExpiradas(limiteValidado)
        return recomendacoes ? recomendacoes : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const limparRecomendacoesExpiradas = async function () {
    try {
        const result = await recomendacoesIADAO.limparRecomendacoesExpiradas()
        return result ? MESSAGE.SUCCESS_DELETED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterEstatisticasRecomendacoesUsuario = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const estatisticas = await recomendacoesIADAO.obterEstatisticasRecomendacoesUsuario(id_usuario, diasValidados)
        
        if (!estatisticas) {
            return {
                status: true,
                total_recomendacoes: 0,
                total_reproduzidas: 0,
                total_curtidas: 0,
                media_confianca: 0,
                max_confianca: 0,
                min_confianca: 0,
                total_tipos: 0,
                taxa_reproducao: 0,
                taxa_curtida: 0
            }
        }

        const totalRecomendacoes = parseInt(estatisticas.total_recomendacoes) || 0
        const taxaReproducao = totalRecomendacoes > 0 ? 
            Math.round(((parseInt(estatisticas.total_reproduzidas) || 0) / totalRecomendacoes) * 100) : 0
        const taxaCurtida = totalRecomendacoes > 0 ? 
            Math.round(((parseInt(estatisticas.total_curtidas) || 0) / totalRecomendacoes) * 100) : 0

        return {
            status: true,
            total_recomendacoes: totalRecomendacoes,
            total_reproduzidas: parseInt(estatisticas.total_reproduzidas) || 0,
            total_curtidas: parseInt(estatisticas.total_curtidas) || 0,
            media_confianca: Math.round((parseFloat(estatisticas.media_confianca) || 0) * 100),
            max_confianca: Math.round((parseFloat(estatisticas.max_confianca) || 0) * 100),
            min_confianca: Math.round((parseFloat(estatisticas.min_confianca) || 0) * 100),
            total_tipos: parseInt(estatisticas.total_tipos) || 0,
            taxa_reproducao: taxaReproducao,
            taxa_curtida: taxaCurtida
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterFeedbackRecomendacoesUsuario = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const feedback = await recomendacoesIADAO.obterFeedbackRecomendacoesUsuario(id_usuario, diasValidados)
        return feedback ? feedback : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterRecomendacoesPorContexto = async function (id_usuario, contexto, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !contexto || typeof contexto !== 'object') {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 20 ? parseInt(limite) : 10
        const recomendacoes = await recomendacoesIADAO.obterRecomendacoesPorContexto(id_usuario, contexto, limiteValidado)
        return recomendacoes ? recomendacoes : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const atualizarConfiancaRecomendacao = async function (id_recomendacao, nova_pontuacao) {
    try {
        if (!id_recomendacao || isNaN(id_recomendacao) || !nova_pontuacao || isNaN(nova_pontuacao)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        if (nova_pontuacao < 0 || nova_pontuacao > 1) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const result = await recomendacoesIADAO.atualizarConfiancaRecomendacao(id_recomendacao, nova_pontuacao)
        return result ? MESSAGE.SUCCESS_UPDATED_ITEM : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterMusicasRecomendadasUsuario = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 30 ? parseInt(dias) : 7
        const musicas = await recomendacoesIADAO.obterMusicasRecomendadasUsuario(id_usuario, diasValidados)
        return {status: true, musicas_recomendadas: musicas}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const verificarMusicaRecomendadaRecentemente = async function (id_usuario, id_musica, horas) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_musica || isNaN(id_musica)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const horasValidadas = horas && !isNaN(horas) && horas > 0 && horas <= 168 ? parseInt(horas) : 24
        const foiRecomendada = await recomendacoesIADAO.verificarMusicaRecomendadaRecentemente(id_usuario, id_musica, horasValidadas)
        return {status: true, foi_recomendada_recentemente: foiRecomendada, horas_verificadas: horasValidadas}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterDesempenhoTiposRecomendacao = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const desempenho = await recomendacoesIADAO.obterDesempenhoTiposRecomendacao(id_usuario, diasValidados)
        
        if (!desempenho) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return desempenho.map(item => ({
            ...item,
            media_confianca: Math.round((parseFloat(item.media_confianca) || 0) * 100),
            taxa_reproducao: Math.round(parseFloat(item.taxa_reproducao) || 0)
        }))
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterRecomendacoesSimilares = async function (id_usuario, id_musica_referencia, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_musica_referencia || isNaN(id_musica_referencia)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 15 ? parseInt(limite) : 5
        const recomendacoes = await recomendacoesIADAO.obterRecomendacoesSimilares(id_usuario, id_musica_referencia, limiteValidado)
        return recomendacoes ? recomendacoes : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterResumoRecomendacoesUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const [estatisticas, feedback, desempenho] = await Promise.all([
            recomendacoesIADAO.obterEstatisticasRecomendacoesUsuario(id_usuario, 7),
            recomendacoesIADAO.obterFeedbackRecomendacoesUsuario(id_usuario, 7),
            recomendacoesIADAO.obterDesempenhoTiposRecomendacao(id_usuario, 7)
        ])

        const totalRecomendacoes = estatisticas ? parseInt(estatisticas.total_recomendacoes) || 0 : 0
        const taxaReproducao = totalRecomendacoes > 0 ? 
            Math.round(((estatisticas ? parseInt(estatisticas.total_reproduzidas) || 0 : 0) / totalRecomendacoes) * 100) : 0

        return {
            status: true,
            resumo_semanal: {
                total_recomendacoes: totalRecomendacoes,
                taxa_reproducao: taxaReproducao,
                media_confianca: estatisticas ? Math.round((parseFloat(estatisticas.media_confianca) || 0) * 100) : 0,
                total_tipos: estatisticas ? parseInt(estatisticas.total_tipos) || 0 : 0
            },
            feedback_recente: feedback || [],
            desempenho_tipos: desempenho ? desempenho.map(item => ({
                tipo: item.tipo_recomendacao,
                taxa_reproducao: Math.round(parseFloat(item.taxa_reproducao) || 0),
                media_confianca: Math.round((parseFloat(item.media_confianca) || 0) * 100)
            })) : []
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const gerarRecomendacoesContextuais = async function (id_usuario, contexto) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !contexto || typeof contexto !== 'object') {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const recomendacoes = await recomendacoesIADAO.obterRecomendacoesPorContexto(id_usuario, contexto, 10)
        
        if (!recomendacoes) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        const recomendacoesAgrupadas = recomendacoes.reduce((acc, rec) => {
            if (!acc[rec.tipo_recomendacao]) {
                acc[rec.tipo_recomendacao] = []
            }
            acc[rec.tipo_recomendacao].push(rec)
            return acc
        }, {})

        return {
            status: true,
            contexto: contexto,
            recomendacoes_contextuais: recomendacoesAgrupadas,
            total_recomendacoes: recomendacoes.length
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
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
    obterRecomendacoesSimilares,
    obterResumoRecomendacoesUsuario,
    gerarRecomendacoesContextuais
}
