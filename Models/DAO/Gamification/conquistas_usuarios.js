const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const desbloquearConquista = async function (id_usuario, id_conquista, dados_progresso = null) {
    try {
        let sql = "INSERT INTO conquistas_usuarios (id_usuario, id_conquista, dados_progresso) VALUES (?, ?, ?)"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_conquista, dados_progresso ? JSON.stringify(dados_progresso) : null)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const atualizarProgressoConquista = async function (id_usuario, id_conquista, dados_progresso) {
    try {
        let sql = "UPDATE conquistas_usuarios SET dados_progresso = ? WHERE id_usuario = ? AND id_conquista = ?"
        let result = await prisma.$queryRawUnsafe(sql, JSON.stringify(dados_progresso), id_usuario, id_conquista)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarConquistasUsuario = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                cu.*,
                c.nome as nome_conquista,
                c.descricao as descricao_conquista,
                c.url_icone as url_icone_conquista,
                c.categoria as categoria_conquista,
                c.raridade as raridade_conquista,
                c.valor_pontos as valor_pontos_conquista
            FROM conquistas_usuarios cu
            JOIN conquistas c ON cu.id_conquista = c.id
            WHERE cu.id_usuario = ?
            ORDER BY cu.conquistada_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarConquistasPorCategoria = async function (id_usuario, categoria) {
    try {
        let sql = `
            SELECT 
                cu.*,
                c.nome as nome_conquista,
                c.descricao as descricao_conquista,
                c.url_icone as url_icone_conquista,
                c.raridade as raridade_conquista,
                c.valor_pontos as valor_pontos_conquista
            FROM conquistas_usuarios cu
            JOIN conquistas c ON cu.id_conquista = c.id
            WHERE cu.id_usuario = ? AND c.categoria = ?
            ORDER BY cu.conquistada_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, categoria)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const verificarConquistaDesbloqueada = async function (id_usuario, id_conquista) {
    try {
        let sql = "SELECT * FROM conquistas_usuarios WHERE id_usuario = ? AND id_conquista = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_conquista)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const contarConquistasUsuario = async function (id_usuario) {
    try {
        let sql = "SELECT COUNT(*) as total FROM conquistas_usuarios WHERE id_usuario = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result[0].total : 0
    } catch (error) {
        console.log(error)
        return 0
    }
}

const contarConquistasPorCategoria = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                c.categoria,
                COUNT(*) as total_conquistas,
                SUM(c.valor_pontos) as total_pontos
            FROM conquistas_usuarios cu
            JOIN conquistas c ON cu.id_conquista = c.id
            WHERE cu.id_usuario = ?
            GROUP BY c.categoria
            ORDER BY total_conquistas DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const contarConquistasPorRaridade = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                c.raridade,
                COUNT(*) as total_conquistas,
                SUM(c.valor_pontos) as total_pontos
            FROM conquistas_usuarios cu
            JOIN conquistas c ON cu.id_conquista = c.id
            WHERE cu.id_usuario = ?
            GROUP BY c.raridade
            ORDER BY 
                CASE c.raridade 
                    WHEN 'comum' THEN 1 
                    WHEN 'raro' THEN 2 
                    WHEN 'epico' THEN 3 
                    WHEN 'lendario' THEN 4 
                END
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const calcularPontosTotaisUsuario = async function (id_usuario) {
    try {
        let sql = `
            SELECT SUM(c.valor_pontos) as total_pontos
            FROM conquistas_usuarios cu
            JOIN conquistas c ON cu.id_conquista = c.id
            WHERE cu.id_usuario = ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result[0].total_pontos || 0 : 0
    } catch (error) {
        console.log(error)
        return 0
    }
}

const obterConquistasRecentes = async function (id_usuario, limite = 10) {
    try {
        let sql = `
            SELECT 
                cu.*,
                c.nome as nome_conquista,
                c.descricao as descricao_conquista,
                c.url_icone as url_icone_conquista,
                c.raridade as raridade_conquista,
                c.valor_pontos as valor_pontos_conquista
            FROM conquistas_usuarios cu
            JOIN conquistas c ON cu.id_conquista = c.id
            WHERE cu.id_usuario = ?
            ORDER BY cu.conquistada_em DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterEstatisticasConquistasUsuario = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                COUNT(*) as total_conquistas,
                COUNT(DISTINCT c.categoria) as total_categorias,
                SUM(c.valor_pontos) as total_pontos,
                AVG(c.valor_pontos) as media_pontos,
                MAX(c.valor_pontos) as max_pontos,
                MIN(c.valor_pontos) as min_pontos,
                MIN(cu.conquistada_em) as primeira_conquista,
                MAX(cu.conquistada_em) as ultima_conquista,
                COUNT(DISTINCT CASE WHEN c.raridade = 'lendario' THEN 1 END) as total_lendarias,
                COUNT(DISTINCT CASE WHEN c.raridade = 'epico' THEN 1 END) as total_epicas,
                COUNT(DISTINCT CASE WHEN c.raridade = 'raro' THEN 1 END) as total_raras,
                COUNT(DISTINCT CASE WHEN c.raridade = 'comum' THEN 1 END) as total_comuns
            FROM conquistas_usuarios cu
            JOIN conquistas c ON cu.id_conquista = c.id
            WHERE cu.id_usuario = ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterConquistasNaoDesbloqueadas = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                c.*,
                CASE WHEN cu.id_usuario IS NOT NULL THEN true ELSE false END as desbloqueada
            FROM conquistas c
            LEFT JOIN conquistas_usuarios cu ON c.id = cu.id_conquista AND cu.id_usuario = ?
            WHERE cu.id_usuario IS NULL
            ORDER BY c.categoria, c.valor_pontos
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterProgressoConquista = async function (id_usuario, id_conquista) {
    try {
        let sql = `
            SELECT 
                cu.*,
                c.nome as nome_conquista,
                c.descricao as descricao_conquista,
                c.categoria as categoria_conquista,
                c.valor_pontos as valor_pontos_conquista
            FROM conquistas_usuarios cu
            JOIN conquistas c ON cu.id_conquista = c.id
            WHERE cu.id_usuario = ? AND cu.id_conquista = ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_conquista)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarUsuariosPorConquista = async function (id_conquista, limite = 50) {
    try {
        let sql = `
            SELECT 
                cu.id_usuario,
                u.nome_usuario,
                u.url_avatar,
                cu.conquistada_em,
                c.nome as nome_conquista,
                c.raridade as raridade_conquista
            FROM conquistas_usuarios cu
            JOIN usuarios u ON cu.id_usuario = u.id
            JOIN conquistas c ON cu.id_conquista = c.id
            WHERE cu.id_conquista = ?
            ORDER BY cu.conquistada_em DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_conquista, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterRankingPontos = async function (limite = 100) {
    try {
        let sql = `
            SELECT 
                cu.id_usuario,
                u.nome_usuario,
                u.url_avatar,
                COUNT(*) as total_conquistas,
                SUM(c.valor_pontos) as total_pontos,
                MAX(cu.conquistada_em) as ultima_conquista
            FROM conquistas_usuarios cu
            JOIN usuarios u ON cu.id_usuario = u.id
            JOIN conquistas c ON cu.id_conquista = c.id
            GROUP BY cu.id_usuario, u.nome_usuario, u.url_avatar
            ORDER BY total_pontos DESC, total_conquistas DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const verificarConquistasDisponiveis = async function (id_usuario, categoria = null) {
    try {
        let baseSql = `
            SELECT c.*, 
                   CASE WHEN cu.id_usuario IS NOT NULL THEN true ELSE false END as desbloqueada
            FROM conquistas c
            LEFT JOIN conquistas_usuarios cu ON c.id = cu.id_conquista AND cu.id_usuario = ?
        `
        
        let params = [id_usuario]
        
        if (categoria) {
            baseSql += " WHERE c.categoria = ?"
            params.push(categoria)
        }
        
        baseSql += " ORDER BY c.categoria, c.valor_pontos"
        
        let result = await prisma.$queryRawUnsafe(baseSql, ...params)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
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
    verificarConquistasDisponiveis
}
