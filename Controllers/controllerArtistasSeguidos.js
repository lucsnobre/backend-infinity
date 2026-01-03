const MESSAGE = require('../../Módulos/config')
const artistasSeguidosDAO = require('../../Models/DAO/Social/artistas_seguidos')

const seguirArtista = async function (id_usuario, id_artista) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_artista || isNaN(id_artista)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const jaSegue = await artistasSeguidosDAO.verificarUsuarioSegueArtista(id_usuario, id_artista)
        if (jaSegue) {
            return {status: false, status_code: 409, message: 'Você já segue este artista'}
        }

        const result = await artistasSeguidosDAO.seguirArtista(id_usuario, id_artista)
        return result ? MESSAGE.SUCCESS_CREATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const deixarSeguirArtista = async function (id_usuario, id_artista) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_artista || isNaN(id_artista)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const jaSegue = await artistasSeguidosDAO.verificarUsuarioSegueArtista(id_usuario, id_artista)
        if (!jaSegue) {
            return {status: false, status_code: 404, message: 'Você não segue este artista'}
        }

        const result = await artistasSeguidosDAO.deixarSeguirArtista(id_usuario, id_artista)
        return result ? MESSAGE.SUCCESS_DELETED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarArtistasSeguidosUsuario = async function (id_usuario, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 100 ? parseInt(limite) : 50
        const artistas = await artistasSeguidosDAO.listarArtistasSeguidosUsuario(id_usuario, limiteValidado)
        return artistas ? artistas : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarSeguidoresArtista = async function (id_artista, limite) {
    try {
        if (!id_artista || isNaN(id_artista)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 100 ? parseInt(limite) : 50
        const seguidores = await artistasSeguidosDAO.listarSeguidoresArtista(id_artista, limiteValidado)
        return seguidores ? seguidores : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const verificarUsuarioSegueArtista = async function (id_usuario, id_artista) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_artista || isNaN(id_artista)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const segue = await artistasSeguidosDAO.verificarUsuarioSegueArtista(id_usuario, id_artista)
        return {status: true, segue_artista: segue}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const contarSeguidoresArtista = async function (id_artista) {
    try {
        if (!id_artista || isNaN(id_artista)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const total = await artistasSeguidosDAO.contarSeguidoresArtista(id_artista)
        return {status: true, total_seguidores: total}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const contarArtistasSeguidosUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const total = await artistasSeguidosDAO.contarArtistasSeguidosUsuario(id_usuario)
        return {status: true, total_artistas_seguidos: total}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterArtistasMaisSeguidos = async function (limite) {
    try {
        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 50 ? parseInt(limite) : 10
        const artistas = await artistasSeguidosDAO.obterArtistasMaisSeguidos(limiteValidado)
        return artistas ? artistas : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterNovosArtistasSeguidosUsuario = async function (id_usuario, dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 365 ? parseInt(dias) : 30
        const artistas = await artistasSeguidosDAO.obterNovosArtistasSeguidosUsuario(id_usuario, diasValidados)
        return artistas ? artistas : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterEstatisticasSeguimentoUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const estatisticas = await artistasSeguidosDAO.obterEstatisticasSeguimentoUsuario(id_usuario)
        
        if (!estatisticas) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return {
            status: true,
            total_artistas_seguidos: parseInt(estatisticas.total_artistas_seguidos) || 0,
            total_paises_diferentes: parseInt(estatisticas.total_paises_diferentes) || 0,
            total_geracoes_diferentes: parseInt(estatisticas.total_geracoes_diferentes) || 0,
            total_artistas_verificados: parseInt(estatisticas.total_artistas_verificados) || 0,
            media_ouvintes_mensais: Math.round(parseFloat(estatisticas.media_ouvintes_mensais) || 0),
            max_ouvintes_mensais: parseInt(estatisticas.max_ouvintes_mensais) || 0,
            min_ouvintes_mensais: parseInt(estatisticas.min_ouvintes_mensais) || 0,
            primeiro_seguimento_em: estatisticas.primeiro_seguimento_em,
            ultimo_seguimento_em: estatisticas.ultimo_seguimento_em
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const buscarArtistasSeguidosPorNome = async function (id_usuario, termo_busca) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !termo_busca || termo_busca.length < 2) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const artistas = await artistasSeguidosDAO.buscarArtistasSeguidosPorNome(id_usuario, termo_busca)
        return artistas ? artistas : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterArtistasRecomendadosPorSeguimento = async function (id_usuario, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 20 ? parseInt(limite) : 10
        const recomendacoes = await artistasSeguidosDAO.obterArtistasRecomendadosPorSeguimento(id_usuario, limiteValidado)
        return recomendacoes ? recomendacoes : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterResumoSeguimentoUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const totalArtistas = await artistasSeguidosDAO.contarArtistasSeguidosUsuario(id_usuario)
        const estatisticas = await artistasSeguidosDAO.obterEstatisticasSeguimentoUsuario(id_usuario)

        if (!estatisticas) {
            return {
                status: true,
                total_artistas_seguidos: totalArtistas,
                total_artistas_verificados: 0,
                total_paises_diferentes: 0,
                diversidade_musical: 'baixa'
            }
        }

        const diversidade = estatisticas.total_paises_diferentes >= 5 ? 'alta' : 
                           estatisticas.total_paises_diferentes >= 3 ? 'media' : 'baixa'

        return {
            status: true,
            total_artistas_seguidos: totalArtistas,
            total_artistas_verificados: parseInt(estatisticas.total_artistas_verificados) || 0,
            total_paises_diferentes: parseInt(estatisticas.total_paises_diferentes) || 0,
            diversidade_musical: diversidade,
            media_ouvintes_mensais: Math.round(parseFloat(estatisticas.media_ouvintes_mensais) || 0),
            primeiro_seguimento_em: estatisticas.primeiro_seguimento_em,
            ultimo_seguimento_em: estatisticas.ultimo_seguimento_em
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const alternarSeguimentoArtista = async function (id_usuario, id_artista) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_artista || isNaN(id_artista)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const jaSegue = await artistasSeguidosDAO.verificarUsuarioSegueArtista(id_usuario, id_artista)
        
        if (jaSegue) {
            const result = await artistasSeguidosDAO.deixarSeguirArtista(id_usuario, id_artista)
            return result ? 
                {status: true, action: 'unfollowed', message: 'Artista deixado de seguir com sucesso'} :
                MESSAGE.ERROR_INTERNAL_SERVER_MODEL
        } else {
            const result = await artistasSeguidosDAO.seguirArtista(id_usuario, id_artista)
            return result ? 
                {status: true, action: 'followed', message: 'Artista seguido com sucesso'} :
                MESSAGE.ERROR_INTERNAL_SERVER_MODEL
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

module.exports = {
    seguirArtista,
    deixarSeguirArtista,
    alternarSeguimentoArtista,
    listarArtistasSeguidosUsuario,
    listarSeguidoresArtista,
    verificarUsuarioSegueArtista,
    contarSeguidoresArtista,
    contarArtistasSeguidosUsuario,
    obterArtistasMaisSeguidos,
    obterNovosArtistasSeguidosUsuario,
    obterEstatisticasSeguimentoUsuario,
    obterResumoSeguimentoUsuario,
    buscarArtistasSeguidosPorNome,
    obterArtistasRecomendadosPorSeguimento
}
