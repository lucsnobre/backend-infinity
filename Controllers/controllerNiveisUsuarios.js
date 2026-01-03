const MESSAGE = require('../../Módulos/config')
const niveisUsuariosDAO = require('../../Models/DAO/Gamification/niveis_usuarios')

const criarNivelUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const nivelExistente = await niveisUsuariosDAO.obterNivelUsuario(id_usuario)
        if (nivelExistente) {
            return {status: false, status_code: 409, message: 'Nível do usuário já existe'}
        }

        const result = await niveisUsuariosDAO.criarNivelUsuario(id_usuario)
        return result ? MESSAGE.SUCCESS_CREATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const adicionarExperiencia = async function (id_usuario, pontos_xp) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !pontos_xp || isNaN(pontos_xp)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        if (pontos_xp <= 0 || pontos_xp > 1000) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const nivelUsuario = await niveisUsuariosDAO.obterNivelUsuario(id_usuario)
        if (!nivelUsuario) {
            await niveisUsuariosDAO.criarNivelUsuario(id_usuario)
        }

        const result = await niveisUsuariosDAO.adicionarExperiencia(id_usuario, pontos_xp)
        if (!result) {
            return MESSAGE.ERROR_INTERNAL_SERVER_MODEL
        }

        const progresso = await niveisUsuariosDAO.verificarEAtualizarNivel(id_usuario)
        
        return {
            status: true,
            message: 'Experiência adicionada com sucesso',
            xp_adicionado: pontos_xp,
            nivel_up: progresso ? {
                nivel_anterior: progresso.nivelAnterior,
                novo_nivel: progresso.novoNivel,
                recompensas: niveisUsuariosDAO.calcularRecompensasNivel(progresso.novoNivel)
            } : null
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const atualizarTempoReproducao = async function (id_usuario, minutos_adicionais) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !minutos_adicionais || isNaN(minutos_adicionais)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        if (minutos_adicionais <= 0 || minutos_adicionais > 1440) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const nivelUsuario = await niveisUsuariosDAO.obterNivelUsuario(id_usuario)
        if (!nivelUsuario) {
            await niveisUsuariosDAO.criarNivelUsuario(id_usuario)
        }

        const result = await niveisUsuariosDAO.atualizarTempoReproducao(id_usuario, minutos_adicionais)
        return result ? MESSAGE.SUCCESS_UPDATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const incrementarMusicasDescobertas = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const nivelUsuario = await niveisUsuariosDAO.obterNivelUsuario(id_usuario)
        if (!nivelUsuario) {
            await niveisUsuariosDAO.criarNivelUsuario(id_usuario)
        }

        const result = await niveisUsuariosDAO.incrementarMusicasDescobertas(id_usuario)
        return result ? MESSAGE.SUCCESS_UPDATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterNivelUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        let nivelUsuario = await niveisUsuariosDAO.obterNivelUsuario(id_usuario)
        if (!nivelUsuario) {
            await niveisUsuariosDAO.criarNivelUsuario(id_usuario)
            nivelUsuario = await niveisUsuariosDAO.obterNivelUsuario(id_usuario)
        }

        const progresso = niveisUsuariosDAO.obterProgressoNivel(nivelUsuario.pontos_experiencia, nivelUsuario.nivel)
        const recompensas = niveisUsuariosDAO.calcularRecompensasNivel(nivelUsuario.nivel)

        return {
            status: true,
            nivel_usuario: {
                ...nivelUsuario,
                progresso: progresso,
                recompensas: recompensas,
                xp_proximo_nivel: niveisUsuariosDAO.calcularXPProximoNivel(nivelUsuario.nivel + 1),
                xp_total_proximo_nivel: niveisUsuariosDAO.calcularXPTotalNivel(nivelUsuario.nivel + 1)
            }
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarRankingNiveis = async function (limite) {
    try {
        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 200 ? parseInt(limite) : 50
        const ranking = await niveisUsuariosDAO.listarRankingNiveis(limiteValidado)
        return ranking ? ranking : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarRankingXP = async function (limite) {
    try {
        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 200 ? parseInt(limite) : 50
        const ranking = await niveisUsuariosDAO.listarRankingXP(limiteValidado)
        return ranking ? ranking : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarRankingTempoReproducao = async function (limite) {
    try {
        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 200 ? parseInt(limite) : 50
        const ranking = await niveisUsuariosDAO.listarRankingTempoReproducao(limiteValidado)
        return ranking ? ranking : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarRankingMusicasDescobertas = async function (limite) {
    try {
        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 200 ? parseInt(limite) : 50
        const ranking = await niveisUsuariosDAO.listarRankingMusicasDescobertas(limiteValidado)
        return ranking ? ranking : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterEstatisticasGeraisNiveis = async function () {
    try {
        const estatisticas = await niveisUsuariosDAO.obterEstatisticasGeraisNiveis()
        
        if (!estatisticas) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return {
            status: true,
            total_usuarios: parseInt(estatisticas.total_usuarios) || 0,
            media_nivel: Math.round(parseFloat(estatisticas.media_nivel) || 0),
            max_nivel: parseInt(estatisticas.max_nivel) || 0,
            min_nivel: parseInt(estatisticas.min_nivel) || 0,
            media_xp: Math.round(parseFloat(estatisticas.media_xp) || 0),
            total_xp: parseInt(estatisticas.total_xp) || 0,
            media_tempo: Math.round(parseFloat(estatisticas.media_tempo) || 0),
            total_tempo: parseInt(estatisticas.total_tempo) || 0,
            media_musicas: Math.round(parseFloat(estatisticas.media_musicas) || 0),
            total_musicas: parseInt(estatisticas.total_musicas) || 0
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterDistribuicaoNiveis = async function () {
    try {
        const distribuicao = await niveisUsuariosDAO.obterDistribuicaoNiveis()
        return distribuicao ? distribuicao : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterPosicaoRanking = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        let nivelUsuario = await niveisUsuariosDAO.obterNivelUsuario(id_usuario)
        if (!nivelUsuario) {
            await niveisUsuariosDAO.criarNivelUsuario(id_usuario)
            nivelUsuario = await niveisUsuariosDAO.obterNivelUsuario(id_usuario)
        }

        const posicoes = await niveisUsuariosDAO.obterPosicaoRanking(id_usuario)
        
        if (!posicoes) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return {
            status: true,
            id_usuario: id_usuario,
            nivel_atual: nivelUsuario.nivel,
            xp_atual: nivelUsuario.pontos_experiencia,
            posicoes_ranking: {
                nivel: parseInt(posicoes.posicao_ranking_nivel) || 0,
                xp: parseInt(posicoes.posicao_ranking_xp) || 0,
                tempo_reproducao: parseInt(posicoes.posicao_ranking_tempo) || 0,
                musicas_descobertas: parseInt(posicoes.posicao_ranking_musicas) || 0
            }
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterUsuariosPorNivel = async function (nivel_min, nivel_max) {
    try {
        if (!nivel_min || isNaN(nivel_min) || !nivel_max || isNaN(nivel_max)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        if (nivel_min < 1 || nivel_max < nivel_min || nivel_max > 1000) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const usuarios = await niveisUsuariosDAO.obterUsuariosPorNivel(nivel_min, nivel_max)
        return usuarios ? usuarios : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const calcularProgressoProximoNivel = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const nivelUsuario = await niveisUsuariosDAO.obterNivelUsuario(id_usuario)
        if (!nivelUsuario) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        const progresso = niveisUsuariosDAO.obterProgressoNivel(nivelUsuario.pontos_experiencia, nivelUsuario.nivel)
        const xpProximoNivel = niveisUsuariosDAO.calcularXPProximoNivel(nivelUsuario.nivel + 1)
        const recompensasProximoNivel = niveisUsuariosDAO.calcularRecompensasNivel(nivelUsuario.nivel + 1)

        return {
            status: true,
            nivel_atual: nivelUsuario.nivel,
            xp_atual: nivelUsuario.pontos_experiencia,
            proximo_nivel: nivelUsuario.nivel + 1,
            xp_necessario_proximo_nivel: xpProximoNivel,
            progresso_atual: progresso,
            recompensas_proximo_nivel: recompensasProximoNivel
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterResumoProgressoUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        let nivelUsuario = await niveisUsuariosDAO.obterNivelUsuario(id_usuario)
        if (!nivelUsuario) {
            await niveisUsuariosDAO.criarNivelUsuario(id_usuario)
            nivelUsuario = await niveisUsuariosDAO.obterNivelUsuario(id_usuario)
        }

        const progresso = niveisUsuariosDAO.obterProgressoNivel(nivelUsuario.pontos_experiencia, nivelUsuario.nivel)
        const posicoes = await niveisUsuariosDAO.obterPosicaoRanking(id_usuario)
        const recompensas = niveisUsuariosDAO.calcularRecompensasNivel(nivelUsuario.nivel)

        return {
            status: true,
            resumo: {
                nivel: nivelUsuario.nivel,
                xp_total: nivelUsuario.pontos_experiencia,
                tempo_total_horas: Math.round(nivelUsuario.tempo_total_reproducao / 60),
                musicas_descobertas: nivelUsuario.total_musicas_descobertas,
                progresso_nivel: progresso,
                recompensas_atuais: recompensas,
                posicoes_ranking: posicoes ? {
                    nivel: parseInt(posicoes.posicao_ranking_nivel) || 0,
                    xp: parseInt(posicoes.posicao_ranking_xp) || 0
                } : null
            }
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const simularProgressoXP = async function (id_usuario, xp_simulado) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !xp_simulado || isNaN(xp_simulado)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        if (xp_simulado < 0 || xp_simulado > 100000) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const nivelUsuario = await niveisUsuariosDAO.obterNivelUsuario(id_usuario)
        if (!nivelUsuario) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        const xpTotalSimulado = nivelUsuario.pontos_experiencia + xp_simulado
        const nivelSimulado = niveisUsuariosDAO.calcularNivelPorXP(xpTotalSimulado)
        const progressoSimulado = niveisUsuariosDAO.obterProgressoNivel(xpTotalSimulado, nivelSimulado)

        return {
            status: true,
            simulacao: {
                xp_adicionado: xp_simulado,
                xp_total_simulado: xpTotalSimulado,
                nivel_atual: nivelUsuario.nivel,
                nivel_simulado: nivelSimulado,
                niveis_ganhos: nivelSimulado - nivelUsuario.nivel,
                progresso_simulado: progressoSimulado,
                recompensas_novo_nivel: nivelSimulado > nivelUsuario.nivel ? 
                    niveisUsuariosDAO.calcularRecompensasNivel(nivelSimulado) : null
            }
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

module.exports = {
    criarNivelUsuario,
    adicionarExperiencia,
    atualizarTempoReproducao,
    incrementarMusicasDescobertas,
    obterNivelUsuario,
    listarRankingNiveis,
    listarRankingXP,
    listarRankingTempoReproducao,
    listarRankingMusicasDescobertas,
    obterEstatisticasGeraisNiveis,
    obterDistribuicaoNiveis,
    obterPosicaoRanking,
    obterUsuariosPorNivel,
    calcularProgressoProximoNivel,
    obterResumoProgressoUsuario,
    simularProgressoXP
}
