const MESSAGE = require('../../Módulos/config')
const feedbackRecomendacoesDAO = require('../../Models/DAO/IA/feedback_recomendacoes')

const registrarFeedback = async function (id_recomendacao, id_usuario, tipo_feedback) {
    try {
        if (!id_recomendacao || isNaN(id_recomendacao) || !id_usuario || isNaN(id_usuario) || !tipo_feedback) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const feedbackValidos = ['reproduzir', 'curtir', 'pular', 'nao_curtir', 'adicionar_playlist']
        if (!feedbackValidos.includes(tipo_feedback)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const feedbackExistente = await feedbackRecomendacoesDAO.verificarFeedbackExistente(id_usuario, id_recomendacao)
        if (feedbackExistente) {
            return {status: false, status_code: 409, message: 'Feedback já registrado para esta recomendação'}
        }

        const result = await feedbackRecomendacoesDAO.registrarFeedback(id_recomendacao, id_usuario, tipo_feedback)
        return result ? MESSAGE.SUCCESS_CREATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarFeedbackUsuario = async function (id_usuario, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 100 ? parseInt(limite) : 50
        const feedback = await feedbackRecomendacoesDAO.listarFeedbackUsuario(id_usuario, limiteValidado)
        return feedback ? feedback : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarFeedbackPorRecomendacao = async function (id_recomendacao, limite) {
    try {
        if (!id_recomendacao || isNaN(id_recomendacao)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 100 ? parseInt(limite) : 50
        const feedback = await feedbackRecomendacoesDAO.listarFeedbackPorRecomendacao(id_recomendacao, limiteValidado)
        return feedback ? feedback : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarFeedbackPorTipo = async function (id_usuario, tipo_feedback, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !tipo_feedback) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const feedbackValidos = ['reproduzir', 'curtir', 'pular', 'nao_curtir', 'adicionar_playlist']
        if (!feedbackValidos.includes(tipo_feedback)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 100 ? parseInt(limite) : 50
        const feedback = await feedbackRecomendacoesDAO.listarFeedbackPorTipo(id_usuario, tipo_feedback, limiteValidado)
        return feedback ? feedback : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterEstatisticasFeedbackUsuario = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const estatisticas = await feedbackRecomendacoesDAO.obterEstatisticasFeedbackUsuario(id_usuario, diasValidados)
        
        if (!estatisticas) {
            return {
                status: true,
                total_feedback: 0,
                total_recomendacoes_unicas: 0,
                total_tipos_feedback: 0,
                total_curtidas: 0,
                total_nao_curtidas: 0,
                total_reproducoes: 0,
                total_pulos: 0,
                total_adicionadas_playlist: 0,
                media_confianca_feedback: 0
            }
        }

        return {
            status: true,
            total_feedback: parseInt(estatisticas.total_feedback) || 0,
            total_recomendacoes_unicas: parseInt(estatisticas.total_recomendacoes_unicas) || 0,
            total_tipos_feedback: parseInt(estatisticas.total_tipos_feedback) || 0,
            total_curtidas: parseInt(estatisticas.total_curtidas) || 0,
            total_nao_curtidas: parseInt(estatisticas.total_nao_curtidas) || 0,
            total_reproducoes: parseInt(estatisticas.total_reproducoes) || 0,
            total_pulos: parseInt(estatisticas.total_pulos) || 0,
            total_adicionadas_playlist: parseInt(estatisticas.total_adicionadas_playlist) || 0,
            media_confianca_feedback: Math.round((parseFloat(estatisticas.media_confianca_feedback) || 0) * 100),
            taxa_curtida: estatisticas.total_feedback > 0 ? 
                Math.round(((parseInt(estatisticas.total_curtidas) || 0) / parseInt(estatisticas.total_feedback)) * 100) : 0,
            taxa_reproducao: estatisticas.total_feedback > 0 ? 
                Math.round(((parseInt(estatisticas.total_reproducoes) || 0) / parseInt(estatisticas.total_feedback)) * 100) : 0
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterDistribuicaoFeedbackUsuario = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const distribuicao = await feedbackRecomendacoesDAO.obterDistribuicaoFeedbackUsuario(id_usuario, diasValidados)
        
        if (!distribuicao) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return distribuicao.map(item => ({
            ...item,
            media_confianca_tipo: Math.round((parseFloat(item.media_confianca_tipo) || 0) * 100),
            taxa_engajamento: item.total_feedback > 0 ? 
                Math.round(((parseInt(item.recomendacoes_unicas) || 0) / item.total_feedback) * 100) : 0
        }))
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterFeedbackPorTipoRecomendacao = async function (tipo_recomendacao, dias) {
    try {
        if (!tipo_recomendacao) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const tiposValidos = ['diaria', 'clima', 'horario', 'humor', 'similar', 'descoberta']
        if (!tiposValidos.includes(tipo_recomendacao)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const feedback = await feedbackRecomendacoesDAO.obterFeedbackPorTipoRecomendacao(tipo_recomendacao, diasValidados)
        
        if (!feedback) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return feedback.map(item => ({
            ...item,
            media_confianca_tipo: Math.round((parseFloat(item.media_confianca_tipo) || 0) * 100),
            taxa_aprovacao: item.total_feedback > 0 ? 
                Math.round(((parseInt(item.total_feedback) - (parseInt(item.total_negativo) || 0)) / item.total_feedback) * 100) : 0
        }))
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterTaxaAprovacaoRecomendacoes = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const taxas = await feedbackRecomendacoesDAO.obterTaxaAprovacaoRecomendacoes(id_usuario, diasValidados)
        
        if (!taxas) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return taxas.map(item => ({
            ...item,
            media_confianca_tipo: Math.round((parseFloat(item.media_confianca_tipo) || 0) * 100),
            taxa_aprovacao: item.total_recomendacoes > 0 ? 
                Math.round(((parseInt(item.total_aprovacoes) || 0) / item.total_recomendacoes) * 100) : 0,
            taxa_reprovacao: item.total_recomendacoes > 0 ? 
                Math.round(((parseInt(item.total_reprovacoes) || 0) / item.total_recomendacoes) * 100) : 0
        }))
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterFeedbackRecente = async function (id_usuario, id_recomendacao) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_recomendacao || isNaN(id_recomendacao)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const feedback = await feedbackRecomendacoesDAO.obterFeedbackRecente(id_usuario, id_recomendacao)
        return feedback ? feedback : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const verificarFeedbackExistente = async function (id_usuario, id_recomendacao) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_recomendacao || isNaN(id_recomendacao)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const existe = await feedbackRecomendacoesDAO.verificarFeedbackExistente(id_usuario, id_recomendacao)
        return {status: true, feedback_existe: existe}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterEvolucaoFeedback = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 30 ? parseInt(dias) : 7
        const evolucao = await feedbackRecomendacoesDAO.obterEvolucaoFeedback(id_usuario, diasValidados)
        
        if (!evolucao) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return evolucao.map(item => ({
            ...item,
            media_confianca_dia: Math.round((parseFloat(item.media_confianca_dia) || 0) * 100),
            taxa_positiva: item.total_feedback_dia > 0 ? 
                Math.round(((parseInt(item.curtidas_dia) + parseInt(item.reproducoes_dia) + parseInt(item.adicionadas_playlist_dia)) / item.total_feedback_dia) * 100) : 0
        }))
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterFeedbackPorPeriodo = async function (id_usuario, data_inicio, data_fim) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !data_inicio || !data_fim) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const inicio = new Date(data_inicio)
        const fim = new Date(data_fim)

        if (isNaN(inicio.getTime()) || isNaN(fim.getTime()) || inicio >= fim) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const feedback = await feedbackRecomendacoesDAO.obterFeedbackPorPeriodo(id_usuario, data_inicio, data_fim)
        return feedback ? feedback : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterPadraoFeedbackPorHora = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const padroes = await feedbackRecomendacoesDAO.obterPadraoFeedbackPorHora(id_usuario, diasValidados)
        
        if (!padroes) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return padroes.map(item => ({
            ...item,
            media_confianca_hora: Math.round((parseFloat(item.media_confianca_hora) || 0) * 100),
            tipos_feedback_hora: item.tipos_feedback_hora ? item.tipos_feedback_hora.split(',') : []
        }))
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterDesempenhoTiposRecomendacao = async function (dias) {
    try {
        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const desempenho = await feedbackRecomendacoesDAO.obterDesempenhoTiposRecomendacao(diasValidados)
        
        if (!desempenho) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return desempenho.map(item => ({
            ...item,
            media_confianca_geral: Math.round((parseFloat(item.media_confianca_geral) || 0) * 100),
            taxa_feedback: item.total_gerada > 0 ? 
                Math.round((parseInt(item.total_feedback) / item.total_gerada) * 100) : 0,
            taxa_aprovacao: item.total_feedback > 0 ? 
                Math.round(((parseInt(item.total_positivo) || 0) / parseInt(item.total_feedback)) * 100) : 0
        }))
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const limparFeedbackAntigo = async function (dias_manter) {
    try {
        const diasValidados = dias_manter && !isNaN(dias_manter) && dias_manter >= 30 && dias_manter <= 730 ? parseInt(dias_manter) : 365
        const result = await feedbackRecomendacoesDAO.limparFeedbackAntigo(diasValidados)
        return result ? MESSAGE.SUCCESS_DELETED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterResumoFeedbackUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const resumo = await feedbackRecomendacoesDAO.obterResumoFeedbackUsuario(id_usuario)
        
        if (!resumo) {
            return {
                status: true,
                total_feedback_geral: 0,
                total_recomendacoes_unicas: 0,
                total_curtidas: 0,
                total_reproducoes: 0,
                total_adicionadas: 0,
                total_pulos: 0,
                total_nao_curtidas: 0,
                ultimo_feedback: null,
                primeiro_feedback: null
            }
        }

        return {
            status: true,
            total_feedback_geral: parseInt(resumo.total_feedback_geral) || 0,
            total_recomendacoes_unicas: parseInt(resumo.total_recomendacoes_unicas) || 0,
            total_curtidas: parseInt(resumo.total_curtidas) || 0,
            total_reproducoes: parseInt(resumo.total_reproducoes) || 0,
            total_adicionadas: parseInt(resumo.total_adicionadas) || 0,
            total_pulos: parseInt(resumo.total_pulos) || 0,
            total_nao_curtidas: parseInt(resumo.total_nao_curtidas) || 0,
            ultimo_feedback: resumo.ultimo_feedback,
            primeiro_feedback: resumo.primeiro_feedback
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterDashboardFeedback = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const [resumo, estatisticas, distribuicao, taxas] = await Promise.all([
            feedbackRecomendacoesDAO.obterResumoFeedbackUsuario(id_usuario),
            feedbackRecomendacoesDAO.obterEstatisticasFeedbackUsuario(id_usuario, 7),
            feedbackRecomendacoesDAO.obterDistribuicaoFeedbackUsuario(id_usuario, 7),
            feedbackRecomendacoesDAO.obterTaxaAprovacaoRecomendacoes(id_usuario, 7)
        ])

        return {
            status: true,
            resumo_geral: resumo ? {
                total_feedback: parseInt(resumo.total_feedback_geral) || 0,
                total_curtidas: parseInt(resumo.total_curtidas) || 0,
                total_reproducoes: parseInt(resumo.total_reproducoes) || 0,
                taxa_curtida: resumo.total_feedback_geral > 0 ? 
                    Math.round(((parseInt(resumo.total_curtidas) || 0) / parseInt(resumo.total_feedback_geral)) * 100) : 0
            } : null,
            estatisticas_semanais: estatisticas ? {
                total_feedback: parseInt(estatisticas.total_feedback) || 0,
                media_confianca: Math.round((parseFloat(estatisticas.media_confianca_feedback) || 0) * 100),
                total_tipos: parseInt(estatisticas.total_tipos_feedback) || 0
            } : null,
            distribuicao_semanal: distribuicao ? distribuicao.slice(0, 3).map(item => ({
                tipo_feedback: item.tipo_feedback,
                total: parseInt(item.total_feedback) || 0,
                media_confianca: Math.round((parseFloat(item.media_confianca_tipo) || 0) * 100)
            })) : [],
            taxas_aprovacao: taxas ? taxas.slice(0, 3).map(item => ({
                tipo_recomendacao: item.tipo_recomendacao,
                taxa_aprovacao: Math.round((parseFloat(item.taxa_aprovacao) || 0) * 100),
                media_confianca: Math.round((parseFloat(item.media_confianca_tipo) || 0) * 100)
            })) : []
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
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
    obterResumoFeedbackUsuario,
    obterDashboardFeedback
}
