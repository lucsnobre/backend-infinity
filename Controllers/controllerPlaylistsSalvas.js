const MESSAGE = require('../../Módulos/config')
const playlistsSalvasDAO = require('../../Models/DAO/Interacao/playlists_salvas')

const salvarPlaylist = async function (id_usuario, id_playlist) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_playlist || isNaN(id_playlist)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const jaSalva = await playlistsSalvasDAO.verificarPlaylistSalva(id_usuario, id_playlist)
        if (jaSalva) {
            return {status: false, status_code: 409, message: 'Playlist já está salva'}
        }

        const result = await playlistsSalvasDAO.salvarPlaylist(id_usuario, id_playlist)
        return result ? MESSAGE.SUCCESS_CREATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const removerPlaylistSalva = async function (id_usuario, id_playlist) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_playlist || isNaN(id_playlist)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const estaSalva = await playlistsSalvasDAO.verificarPlaylistSalva(id_usuario, id_playlist)
        if (!estaSalva) {
            return {status: false, status_code: 404, message: 'Playlist não encontrada nos salvos'}
        }

        const result = await playlistsSalvasDAO.removerPlaylistSalva(id_usuario, id_playlist)
        return result ? MESSAGE.SUCCESS_DELETED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarPlaylistsSalvasUsuario = async function (id_usuario, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 100 ? parseInt(limite) : 50
        const playlists = await playlistsSalvasDAO.listarPlaylistsSalvasUsuario(id_usuario, limiteValidado)
        return playlists ? playlists : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const verificarPlaylistSalva = async function (id_usuario, id_playlist) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_playlist || isNaN(id_playlist)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const estaSalva = await playlistsSalvasDAO.verificarPlaylistSalva(id_usuario, id_playlist)
        return {status: true, esta_salva: estaSalva}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const contarPlaylistsSalvasUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const total = await playlistsSalvasDAO.contarPlaylistsSalvasUsuario(id_usuario)
        return {status: true, total_playlists_salvas: total}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarPlaylistsSalvasPorPeriodo = async function (id_usuario, data_inicio, data_fim) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !data_inicio || !data_fim) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const inicio = new Date(data_inicio)
        const fim = new Date(data_fim)

        if (isNaN(inicio.getTime()) || isNaN(fim.getTime()) || inicio >= fim) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const playlists = await playlistsSalvasDAO.listarPlaylistsSalvasPorPeriodo(id_usuario, data_inicio, data_fim)
        return playlists ? playlists : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarPlaylistsMaisSalvas = async function (limite) {
    try {
        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 50 ? parseInt(limite) : 10
        const playlists = await playlistsSalvasDAO.listarPlaylistsMaisSalvas(limiteValidado)
        return playlists ? playlists : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarUsuariosPorPlaylistSalva = async function (id_playlist, limite) {
    try {
        if (!id_playlist || isNaN(id_playlist)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 100 ? parseInt(limite) : 50
        const usuarios = await playlistsSalvasDAO.listarUsuariosPorPlaylistSalva(id_playlist, limiteValidado)
        return usuarios ? usuarios : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterPlaylistsSalvasRecentes = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 30 ? parseInt(dias) : 7
        const playlists = await playlistsSalvasDAO.obterPlaylistsSalvasRecentes(id_usuario, diasValidados)
        return playlists ? playlists : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterEstatisticasPlaylistsSalvas = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const estatisticas = await playlistsSalvasDAO.obterEstatisticasPlaylistsSalvas(id_usuario)
        
        if (!estatisticas) {
            return {
                status: true,
                total_playlists_salvas: 0,
                total_criadores_diferentes: 0,
                media_musicas_playlist: 0,
                total_musicas_geral: 0,
                media_duracao_playlist: 0,
                total_duracao_segundos: 0,
                max_curtidas: 0,
                min_curtidas: 0,
                media_curtidas: 0,
                total_playlists_publicas: 0,
                primeira_salva_em: null,
                ultima_salva_em: null
            }
        }

        return {
            status: true,
            total_playlists_salvas: parseInt(estatisticas.total_playlists_salvas) || 0,
            total_criadores_diferentes: parseInt(estatisticas.total_criadores_diferentes) || 0,
            media_musicas_playlist: Math.round(parseFloat(estatisticas.media_musicas_playlist) || 0),
            total_musicas_geral: parseInt(estatisticas.total_musicas_geral) || 0,
            media_duracao_playlist: Math.round(parseFloat(estatisticas.media_duracao_playlist) || 0),
            total_duracao_segundos: parseInt(estatisticas.total_duracao_segundos) || 0,
            total_duracao_horas: Math.round((parseInt(estatisticas.total_duracao_segundos) || 0) / 3600),
            max_curtidas: parseInt(estatisticas.max_curtidas) || 0,
            min_curtidas: parseInt(estatisticas.min_curtidas) || 0,
            media_curtidas: Math.round(parseFloat(estatisticas.media_curtidas) || 0),
            total_playlists_publicas: parseInt(estatisticas.total_playlists_publicas) || 0,
            primeira_salva_em: estatisticas.primeira_salva_em,
            ultima_salva_em: estatisticas.ultima_salva_em
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterDistribuicaoCriadoresSalvos = async function (id_usuario, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 20 ? parseInt(limite) : 10
        const distribuicao = await playlistsSalvasDAO.obterDistribuicaoCriadoresSalvos(id_usuario, limiteValidado)
        
        if (!distribuicao) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return distribuicao.map(item => ({
            ...item,
            media_curtidas_criador: Math.round(parseFloat(item.media_curtidas_criador) || 0)
        }))
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterPlaylistsSalvasPorCriador = async function (id_usuario, id_criador) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_criador || isNaN(id_criador)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const playlists = await playlistsSalvasDAO.obterPlaylistsSalvasPorCriador(id_usuario, id_criador)
        return playlists ? playlists : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterPlaylistsSalvasPublicas = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const playlists = await playlistsSalvasDAO.obterPlaylistsSalvasPublicas(id_usuario)
        return playlists ? playlists : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterPlaylistsSalvasPorTamanho = async function (id_usuario, min_musicas, max_musicas) {
    try {
        if (!id_usuario || isNaN(id_usuario) || min_musicas === undefined || max_musicas === undefined || isNaN(min_musicas) || isNaN(max_musicas)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        if (min_musicas < 0 || max_musicas > 1000 || min_musicas >= max_musicas) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const playlists = await playlistsSalvasDAO.obterPlaylistsSalvasPorTamanho(id_usuario, min_musicas, max_musicas)
        return playlists ? playlists : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterPlaylistsSalvasPorDuracao = async function (id_usuario, duracao_min, duracao_max) {
    try {
        if (!id_usuario || isNaN(id_usuario) || duracao_min === undefined || duracao_max === undefined || isNaN(duracao_min) || isNaN(duracao_max)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        if (duracao_min < 0 || duracao_max > 86400 || duracao_min >= duracao_max) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const playlists = await playlistsSalvasDAO.obterPlaylistsSalvasPorDuracao(id_usuario, duracao_min, duracao_max)
        return playlists ? playlists : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const buscarPlaylistsSalvasPorNome = async function (id_usuario, termo_busca) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !termo_busca || termo_busca.length < 2) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const playlists = await playlistsSalvasDAO.buscarPlaylistsSalvasPorNome(id_usuario, termo_busca)
        return playlists ? playlists : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterRecomendacoesPlaylistsSimilares = async function (id_usuario, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 20 ? parseInt(limite) : 5
        const recomendacoes = await playlistsSalvasDAO.obterRecomendacoesPlaylistsSimilares(id_usuario, limiteValidado)
        return recomendacoes ? recomendacoes : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterResumoPlaylistsSalvas = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const [total, estatisticas, recentes, criadores] = await Promise.all([
            playlistsSalvasDAO.contarPlaylistsSalvasUsuario(id_usuario),
            playlistsSalvasDAO.obterEstatisticasPlaylistsSalvas(id_usuario),
            playlistsSalvasDAO.obterPlaylistsSalvasRecentes(id_usuario, 7),
            playlistsSalvasDAO.obterDistribuicaoCriadoresSalvos(id_usuario, 5)
        ])

        return {
            status: true,
            resumo: {
                total_playlists: total,
                total_criadores: estatisticas ? parseInt(estatisticas.total_criadores_diferentes) || 0 : 0,
                total_musicas: estatisticas ? parseInt(estatisticas.total_musicas_geral) || 0 : 0,
                total_horas: estatisticas ? Math.round((parseInt(estatisticas.total_duracao_segundos) || 0) / 3600) : 0,
                media_curtidas: estatisticas ? Math.round(parseFloat(estatisticas.media_curtidas) || 0) : 0,
                total_publicas: estatisticas ? parseInt(estatisticas.total_playlists_publicas) || 0 : 0
            },
            playlists_recentes: recentes ? recentes.slice(0, 3) : [],
            criadores_principais: criadores ? criadores.slice(0, 3).map(item => ({
                nome_usuario: item.nome_usuario,
                total_playlists: parseInt(item.total_playlists_salvas) || 0
            })) : []
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const alternarPlaylistSalva = async function (id_usuario, id_playlist) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_playlist || isNaN(id_playlist)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const estaSalva = await playlistsSalvasDAO.verificarPlaylistSalva(id_usuario, id_playlist)
        
        if (estaSalva) {
            const result = await playlistsSalvasDAO.removerPlaylistSalva(id_usuario, id_playlist)
            return result ? 
                {status: true, action: 'unsaved', message: 'Playlist removida dos salvos'} :
                MESSAGE.ERROR_INTERNAL_SERVER_MODEL
        } else {
            const result = await playlistsSalvasDAO.salvarPlaylist(id_usuario, id_playlist)
            return result ? 
                {status: true, action: 'saved', message: 'Playlist salva com sucesso'} :
                MESSAGE.ERROR_INTERNAL_SERVER_MODEL
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

module.exports = {
    salvarPlaylist,
    removerPlaylistSalva,
    alternarPlaylistSalva,
    listarPlaylistsSalvasUsuario,
    verificarPlaylistSalva,
    contarPlaylistsSalvasUsuario,
    listarPlaylistsSalvasPorPeriodo,
    listarPlaylistsMaisSalvas,
    listarUsuariosPorPlaylistSalva,
    obterPlaylistsSalvasRecentes,
    obterEstatisticasPlaylistsSalvas,
    obterDistribuicaoCriadoresSalvos,
    obterPlaylistsSalvasPorCriador,
    obterPlaylistsSalvasPublicas,
    obterPlaylistsSalvasPorTamanho,
    obterPlaylistsSalvasPorDuracao,
    buscarPlaylistsSalvasPorNome,
    obterRecomendacoesPlaylistsSimilares,
    obterResumoPlaylistsSalvas
}
