const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const enviarSolicitacaoAmizade = async function (id_usuario1, id_usuario2) {
    try {
        let sql = "INSERT INTO amizades (id_usuario1, id_usuario2, status, solicitada_por) VALUES (?, ?, 'pendente', ?)"
        let result = await prisma.$queryRawUnsafe(sql, Math.min(id_usuario1, id_usuario2), Math.max(id_usuario1, id_usuario2), id_usuario1)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const aceitarSolicitacaoAmizade = async function (id_usuario1, id_usuario2) {
    try {
        let sql = "UPDATE amizades SET status = 'aceita', atualizada_em = ? WHERE id_usuario1 = ? AND id_usuario2 = ? AND status = 'pendente'"
        let result = await prisma.$queryRawUnsafe(sql, new Date(), Math.min(id_usuario1, id_usuario2), Math.max(id_usuario1, id_usuario2))
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const recusarSolicitacaoAmizade = async function (id_usuario1, id_usuario2) {
    try {
        let sql = "DELETE FROM amizades WHERE id_usuario1 = ? AND id_usuario2 = ? AND status = 'pendente'"
        let result = await prisma.$queryRawUnsafe(sql, Math.min(id_usuario1, id_usuario2), Math.max(id_usuario1, id_usuario2))
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const removerAmizade = async function (id_usuario1, id_usuario2) {
    try {
        let sql = "DELETE FROM amizades WHERE (id_usuario1 = ? AND id_usuario2 = ?) OR (id_usuario1 = ? AND id_usuario2 = ?)"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario1, id_usuario2, id_usuario2, id_usuario1)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const bloquearUsuario = async function (id_usuario_bloqueador, id_usuario_bloqueado) {
    try {
        await removerAmizade(id_usuario_bloqueador, id_usuario_bloqueado)
        
        let sql = "INSERT INTO amizades (id_usuario1, id_usuario2, status, solicitada_por) VALUES (?, ?, 'bloqueada', ?)"
        let result = await prisma.$queryRawUnsafe(sql, Math.min(id_usuario_bloqueador, id_usuario_bloqueado), Math.max(id_usuario_bloqueador, id_usuario_bloqueado), id_usuario_bloqueador)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const desbloquearUsuario = async function (id_usuario_bloqueador, id_usuario_bloqueado) {
    try {
        let sql = "DELETE FROM amizades WHERE id_usuario1 = ? AND id_usuario2 = ? AND status = 'bloqueada'"
        let result = await prisma.$queryRawUnsafe(sql, Math.min(id_usuario_bloqueador, id_usuario_bloqueado), Math.max(id_usuario_bloqueador, id_usuario_bloqueado))
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarAmigosUsuario = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                CASE 
                    WHEN a.id_usuario1 = ? THEN a.id_usuario2 
                    ELSE a.id_usuario1 
                END as id_amigo,
                u.nome_usuario,
                u.url_avatar,
                u.esta_ativo,
                a.criada_em,
                a.atualizada_em
            FROM amizades a
            JOIN usuarios u ON (
                (a.id_usuario1 = ? AND u.id = a.id_usuario2) OR 
                (a.id_usuario2 = ? AND u.id = a.id_usuario1)
            )
            WHERE a.status = 'aceita' AND (a.id_usuario1 = ? OR a.id_usuario2 = ?)
            ORDER BY a.atualizada_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_usuario, id_usuario, id_usuario, id_usuario)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarSolicitacoesRecebidas = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                a.id_usuario1 as id_solicitante,
                u.nome_usuario,
                u.url_avatar,
                u.esta_ativo,
                a.criada_em
            FROM amizades a
            JOIN usuarios u ON a.id_usuario1 = u.id
            WHERE a.id_usuario2 = ? AND a.status = 'pendente' AND a.solicitada_por != ?
            ORDER BY a.criada_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_usuario)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarSolicitacoesEnviadas = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                a.id_usuario2 as id_destinatario,
                u.nome_usuario,
                u.url_avatar,
                u.esta_ativo,
                a.criada_em
            FROM amizades a
            JOIN usuarios u ON a.id_usuario2 = u.id
            WHERE a.id_usuario1 = ? AND a.status = 'pendente' AND a.solicitada_por = ?
            ORDER BY a.criada_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_usuario)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarUsuariosBloqueados = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                CASE 
                    WHEN a.id_usuario1 = ? AND a.solicitada_por = ? THEN a.id_usuario2
                    WHEN a.id_usuario2 = ? AND a.solicitada_por = ? THEN a.id_usuario1
                END as id_bloqueado,
                u.nome_usuario,
                u.url_avatar,
                a.criada_em
            FROM amizades a
            JOIN usuarios u ON (
                (a.id_usuario1 = ? AND a.solicitada_por = ? AND u.id = a.id_usuario2) OR 
                (a.id_usuario2 = ? AND a.solicitada_por = ? AND u.id = a.id_usuario1)
            )
            WHERE a.status = 'bloqueada' AND a.solicitada_por = ?
            ORDER BY a.criada_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_usuario, id_usuario, id_usuario, id_usuario, id_usuario, id_usuario, id_usuario, id_usuario)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const verificarStatusAmizade = async function (id_usuario1, id_usuario2) {
    try {
        let sql = `
            SELECT status, solicitada_por, criada_em, atualizada_em
            FROM amizades 
            WHERE (id_usuario1 = ? AND id_usuario2 = ?) OR (id_usuario1 = ? AND id_usuario2 = ?)
        `
        let result = await prisma.$queryRawUnsafe(sql, Math.min(id_usuario1, id_usuario2), Math.max(id_usuario1, id_usuario2), Math.max(id_usuario1, id_usuario2), Math.min(id_usuario1, id_usuario2))
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const verificarSaoAmigos = async function (id_usuario1, id_usuario2) {
    try {
        let sql = `
            SELECT COUNT(*) as total
            FROM amizades 
            WHERE status = 'aceita' AND ((id_usuario1 = ? AND id_usuario2 = ?) OR (id_usuario1 = ? AND id_usuario2 = ?))
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario1, id_usuario2, id_usuario2, id_usuario1)
        return result && result.length > 0 && result[0].total > 0
    } catch (error) {
        console.log(error)
        return false
    }
}

const verificarEstaBloqueado = async function (id_usuario1, id_usuario2) {
    try {
        let sql = `
            SELECT COUNT(*) as total, solicitada_por
            FROM amizades 
            WHERE status = 'bloqueada' AND ((id_usuario1 = ? AND id_usuario2 = ?) OR (id_usuario1 = ? AND id_usuario2 = ?))
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario1, id_usuario2, id_usuario2, id_usuario1)
        
        if (result && result.length > 0 && result[0].total > 0) {
            return {
                bloqueado: true,
                bloqueado_por: result[0].solicitada_por
            }
        }
        
        return { bloqueado: false }
    } catch (error) {
        console.log(error)
        return { bloqueado: false }
    }
}

const contarAmigosUsuario = async function (id_usuario) {
    try {
        let sql = `
            SELECT COUNT(*) as total
            FROM amizades 
            WHERE status = 'aceita' AND (id_usuario1 = ? OR id_usuario2 = ?)
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_usuario)
        return result && result.length > 0 ? result[0].total : 0
    } catch (error) {
        console.log(error)
        return 0
    }
}

module.exports = {
    enviarSolicitacaoAmizade,
    aceitarSolicitacaoAmizade,
    recusarSolicitacaoAmizade,
    removerAmizade,
    bloquearUsuario,
    desbloquearUsuario,
    listarAmigosUsuario,
    listarSolicitacoesRecebidas,
    listarSolicitacoesEnviadas,
    listarUsuariosBloqueados,
    verificarStatusAmizade,
    verificarSaoAmigos,
    verificarEstaBloqueado,
    contarAmigosUsuario
}
