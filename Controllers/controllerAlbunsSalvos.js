const MESSAGE = require('../../Módulos/config')
const albunsSalvosDAO = require('../../Models/DAO/Interacao/albuns_salvos')

const salvarAlbum = async function (id_usuario, id_album) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_album || isNaN(id_album)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const jaSalvo = await albunsSalvosDAO.verificarAlbumSalvo(id_usuario, id_album)
        if (jaSalvo) {
            return {status: false, status_code: 409, message: 'Álbum já está salvo'}
        }

        const result = await albunsSalvosDAO.salvarAlbum(id_usuario, id_album)
        return result ? MESSAGE.SUCCESS_CREATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const removerAlbumSalvo = async function (id_usuario, id_album) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_album || isNaN(id_album)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const estaSalvo = await albunsSalvosDAO.verificarAlbumSalvo(id_usuario, id_album)
        if (!estaSalvo) {
            return {status: false, status_code: 404, message: 'Álbum não encontrado nos salvos'}
        }

        const result = await albunsSalvosDAO.removerAlbumSalvo(id_usuario, id_album)
        return result ? MESSAGE.SUCCESS_DELETED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarAlbunsSalvosUsuario = async function (id_usuario, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 100 ? parseInt(limite) : 50
        const albuns = await albunsSalvosDAO.listarAlbunsSalvosUsuario(id_usuario, limiteValidado)
        return albuns ? albuns : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const verificarAlbumSalvo = async function (id_usuario, id_album) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_album || isNaN(id_album)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const estaSalvo = await albunsSalvosDAO.verificarAlbumSalvo(id_usuario, id_album)
        return {status: true, esta_salvo: estaSalvo}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const contarAlbunsSalvosUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const total = await albunsSalvosDAO.contarAlbunsSalvosUsuario(id_usuario)
        return {status: true, total_albuns_salvos: total}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarAlbunsSalvosPorPeriodo = async function (id_usuario, data_inicio, data_fim) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !data_inicio || !data_fim) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const inicio = new Date(data_inicio)
        const fim = new Date(data_fim)

        if (isNaN(inicio.getTime()) || isNaN(fim.getTime()) || inicio >= fim) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const albuns = await albunsSalvosDAO.listarAlbunsSalvosPorPeriodo(id_usuario, data_inicio, data_fim)
        return albuns ? albuns : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarAlbunsMaisSalvos = async function (limite) {
    try {
        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 50 ? parseInt(limite) : 10
        const albuns = await albunsSalvosDAO.listarAlbunsMaisSalvos(limiteValidado)
        return albuns ? albuns : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarUsuariosPorAlbumSalvo = async function (id_album, limite) {
    try {
        if (!id_album || isNaN(id_album)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 100 ? parseInt(limite) : 50
        const usuarios = await albunsSalvosDAO.listarUsuariosPorAlbumSalvo(id_album, limiteValidado)
        return usuarios ? usuarios : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterAlbunsSalvosRecentes = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 30 ? parseInt(dias) : 7
        const albuns = await albunsSalvosDAO.obterAlbunsSalvosRecentes(id_usuario, diasValidados)
        return albuns ? albuns : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterEstatisticasAlbunsSalvos = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const estatisticas = await albunsSalvosDAO.obterEstatisticasAlbunsSalvos(id_usuario)
        
        if (!estatisticas) {
            return {
                status: true,
                total_albuns_salvos: 0,
                total_artistas_diferentes: 0,
                media_faixas_album: 0,
                total_faixas_geral: 0,
                media_duracao_album: 0,
                total_duracao_minutos: 0,
                max_popularidade: 0,
                min_popularidade: 0,
                media_popularidade: 0,
                primeiro_salvo_em: null,
                ultimo_salvo_em: null
            }
        }

        return {
            status: true,
            total_albuns_salvos: parseInt(estatisticas.total_albuns_salvos) || 0,
            total_artistas_diferentes: parseInt(estatisticas.total_artistas_diferentes) || 0,
            media_faixas_album: Math.round(parseFloat(estatisticas.media_faixas_album) || 0),
            total_faixas_geral: parseInt(estatisticas.total_faixas_geral) || 0,
            media_duracao_album: Math.round(parseFloat(estatisticas.media_duracao_album) || 0),
            total_duracao_minutos: parseInt(estatisticas.total_duracao_minutos) || 0,
            total_duracao_horas: Math.round((parseInt(estatisticas.total_duracao_minutos) || 0) / 60),
            max_popularidade: Math.round((parseFloat(estatisticas.max_popularidade) || 0) * 100) / 100,
            min_popularidade: Math.round((parseFloat(estatisticas.min_popularidade) || 0) * 100) / 100,
            media_popularidade: Math.round((parseFloat(estatisticas.media_popularidade) || 0) * 100) / 100,
            primeiro_salvo_em: estatisticas.primeiro_salvo_em,
            ultimo_salvo_em: estatisticas.ultimo_salvo_em
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterDistribuicaoArtistasSalvos = async function (id_usuario, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 20 ? parseInt(limite) : 10
        const distribuicao = await albunsSalvosDAO.obterDistribuicaoArtistasSalvos(id_usuario, limiteValidado)
        
        if (!distribuicao) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return distribuicao.map(item => ({
            ...item,
            media_popularidade_artista: Math.round((parseFloat(item.media_popularidade_artista) || 0) * 100) / 100
        }))
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterAlbunsSalvosPorArtista = async function (id_usuario, id_artista) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_artista || isNaN(id_artista)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const albuns = await albunsSalvosDAO.obterAlbunsSalvosPorArtista(id_usuario, id_artista)
        return albuns ? albuns : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterAlbunsSalvosPorGenero = async function (id_usuario, id_genero) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_genero || isNaN(id_genero)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const albuns = await albunsSalvosDAO.obterAlbunsSalvosPorGenero(id_usuario, id_genero)
        return albuns ? albuns : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterAlbunsSalvosPorDecada = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const decadas = await albunsSalvosDAO.obterAlbunsSalvosPorDecada(id_usuario)
        
        if (!decadas) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return decadas.map(item => ({
            ...item,
            media_faixas_decada: Math.round(parseFloat(item.media_faixas_decada) || 0),
            media_popularidade_decada: Math.round((parseFloat(item.media_popularidade_decada) || 0) * 100) / 100,
            artistas_decada: item.artistas_decada ? item.artistas_decada.split(',').slice(0, 5) : []
        }))
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const buscarAlbunsSalvosPorNome = async function (id_usuario, termo_busca) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !termo_busca || termo_busca.length < 2) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const albuns = await albunsSalvosDAO.buscarAlbunsSalvosPorNome(id_usuario, termo_busca)
        return albuns ? albuns : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterRecomendacoesAlbunsSimilares = async function (id_usuario, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 20 ? parseInt(limite) : 5
        const recomendacoes = await albunsSalvosDAO.obterRecomendacoesAlbunsSimilares(id_usuario, limiteValidado)
        return recomendacoes ? recomendacoes : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterResumoAlbunsSalvos = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const [total, estatisticas, recentes, artistas] = await Promise.all([
            albunsSalvosDAO.contarAlbunsSalvosUsuario(id_usuario),
            albunsSalvosDAO.obterEstatisticasAlbunsSalvos(id_usuario),
            albunsSalvosDAO.obterAlbunsSalvosRecentes(id_usuario, 7),
            albunsSalvosDAO.obterDistribuicaoArtistasSalvos(id_usuario, 5)
        ])

        return {
            status: true,
            resumo: {
                total_albuns: total,
                total_artistas: estatisticas ? parseInt(estatisticas.total_artistas_diferentes) || 0 : 0,
                total_musicas: estatisticas ? parseInt(estatisticas.total_faixas_geral) || 0 : 0,
                total_horas: estatisticas ? Math.round((parseInt(estatisticas.total_duracao_minutos) || 0) / 60) : 0,
                media_popularidade: estatisticas ? Math.round((parseFloat(estatisticas.media_popularidade) || 0) * 100) / 100 : 0
            },
            albuns_recentes: recentes ? recentes.slice(0, 3) : [],
            artistas_principais: artistas ? artistas.slice(0, 3).map(item => ({
                nome: item.nome,
                total_albuns: parseInt(item.total_albuns_salvos) || 0
            })) : []
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const alternarAlbumSalvo = async function (id_usuario, id_album) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_album || isNaN(id_album)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const estaSalvo = await albunsSalvosDAO.verificarAlbumSalvo(id_usuario, id_album)
        
        if (estaSalvo) {
            const result = await albunsSalvosDAO.removerAlbumSalvo(id_usuario, id_album)
            return result ? 
                {status: true, action: 'unsaved', message: 'Álbum removido dos salvos'} :
                MESSAGE.ERROR_INTERNAL_SERVER_MODEL
        } else {
            const result = await albunsSalvosDAO.salvarAlbum(id_usuario, id_album)
            return result ? 
                {status: true, action: 'saved', message: 'Álbum salvo com sucesso'} :
                MESSAGE.ERROR_INTERNAL_SERVER_MODEL
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

module.exports = {
    salvarAlbum,
    removerAlbumSalvo,
    alternarAlbumSalvo,
    listarAlbunsSalvosUsuario,
    verificarAlbumSalvo,
    contarAlbunsSalvosUsuario,
    listarAlbunsSalvosPorPeriodo,
    listarAlbunsMaisSalvos,
    listarUsuariosPorAlbumSalvo,
    obterAlbunsSalvosRecentes,
    obterEstatisticasAlbunsSalvos,
    obterDistribuicaoArtistasSalvos,
    obterAlbunsSalvosPorArtista,
    obterAlbunsSalvosPorGenero,
    obterAlbunsSalvosPorDecada,
    buscarAlbunsSalvosPorNome,
    obterRecomendacoesAlbunsSimilares,
    obterResumoAlbunsSalvos
}
