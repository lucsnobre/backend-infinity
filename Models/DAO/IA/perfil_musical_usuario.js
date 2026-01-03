const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const criarPerfilMusicalUsuario = async function (id_usuario, dados_perfil) {
    try {
        let sql = `
            INSERT INTO perfil_musical_usuario 
            (id_usuario, tipo_personalidade, preferencia_energia, preferencia_valencia, preferencia_danca, preferencia_acustica, 
             tempo_preferencia_min, tempo_preferencia_max, pesos_generos, pesos_artistas, 
             padroes_hora_dia, padroes_clima, padroes_humor, ultima_analise) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
        let params = [
            id_usuario,
            dados_perfil.tipo_personalidade || null,
            dados_perfil.preferencia_energia || 0.50,
            dados_perfil.preferencia_valencia || 0.50,
            dados_perfil.preferencia_danca || 0.50,
            dados_perfil.preferencia_acustica || 0.50,
            dados_perfil.tempo_preferencia_min || 60.00,
            dados_perfil.tempo_preferencia_max || 140.00,
            dados_perfil.pesos_generos ? JSON.stringify(dados_perfil.pesos_generos) : null,
            dados_perfil.pesos_artistas ? JSON.stringify(dados_perfil.pesos_artistas) : null,
            dados_perfil.padroes_hora_dia ? JSON.stringify(dados_perfil.padroes_hora_dia) : null,
            dados_perfil.padroes_clima ? JSON.stringify(dados_perfil.padroes_clima) : null,
            dados_perfil.padroes_humor ? JSON.stringify(dados_perfil.padroes_humor) : null,
            new Date()
        ]
        let result = await prisma.$queryRawUnsafe(sql, ...params)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const atualizarPerfilMusicalUsuario = async function (id_usuario, dados_perfil) {
    try {
        let sql = `
            UPDATE perfil_musical_usuario 
            SET tipo_personalidade = ?, preferencia_energia = ?, preferencia_valencia = ?, preferencia_danca = ?, preferencia_acustica = ?,
                tempo_preferencia_min = ?, tempo_preferencia_max = ?, pesos_generos = ?, pesos_artistas = ?,
                padroes_hora_dia = ?, padroes_clima = ?, padroes_humor = ?, ultima_analise = ?
            WHERE id_usuario = ?
        `
        let params = [
            dados_perfil.tipo_personalidade || null,
            dados_perfil.preferencia_energia || 0.50,
            dados_perfil.preferencia_valencia || 0.50,
            dados_perfil.preferencia_danca || 0.50,
            dados_perfil.preferencia_acustica || 0.50,
            dados_perfil.tempo_preferencia_min || 60.00,
            dados_perfil.tempo_preferencia_max || 140.00,
            dados_perfil.pesos_generos ? JSON.stringify(dados_perfil.pesos_generos) : null,
            dados_perfil.pesos_artistas ? JSON.stringify(dados_perfil.pesos_artistas) : null,
            dados_perfil.padroes_hora_dia ? JSON.stringify(dados_perfil.padroes_hora_dia) : null,
            dados_perfil.padroes_clima ? JSON.stringify(dados_perfil.padroes_clima) : null,
            dados_perfil.padroes_humor ? JSON.stringify(dados_perfil.padroes_humor) : null,
            new Date(),
            id_usuario
        ]
        let result = await prisma.$queryRawUnsafe(sql, ...params)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterPerfilMusicalUsuario = async function (id_usuario) {
    try {
        let sql = `
            SELECT * FROM perfil_musical_usuario WHERE id_usuario = ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        return result && result.length > 0 ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const analisarPreferenciasUsuario = async function (id_usuario, dados_historico) {
    try {
        const analise = {
            tipo_personalidade: 'explorador',
            preferencia_energia: 0.50,
            preferencia_valencia: 0.50,
            preferencia_danca: 0.50,
            preferencia_acustica: 0.50,
            tempo_preferencia_min: 60.00,
            tempo_preferencia_max: 140.00,
            pesos_generos: {},
            pesos_artistas: {},
            padroes_hora_dia: {},
            padroes_clima: {},
            padroes_humor: {}
        }

        if (dados_historico.musicas_ouvidas && dados_historico.musicas_ouvidas.length > 0) {
            analise = calcularPreferenciasPorHistorico(dados_historico)
        }

        return analise
    } catch (error) {
        console.log(error)
        return false
    }
}

const calcularPreferenciasPorHistorico = function (dados_historico) {
    const analise = {
        tipo_personalidade: 'explorador',
        preferencia_energia: 0.50,
        preferencia_valencia: 0.50,
        preferencia_danca: 0.50,
        preferencia_acustica: 0.50,
        tempo_preferencia_min: 60.00,
        tempo_preferencia_max: 140.00,
        pesos_generos: {},
        pesos_artistas: {},
        padroes_hora_dia: {},
        padroes_clima: {},
        padroes_humor: {}
    }

    let totalEnergia = 0, totalValencia = 0, totalDanca = 0, totalAcustica = 0
    let tempos = []

    const generosCount = {}
    const artistasCount = {}
    const horasCount = {}
    const climasCount = {}
    const humoresCount = {}

    dados_historico.musicas_ouvidas.forEach(musica => {
        totalEnergia += musica.nivel_energia || 0.50
        totalValencia += musica.valencia || 0.50
        totalDanca += musica.capacidade_danca || 0.50
        totalAcustica += musica.acusticidade || 0.50
        tempos.push(musica.tempo || 120.00)

        if (musica.generos) {
            musica.generos.forEach(genero => {
                generosCount[genero] = (generosCount[genero] || 0) + 1
            })
        }

        if (musica.artistas) {
            musica.artistas.forEach(artista => {
                artistasCount[artista] = (artistasCount[artista] || 0) + 1
            })
        }

        if (musica.hora) {
            horasCount[musica.hora] = (horasCount[musica.hora] || 0) + 1
        }

        if (musica.clima) {
            climasCount[musica.clima] = (climasCount[musica.clima] || 0) + 1
        }

        if (musica.humor) {
            humoresCount[musica.humor] = (humoresCount[musica.humor] || 0) + 1
        }
    })

    const totalMusicas = dados_historico.musicas_ouvidas.length
    if (totalMusicas > 0) {
        analise.preferencia_energia = totalEnergia / totalMusicas
        analise.preferencia_valencia = totalValencia / totalMusicas
        analise.preferencia_danca = totalDanca / totalMusicas
        analise.preferencia_acustica = totalAcustica / totalMusicas

        tempos.sort((a, b) => a - b)
        analise.tempo_preferencia_min = tempos[Math.floor(tempos.length * 0.25)] || 60.00
        analise.tempo_preferencia_max = tempos[Math.floor(tempos.length * 0.75)] || 140.00

        Object.keys(generosCount).forEach(genero => {
            analise.pesos_generos[genero] = generosCount[genero] / totalMusicas
        })

        Object.keys(artistasCount).forEach(artista => {
            analise.pesos_artistas[artista] = artistasCount[artista] / totalMusicas
        })

        Object.keys(horasCount).forEach(hora => {
            analise.padroes_hora_dia[hora] = horasCount[hora] / totalMusicas
        })

        Object.keys(climasCount).forEach(clima => {
            analise.padroes_clima[clima] = climasCount[clima] / totalMusicas
        })

        Object.keys(humoresCount).forEach(humor => {
            analise.padroes_humor[humor] = humoresCount[humor] / totalMusicas
        })

        analise.tipo_personalidade = determinarTipoPersonalidade(analise)
    }

    return analise
}

function determinarTipoPersonalidade(analise) {
    if (analise.preferencia_energia > 0.7 && analise.preferencia_danca > 0.7) {
        return 'energetico'
    } else if (analise.preferencia_valencia < 0.3 && analise.preferencia_acustica > 0.7) {
        return 'relaxado'
    } else if (analise.preferencia_valencia > 0.7 && analise.preferencia_energia > 0.5) {
        return 'feliz'
    } else if (analise.preferencia_valencia < 0.3 && analise.preferencia_danca < 0.3) {
        return 'melancolico'
    } else if (analise.preferencia_acustica > 0.7 && analise.preferencia_danca < 0.3) {
        return 'introspectivo'
    } else {
        return 'explorador'
    }
}

const atualizarPerfilPorIA = async function (id_usuario, dados_historico) {
    try {
        const analise = await analisarPreferenciasUsuario(id_usuario, dados_historico)
        if (!analise) {
            return false
        }

        const result = await atualizarPerfilMusicalUsuario(id_usuario, analise)
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterPerfilCompletoUsuario = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                pmu.*,
                u.nome_usuario,
                u.url_avatar,
                u.esta_ativo,
                u.e_premium
            FROM perfil_musical_usuario pmu
            JOIN usuarios u ON pmu.id_usuario = u.id
            WHERE pmu.id_usuario = ?
        `
        let result = await prisma.$queryRawUnsafe(sql, id_usuario)
        
        if (!result || result.length === 0) {
            return false
        }

        const perfil = result[0]
        
        if (perfil.pesos_generos) {
            try {
                perfil.pesos_generos = JSON.parse(perfil.pesos_generos)
            } catch (e) {
                perfil.pesos_generos = {}
            }
        }
        
        if (perfil.pesos_artistas) {
            try {
                perfil.pesos_artistas = JSON.parse(perfil.pesos_artistas)
            } catch (e) {
                perfil.pesos_artistas = {}
            }
        }
        
        if (perfil.padroes_hora_dia) {
            try {
                perfil.padroes_hora_dia = JSON.parse(perfil.padroes_hora_dia)
            } catch (e) {
                perfil.padroes_hora_dia = {}
            }
        }
        
        if (perfil.padroes_clima) {
            try {
                perfil.padroes_clima = JSON.parse(perfil.padroes_clima)
            } catch (e) {
                perfil.padroes_clima = {}
            }
        }
        
        if (perfil.padroes_humor) {
            try {
                perfil.padroes_humor = JSON.parse(perfil.padroes_humor)
            } catch (e) {
                perfil.padroes_humor = {}
            }
        }

        return perfil
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterEstatisticasPerfil = async function (id_usuario) {
    try {
        const perfil = await obterPerfilCompletoUsuario(id_usuario)
        if (!perfil) {
            return false
        }

        const estatisticas = {
            tipo_personalidade: perfil.tipo_personalidade,
            preferencias_principais: {
                energia: Math.round(perfil.preferencia_energia * 100),
                valencia: Math.round(perfil.preferencia_valencia * 100),
                danca: Math.round(perfil.preferencia_danca * 100),
                acustica: Math.round(perfil.preferencia_acustica * 100)
            },
            preferencia_tempo: {
                min: perfil.tempo_preferencia_min,
                max: perfil.tempo_preferencia_max,
                media: (perfil.tempo_preferencia_min + perfil.tempo_preferencia_max) / 2
            },
            total_generos_ponderados: Object.keys(perfil.pesos_generos || {}).length,
            total_artistas_ponderados: Object.keys(perfil.pesos_artistas || {}).length,
            padroes_ativos: {
                horas: Object.keys(perfil.padroes_hora_dia || {}).length,
                climas: Object.keys(perfil.padroes_clima || {}).length,
                humores: Object.keys(perfil.padroes_humor || {}).length
            },
            ultima_analise: perfil.ultima_analise
        }

        return estatisticas
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterTopGenerosPreferidos = async function (id_usuario, limite = 10) {
    try {
        const perfil = await obterPerfilCompletoUsuario(id_usuario)
        if (!perfil || !perfil.pesos_generos) {
            return false
        }

        const generosArray = Object.entries(perfil.pesos_generos)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limite)
            .map(([nome, peso]) => ({ nome, peso: Math.round(peso * 100) }))

        return generosArray
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterTopArtistasPreferidos = async function (id_usuario, limite = 10) {
    try {
        const perfil = await obterPerfilCompletoUsuario(id_usuario)
        if (!perfil || !perfil.pesos_artistas) {
            return false
        }

        const artistasArray = Object.entries(perfil.pesos_artistas)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limite)
            .map(([nome, peso]) => ({ nome, peso: Math.round(peso * 100) }))

        return artistasArray
    } catch (error) {
        console.log(error)
        return false
    }
}

const obterPadroesComportamentais = async function (id_usuario) {
    try {
        const perfil = await obterPerfilCompletoUsuario(id_usuario)
        if (!perfil) {
            return false
        }

        return {
            padroes_hora_dia: perfil.padroes_hora_dia || {},
            padroes_clima: perfil.padroes_clima || {},
            padroes_humor: perfil.padroes_humor || {}
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

const compararPerfisMusicais = async function (id_usuario1, id_usuario2) {
    try {
        const [perfil1, perfil2] = await Promise.all([
            obterPerfilCompletoUsuario(id_usuario1),
            obterPerfilCompletoUsuario(id_usuario2)
        ])

        if (!perfil1 || !perfil2) {
            return false
        }

        const similaridade = calcularSimilaridadePerfis(perfil1, perfil2)
        return similaridade
    } catch (error) {
        console.log(error)
        return false
    }
}

function calcularSimilaridadePerfis(perfil1, perfil2) {
    const pesos = {
        energia: 0.2,
        valencia: 0.2,
        danca: 0.2,
        acustica: 0.2,
        tempo: 0.1,
        generos: 0.15,
        artistas: 0.15
    }

    let similaridade = 0
    let totalPeso = 0

    similaridade += Math.abs(perfil1.preferencia_energia - perfil2.preferencia_energia) * pesos.energia
    similaridade += Math.abs(perfil1.preferencia_valencia - perfil2.preferencia_valencia) * pesos.valencia
    similaridade += Math.abs(perfil1.preferencia_danca - perfil2.preferencia_danca) * pesos.danca
    similaridade += Math.abs(perfil1.preferencia_acustica - perfil2.preferencia_acustica) * pesos.acustica
    similaridade += Math.abs(perfil1.tempo_preferencia_min - perfil2.tempo_preferencia_min) * pesos.tempo
    similaridade += Math.abs(perfil1.tempo_preferencia_max - perfil2.tempo_preferencia_max) * pesos.tempo

    totalPeso = pesos.energia + pesos.valencia + pesos.danca + pesos.acustica + pesos.tempo * 2

    if (perfil1.pesos_generos && perfil2.pes_generos) {
        const generos1 = Object.keys(perfil1.pesos_generos)
        const generos2 = Object.keys(perfil2.pes_generos)
        const todosGeneros = [...new Set([...generos1, ...generos2])]
        
        todosGeneros.forEach(genero => {
            const peso1 = perfil1.pesos_generos[genero] || 0
            const peso2 = perfil2.pesos_generos[genero] || 0
            similaridade += Math.abs(peso1 - peso2) * pesos.generos
        })
        totalPeso += pesos.generos * todosGeneros.length
    }

    if (perfil1.pesos_artistas && perfil2.pesos_artistas) {
        const artistas1 = Object.keys(perfil1.pesos_artistas)
        const artistas2 = Object.keys(perfil2.pesos_artistas)
        const todosArtistas = [...new Set([...artistas1, ...artistas2])]
        
        todosArtistas.forEach(artista => {
            const peso1 = perfil1.pesos_artistas[artista] || 0
            const peso2 = perfil2.pesos_artistas[artista] || 0
            similaridade += Math.abs(peso1 - peso2) * pesos.artistas
        })
        totalPeso += pesos.artistas * todosArtistas.length
    }

    const similaridadeFinal = totalPeso > 0 ? 1 - (similaridade / totalPeso) : 0
    return Math.round(similaridadeFinal * 100)
}

module.exports = {
    criarPerfilMusicalUsuario,
    atualizarPerfilMusicalUsuario,
    obterPerfilMusicalUsuario,
    analisarPreferenciasUsuario,
    atualizarPerfilPorIA,
    obterPerfilCompletoUsuario,
    obterEstatisticasPerfil,
    obterTopGenerosPreferidos,
    obterTopArtistasPreferidos,
    obterPadroesComportamentais,
    compararPerfisMusicais
}
