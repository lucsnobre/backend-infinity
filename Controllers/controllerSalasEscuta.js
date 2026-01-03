const MESSAGE = require('../../Módulos/config')
const salasEscutaDAO = require('../../Models/DAO/Social/salas_escuta')

const criarSalaEscuta = async function (dados, contentType) {
    try {
        if (String(contentType).toLowerCase() !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE
        }

        const {nome, id_criador, id_musica_atual, e_publica, max_participantes} = dados

        if (!nome || nome.length > 100 || !id_criador || isNaN(id_criador)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        if (max_participantes && (isNaN(max_participantes) || max_participantes < 2 || max_participantes > 50)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const result = await salasEscutaDAO.criarSalaEscuta(dados)
        return result ? MESSAGE.SUCCESS_CREATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const atualizarSalaEscuta = async function (id_sala, dados, contentType) {
    try {
        if (String(contentType).toLowerCase() !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE
        }

        if (!id_sala || isNaN(id_sala)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const {nome, e_publica, max_participantes} = dados

        if (!nome || nome.length > 100) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        if (max_participantes && (isNaN(max_participantes) || max_participantes < 2 || max_participantes > 50)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const result = await salasEscutaDAO.atualizarSalaEscuta(id_sala, dados)
        return result ? MESSAGE.SUCCESS_UPDATED_ITEM : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const encerrarSalaEscuta = async function (id_sala) {
    try {
        if (!id_sala || isNaN(id_sala)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const result = await salasEscutaDAO.encerrarSalaEscuta(id_sala)
        return result ? MESSAGE.SUCCESS_UPDATED_ITEM : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarSalasAtivas = async function () {
    try {
        const salas = await salasEscutaDAO.listarSalasAtivas()
        return salas ? salas : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarSalasPublicas = async function () {
    try {
        const salas = await salasEscutaDAO.listarSalasPublicas()
        return salas ? salas : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarSalaPorID = async function (id_sala) {
    try {
        if (!id_sala || isNaN(id_sala)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const sala = await salasEscutaDAO.listarSalaPorID(id_sala)
        return sala ? sala : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarSalasUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const salas = await salasEscutaDAO.listarSalasUsuario(id_usuario)
        return salas ? salas : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const entrarNaSala = async function (id_sala, id_usuario) {
    try {
        if (!id_sala || isNaN(id_sala) || !id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const sala = await salasEscutaDAO.listarSalaPorID(id_sala)
        if (!sala || !sala.esta_ativa) {
            return {status: false, status_code: 404, message: 'Sala não encontrada ou inativa'}
        }

        const totalParticipantes = await salasEscutaDAO.contarParticipantesSala(id_sala)
        if (totalParticipantes >= sala.max_participantes) {
            return {status: false, status_code: 403, message: 'Sala está cheia'}
        }

        const jaParticipa = await salasEscutaDAO.verificarParticipanteSala(id_sala, id_usuario)
        if (jaParticipa) {
            return {status: false, status_code: 409, message: 'Você já está nesta sala'}
        }

        const result = await salasEscutaDAO.entrarNaSala(id_sala, id_usuario)
        return result ? MESSAGE.SUCCESS_CREATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const sairDaSala = async function (id_sala, id_usuario) {
    try {
        if (!id_sala || isNaN(id_sala) || !id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const participante = await salasEscutaDAO.verificarParticipanteSala(id_sala, id_usuario)
        if (!participante) {
            return {status: false, status_code: 404, message: 'Você não está nesta sala'}
        }

        const result = await salasEscutaDAO.sairDaSala(id_sala, id_usuario)
        return result ? MESSAGE.SUCCESS_DELETED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarParticipantesSala = async function (id_sala) {
    try {
        if (!id_sala || isNaN(id_sala)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const participantes = await salasEscutaDAO.listarParticipantesSala(id_sala)
        return participantes ? participantes : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const verificarParticipanteSala = async function (id_sala, id_usuario) {
    try {
        if (!id_sala || isNaN(id_sala) || !id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const participante = await salasEscutaDAO.verificarParticipanteSala(id_sala, id_usuario)
        return {status: true, esta_na_sala: !!participante, dados_participante: participante}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const contarParticipantesSala = async function (id_sala) {
    try {
        if (!id_sala || isNaN(id_sala)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const total = await salasEscutaDAO.contarParticipantesSala(id_sala)
        return {status: true, total_participantes: total}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const atualizarMusicaAtualSala = async function (id_sala, id_musica, posicao) {
    try {
        if (!id_sala || isNaN(id_sala) || !id_musica || isNaN(id_musica)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const posicaoValidada = posicao !== undefined && !isNaN(posicao) && posicao >= 0 ? parseInt(posicao) : 0
        const result = await salasEscutaDAO.atualizarMusicaAtualSala(id_sala, id_musica, posicaoValidada)
        return result ? MESSAGE.SUCCESS_UPDATED_ITEM : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const atualizarEstadoReproducaoSala = async function (id_sala, esta_reproduzindo, posicao_atual) {
    try {
        if (!id_sala || isNaN(id_sala) || esta_reproduzindo === undefined || posicao_atual === undefined || isNaN(posicao_atual)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        if (posicao_atual < 0) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const result = await salasEscutaDAO.atualizarEstadoReproducaoSala(id_sala, esta_reproduzindo, posicao_atual)
        return result ? MESSAGE.SUCCESS_UPDATED_ITEM : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const adicionarMusicaFila = async function (id_sala, id_musica, id_usuario) {
    try {
        if (!id_sala || isNaN(id_sala) || !id_musica || isNaN(id_musica) || !id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const participante = await salasEscutaDAO.verificarParticipanteSala(id_sala, id_usuario)
        if (!participante) {
            return {status: false, status_code: 403, message: 'Você não está nesta sala'}
        }

        const result = await salasEscutaDAO.adicionarMusicaFila(id_sala, id_musica, id_usuario)
        return result ? MESSAGE.SUCCESS_CREATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const removerMusicaFila = async function (id_sala, id_musica, id_usuario) {
    try {
        if (!id_sala || isNaN(id_sala) || !id_musica || isNaN(id_musica) || !id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const participante = await salasEscutaDAO.verificarParticipanteSala(id_sala, id_usuario)
        if (!participante) {
            return {status: false, status_code: 403, message: 'Você não está nesta sala'}
        }

        const result = await salasEscutaDAO.removerMusicaFila(id_sala, id_musica)
        return result ? MESSAGE.SUCCESS_DELETED_ITEM : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarFilaSala = async function (id_sala) {
    try {
        if (!id_sala || isNaN(id_sala)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const fila = await salasEscutaDAO.listarFilaSala(id_sala)
        return fila ? fila : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const proximaMusicaFila = async function (id_sala, id_usuario) {
    try {
        if (!id_sala || isNaN(id_sala) || !id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const participante = await salasEscutaDAO.verificarParticipanteSala(id_sala, id_usuario)
        if (!participante) {
            return {status: false, status_code: 403, message: 'Você não está nesta sala'}
        }

        const proximaMusica = await salasEscutaDAO.proximaMusicaFila(id_sala)
        if (!proximaMusica) {
            return {status: false, status_code: 404, message: 'Fila vazia'}
        }

        await salasEscutaDAO.removerPrimeiraMusicaFila(id_sala)
        await salasEscutaDAO.atualizarMusicaAtualSala(id_sala, proximaMusica, 0)

        return {status: true, proxima_musica: proximaMusica, message: 'Próxima música iniciada'}
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const buscarSalasPorNome = async function (termo_busca) {
    try {
        if (!termo_busca || termo_busca.length < 2) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        let sql = `
            SELECT 
                s.*,
                u.nome_usuario as nome_criador,
                COUNT(ps.id_usuario) as total_participantes,
                m.titulo as musica_atual_titulo
            FROM salas_escuta s
            JOIN usuarios u ON s.id_criador = u.id
            LEFT JOIN musicas m ON s.id_musica_atual = m.id
            LEFT JOIN participantes_sala ps ON s.id = ps.id_sala
            WHERE s.esta_ativa = true AND s.e_publica = true AND s.nome LIKE ?
            GROUP BY s.id, u.nome_usuario, m.titulo
            ORDER BY total_participantes DESC, s.criada_em DESC
        `
        
        const result = await prisma.$queryRawUnsafe(sql, `%${termo_busca}%`)
        return result && result.length > 0 ? result : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterEstatisticasSala = async function (id_sala) {
    try {
        if (!id_sala || isNaN(id_sala)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const sala = await salasEscutaDAO.listarSalaPorID(id_sala)
        if (!sala) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        const totalParticipantes = await salasEscutaDAO.contarParticipantesSala(id_sala)
        const fila = await salasEscutaDAO.listarFilaSala(id_sala)
        const totalFila = fila ? fila.length : 0

        return {
            status: true,
            id_sala: sala.id,
            nome: sala.nome,
            total_participantes: totalParticipantes,
            max_participantes: sala.max_participantes,
            total_musicas_fila: totalFila,
            esta_reproduzindo: sala.esta_reproduzindo,
            posicao_atual: sala.posicao_atual,
            e_publica: sala.e_publica,
            criada_em: sala.criada_em,
            atualizada_em: sala.atualizada_em
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

module.exports = {
    criarSalaEscuta,
    atualizarSalaEscuta,
    encerrarSalaEscuta,
    listarSalasAtivas,
    listarSalasPublicas,
    listarSalaPorID,
    listarSalasUsuario,
    entrarNaSala,
    sairDaSala,
    listarParticipantesSala,
    verificarParticipanteSala,
    contarParticipantesSala,
    atualizarMusicaAtualSala,
    atualizarEstadoReproducaoSala,
    adicionarMusicaFila,
    removerMusicaFila,
    listarFilaSala,
    proximaMusicaFila,
    buscarSalasPorNome,
    obterEstatisticasSala
}
