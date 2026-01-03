const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const criarSalaEscuta = async function (sala) {
    try {
        let sql = "INSERT INTO salas_escuta (nome, id_criador, id_musica_atual, e_publica, max_participantes) VALUES (?, ?, ?, ?, ?)"
        let params = [
            sala.nome,
            sala.id_criador,
            sala.id_musica_atual || null,
            sala.e_publica || false,
            sala.max_participantes || 10
        ]
        let result = await prisma.$queryRawUnsafe(sql, ...params)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const atualizarSalaEscuta = async function (id_sala, sala) {
    try {
        let sql = "UPDATE salas_escuta SET nome = ?, e_publica = ?, max_participantes = ?, atualizada_em = ? WHERE id = ?"
        let params = [
            sala.nome,
            sala.e_publica,
            sala.max_participantes,
            new Date(),
            id_sala
        ]
        let result = await prisma.$queryRawUnsafe(sql, ...params)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const encerrarSalaEscuta = async function (id_sala) {
    try {
        let sql = "UPDATE salas_escuta SET esta_ativa = false, atualizada_em = ? WHERE id = ?"
        let result = await prisma.$queryRawUnsafe(sql, new Date(), id_sala)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarSalasAtivas = async function () {
    try {
        let sql = `
            SELECT 
                s.*,
                u.nome_usuario as nome_criador,
                u.url_avatar as avatar_criador,
                COUNT(ps.id_usuario) as total_participantes,
                m.titulo as musica_atual_titulo,
                a.nome as artista_atual_nome,
                s.posicao_atual
            FROM salas_escuta s
            JOIN usuarios u ON s.id_criador = u.id
            LEFT JOIN musicas m ON s.id_musica_atual = m.id
            LEFT JOIN artistas a ON m.id_artista = a.id
            LEFT JOIN participantes_sala ps ON s.id = ps.id_sala
            WHERE s.esta_ativa = true
            GROUP BY s.id, u.nome_usuario, u.url_avatar, m.titulo, a.nome, s.posicao_atual
            ORDER BY s.e_publica DESC, s.criada_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarSalasPublicas = async function () {
    try {
        let sql = `
            SELECT 
                s.*,
                u.nome_usuario as nome_criador,
                u.url_avatar as avatar_criador,
                COUNT(ps.id_usuario) as total_participantes,
                m.titulo as musica_atual_titulo,
                a.nome as artista_atual_nome,
                s.posicao_atual
            FROM salas_escuta s
            JOIN usuarios u ON s.id_criador = u.id
            LEFT JOIN musicas m ON s.id_musica_atual = m.id
            LEFT JOIN artistas a ON m.id_artista = a.id
            LEFT JOIN participantes_sala ps ON s.id = ps.id_sala
            WHERE s.esta_ativa = true AND s.e_publica = true
            GROUP BY s.id, u.nome_usuario, u.url_avatar, m.titulo, a.nome, s.posicao_atual
            ORDER BY total_participantes DESC, s.criada_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarSalaPorID = async function (id_sala) {
    try {
        let sql = `
            SELECT 
                s.*,
                u.nome_usuario as nome_criador,
                u.url_avatar as avatar_criador,
                m.titulo as musica_atual_titulo,
                m.duracao_segundos as musica_atual_duracao,
                a.nome as artista_atual_nome,
                al.titulo as album_atual_titulo,
                al.url_capa as album_atual_capa
            FROM salas_escuta s
            JOIN usuarios u ON s.id_criador = u.id
            LEFT JOIN musicas m ON s.id_musica_atual = m.id
            LEFT JOIN artistas a ON m.id_artista = a.id
            LEFT JOIN albuns al ON m.id_album = al.id
            WHERE s.id = ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_sala)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarSalasUsuario = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                s.*,
                COUNT(ps.id_usuario) as total_participantes,
                m.titulo as musica_atual_titulo,
                a.nome as artista_atual_nome,
                CASE 
                    WHEN s.id_criador = ? THEN 'criador'
                    ELSE 'participante'
                END as papel_usuario
            FROM salas_escuta s
            LEFT JOIN musicas m ON s.id_musica_atual = m.id
            LEFT JOIN artistas a ON m.id_artista = a.id
            LEFT JOIN participantes_sala ps ON s.id = ps.id_sala
            WHERE (s.id_criador = ? OR s.id IN (
                SELECT id_sala FROM participantes_sala WHERE id_usuario = ?
            )) AND s.esta_ativa = true
            GROUP BY s.id, m.titulo, a.nome
            ORDER BY s.atualizada_em DESC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario, id_usuario, id_usuario)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const entrarNaSala = async function (id_sala, id_usuario) {
    try {
        let sql = "INSERT INTO participantes_sala (id_sala, id_usuario, e_admin) VALUES (?, ?, false)"
        let result = await prisma.$queryRawUnsafe(sql, id_sala, id_usuario)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const sairDaSala = async function (id_sala, id_usuario) {
    try {
        let sql = "DELETE FROM participantes_sala WHERE id_sala = ? AND id_usuario = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_sala, id_usuario)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarParticipantesSala = async function (id_sala) {
    try {
        let sql = `
            SELECT 
                ps.*,
                u.nome_usuario,
                u.url_avatar,
                u.esta_ativo,
                u.e_premium,
                CASE 
                    WHEN s.id_criador = u.id THEN true 
                    ELSE ps.e_admin 
                END as e_admin_real
            FROM participantes_sala ps
            JOIN usuarios u ON ps.id_usuario = u.id
            JOIN salas_escuta s ON ps.id_sala = s.id
            WHERE ps.id_sala = ?
            ORDER BY ps.e_admin DESC, ps.entrou_em ASC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_sala)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const verificarParticipanteSala = async function (id_sala, id_usuario) {
    try {
        let sql = "SELECT * FROM participantes_sala WHERE id_sala = ? AND id_usuario = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_sala, id_usuario)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const contarParticipantesSala = async function (id_sala) {
    try {
        let sql = "SELECT COUNT(*) as total FROM participantes_sala WHERE id_sala = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_sala)
        return result && result.length > 0 ? result[0].total : 0
    } catch (error) {
        console.log(error)
        return 0
    }
}

const atualizarMusicaAtualSala = async function (id_sala, id_musica, posicao = 0) {
    try {
        let sql = "UPDATE salas_escuta SET id_musica_atual = ?, posicao_atual = ?, atualizada_em = ? WHERE id = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_musica, posicao, new Date(), id_sala)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const atualizarEstadoReproducaoSala = async function (id_sala, esta_reproduzindo, posicao_atual) {
    try {
        let sql = "UPDATE salas_escuta SET esta_reproduzindo = ?, posicao_atual = ?, atualizada_em = ? WHERE id = ?"
        let result = await prisma.$queryRawUnsafe(sql, esta_reproduzindo, posicao_atual, new Date(), id_sala)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const adicionarMusicaFila = async function (id_sala, id_musica, id_usuario) {
    try {
        let sql = "SELECT COALESCE(MAX(posicao), 0) + 1 as proxima_posicao FROM fila_sala WHERE id_sala = ?"
        let resultPosicao = await prisma.$queryRawUnsafe(sql, id_sala)
        let proximaPosicao = resultPosicao && resultPosicao.length > 0 ? resultPosicao[0].proxima_posicao : 1

        let sqlInsert = "INSERT INTO fila_sala (id_sala, id_musica, adicionada_por, posicao) VALUES (?, ?, ?, ?)"
        let result = await prisma.$queryRawUnsafe(sqlInsert, id_sala, id_musica, id_usuario, proximaPosicao)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const removerMusicaFila = async function (id_sala, id_musica) {
    try {
        let sql = "DELETE FROM fila_sala WHERE id_sala = ? AND id_musica = ?"
        let result = await prisma.$queryRawUnsafe(sql, id_sala, id_musica)
        
        if (result) {
            await reorganizarFilaSala(id_sala)
        }
        
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const listarFilaSala = async function (id_sala) {
    try {
        let sql = `
            SELECT 
                fs.*,
                m.titulo, m.duracao_segundos,
                a.nome as nome_artista,
                al.titulo as titulo_album,
                al.url_capa,
                u_adicionou.nome_usuario as adicionado_por_nome
            FROM fila_sala fs
            JOIN musicas m ON fs.id_musica = m.id
            JOIN artistas a ON m.id_artista = a.id
            LEFT JOIN albuns al ON m.id_album = al.id
            JOIN usuarios u_adicionou ON fs.adicionado_por = u_adicionou.id
            WHERE fs.id_sala = ?
            ORDER BY fs.posicao ASC
        `
        let result = await prisma.$queryRawUnsafe(sql, id_sala)
        return result && result.length > 0 ? result : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const reorganizarFilaSala = async function (id_sala) {
    try {
        let sql = `
            UPDATE fila_sala 
            SET posicao = (
                SELECT ROW_NUMBER() OVER (ORDER BY adicionada_em) - 1
                FROM fila_sala fs2
                WHERE fs2.id_sala = fila_sala.id_sala
            )
            WHERE id_sala = ?
        `
        await prisma.$queryRawUnsafe(sql, id_sala)
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

const proximaMusicaFila = async function (id_sala) {
    try {
        let sql = `
            SELECT id_musica 
            FROM fila_sala 
            WHERE id_sala = ? 
            ORDER BY posicao ASC 
            LIMIT 1
        `
        let result = await prisma.$queryRawUnsafe(sql, id_sala)
        return result && result.length > 0 ? result[0].id_musica : null
    } catch (error) {
        console.log(error)
        return null
    }
}

const removerPrimeiraMusicaFila = async function (id_sala) {
    try {
        let sql = `
            DELETE FROM fila_sala 
            WHERE id_sala = ? AND posicao = (
                SELECT MIN(posicao) FROM fila_sala WHERE id_sala = ?
            )
        `
        let result = await prisma.$queryRawUnsafe(sql, id_sala, id_sala)
        
        if (result) {
            await reorganizarFilaSala(id_sala)
        }
        
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
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
    removerPrimeiraMusicaFila
}
