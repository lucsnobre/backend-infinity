const MESSAGE = require('../../Módulos/config')
const perfilMusicalUsuarioDAO = require('../../Models/DAO/IA/perfil_musical_usuario')

const criarPerfilMusicalUsuario = async function (id_usuario, dados_perfil, contentType) {
    try {
        if (String(contentType).toLowerCase() !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE
        }

        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const perfilExistente = await perfilMusicalUsuarioDAO.obterPerfilMusicalUsuario(id_usuario)
        if (perfilExistente) {
            return {status: false, status_code: 409, message: 'Perfil musical já existe para este usuário'}
        }

        const result = await perfilMusicalDAO.criarPerfilMusicalUsuario(id_usuario, dados_perfil)
        return result ? MESSAGE.SUCCESS_CREATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const atualizarPerfilMusicalUsuario = async function (id_usuario, dados_perfil, contentType) {
    try {
        if (String(contentType).toLowerCase() !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE
        }

        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const perfilExistente = await perfilMusicalDAO.obterPerfilMusicalUsuario(id_usuario)
        if (!perfilExistente) {
            return {status: false, status_code: 404, message: 'Perfil musical não encontrado'}
        }

        const result = await perfilMusicalDAO.atualizarPerfilMusicalUsuario(id_usuario, dados_perfil)
        return result ? MESSAGE.SUCCESS_UPDATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterPerfilMusicalUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const perfil = await perfilMusicalDAO.obterPerfilMusicalUsuario(id_usuario)
        return perfil ? perfil : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const analisarPreferenciasUsuario = async function (id_usuario, dados_historico) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !dados_historico) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        if (!dados_historico.musicas_ouvidas || !Array.isArray(dados_historico.musicas_ouvidas)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        if (dados_historico.musicas_ouvidas.length === 0) {
            return {status: false, message: 'Nenhuma música encontrada no histórico para análise'}
        }

        const analise = await perfilMusicalDAO.analisarPreferenciasUsuario(id_usuario, dados_historico)
        return analise ? {status: true, analise_perfil: analise} : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const atualizarPerfilPorIA = async function (id_usuario, dados_historico) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !dados_historico) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        if (!dados_historico.musicas_ouvidas || !Array.isArray(dados_historico.musicas_ouvidas)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        if (dados_historico.musicas_ouvidas.length === 0) {
            return {status: false, message: 'Nenhuma música encontrada no histórico para análise'}
        }

        const result = await perfilMusicalDAO.atualizarPerfilPorIA(id_usuario, dados_historico)
        return result ? 
            {status: true, message: 'Perfil atualizado com base na análise de IA'} :
            MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterPerfilCompletoUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const perfil = await perfilMusicalDAO.obterPerfilCompletoUsuario(id_usuario)
        return perfil ? {status: true, perfil: perfil} : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterEstatisticasPerfil = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const estatisticas = await perfilMusicalDAO.obterEstatisticasPerfil(id_usuario)
        return estatisticas ? {status: true, estatisticas: estatisticas} : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterTopGenerosPreferidos = async function (id_usuario, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 20 ? parseInt(limite) : 10
        const generos = await perfilMusicalDAO.obterTopGenerosPreferidos(id_usuario, limiteValidado)
        return generos ? {status: true, generos_preferidos: generos} : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterTopArtistasPreferidos = async function (id_usuario, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 20 ? parseInt(limite) : 10
        const artistas = await perfilMusicalDAO.obterTopArtistasPreferidos(id_usuario, limiteValidado)
        return artistas ? {status: true, artistas_preferidos: artistas} : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterPadroesComportamentais = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const padroes = await perfilMusicalDAO.obterPadroesComportamentais(id_usuario)
        return padroes ? {status: true, padroes_comportamentais: padroes} : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const compararPerfisMusicais = async function (id_usuario1, id_usuario2) {
    try {
        if (!id_usuario1 || isNaN(id_usuario1) || !id_usuario2 || isNaN(id_usuario2)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        if (id_usuario1 === id_usuario2) {
            return {status: false, message: 'Não é possível comparar um perfil com ele mesmo'}
        }

        const similaridade = await perfilMusicalDAO.compararPerfisMusicais(id_usuario1, id_usuario2)
        return similaridade !== false ? 
            {status: true, similaridade_percentual: similaridade} : 
            MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterResumoPerfilMusical = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const [perfil, estatisticas, generos, artistas, padroes] = await Promise.all([
            perfilMusicalDAO.obterPerfilCompletoUsuario(id_usuario),
            perfilMusicalDAO.obterEstatisticasPerfil(id_usuario),
            perfilMusicalDAO.obterTopGenerosPreferidos(id_usuario, 5),
            perfilMusicalDAO.obterTopArtistasPreferidos(id_usuario, 5),
            perfilMusicalDAO.obterPadroesComportamentais(id_usuario)
        ])

        if (!perfil) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return {
            status: true,
            perfil_basico: {
                tipo_personalidade: perfil.tipo_personalidade,
                preferencias_principais: {
                    energia: Math.round((perfil.preferencia_energia || 0.5) * 100),
                    valencia: Math.round((perfil.preferencia_faixa || 0.5) * 100),
                    danca: Math.round((perfil.preferencia_danca || 0.5) * 100),
                    acustica: Math.round((perfil.preferencia_acustica || 0.5) * 100)
                },
                faixa_tempo_preferencia: {
                    min: perfil.tempo_preferencia_min || 60,
                    max: perfil.tempo_preferencia_max || 140
                }
            },
            estatisticas: estatisticas || null,
            top_generos: generos || [],
            top_artistas: artistas || [],
            padroes_comportamentais: padroes || {}
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterAnalisePerfilDetalhada = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const perfil = await perfilMusicalDAO.obterPerfilCompletoUsuario(id_usuario)
        if (!perfil) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        const analise = {
            personalidade_musical: {
                tipo: perfil.tipo_personalidade,
                descricao: obterDescricaoPersonalidade(perfil.tipo_personalidade),
                caracteristicas: obterCaracteristicasPersonalidade(perfil)
            },
            preferencias_musicais: {
                energia: Math.round((perfil.preferencia_energia || 0.5) * 100),
                valencia: Math.round((perfil.preferencia_valencia || 0.5) * 100),
                danca: Math.round((perfil.preferencia_danca || 0.5) * 100),
                acustica: Math.round((perfil.preferencia_acustica || 0.5) * 100),
                tempo: {
                    preferencia_min: perfil.tempo_preferencia_min || 60,
                    preferencia_max: perfil.tempo_preferencia_max || 140,
                    media: Math.round(((perfil.tempo_preferencia_min || 60) + (perfil.tempo_preferencia_max || 140)) / 2)
                }
            },
            diversidade_taste: {
                total_generos_ponderados: Object.keys(perfil.pesos_generos || {}).length,
                total_artistas_ponderados: Object.keys(perfil.pesos_artistas || {}).length,
                score_diversidade: calcularScoreDiversidade(perfil)
            },
            padroes_comportamentais: {
                horarios: analisarPadroesHorarios(perfil.padroes_hora_dia || {}),
                climaticos: analisarPadroesClimaticos(perfil.padroes_clima || {}),
                emocionais: analisarPadroesEmocionais(perfil.padroes_humor || {})
            },
            recomendacoes_ia: {
                ultima_analise: perfil.ultima_analise,
                precisao_analise: calcularPrecisaoAnalise(perfil),
                necessita_atualizacao: verificarNecessidadeAtualizacao(perfil.ultima_analise)
            }
        }

        return {status: true, analise_detalhada: analise}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

function obterDescricaoPersonalidade(tipo) {
    descricoes = {
        'energetico': 'Pessoa que prefere músicas com alta energia, ideal para festas e exercícios',
        'relaxado': 'Pessoa que gosta de músicas calmas e acústicas, perfeito para momentos de tranquilidade',
        'feliz': 'Pessoa com preferência por músicas positivas e alegres, com bom nível de energia',
        'melancolico': 'Pessoa que se identifica com músicas mais introspectivas e emocionalmente carregadas',
        'introspectivo': 'Pessoa que aprecia músicas acústicas e calmas, para momentos de reflexão',
        'explorador': 'Pessoa curiosa que gosta de explorar diferentes estilos e descobrir novas músicas'
    }
    return descricoes[tipo] || 'Perfil não identificado'
}

function obterCaracteristicasPersonalidade(perfil) {
    const caracteristicas = []

    if (perfil.preferencia_energia > 0.7) {
        caracteristicas.push('Alta energia')
    }
    if (perfil.preferencia_danca > 0.7) {
        caracteristicas.push('Gosta de dançar')
    }
    if (perfil.preferencia_acustica > 0.7) {
        caracteristicas.push('Preferência por música acústica')
    }
    if (perfil.preferencia_valencia < 0.3) {
        caracteristicas.push('Preferência por músicas introspectivas')
    }
    if (perfil.preferencia_valencia > 0.7) {
        caracteristicas.push('Preferência por músicas positivas')
    }

    if (perfil.tempo_preferencia_max > 120) {
        caracteristicas.push('Gosta de músicas longas')
    } else if (perfil.tempo_preferencia_min < 90) {
        caracteristicas.push('Prefere músicas curtas')
    }

    return caracteristicas
}

function calcularScoreDiversidade(perfil) {
    const totalGeneros = Object.keys(perfil.pesos_generos || {}).length
    const totalArtistas = Object.keys(perfil.pesos_artistas || {}).length
    
    if (totalGeneros === 0 && totalArtistas === 0) return 0
    
    const mediaGeneros = totalGeneros / 50
    const mediaArtistas = totalArtistas / 100
    
    return Math.round(((mediaGeneros + mediaArtistas) / 2) * 100)
}

function analisarPadroesHorarios(padroes) {
    const analise = {}
    
    const horariosAtivos = Object.keys(padroes)
    if (horariosAtivos.length === 0) return analise
    
    const horarioMaisAtivo = Object.entries(padroes)
        .sort(([, a], [, b]) => b - a)[0][0]
    
    const horarioMenosAtivo = Object.entries(padroes)
        .sort(([, a], [, b]) => a - b)[0][0]
    
    const horariosPicos = Object.entries(padroes)
        .filter(([, peso]) => peso > 0.05)
        .map(([hora, peso]) => parseInt(hora))
    
    analise.hora_pico = horarioPicos.length > 0 ? horarioPicos[0] : null
    analise.hora_vale = horarioMenosAtivo
    analise.total_horarios_ativos = horariosAtivos.length
    analise.periodo_ativo = horarioPicos.length > 1 ? 
        Math.max(...horarioPicos) - Math.min(...horarioPicos) : 0
    
    return analise
}

function analisarPadroesClimaticos(padroes) {
    const analise = {}
    
    const climasAtivos = Object.keys(padroes)
    if (climasAtivos.length === 0) return analise
    
    const climaPreferido = Object.entries(padroes)
        .sort(([, a], [, b]) => b - a)[0][0]
    
    analise.clima_preferido = climaPreferido
    analise.total_climas_ativos = climasAtivos.length
    analise.diversidade_climatica = climasAtivos.length
    
    return analise
}

function analisarPadroesEmocionais(padroes) {
    const analise = {}
    
    const emocoesAtivas = Object.keys(padroes)
    if (emocoesAtivas.length === 0) return analise
    
    const emocaoDominante = Object.entries(padroes)
        .sort(([, a], [, b]) => b - a)[0][0]
    
    const emocoesPositivas = Object.entries(padroes)
        .filter(([, peso]) => peso > 0.6)
        .map(([emocao]) => emocao)
    
    analise.emocao_dominante = emocaoDominante
    analise.total_emocoes_ativas = emocoesAtivas.length
    analise.emocoes_positivas = emocoesPositivas.length
    analiseindice_positividade = emocoesAtivos.length > 0 ? 
        (emocoesPositivas.length / emocoesAtivos.length) * 100 : 0
    
    return analise
}

function calcularPrecisaoAnalise(ultimaAnalise) {
    if (!ultimaAnalise) return 0
    
    const agora = new Date()
    const diferenca = agora - new Date(ultimaAnalise)
    const dias = diferenca / (1000 * 60 * 60 * 24)
    
    if (dias < 7) return 100
    if (dias < 30) return 80
    if (dias < 90) return 60
    return Math.max(0, 100 - (dias / 365) * 100)
}

function verificarNecessidadeAtualizacao(ultimaAnalise) {
    if (!ultimaAnalise) return true
    
    const agora = new Date()
    const diferenca = agora - new Date(ultimaAnalise)
    const dias = diferenca / (1000 * 60 * 60 * 24)
    
    return dias > 30
}

module.exports = {
    criarPerfilMusicalUsuario,
    atualizarPerfilMusicalUsuario,
    obterPerfilMusicalUsuario,
    analisarPreferenciasUsuario,
    atualizarPerfilPorIA,
    obterPerfilCompletoUsuario,
    obterEstatisticasPerfil,
    obterTopGenerosPreferidos,
    obterTopArtistasPreferidos,
    obterPadroesComportamentais,
    compararPerfisMusicais,
    obterResumoPerfilMusical,
    obterAnalisePerfilDetalhada
}
