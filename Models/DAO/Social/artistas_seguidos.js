const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const seguirArtista = async function (id_usuario, id_artista) {
    try {
        let sql = "INSERT INTO artistas_seguidos (id_usuario, id_artista) VALUES (?, ?)"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_artista)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const deixarSeguirArtista = async function (id_usuario, id_artista) {
    try {
        let sql = "DELETE FROM artistas_seguidos WHERE id_usuario = ? AND id_artista = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_artista)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarArtistasSeguidosUsuario = async function (id_usuario, limite = 50) {
    try {
        let sql = `
            SELECT 
                a.id, a.nome, a.biografia, a.url_imagem, a.pais, a.ano_formacao, 
                a.verificado, a.ouvintes_mensais, a.criado_em,
                as_.seguido_em,
                COUNT(DISTINCT al.id) as total_albuns,
                COUNT(DISTINCT m.id) as total_musicas
            FROM artistas_seguidos as_
            JOIN artistas a ON as_.id_artista = a.id
            LEFT JOIN albuns al ON a.id = al.id_artista
            LEFT JOIN musicas m ON a.id = m.id_artista
            WHERE as_.id_usuario = ?
            GROUP BY a.id, a.nome, a.biografia, a.url_imagem, a.pais, a.ano_formacao, 
                     a.verificado, a.ouvintes_mensais, a.criado_em, as_.seguido_em
            ORDER BY as_.seguido_em DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarSeguidoresArtista = async function (id_artista, limite = 50) {
    try {
        let sql = `
            SELECT 
                u.id, u.nome_usuario, u.url_avatar, u.esta_ativo, u.e_premium,
                as_.seguido_em
            FROM artistas_seguidos as_
            JOIN usuarios u ON as_.id_usuario = u.id
            WHERE as_.id_artista = ?
            ORDER BY as_.seguido_em DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_artista, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const verificarUsuarioSegueArtista = async function (id_usuario, id_artista) {
    try {
        let sql = "SELECT * FROM artistas_seguidos WHERE id_usuario = ? AND id_artista = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_artista)
        return result && result.length > 0 ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const contarSeguidoresArtista = async function (id_artista) {
    try {
        let sql = "SELECT COUNT(*) as total FROM artistas_seguidos WHERE id_artista = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_artista)
        return result && result.length > 0 ? result[0].total : 0
    } catch (error) {
        console.log(error)
        return 0
    }
}

const contarArtistasSeguidosUsuario = async function (id_usuario) {
    try {
        let sql = "SELECT COUNT(*) as total FROM artistas_seguidos WHERE id_usuario = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result[0].total : 0
    } catch (error) {
        console.log(error)
        return 0
    }
}

const obterArtistasMaisSeguidos = async function (limite = 10) {
    try {
        let sql = `
            SELECT 
                a.id, a.nome, a.url_imagem, a.verificado, a.ouvintes_mensais,
                COUNT(as_.id_usuario) as total_seguidores,
                MAX(as_.seguido_em) as ultimo_seguidor_em
            FROM artistas a
            LEFT JOIN artistas_seguidos as_ ON a.id = as_.id_artista
            GROUP BY a.id, a.nome, a.url_imagem, a.verificado, a.ouvintes_mensais
            HAVING total_seguidores > 0
            ORDER BY total_seguidores DESC, a.ouvintes_mensais DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterNovosArtistasSeguidosUsuario = async function (id_usuario, dias = 30) {
    try {
        let sql = `
            SELECT 
                a.id, a.nome, a.url_imagem, a.verificado, a.pais,
                as_.seguido_em,
                COUNT(DISTINCT m.id) as total_musicas_disponiveis
            FROM artistas_seguidos as_
            JOIN artistas a ON as_.id_artista = a.id
            LEFT JOIN musicas m ON a.id = m.id_artista
            WHERE as_.id_usuario = ? 
            AND as_.seguido_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY a.id, a.nome, a.url_imagem, a.verificado, a.pais, as_.seguido_em
            ORDER BY as_.seguido_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, dias)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterEstatisticasSeguimentoUsuario = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                COUNT(*) as total_artistas_seguidos,
                COUNT(DISTINCT a.pais) as total_paises_diferentes,
                COUNT(DISTINCT a.ano_formacao) as total_geracoes_diferentes,
                SUM(CASE WHEN a.verificado = true THEN 1 ELSE 0 END) as total_artistas_verificados,
                AVG(a.ouvintes_mensais) as media_ouvintes_mensais,
                MAX(a.ouvintes_mensais) as max_ouvintes_mensais,
                MIN(a.ouvintes_mensais) as min_ouvintes_mensais,
                MIN(as_.seguido_em) as primeiro_seguimento_em,
                MAX(as_.seguido_em) as ultimo_seguimento_em
            FROM artistas_seguidos as_
            JOIN artistas a ON as_.id_artista = a.id
            WHERE as_.id_usuario = ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const buscarArtistasSeguidosPorNome = async function (id_usuario, termo_busca) {
    try {
        let sql = `
            SELECT 
                a.id, a.nome, a.url_imagem, a.verificado, a.pais, a.ouvintes_mensais,
                as_.seguido_em,
                COUNT(DISTINCT al.id) as total_albuns
            FROM artistas_seguidos as_
            JOIN artistas a ON as_.id_artista = a.id
            LEFT JOIN albuns al ON a.id = al.id_artista
            WHERE as_.id_usuario = ? AND a.nome LIKE ?
            GROUP BY a.id, a.nome, a.url_imagem, a.verificado, a.pais, a.ouvintes_mensais, as_.seguido_em
            ORDER BY as_.seguido_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, `%${termo_busca}%`)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterArtistasRecomendadosPorSeguimento = async function (id_usuario, limite = 10) {
    try {
        let sql = `
            SELECT 
                a.id, a.nome, a.url_imagem, a.verificado, a.pais, a.ouvintes_mensais,
                COUNT(DISTINCT as2.id_usuario) as seguidores_em_comum,
                COUNT(DISTINCT al.id) as total_albuns,
                COUNT(DISTINCT m.id) as total_musicas
            FROM artistas a
            LEFT JOIN artistas_seguidos as1 ON a.id = as1.id_artista AND as1.id_usuario = ?
            JOIN artistas_seguidos as2 ON a.id = as2.id_artista AND as2.id_usuario != ?
            JOIN artistas_seguidos as3 ON as2.id_usuario = as3.id_usuario AND as3.id_artista != a.id
            LEFT JOIN albuns al ON a.id = al.id_artista
            LEFT JOIN musicas m ON a.id = m.id_artista
            WHERE as1.id_artista IS NULL
            AND as2.id_usuario IN (
                SELECT as4.id_usuario 
                FROM artistas_seguidos as4 
                WHERE as4.id_usuario = ?
            )
            GROUP BY a.id, a.nome, a.url_imagem, a.verificado, a.pais, a.ouvintes_mensais
            HAVING seguidores_em_comum >= 2
            ORDER BY seguidores_em_comum DESC, a.ouvintes_mensais DESC
            LIMIT ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_usuario, id_usuario, limite)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

module.exports = {
    seguirArtista,
    deixarSeguirArtista,
    listarArtistasSeguidosUsuario,
    listarSeguidoresArtista,
    verificarUsuarioSegueArtista,
    contarSeguidoresArtista,
    contarArtistasSeguidosUsuario,
    obterArtistasMaisSeguidos,
    obterNovosArtistasSeguidosUsuario,
    obterEstatisticasSeguimentoUsuario,
    buscarArtistasSeguidosPorNome,
    obterArtistasRecomendadosPorSeguimento
}
