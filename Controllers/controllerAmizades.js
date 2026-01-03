const MESSAGE = require('../../Módulos/config')
const amizadesDAO = require('../../Models/DAO/Social/amizades')

const enviarSolicitacaoAmizade = async function (id_usuario1, id_usuario2) {
    try {
        if (!id_usuario1 || isNaN(id_usuario1) || !id_usuario2 || isNaN(id_usuario2)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        if (id_usuario1 === id_usuario2) {
            return {status: false, status_code: 400, message: 'Não é possível enviar solicitação para si mesmo'}
        }

        const statusExistente = await amizadesDAO.verificarStatusAmizade(id_usuario1, id_usuario2)
        if (statusExistente) {
            if (statusExistente.status === 'aceita') {
                return {status: false, status_code: 409, message: 'Vocês já são amigos'}
            } else if (statusExistente.status === 'pendente') {
                return {status: false, status_code: 409, message: 'Já existe uma solicitação de amizade pendente'}
            } else if (statusExistente.status === 'bloqueada') {
                return {status: false, status_code: 403, message: 'Não é possível enviar solicitação: usuário bloqueado'}
            }
        }

        const result = await amizadesDAO.enviarSolicitacaoAmizade(id_usuario1, id_usuario2)
        return result ? MESSAGE.SUCCESS_CREATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const aceitarSolicitacaoAmizade = async function (id_usuario, id_solicitante) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_solicitante || isNaN(id_solicitante)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const statusExistente = await amizadesDAO.verificarStatusAmizade(id_usuario, id_solicitante)
        if (!statusExistente || statusExistente.status !== 'pendente') {
            return {status: false, status_code: 404, message: 'Solicitação de amizade não encontrada'}
        }

        if (statusExistente.solicitada_por === id_usuario) {
            return {status: false, status_code: 400, message: 'Não é possível aceitar sua própria solicitação'}
        }

        const result = await amizadesDAO.aceitarSolicitacaoAmizade(id_usuario, id_solicitante)
        return result ? MESSAGE.SUCCESS_UPDATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const recusarSolicitacaoAmizade = async function (id_usuario, id_solicitante) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_solicitante || isNaN(id_solicitante)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const statusExistente = await amizadesDAO.verificarStatusAmizade(id_usuario, id_solicitante)
        if (!statusExistente || statusExistente.status !== 'pendente') {
            return {status: false, status_code: 404, message: 'Solicitação de amizade não encontrada'}
        }

        if (statusExistente.solicitada_por === id_usuario) {
            return {status: false, status_code: 400, message: 'Utilize a função de cancelar solicitação'}
        }

        const result = await amizadesDAO.recusarSolicitacaoAmizade(id_usuario, id_solicitante)
        return result ? MESSAGE.SUCCESS_DELETED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const cancelarSolicitacaoAmizade = async function (id_usuario, id_destinatario) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_destinatario || isNaN(id_destinatario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const statusExistente = await amizadesDAO.verificarStatusAmizade(id_usuario, id_destinatario)
        if (!statusExistente || statusExistente.status !== 'pendente') {
            return {status: false, status_code: 404, message: 'Solicitação de amizade não encontrada'}
        }

        if (statusExistente.solicitada_por !== id_usuario) {
            return {status: false, status_code: 403, message: 'Você só pode cancelar suas próprias solicitações'}
        }

        const result = await amizadesDAO.recusarSolicitacaoAmizade(id_usuario, id_destinatario)
        return result ? MESSAGE.SUCCESS_DELETED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const removerAmizade = async function (id_usuario1, id_usuario2) {
    try {
        if (!id_usuario1 || isNaN(id_usuario1) || !id_usuario2 || isNaN(id_usuario2)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const saoAmigos = await amizadesDAO.verificarSaoAmigos(id_usuario1, id_usuario2)
        if (!saoAmigos) {
            return {status: false, status_code: 404, message: 'Amizade não encontrada'}
        }

        const result = await amizadesDAO.removerAmizade(id_usuario1, id_usuario2)
        return result ? MESSAGE.SUCCESS_DELETED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const bloquearUsuario = async function (id_usuario_bloqueador, id_usuario_bloqueado) {
    try {
        if (!id_usuario_bloqueador || isNaN(id_usuario_bloqueador) || !id_usuario_bloqueado || isNaN(id_usuario_bloqueado)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        if (id_usuario_bloqueador === id_usuario_bloqueado) {
            return {status: false, status_code: 400, message: 'Não é possível bloquear a si mesmo'}
        }

        const result = await amizadesDAO.bloquearUsuario(id_usuario_bloqueador, id_usuario_bloqueado)
        return result ? MESSAGE.SUCCESS_UPDATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const desbloquearUsuario = async function (id_usuario_bloqueador, id_usuario_bloqueado) {
    try {
        if (!id_usuario_bloqueador || isNaN(id_usuario_bloqueador) || !id_usuario_bloqueado || isNaN(id_usuario_bloqueado)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const bloqueioInfo = await amizadesDAO.verificarEstaBloqueado(id_usuario_bloqueador, id_usuario_bloqueado)
        if (!bloqueioInfo.bloqueado || bloqueioInfo.bloqueado_por !== id_usuario_bloqueador) {
            return {status: false, status_code: 404, message: 'Bloqueio não encontrado'}
        }

        const result = await amizadesDAO.desbloquearUsuario(id_usuario_bloqueador, id_usuario_bloqueado)
        return result ? MESSAGE.SUCCESS_DELETED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarAmigosUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const amigos = await amizadesDAO.listarAmigosUsuario(id_usuario)
        return amigos ? amigos : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarSolicitacoesRecebidas = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const solicitacoes = await amizadesDAO.listarSolicitacoesRecebidas(id_usuario)
        return solicitacoes ? solicitacoes : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarSolicitacoesEnviadas = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const solicitacoes = await amizadesDAO.listarSolicitacoesEnviadas(id_usuario)
        return solicitacoes ? solicitacoes : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarUsuariosBloqueados = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const bloqueados = await amizadesDAO.listarUsuariosBloqueados(id_usuario)
        return bloqueados ? bloqueados : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const verificarStatusAmizade = async function (id_usuario1, id_usuario2) {
    try {
        if (!id_usuario1 || isNaN(id_usuario1) || !id_usuario2 || isNaN(id_usuario2)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const status = await amizadesDAO.verificarStatusAmizade(id_usuario1, id_usuario2)
        
        if (!status) {
            return {status: true, relacao: 'nenhuma', sao_amigos: false, esta_bloqueado: false}
        }

        const saoAmigos = status.status === 'aceita'
        const bloqueioInfo = await amizadesDAO.verificarEstaBloqueado(id_usuario1, id_usuario2)

        return {
            status: true,
            relacao: status.status,
            sao_amigos: saoAmigos,
            esta_bloqueado: bloqueioInfo.bloqueado,
            bloqueado_por: bloqueioInfo.bloqueado_por,
            solicitada_por: status.solicitada_por,
            criada_em: status.criada_em,
            atualizada_em: status.atualizada_em
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const contarAmigosUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const total = await amizadesDAO.contarAmigosUsuario(id_usuario)
        return {status: true, total_amigos: total}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const buscarAmigosPorNome = async function (id_usuario, termo_busca) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !termo_busca || termo_busca.length < 2) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const amigos = await amizadesDAO.listarAmigosUsuario(id_usuario)
        if (!amigos) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        const amigosFiltrados = amigos.filter(amigo => 
            amigo.nome_usuario.toLowerCase().includes(termo_busca.toLowerCase())
        )

        return amigosFiltrados.length > 0 ? amigosFiltrados : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

module.exports = {
    enviarSolicitacaoAmizade,
    aceitarSolicitacaoAmizade,
    recusarSolicitacaoAmizade,
    cancelarSolicitacaoAmizade,
    removerAmizade,
    bloquearUsuario,
    desbloquearUsuario,
    listarAmigosUsuario,
    listarSolicitacoesRecebidas,
    listarSolicitacoesEnviadas,
    listarUsuariosBloqueados,
    verificarStatusAmizade,
    contarAmigosUsuario,
    buscarAmigosPorNome
}
