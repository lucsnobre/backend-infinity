const MESSAGE = require('../../Módulos/config')
const conquistasUsuariosDAO = require('../../Models/DAO/Gamification/conquistas_usuarios')

const desbloquearConquista = async function (id_usuario, id_conquista, dados_progresso) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_conquista || isNaN(id_conquista)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const jaDesbloqueada = await conquistasUsuariosDAO.verificarConquistaDesbloqueada(id_usuario, id_conquista)
        if (jaDesbloqueada) {
            return {status: false, status_code: 409, message: 'Conquista já desbloqueada'}
        }

        const progressoValidado = dados_progresso ? (typeof dados_progresso === 'object' ? dados_progresso : {}) : null
        const result = await conquistasUsuariosDAO.desbloquearConquista(id_usuario, id_conquista, progressoValidado)
        return result ? MESSAGE.SUCCESS_CREATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const atualizarProgressoConquista = async function (id_usuario, id_conquista, dados_progresso) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_conquista || isNaN(id_conquista) || !dados_progresso) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        if (typeof dados_progresso !== 'object') {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const conquistaExistente = await conquistasUsuariosDAO.verificarConquistaDesbloqueada(id_usuario, id_conquista)
        if (!conquistaExistente) {
            return {status: false, status_code: 404, message: 'Conquista não encontrada'}
        }

        const result = await conquistasUsuariosDAO.atualizarProgressoConquista(id_usuario, id_conquista, dados_progresso)
        return result ? MESSAGE.SUCCESS_UPDATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarConquistasUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const conquistas = await conquistasUsuariosDAO.listarConquistasUsuario(id_usuario)
        return conquistas ? conquistas : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarConquistasPorCategoria = async function (id_usuario, categoria) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !categoria) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const categoriasValidas = ['listening', 'social', 'discovery', 'creation', 'achievement']
        if (!categoriasValidas.includes(categoria)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const conquistas = await conquistasUsuariosDAO.listarConquistasPorCategoria(id_usuario, categoria)
        return conquistas ? conquistas : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const verificarConquistaDesbloqueada = async function (id_usuario, id_conquista) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_conquista || isNaN(id_conquista)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const conquista = await conquistasUsuariosDAO.verificarConquistaDesbloqueada(id_usuario, id_conquista)
        return {status: true, desbloqueada: !!conquista, dados_conquista: conquista}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const contarConquistasUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const total = await conquistasUsuariosDAO.contarConquistasUsuario(id_usuario)
        return {status: true, total_conquistas: total}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const contarConquistasPorCategoria = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const categorias = await conquistasUsuariosDAO.contarConquistasPorCategoria(id_usuario)
        return categorias ? categorias : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const contarConquistasPorRaridade = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const raridades = await conquistasUsuariosDAO.contarConquistasPorRaridade(id_usuario)
        return raridades ? raridades : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const calcularPontosTotaisUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const pontos = await conquistasUsuariosDAO.calcularPontosTotaisUsuario(id_usuario)
        return {status: true, total_pontos: pontos}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterConquistasRecentes = async function (id_usuario, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 50 ? parseInt(limite) : 10
        const conquistas = await conquistasUsuariosDAO.obterConquistasRecentes(id_usuario, limiteValidado)
        return conquistas ? conquistas : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterEstatisticasConquistasUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const estatisticas = await conquistasUsuariosDAO.obterEstatisticasConquistasUsuario(id_usuario)
        
        if (!estatisticas) {
            return {
                status: true,
                total_conquistas: 0,
                total_categorias: 0,
                total_pontos: 0,
                media_pontos: 0,
                max_pontos: 0,
                min_pontos: 0,
                primeira_conquista: null,
                ultima_conquista: null,
                total_lendarias: 0,
                total_epicas: 0,
                total_raras: 0,
                total_comuns: 0
            }
        }

        return {
            status: true,
            total_conquistas: parseInt(estatisticas.total_conquistas) || 0,
            total_categorias: parseInt(estatisticas.total_categorias) || 0,
            total_pontos: parseInt(estatisticas.total_pontos) || 0,
            media_pontos: Math.round(parseFloat(estatisticas.media_pontos) || 0),
            max_pontos: parseInt(estatisticas.max_pontos) || 0,
            min_pontos: parseInt(estatisticas.min_pontos) || 0,
            primeira_conquista: estatisticas.primeira_conquista,
            ultima_conquista: estatisticas.ultima_conquista,
            total_lendarias: parseInt(estatisticas.total_lendarias) || 0,
            total_epicas: parseInt(estatisticas.total_epicas) || 0,
            total_raras: parseInt(estatisticas.total_raras) || 0,
            total_comuns: parseInt(estatisticas.total_comuns) || 0
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterConquistasNaoDesbloqueadas = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const conquistas = await conquistasUsuariosDAO.obterConquistasNaoDesbloqueadas(id_usuario)
        return conquistas ? conquistas : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterProgressoConquista = async function (id_usuario, id_conquista) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_conquista || isNaN(id_conquista)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const progresso = await conquistasUsuariosDAO.obterProgressoConquista(id_usuario, id_conquista)
        return progresso ? progresso : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarUsuariosPorConquista = async function (id_conquista, limite) {
    try {
        if (!id_conquista || isNaN(id_conquista)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 100 ? parseInt(limite) : 50
        const usuarios = await conquistasUsuariosDAO.listarUsuariosPorConquista(id_conquista, limiteValidado)
        return usuarios ? usuarios : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterRankingPontos = async function (limite) {
    try {
        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 200 ? parseInt(limite) : 100
        const ranking = await conquistasUsuariosDAO.obterRankingPontos(limiteValidado)
        return ranking ? ranking : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const verificarConquistasDisponiveis = async function (id_usuario, categoria) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        if (categoria) {
            const categoriasValidas = ['listening', 'social', 'discovery', 'creation', 'achievement']
            if (!categoriasValidas.includes(categoria)) {
                return MESSAGE.ERROR_REQUIRED_FIELDS
            }
        }

        const conquistas = await conquistasUsuariosDAO.verificarConquistasDisponiveis(id_usuario, categoria)
        return conquistas ? conquistas : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterResumoConquistasUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const totalConquistas = await conquistasUsuariosDAO.contarConquistasUsuario(id_usuario)
        const pontosTotais = await conquistasUsuariosDAO.calcularPontosTotaisUsuario(id_usuario)
        const categorias = await conquistasUsuariosDAO.contarConquistasPorCategoria(id_usuario)
        const recentes = await conquistasUsuariosDAO.obterConquistasRecentes(id_usuario, 3)

        return {
            status: true,
            total_conquistas: totalConquistas,
            total_pontos: pontosTotais,
            categorias: categorias || [],
            conquistas_recentes: recentes || []
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterProgressoGeralUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const estatisticas = await conquistasUsuariosDAO.obterEstatisticasConquistasUsuario(id_usuario)
        const naoDesbloqueadas = await conquistasUsuariosDAO.obterConquistasNaoDesbloqueadas(id_usuario)
        
        const totalDisponiveis = (naoDesbloqueadas ? naoDesbloqueadas.length : 0) + (estatisticas ? parseInt(estatisticas.total_conquistas) : 0)
        const percentualConcluido = totalDisponiveis > 0 ? 
            Math.round(((estatisticas ? parseInt(estatisticas.total_conquistas) : 0) / totalDisponiveis) * 100) : 0

        return {
            status: true,
            total_conquistas_desbloqueadas: estatisticas ? parseInt(estatisticas.total_conquistas) : 0,
            total_conquistas_disponiveis: totalDisponiveis,
            percentual_concluido: percentualConcluido,
            total_pontos: estatisticas ? parseInt(estatisticas.total_pontos) : 0,
            total_categorias: estatisticas ? parseInt(estatisticas.total_categorias) : 0,
            proxima_categoria: obterProximaCategoriaSugerida(estatisticas)
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

function obterProximaCategoriaSugerida(estatisticas) {
    if (!estatisticas) return 'listening'
    
    const categoriasComuns = ['listening', 'social', 'discovery', 'creation', 'achievement']
    const categoriasAtuais = []
    
    if (estatisticas.total_comuns > 0) categoriasAtuais.push('listening')
    if (estatisticas.total_raras > 0) categoriasAtuais.push('social')
    if (estatisticas.total_epicas > 0) categoriasAtuais.push('discovery')
    if (estatisticas.total_lendarias > 0) categoriasAtuais.push('creation')
    
    for (const categoria of categoriasComuns) {
        if (!categoriasAtuais.includes(categoria)) {
            return categoria
        }
    }
    
    return 'achievement'
}

module.exports = {
    desbloquearConquista,
    atualizarProgressoConquista,
    listarConquistasUsuario,
    listarConquistasPorCategoria,
    verificarConquistaDesbloqueada,
    contarConquistasUsuario,
    contarConquistasPorCategoria,
    contarConquistasPorRaridade,
    calcularPontosTotaisUsuario,
    obterConquistasRecentes,
    obterEstatisticasConquistasUsuario,
    obterConquistasNaoDesbloqueadas,
    obterProgressoConquista,
    listarUsuariosPorConquista,
    obterRankingPontos,
    verificarConquistasDisponiveis,
    obterResumoConquistasUsuario,
    obterProgressoGeralUsuario
}
