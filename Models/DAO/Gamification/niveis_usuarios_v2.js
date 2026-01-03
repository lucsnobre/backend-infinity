const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const criarNivelUsuario = async function (id_usuario) {
    try {
        let sql = "INSERT INTO niveis_usuarios (id_usuario, nivel, pontos_experiencia, tempo_total_reproducao, total_musicas_descobertas) VALUES (?, 1, 0, 0, 0)"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const adicionarExperiencia = async function (id_usuario, pontos_xp) {
    try {
        let sql = "UPDATE niveis_usuarios SET pontos_experiencia = pontos_experiencia + ?, atualizado_em = ? WHERE id_usuario = ?"
        let result = await prisma.$queryRawUnsafe(sql, pontos_xp, new Date(), id_usuario)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const atualizarTempoReproducao = async function (id_usuario, minutos_adicionais) {
    try {
        let sql = "UPDATE niveis_usuarios SET tempo_total_reproducao = tempo_total_reproducao + ?, atualizado_em = ? WHERE id_usuario = ?"
        let result = await prisma.$queryRawUnsafe(sql, minutos_adicionais, new Date(), id_usuario)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const incrementarMusicasDescobertas = async function (id_usuario) {
    try {
        let sql = "UPDATE niveis_usuarios SET total_musicas_descobertas = total_musicas_descobertas + 1, atualizado_em = ? WHERE id_usuario = ?"
        let result = await prisma.$queryRawUnsafe(sql, new Date(), id_usuario)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const verificarEAtualizarNivel = async function (id_usuario) {
    try {
        let sql = "SELECT * FROM niveis_usuarios WHERE id_usuario = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        
        if (!result || result.length === 0) {
            return false
        }
        
        const nivelAtual = result[0]
        const xpAtual = nivelAtual.pontos_experiencia
        const novoNivel = calcularNivelPorXP(xpAtual)
        
        if (novoNivel > nivelAtual.nivel) {
            let sqlUpdate = "UPDATE niveis_usuarios SET nivel = ?, atualizado_em = ? WHERE id_usuario = ?"
            await prisma.$queryRawUnsafe(sql, novoNivel, new Date(), id_usuario)
            return {nivelAnterior: nivelAtual.nivel, novoNivel: novoNivel}
        }
        
        return false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterNivelUsuario = async function (id_usuario) {
    try {
        let sql = "SELECT * FROM niveis_usuarios WHERE id_usuario = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const calcularXPProximoNivel = function (nivel) {
    const xpBase = 100
    const multiplicador = 1.5
    return Math.floor(xpBase * Math.pow(multiplicador, nivel - 1))
}

const calcularXPTotalNivel = function (nivel) {
    let xpTotal = 0
    for (let i = 1; i <= nivel; i++) {
        xpTotal += calcularXPProximoNivel(i)
    }
    return xpTotal
}

const calcularNivelPorXP = function (xp_total) {
    let nivel = 1
    let xpAcumulado = 0
    
    while (xpAcumulado + calcularXPProximoNivel(nivel) <= xp_total) {
        xpAcumulado += calcularXPProximoNivel(nivel)
        nivel++
    }
    
    return nivel
}

const obterProgressoNivel = function (xp_atual, nivel_atual) {
    const xpNivelAnterior = calcularXPTotalNivel(nivel_atual - 1)
    const xpProximoNivel = calcularXPProximoNivel(nivel_atual)
    const xpNecessarioNivel = calcularXPProximoNivel(nivel_atual)
    const xpProgressoNivel = xp_atual - xpNivelAnterior
    
    return {
        xp_atual: xp_atual,
        nivel_atual: nivel_atual,
        xp_necessario_nivel: xpNecessarioNivel,
        xp_progresso_nivel: xpProgressoNivel,
        xp_total_proximo_nivel: xpNivelAnterior + xpNecessarioNivel,
        percentual_concluido: Math.min(100, Math.round((xpProgressoNivel / xpNecessarioNivel) * 100))
    }
}

const listarRankingNiveis = async function (limite = 50) {
    try {
        let sql = `
            SELECT 
                nu.*,
                u.nome_usuario,
                u.url_avatar,
                u.esta_ativo,
                u.e_premium
            FROM niveis_usuarios nu
            JOIN usuarios u ON nu.id_usuario = u.id
            ORDER BY nu.nivel DESC, nu.pontos_experiencia DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarRankingXP = async function (limite = 50) {
    try {
        let sql = `
            SELECT 
                nu.*,
                u.nome_usuario,
                u.url_avatar,
                u.esta_ativo,
                u.e_premium
            FROM niveis_usuarios nu
            JOIN usuarios u ON nu.id_usuario = u.id
            ORDER BY nu.pontos_experiencia DESC, nu.nivel DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarRankingTempoReproducao = async function (limite = 50) {
    try {
        let sql = `
            SELECT 
                nu.*,
                u.nome_usuario,
                u.url_avatar,
                u.esta_ativo,
                u.e_premium
            FROM niveis_usuarios nu
            JOIN usuarios u ON nu.id_usuario = u.id
            ORDER BY nu.tempo_total_reproducao DESC, nu.nivel DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarRankingMusicasDescobertas = async function (limite = 50) {
    try {
        let sql = `
            SELECT 
                nu.*,
                u.nome_usuario,
                u.url_avatar,
                u.esta_ativo,
                u.e_premium
            FROM niveis_usuarios nu
            JOIN usuarios u ON nu.id_usuario = u.id
            ORDER BY nu.total_musicas_descobertas DESC, nu.nivel DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterEstatisticasGeraisNiveis = async function () {
    try {
        let sql = `
            SELECT 
                COUNT(*) as total_usuarios,
                AVG(nivel) as media_nivel,
                MAX(nivel) as max_nivel,
                MIN(nivel) as min_nivel,
                AVG(pontos_experiencia) as media_xp,
                SUM(pontos_experiencia) as total_xp,
                AVG(tempo_total_reproducao) as media_tempo,
                SUM(tempo_total_reproducao) as total_tempo,
                AVG(total_musicas_descobertas) as total_musicas,
                SUM(total_musicas_descobertas) as total_musicas_geral
            FROM niveis_usuarios
        `
        let result = await prisma.$queryRawUnsafe(sql)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterDistribuicaoNiveis = async function () {
    try {
        let sql = `
            SELECT 
                nivel,
                COUNT(*) as total_usuarios,
                AVG(pontos_experiencia) as media_xp_nivel,
                SUM(tempo_total_reproducao) as media_tempo_nivel,
                SUM(total_musicas_descobertas) as total_musicas_nivel
            FROM niveis_usuarios
            GROUP BY nivel
            ORDER BY nivel ASC
        `
        let result = await prisma.$queryRawUnsafe(sql)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterPosicaoRanking = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                (SELECT COUNT(*) + 1 FROM niveis_usuarios nu2 WHERE nu2.nivel > nu.nivel OR (nu2.nivel = nu.nivel AND nu2.pontos_experiencia > nu.pontos_experiencia)) as posicao_ranking_nivel,
                (SELECT COUNT(*) + 1 FROM niveis_usuarios nu3 WHERE nu3.pontos_experiencia > nu.pontos_experiencia) as posicao_ranking_xp,
                (SELECT COUNT(*) + 1 FROM niveis_usuarios nu4 WHERE nu4.tempo_total_reproducao > nu.tempo_total_reproducao) as posicao_ranking_tempo,
                (SELECT COUNT(*) + 1 FROM niveis_usuarios nu5 WHERE nu5.total_musicas_descobertas > nu.total_musicas_descobertas) as posicao_ranking_musicas
            FROM niveis_usuarios nu
            WHERE nu.id_usuario = ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterUsuariosPorNivel = async function (nivel_min, nivel_max) {
    try {
        let sql = `
            SELECT 
                nu.*,
                u.nome_usuario,
                u.url_avatar,
                u.esta_ativo,
                u.e_premium
            FROM niveis_usuarios nu
            JOIN usuarios u ON nu.id_usuario = u.id
            WHERE nu.nivel BETWEEN ? AND ?
            ORDER BY nu.nivel DESC, nu.pontos_experiencia DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, nivel_min, nivel_max)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const calcularRecompensasNivel = function (nivel) {
    const recompensas = {
        bonus_xp: 0,
        titulo: '',
        beneficios: []
    }
    
    if (nivel % 5 === 0) {
        recompensas.bonus_xp = nivel * 10
        recompensas.titulo = `Mestre Nível ${nivel}`
        recompensas.beneficios.push('Acesso a playlists exclusivas')
    }
    
    if (nivel % 10 === 0) {
        recompensas.bonus_xp += nivel * 25
        recompensas.titulo = `Lendário Nível ${nivel}`
        recompensas.beneficios.push('Badge especial no perfil')
        recompensas.beneficios.push('Acesso antecipado a novidades')
    }
    
    if (nivel % 25 === 0) {
        recompensas.bonus_xp += nivel * 50
        recompensas.titulo = `Mítico Nível ${nivel}`
        recompensas.beneficios.push('Status VIP temporário')
        recompensas.beneficios.push('Acesso a salas exclusivas')
    }
    
    if (nivel >= 50) {
        recompensas.titulo = recompensas.titulo || 'Veterano Supremo'
        recompensas.beneficios.push('Acesso vitalício a recursos premium')
    }
    
    return recompensas
}

const obterProximoNivelUsuario = async function (id_usuario) {
    try {
        const nivelAtual = await obterNivelUsuario(id_usuario)
        if (!nivelAtual) {
            return {status: false, proximo_nivel: 1, xp_necessario: calcularXPProximoNivel(1)}
        }

        const proximoNivel = nivelAtual.nivel + 1
        const xpAtual = nivelAtual.pontos_experiencia
        const xpNecessario = calcularXPProximoNivel(proximoNivel)
        const xpTotalProximoNivel = calcularXPTotalNivel(proximoNivel)

        return {
            status: true,
            nivel_atual: nivelAtual.nivel,
            proximo_nivel: proximoNivel,
            xp_atual: xpAtual,
            xp_necessario: xpNecessario,
            xp_total_proximo_nivel: xpTotalProximoNivel,
            percentual_concluido: Math.min(100, Math.round(((xpAtual - calcularXPTotalNivel(nivelAtual.nivel)) / xpNecessario) * 100))
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
    verificarEAtualizarNivel,
    obterNivelUsuario,
    calcularXPProximoNivel,
    calcularXPTotalNivel,
    calcularNivelPorXP,
    obterProgressoNivel,
    listarRankingNiveis,
    listarRankingXP,
    listarRankingTempoReproducao,
    listarRankingMusicasDescobertas,
    obterEstatisticasGeraisNiveis,
    obterDistribuicaoNiveis,
    obterPosicaoRanking,
    obterUsuariosPorNivel,
    calcularRecompensasNivel,
    obterProximoNivelUsuario
}
