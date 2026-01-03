const MESSAGE = require('../../Módulos/config')
const historicoDAO = require('../../Models/DAO/Historico/historico_reproducao')

const registrarReproducao = async function (id_usuario, id_musica, duracao_reproduzida, tipo_dispositivo) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_musica || isNaN(id_musica)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        if (duracao_reproduzida !== undefined && (isNaN(duracao_reproduzida) || duracao_reproduzida < 0)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const dispositivosValidos = ['mobile', 'web', 'desktop', 'tablet', 'smart_tv', 'unknown']
        if (tipo_dispositivo && !dispositivosValidos.includes(tipo_dispositivo)) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const result = await historicoDAO.registrarReproducao(id_usuario, id_musica, duracao_reproduzida, tipo_dispositivo)
        return result ? MESSAGE.SUCCESS_CREATED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarHistoricoUsuario = async function (id_usuario, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 100 ? parseInt(limite) : 50
        const historico = await historicoDAO.listarHistoricoUsuario(id_usuario, limiteValidado)
        return historico ? historico : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarHistoricoUsuarioPorPeriodo = async function (id_usuario, data_inicio, data_fim) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !data_inicio || !data_fim) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const inicio = new Date(data_inicio)
        const fim = new Date(data_fim)

        if (isNaN(inicio.getTime()) || isNaN(fim.getTime()) || inicio >= fim) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const historico = await historicoDAO.listarHistoricoUsuarioPorPeriodo(id_usuario, data_inicio, data_fim)
        return historico ? historico : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterMusicasMaisReproduzidasUsuario = async function (id_usuario, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 50 ? parseInt(limite) : 10
        const musicas = await historicoDAO.obterMusicasMaisReproduzidasUsuario(id_usuario, limiteValidado)
        return musicas ? musicas : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterArtistasMaisReproduzidosUsuario = async function (id_usuario, limite) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const limiteValidado = limite && !isNaN(limite) && limite > 0 && limite <= 50 ? parseInt(limite) : 10
        const artistas = await historicoDAO.obterArtistasMaisReproduzidosUsuario(id_usuario, limiteValidado)
        return artistas ? artistas : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterEstatisticasReproducaoUsuario = async function (id_usuario, periodo_dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const periodoValidado = periodo_dias && !isNaN(periodo_dias) && periodo_dias > 0 && periodo_dias <= 365 ? parseInt(periodo_dias) : 30
        const estatisticas = await historicoDAO.obterEstatisticasReproducaoUsuario(id_usuario, periodoValidado)
        
        if (!estatisticas) {
            return MESSAGE.ERROR_NOT_FOUND
        }

        return {
            status: true,
            periodo_dias: periodoValidado,
            musicas_unicas: parseInt(estatisticas.musicas_unicas) || 0,
            artistas_unicos: parseInt(estatisticas.artistas_unicos) || 0,
            total_reproducoes: parseInt(estatisticas.total_reproducoes) || 0,
            total_segundos_ouvidos: parseInt(estatisticas.total_segundos_ouvidos) || 0,
            total_minutos_ouvidos: Math.floor((parseInt(estatisticas.total_segundos_ouvidos) || 0) / 60),
            total_horas_ouvidas: Math.floor((parseInt(estatisticas.total_segundos_ouvidos) || 0) / 3600),
            media_segundos_por_reproducao: parseFloat(estatisticas.media_segundos_por_reproducao) || 0,
            ultima_reproducao: estatisticas.ultima_reproducao,
            primeira_reproducao: estatisticas.primeira_reproducao
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterHorasMaisAtivasUsuario = async function (id_usuario, periodo_dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const periodoValidado = periodo_dias && !isNaN(periodo_dias) && periodo_dias > 0 && periodo_dias <= 365 ? parseInt(periodo_dias) : 30
        const horas = await historicoDAO.obterHorasMaisAtivasUsuario(id_usuario, periodoValidado)
        return horas ? horas : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterDispositivosMaisUtilizados = async function (id_usuario, periodo_dias) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const periodoValidado = periodo_dias && !isNaN(periodo_dias) && periodo_dias > 0 && periodo_dias <= 365 ? parseInt(periodo_dias) : 30
        const dispositivos = await historicoDAO.obterDispositivosMaisUtilizados(id_usuario, periodoValidado)
        return dispositivos ? dispositivos : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const limparHistoricoUsuario = async function (id_usuario, data_limite) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !data_limite) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const limite = new Date(data_limite)
        if (isNaN(limite.getTime()) || limite >= new Date()) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        const result = await historicoDAO.limparHistoricoUsuario(id_usuario, data_limite)
        return result ? MESSAGE.SUCCESS_DELETED_ITEM : MESSAGE.ERROR_INTERNAL_SERVER_MODEL
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const verificarMusicaReproduzidaRecentemente = async function (id_usuario, id_musica, minutos) {
    try {
        if (!id_usuario || isNaN(id_usuario) || !id_musica || isNaN(id_musica)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const minutosValidados = minutos && !isNaN(minutos) && minutos > 0 && minutos <= 60 ? parseInt(minutos) : 5
        const foiReproduzida = await historicoDAO.verificarMusicaReproduzidaRecentemente(id_usuario, id_musica, minutosValidados)
        
        return {
            status: true,
            foi_reproduzida_recentemente: foiReproduzida,
            minutos_verificados: minutosValidados
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const obterResumoDiarioUsuario = async function (id_usuario, dias = 7) {
    try {
        if (!id_usuario || isNaN(id_usuario)) {
            return MESSAGE.ERROR_INVALID_ID
        }

        const diasValidados = dias && !isNaN(dias) && dias > 0 && dias <= 30 ? parseInt(dias) : 7
        
        let sql = `
            SELECT 
                DATE(hr.reproduzida_em) as data,
                COUNT(hr.id) as total_reproducoes,
                COUNT(DISTINCT hr.id_musica) as musicas_diferentes,
                SUM(hr.duracao_reproduzida) as total_segundos_ouvidos
            FROM historico_reproducao hr
            WHERE hr.id_usuario = ? 
            AND hr.reproduzida_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(hr.reproduzida_em)
            ORDER BY data DESC
        `
        
        const result = await prisma.$queryRawUnsafe(sql, id_usuario, diasValidados)
        return result && result.length > 0 ? result : MESSAGE.ERROR_NOT_FOUND
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

module.exports = {
    registrarReproducao,
    listarHistoricoUsuario,
    listarHistoricoUsuarioPorPeriodo,
    obterMusicasMaisReproduzidasUsuario,
    obterArtistasMaisReproduzidosUsuario,
    obterEstatisticasReproducaoUsuario,
    obterHorasMaisAtivasUsuario,
    obterDispositivosMaisUtilizados,
    limparHistoricoUsuario,
    verificarMusicaReproduzidaRecentemente,
    obterResumoDiarioUsuario
}
