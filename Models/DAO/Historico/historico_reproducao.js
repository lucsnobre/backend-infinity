const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const registrarReproducao = async function (id_usuario, id_musica, duracao_reproduzida, tipo_dispositivo) {
    try {
        let sql = "INSERT INTO historico_reproducao (id_usuario, id_musica, duracao_reproduzida, tipo_dispositivo) VALUES (?, ?, ?, ?)"
        let params = [
            id_usuario,
            id_musica,
            duracao_reproduzida || 0,
            tipo_dispositivo || 'unknown'
        ]
        let result = await prisma.$queryRawUnsafe(sql, ...params)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarHistoricoUsuario = async function (id_usuario, limite = 50) {
    try {
        let sql = `
            SELECT hr.*, 
                   m.titulo, m.duracao_segundos,
                   a.nome as nome_artista,
                   al.titulo as titulo_album,
                   al.url_capa
            FROM historico_reproducao hr
            JOIN musicas m ON hr.id_musica = m.id
            JOIN artistas a ON m.id_artista = a.id
            LEFT JOIN albuns al ON m.id_album = al.id
            WHERE hr.id_usuario = ?
            ORDER BY hr.reproduzida_em DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarHistoricoUsuarioPorPeriodo = async function (id_usuario, data_inicio, data_fim) {
    try {
        let sql = `
            SELECT hr.*, 
                   m.titulo, m.duracao_segundos,
                   a.nome as nome_artista,
                   al.titulo as titulo_album,
                   al.url_capa
            FROM historico_reproducao hr
            JOIN musicas m ON hr.id_musica = m.id
            JOIN artistas a ON m.id_artista = a.id
            LEFT JOIN albuns al ON m.id_album = al.id
            WHERE hr.id_usuario = ? 
            AND hr.reproduzida_em BETWEEN ? AND ?
            ORDER BY hr.reproduzida_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, data_inicio, data_fim)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterMusicasMaisReproduzidasUsuario = async function (id_usuario, limite = 10) {
    try {
        let sql = `
            SELECT 
                m.id, m.titulo, m.duracao_segundos,
                a.nome as nome_artista,
                al.titulo as titulo_album,
                al.url_capa,
                COUNT(hr.id) as total_reproducoes,
                SUM(hr.duracao_reproduzida) as total_segundos_ouvidos,
                MAX(hr.reproduzida_em) as ultima_reproducao
            FROM historico_reproducao hr
            JOIN musicas m ON hr.id_musica = m.id
            JOIN artistas a ON m.id_artista = a.id
            LEFT JOIN albuns al ON m.id_album = al.id
            WHERE hr.id_usuario = ?
            GROUP BY m.id, m.titulo, m.duracao_segundos, a.nome, al.titulo, al.url_capa
            ORDER BY total_reproducoes DESC, total_segundos_ouvidos DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterArtistasMaisReproduzidosUsuario = async function (id_usuario, limite = 10) {
    try {
        let sql = `
            SELECT 
                a.id, a.nome, a.url_imagem,
                COUNT(DISTINCT hr.id_musica) as musicas_diferentes,
                COUNT(hr.id) as total_reproducoes,
                SUM(hr.duracao_reproduzida) as total_segundos_ouvidos
            FROM historico_reproducao hr
            JOIN musicas m ON hr.id_musica = m.id
            JOIN artistas a ON m.id_artista = a.id
            WHERE hr.id_usuario = ?
            GROUP BY a.id, a.nome, a.url_imagem
            ORDER BY total_reproducoes DESC, total_segundos_ouvidos DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterEstatisticasReproducaoUsuario = async function (id_usuario, periodo_dias = 30) {
    try {
        let sql = `
            SELECT 
                COUNT(DISTINCT hr.id_musica) as musicas_unicas,
                COUNT(DISTINCT m.id_artista) as artistas_unicos,
                COUNT(hr.id) as total_reproducoes,
                SUM(hr.duracao_reproduzida) as total_segundos_ouvidos,
                AVG(hr.duracao_reproduzida) as media_segundos_por_reproducao,
                MAX(hr.reproduzida_em) as ultima_reproducao,
                MIN(hr.reproduzida_em) as primeira_reproducao
            FROM historico_reproducao hr
            JOIN musicas m ON hr.id_musica = m.id
            WHERE hr.id_usuario = ? 
            AND hr.reproduzida_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, periodo_dias)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterHorasMaisAtivasUsuario = async function (id_usuario, periodo_dias = 30) {
    try {
        let sql = `
            SELECT 
                HOUR(hr.reproduzida_em) as hora,
                COUNT(hr.id) as total_reproducoes,
                COUNT(DISTINCT hr.id_musica) as musicas_diferentes
            FROM historico_reproducao hr
            WHERE hr.id_usuario = ? 
            AND hr.reproduzida_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY HOUR(hr.reproduzida_em)
            ORDER BY total_reproducoes DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, periodo_dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterDispositivosMaisUtilizados = async function (id_usuario, periodo_dias = 30) {
    try {
        let sql = `
            SELECT 
                hr.tipo_dispositivo,
                COUNT(hr.id) as total_reproducoes,
                COUNT(DISTINCT hr.id_musica) as musicas_diferentes,
                SUM(hr.duracao_reproduzida) as total_segundos_ouvidos
            FROM historico_reproducao hr
            WHERE hr.id_usuario = ? 
            AND hr.reproduzida_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY hr.tipo_dispositivo
            ORDER BY total_reproducoes DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, periodo_dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const limparHistoricoUsuario = async function (id_usuario, data_limite) {
    try {
        let sql = "DELETE FROM historico_reproducao WHERE id_usuario = ? AND reproduzida_em < ?"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, data_limite)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const verificarMusicaReproduzidaRecentemente = async function (id_usuario, id_musica, minutos = 5) {
    try {
        let sql = `
            SELECT COUNT(*) as total 
            FROM historico_reproducao 
            WHERE id_usuario = ? AND id_musica = ? 
            AND reproduzida_em >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_musica, minutos)
        return result && result.length > 0 && result[0].total > 0
    } catch (error) {
        console.log(error)
        return false
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
    verificarMusicaReproduzidaRecentemente
}
