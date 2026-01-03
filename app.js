/*                                                                                                                                                                  
                                  ,---,                                                                   
                                ,--.' |                                                ,---,              
                                |  |  :       ,---.    __  ,-.  __  ,-.              ,---.'|              
                                :  :  :      '   ,'\ ,' ,'/ /|,' ,'/ /|              |   | :              
   ,---.     ,--.--.     ,---.  :  |  |,--. /   /   |'  | |' |'  | |' | ,--.--.      |   | |   ,--.--.    
  /     \   /       \   /     \ |  :  '   |.   ; ,. :|  |   ,'|  |   ,'/       \   ,--.__| |  /       \   
 /    / '  .--.  .-. | /    / ' |  |   /' :'   | |: :'  :  /  '  :  / .--.  .-. | /   ,'   | .--.  .-. |  
.    ' /    \__\/: . ..    ' /  '  :  | | |'   | .; :|  | '   |  | '   \__\/: . ..   '  /  |  \__\/: . .  
'   ; :__   ," .--.; |'   ; :__ |  |  ' | :|   :    |;  : |   ;  : |   ," .--.; |'   ; |:  |  ," .--.; |  
'   | '.'| /  /  ,.  |'   | '.'||  :  :_:,' \   \  / |  , ;   |  , ;  /  /  ,.  ||   | '/  ' /  /  ,.  |  
|   :    :;  :   .'   \   :    :|  | ,'      `----'   ---'     ---'  ;  :   .'   \   :    :|;  :   .'   \ 
 \   \  / |  ,     .-./\   \  / `--''                                |  ,     .-./\   \  /  |  ,     .-./ 
  `----'   `--`---'     `----'                                        `--`---'     `----'    `--`---'     
*/

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

// Import Controllers
const controllerUsuarios = require('./Controllers/controllerUsuarios')
const controllerMusicasFavoritas = require('./Controllers/controllerMusicasFavoritas')
const controllerPlaylists = require('./Controllers/controllerPlaylists')
const controllerHistoricoReproducao = require('./Controllers/controllerHistoricoReproducao')
const controllerAmizades = require('./Controllers/controllerAmizades')
const controllerArtistasSeguidos = require('./Controllers/controllerArtistasSeguidos')
const controllerConquistasUsuarios = require('./Controllers/controllerConquistasUsuarios')
const controllerNiveisUsuarios = require('./Controllers/controllerNiveisUsuarios')
const controllerSalasEscuta = require('./Controllers/controllerSalasEscuta')
const controllerRecomendacoesIA = require('./Controllers/controllerRecomendacoesIA')
const controllerDadosClima = require('./Controllers/controllerDadosClima')
const controllerHumorUsuario = require('./Controllers/controllerHumorUsuario')
const controllerAlbunsSalvos = require('./Controllers/controllerAlbunsSalvos')
const controllerPlaylistsSalvas = require('./Controllers/controllerPlaylistsSalvas')
const controllerFeedbackRecomendacoes = require('./Controllers/controllerFeedbackRecomendacoes')
const controllerPerfilMusicalUsuario = require('./Controllers/controllerPerfilMusicalUsuario')

const bodyParserJSON = bodyParser.json()

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*')
    response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    app.use(cors())
    next()
})

app.listen(8080, function() {
    console.log('Nigga Dicks')
})

// Endpoints - Usuarios
app.get('/v1/usuarios', controllerUsuarios.listarTodosUsuarios)
app.get('/v1/usuarios/:id', controllerUsuarios.listarUsuarioPorID)
app.post('/v1/usuarios', bodyParserJSON, controllerUsuarios.inserirNovoUsuario)
app.put('/v1/usuarios/:id', bodyParserJSON, controllerUsuarios.atualizarPerfilUsuario)
app.delete('/v1/usuarios/:id', controllerUsuarios.excluirContaUsuario)

// Endpoints - Musicas Favoritas
app.post('/v1/musicas-favoritas', bodyParserJSON, controllerMusicasFavoritas.adicionarMusicaFavorita)
app.delete('/v1/musicas-favoritas/:id_usuario/:id_musica', controllerMusicasFavoritas.removerMusicaFavorita)
app.get('/v1/musicas-favoritas/:id_usuario', controllerMusicasFavoritas.listarMusicasFavoritas)
app.get('/v1/musicas-favoritas/:id_usuario/verificar/:id_musica', controllerMusicasFavoritas.verificarMusicaFavorita)
app.get('/v1/musicas-favoritas/:id_usuario/estatisticas', controllerMusicasFavoritas.obterEstatisticasMusicasFavoritas)

// Endpoints - Playlists
app.post('/v1/playlists', bodyParserJSON, controllerPlaylists.criarPlaylist)
app.get('/v1/playlists/:id', controllerPlaylists.listarPlaylistPorID)
app.get('/v1/playlists/usuario/:id_usuario', controllerPlaylists.listarPlaylistsUsuario)
app.put('/v1/playlists/:id', bodyParserJSON, controllerPlaylists.atualizarPlaylist)
app.delete('/v1/playlists/:id', controllerPlaylists.excluirPlaylist)
app.post('/v1/playlists/:id/musicas', bodyParserJSON, controllerPlaylists.adicionarMusicaPlaylist)
app.delete('/v1/playlists/:id/musicas/:id_musica', controllerPlaylists.removerMusicaPlaylist)
app.put('/v1/playlists/:id/musicas/:id_musica/posicao', bodyParserJSON, controllerPlaylists.reordenarMusicaPlaylist)
app.get('/v1/playlists/:id/musicas', controllerPlaylists.listarMusicasPlaylist)
app.get('/v1/playlists/buscar', controllerPlaylists.buscarPlaylists)

// Endpoints - Historico Reproducao
app.post('/v1/historico-reproducao', bodyParserJSON, controllerHistoricoReproducao.registrarReproducao)
app.get('/v1/historico-reproducao/:id_usuario', controllerHistoricoReproducao.listarHistoricoUsuario)
app.get('/v1/historico-reproducao/:id_usuario/recentes', controllerHistoricoReproducao.obterMusicasRecentes)
app.get('/v1/historico-reproducao/:id_usuario/estatisticas', controllerHistoricoReproducao.obterEstatisticasReproducao)
app.get('/v1/historico-reproducao/:id_usuario/top-musicas', controllerHistoricoReproducao.obterTopMusicas)
app.get('/v1/historico-reproducao/:id_usuario/top-artistas', controllerHistoricoReproducao.obterTopArtistas)
app.get('/v1/historico-reproducao/:id_usuario/top-generos', controllerHistoricoReproducao.obterTopGeneros)
app.get('/v1/historico-reproducao/:id_usuario/evolucao', controllerHistoricoReproducao.obterEvolucaoReproducao)

// Endpoints - Amizades
app.post('/v1/amizades/solicitar', bodyParserJSON, controllerAmizades.enviarSolicitacaoAmizade)
app.post('/v1/amizades/aceitar/:id', controllerAmizades.aceitarSolicitacaoAmizade)
app.post('/v1/amizades/recusar/:id', controllerAmizades.recusarSolicitacaoAmizade)
app.delete('/v1/amizades/:id_usuario1/:id_usuario2', controllerAmizades.desfazerAmizade)
app.post('/v1/amizades/bloquear', bodyParserJSON, controllerAmizades.bloquearUsuario)
app.delete('/v1/amizades/desbloquear/:id_usuario1/:id_usuario2', controllerAmizades.desbloquearUsuario)
app.get('/v1/amizades/:id_usuario', controllerAmizades.listarAmigos)
app.get('/v1/amizades/:id_usuario/solicitacoes', controllerAmizades.listarSolicitacoesAmizade)
app.get('/v1/amizades/:id_usuario/bloqueados', controllerAmizades.listarUsuariosBloqueados)
app.get('/v1/amizades/relacao/:id_usuario1/:id_usuario2', controllerAmizades.verificarRelacaoAmizade)

// Endpoints - Artistas Seguidos
app.post('/v1/artistas-seguidos', bodyParserJSON, controllerArtistasSeguidos.seguirArtista)
app.delete('/v1/artistas-seguidos/:id_usuario/:id_artista', controllerArtistasSeguidos.deixarSeguirArtista)
app.get('/v1/artistas-seguidos/:id_usuario', controllerArtistasSeguidos.listarArtistasSeguidos)
app.get('/v1/artistas-seguidos/:id_usuario/verificar/:id_artista', controllerArtistasSeguidos.verificarArtistaSeguido)
app.get('/v1/artistas-seguidos/:id_usuario/estatisticas', controllerArtistasSeguidos.obterEstatisticasArtistasSeguidos)
app.get('/v1/artistas-seguidos/:id_usuario/recomendacoes', controllerArtistasSeguidos.obterRecomendacoesArtistas)
app.get('/v1/artistas-seguidos/:id_usuario/descoberta', controllerArtistasSeguidos.obterArtistasDescoberta)
app.get('/v1/artistas-seguidos/:id_usuario/tendencias', controllerArtistasSeguidos.obterTendenciasArtistas)
app.get('/v1/artistas-seguidos/:id_usuario/analise', controllerArtistasSeguidos.obterAnaliseArtistasSeguidos)

// Endpoints - Conquistas Usuarios
app.post('/v1/conquistas-usuarios', bodyParserJSON, controllerConquistasUsuarios.desbloquearConquista)
app.get('/v1/conquistas-usuarios/:id_usuario', controllerConquistasUsuarios.listarConquistasUsuario)
app.get('/v1/conquistas-usuarios/:id_usuario/:id_conquista', controllerConquistasUsuarios.obterConquistaUsuario)
app.put('/v1/conquistas-usuarios/:id_usuario/:id_conquista/progresso', bodyParserJSON, controllerConquistasUsuarios.atualizarProgressoConquista)
app.get('/v1/conquistas-usuarios/:id_usuario/estatisticas', controllerConquistasUsuarios.obterEstatisticasConquistas)
app.get('/v1/conquistas-usuarios/:id_usuario/ranking', controllerConquistasUsuarios.obterRankingConquistas)
app.get('/v1/conquistas-usuarios/:id_usuario/dashboard', controllerConquistasUsuarios.obterDashboardConquistas)
app.get('/v1/conquistas-usuarios/:id_usuario/progresso', controllerConquistasUsuarios.obterProgressoGeral)
app.get('/v1/conquistas-usuarios/:id_usuario/recomendacoes', controllerConquistasUsuarios.obterRecomendacoesConquistas)

// Endpoints - Niveis Usuarios
app.post('/v1/niveis-usuarios/:id_usuario', controllerNiveisUsuarios.criarNivelUsuario)
app.post('/v1/niveis-usuarios/:id_usuario/xp', bodyParserJSON, controllerNiveisUsuarios.adicionarExperiencia)
app.post('/v1/niveis-usuarios/:id_usuario/tempo', bodyParserJSON, controllerNiveisUsuarios.atualizarTempoReproducao)
app.post('/v1/niveis-usuarios/:id_usuario/musicas-descobertas', controllerNiveisUsuarios.incrementarMusicasDescobertas)
app.post('/v1/niveis-usuarios/:id_usuario/verificar-nivel', controllerNiveisUsuarios.verificarEAtualizarNivel)
app.get('/v1/niveis-usuarios/:id_usuario', controllerNiveisUsuarios.obterNivelUsuario)
app.get('/v1/niveis-usuarios/:id_usuario/progresso', controllerNiveisUsuarios.obterProgressoNivel)
app.get('/v1/niveis-usuarios/ranking/niveis', controllerNiveisUsuarios.listarRankingNiveis)
app.get('/v1/niveis-usuarios/ranking/xp', controllerNiveisUsuarios.listarRankingXP)
app.get('/v1/niveis-usuarios/ranking/tempo', controllerNiveisUsuarios.listarRankingTempoReproducao)
app.get('/v1/niveis-usuarios/ranking/musicas', controllerNiveisUsuarios.listarRankingMusicasDescobertas)
app.get('/v1/niveis-usuarios/estatisticas', controllerNiveisUsuarios.obterEstatisticasGeraisNiveis)
app.get('/v1/niveis-usuarios/distribuicao', controllerNiveisUsuarios.obterDistribuicaoNiveis)
app.get('/v1/niveis-usuarios/:id_usuario/posicao', controllerNiveisUsuarios.obterPosicaoRanking)
app.get('/v1/niveis-usuarios/por-nivel/:nivel_min/:nivel_max', controllerNiveisUsuarios.obterUsuariosPorNivel)
app.get('/v1/niveis-usuarios/:id_usuario/proximo-nivel', controllerNiveisUsuarios.obterProximoNivelUsuario)

// Endpoints - Salas Escuta
app.post('/v1/salas-escuta', bodyParserJSON, controllerSalasEscuta.criarSalaEscuta)
app.get('/v1/salas-escuta/:id', controllerSalasEscuta.obterSalaEscuta)
app.put('/v1/salas-escuta/:id', bodyParserJSON, controllerSalasEscuta.atualizarSalaEscuta)
app.delete('/v1/salas-escuta/:id', controllerSalasEscuta.excluirSalaEscuta)
app.post('/v1/salas-escuta/:id/participantes', bodyParserJSON, controllerSalasEscuta.entrarSalaEscuta)
app.delete('/v1/salas-escuta/:id/participantes/:id_usuario', controllerSalasEscuta.sairSalaEscuta)
app.get('/v1/salas-escuta/:id/participantes', controllerSalasEscuta.listarParticipantesSala)
app.post('/v1/salas-escuta/:id/fila', bodyParserJSON, controllerSalasEscuta.adicionarMusicaFila)
app.delete('/v1/salas-escuta/:id/fila/:id_musica', controllerSalasEscuta.removerMusicaFila)
app.get('/v1/salas-escuta/:id/fila', controllerSalasEscuta.listarFilaMusicas)
app.put('/v1/salas-escuta/:id/fila/reordenar', bodyParserJSON, controllerSalasEscuta.reordenarFilaMusicas)
app.post('/v1/salas-escuta/:id/playback', bodyParserJSON, controllerSalasEscuta.controlarPlayback)
app.get('/v1/salas-escuta/ativas', controllerSalasEscuta.listarSalasAtivas)
app.get('/v1/salas-escuta/publicas', controllerSalasEscuta.listarSalasPublicas)
app.get('/v1/salas-escuta/usuario/:id_usuario', controllerSalasEscuta.listarSalasUsuario)
app.get('/v1/salas-escuta/buscar', controllerSalasEscuta.buscarSalasEscuta)
app.get('/v1/salas-escuta/:id/estatisticas', controllerSalasEscuta.obterEstatisticasSala)

// Endpoints - Recomendacoes IA
app.post('/v1/recomendacoes-ia', bodyParserJSON, controllerRecomendacoesIA.gerarRecomendacao)
app.get('/v1/recomendacoes-ia/:id_usuario', controllerRecomendacoesIA.listarRecomendacoesUsuario)
app.get('/v1/recomendacoes-ia/:id_usuario/tipo/:tipo', controllerRecomendacoesIA.listarRecomendacoesPorTipo)
app.get('/v1/recomendacoes-ia/:id_usuario/ativas', controllerRecomendacoesIA.listarRecomendacoesAtivas)
app.get('/v1/recomendacoes-ia/:id_usuario/expiradas', controllerRecomendacoesIA.listarRecomendacoesExpiradas)
app.post('/v1/recomendacoes-ia/:id/feedback', bodyParserJSON, controllerRecomendacoesIA.registrarFeedback)
app.put('/v1/recomendacoes-ia/:id/curtir', controllerRecomendacoesIA.curtirRecomendacao)
app.put('/v1/recomendacoes-ia/:id/reproduzir', controllerRecomendacoesIA.reproduzirRecomendacao)
app.get('/v1/recomendacoes-ia/:id_usuario/estatisticas', controllerRecomendacoesIA.obterEstatisticasRecomendacoes)
app.get('/v1/recomendacoes-ia/:id_usuario/performance', controllerRecomendacoesIA.obterPerformanceRecomendacoes)
app.get('/v1/recomendacoes-ia/:id_usuario/contextuais', controllerRecomendacoesIA.obterRecomendacoesContextuais)
app.get('/v1/recomendacoes-ia/:id_usuario/dashboard', controllerRecomendacoesIA.obterDashboardRecomendacoes)
app.delete('/v1/recomendacoes-ia/limpar-expiradas', controllerRecomendacoesIA.limparRecomendacoesExpiradas)

// Endpoints - Dados Clima
app.post('/v1/dados-clima', bodyParserJSON, controllerDadosClima.registrarDadosClima)
app.get('/v1/dados-clima/:id_usuario', controllerDadosClima.listarDadosClimaUsuario)
app.get('/v1/dados-clima/:id_usuario/recentes', controllerDadosClima.obterDadosClimaRecentes)
app.get('/v1/dados-clima/:id_usuario/periodo', controllerDadosClima.listarDadosClimaPorPeriodo)
app.get('/v1/dados-clima/:id_usuario/estatisticas', controllerDadosClima.obterEstatisticasDadosClima)
app.get('/v1/dados-clima/:id_usuario/padroes', controllerDadosClima.obterPadroesClima)
app.get('/v1/dados-clima/:id_usuario/extremos', controllerDadosClima.obterExtremosClima)
app.get('/v1/dados-clima/:id_usuario/distribuicao', controllerDadosClima.obterDistribuicaoClima)
app.get('/v1/dados-clima/:id_usuario/evolucao', controllerDadosClima.obterEvolucaoClima)
app.get('/v1/dados-clima/:id_usuario/dashboard', controllerDadosClima.obterDashboardClima)
app.delete('/v1/dados-clima/limpar-antigos/:dias', controllerDadosClima.limparDadosClimaAntigos)

// Endpoints - Humor Usuario
app.post('/v1/humor-usuario', bodyParserJSON, controllerHumorUsuario.registrarHumor)
app.get('/v1/humor-usuario/:id_usuario', controllerHumorUsuario.listarHumorUsuario)
app.get('/v1/humor-usuario/:id_usuario/recentes', controllerHumorUsuario.obterHumorRecente)
app.get('/v1/humor-usuario/:id_usuario/periodo', controllerHumorUsuario.listarHumorPorPeriodo)
app.get('/v1/humor-usuario/:id_usuario/tipo/:tipo', controllerHumorUsuario.obterHumorPorTipo)
app.get('/v1/humor-usuario/:id_usuario/estatisticas', controllerHumorUsuario.obterEstatisticasHumor)
app.get('/v1/humor-usuario/:id_usuario/padroes', controllerHumorUsuario.obterPadroesHumor)
app.get('/v1/humor-usuario/:id_usuario/frequentes', controllerHumorUsuario.obterHumoresFrequentes)
app.get('/v1/humor-usuario/:id_usuario/por-hora', controllerHumorUsuario.obterPadraoHumorPorHora)
app.get('/v1/humor-usuario/:id_usuario/evolucao', controllerHumorUsuario.obterEvolucaoHumorDiaria)
app.get('/v1/humor-usuario/:id_usuario/distribuicao-origens', controllerHumorUsuario.obterDistribuicaoOrigens)
app.get('/v1/humor-usuario/:id_usuario/por-intensidade', controllerHumorUsuario.obterHumoresPorIntensidade)
app.get('/v1/humor-usuario/:id_usuario/tendencia', controllerHumorUsuario.obterTendenciaHumor)
app.get('/v1/humor-usuario/:id_usuario/resumo', controllerHumorUsuario.obterResumoHumorAtual)
app.get('/v1/humor-usuario/:id_usuario/analise', controllerHumorUsuario.obterAnaliseEmocional)
app.get('/v1/humor-usuario/:id_usuario/correlacao-musica', controllerHumorUsuario.obterCorrelacaoHumorMusica)
app.get('/v1/humor-usuario/:id_usuario/dashboard', controllerHumorUsuario.obterDashboardHumor)
app.delete('/v1/humor-usuario/limpar-antigos/:dias', controllerHumorUsuario.limparHumorAntigo)

// Endpoints - Albuns Salvos
app.post('/v1/albuns-salvos', bodyParserJSON, controllerAlbunsSalvos.salvarAlbum)
app.delete('/v1/albuns-salvos/:id_usuario/:id_album', controllerAlbunsSalvos.removerAlbumSalvo)
app.post('/v1/albuns-salvos/alternar', bodyParserJSON, controllerAlbunsSalvos.alternarAlbumSalvo)
app.get('/v1/albuns-salvos/:id_usuario', controllerAlbunsSalvos.listarAlbunsSalvosUsuario)
app.get('/v1/albuns-salvos/:id_usuario/verificar/:id_album', controllerAlbunsSalvos.verificarAlbumSalvo)
app.get('/v1/albuns-salvos/:id_usuario/total', controllerAlbunsSalvos.contarAlbunsSalvosUsuario)
app.get('/v1/albuns-salvos/:id_usuario/periodo', controllerAlbunsSalvos.listarAlbunsSalvosPorPeriodo)
app.get('/v1/albuns-salvos/mais-salvos', controllerAlbunsSalvos.listarAlbunsMaisSalvos)
app.get('/v1/albuns-salvos/:id_album/usuarios', controllerAlbunsSalvos.listarUsuariosPorAlbumSalvo)
app.get('/v1/albuns-salvos/:id_usuario/recentes', controllerAlbunsSalvos.obterAlbunsSalvosRecentes)
app.get('/v1/albuns-salvos/:id_usuario/estatisticas', controllerAlbunsSalvos.obterEstatisticasAlbunsSalvos)
app.get('/v1/albuns-salvos/:id_usuario/distribuicao-artistas', controllerAlbunsSalvos.obterDistribuicaoArtistasSalvos)
app.get('/v1/albuns-salvos/:id_usuario/artista/:id_artista', controllerAlbunsSalvos.obterAlbunsSalvosPorArtista)
app.get('/v1/albuns-salvos/:id_usuario/genero/:id_genero', controllerAlbunsSalvos.obterAlbunsSalvosPorGenero)
app.get('/v1/albuns-salvos/:id_usuario/por-decada', controllerAlbunsSalvos.obterAlbunsSalvosPorDecada)
app.get('/v1/albuns-salvos/:id_usuario/buscar', controllerAlbunsSalvos.buscarAlbunsSalvosPorNome)
app.get('/v1/albuns-salvos/:id_usuario/recomendacoes', controllerAlbunsSalvos.obterRecomendacoesAlbunsSimilares)
app.get('/v1/albuns-salvos/:id_usuario/resumo', controllerAlbunsSalvos.obterResumoAlbunsSalvos)

// Endpoints - Playlists Salvas
app.post('/v1/playlists-salvas', bodyParserJSON, controllerPlaylistsSalvas.salvarPlaylist)
app.delete('/v1/playlists-salvas/:id_usuario/:id_playlist', controllerPlaylistsSalvas.removerPlaylistSalva)
app.post('/v1/playlists-salvas/alternar', bodyParserJSON, controllerPlaylistsSalvas.alternarPlaylistSalva)
app.get('/v1/playlists-salvas/:id_usuario', controllerPlaylistsSalvas.listarPlaylistsSalvasUsuario)
app.get('/v1/playlists-salvas/:id_usuario/verificar/:id_playlist', controllerPlaylistsSalvas.verificarPlaylistSalva)
app.get('/v1/playlists-salvas/:id_usuario/total', controllerPlaylistsSalvas.contarPlaylistsSalvasUsuario)
app.get('/v1/playlists-salvas/:id_usuario/periodo', controllerPlaylistsSalvas.listarPlaylistsSalvasPorPeriodo)
app.get('/v1/playlists-salvas/mais-salvas', controllerPlaylistsSalvas.listarPlaylistsMaisSalvas)
app.get('/v1/playlists-salvas/:id_playlist/usuarios', controllerPlaylistsSalvas.listarUsuariosPorPlaylistSalva)
app.get('/v1/playlists-salvas/:id_usuario/recentes', controllerPlaylistsSalvas.obterPlaylistsSalvasRecentes)
app.get('/v1/playlists-salvas/:id_usuario/estatisticas', controllerPlaylistsSalvas.obterEstatisticasPlaylistsSalvas)
app.get('/v1/playlists-salvas/:id_usuario/distribuicao-criadores', controllerPlaylistsSalvas.obterDistribuicaoCriadoresSalvos)
app.get('/v1/playlists-salvas/:id_usuario/criador/:id_criador', controllerPlaylistsSalvas.obterPlaylistsSalvasPorCriador)
app.get('/v1/playlists-salvas/:id_usuario/publicas', controllerPlaylistsSalvas.obterPlaylistsSalvasPublicas)
app.get('/v1/playlists-salvas/:id_usuario/por-tamanho', controllerPlaylistsSalvas.obterPlaylistsSalvasPorTamanho)
app.get('/v1/playlists-salvas/:id_usuario/por-duracao', controllerPlaylistsSalvas.obterPlaylistsSalvasPorDuracao)
app.get('/v1/playlists-salvas/:id_usuario/buscar', controllerPlaylistsSalvas.buscarPlaylistsSalvasPorNome)
app.get('/v1/playlists-salvas/:id_usuario/recomendacoes', controllerPlaylistsSalvas.obterRecomendacoesPlaylistsSimilares)
app.get('/v1/playlists-salvas/:id_usuario/resumo', controllerPlaylistsSalvas.obterResumoPlaylistsSalvas)

// Endpoints - Feedback Recomendacoes
app.post('/v1/feedback-recomendacoes', bodyParserJSON, controllerFeedbackRecomendacoes.registrarFeedback)
app.get('/v1/feedback-recomendacoes/:id_usuario', controllerFeedbackRecomendacoes.listarFeedbackUsuario)
app.get('/v1/feedback-recomendacoes/recomendacao/:id_recomendacao', controllerFeedbackRecomendacoes.listarFeedbackPorRecomendacao)
app.get('/v1/feedback-recomendacoes/:id_usuario/tipo/:tipo_feedback', controllerFeedbackRecomendacoes.listarFeedbackPorTipo)
app.get('/v1/feedback-recomendacoes/:id_usuario/estatisticas', controllerFeedbackRecomendacoes.obterEstatisticasFeedbackUsuario)
app.get('/v1/feedback-recomendacoes/:id_usuario/distribuicao', controllerFeedbackRecomendacoes.obterDistribuicaoFeedbackUsuario)
app.get('/v1/feedback-recomendacoes/tipo-recomendacao/:tipo_recomendacao', controllerFeedbackRecomendacoes.obterFeedbackPorTipoRecomendacao)
app.get('/v1/feedback-recomendacoes/:id_usuario/taxa-aprovacao', controllerFeedbackRecomendacoes.obterTaxaAprovacaoRecomendacoes)
app.get('/v1/feedback-recomendacoes/:id_usuario/:id_recomendacao/recente', controllerFeedbackRecomendacoes.obterFeedbackRecente)
app.get('/v1/feedback-recomendacoes/:id_usuario/:id_recomendacao/verificar', controllerFeedbackRecomendacoes.verificarFeedbackExistente)
app.get('/v1/feedback-recomendacoes/:id_usuario/evolucao', controllerFeedbackRecomendacoes.obterEvolucaoFeedback)
app.get('/v1/feedback-recomendacoes/:id_usuario/periodo', controllerFeedbackRecomendacoes.obterFeedbackPorPeriodo)
app.get('/v1/feedback-recomendacoes/:id_usuario/padroes-hora', controllerFeedbackRecomendacoes.obterPadraoFeedbackPorHora)
app.get('/v1/feedback-recomendacoes/desempenho-tipos', controllerFeedbackRecomendacoes.obterDesempenhoTiposRecomendacao)
app.delete('/v1/feedback-recomendacoes/limpar-antigos/:dias', controllerFeedbackRecomendacoes.limparFeedbackAntigo)
app.get('/v1/feedback-recomendacoes/:id_usuario/resumo', controllerFeedbackRecomendacoes.obterResumoFeedbackUsuario)
app.get('/v1/feedback-recomendacoes/:id_usuario/dashboard', controllerFeedbackRecomendacoes.obterDashboardFeedback)

// Endpoints - Perfil Musical Usuario
app.post('/v1/perfil-musical-usuario/:id_usuario', bodyParserJSON, controllerPerfilMusicalUsuario.criarPerfilMusicalUsuario)
app.put('/v1/perfil-musical-usuario/:id_usuario', bodyParserJSON, controllerPerfilMusicalUsuario.atualizarPerfilMusicalUsuario)
app.get('/v1/perfil-musical-usuario/:id_usuario', controllerPerfilMusicalUsuario.obterPerfilMusicalUsuario)
app.post('/v1/perfil-musical-usuario/:id_usuario/analise', bodyParserJSON, controllerPerfilMusicalUsuario.analisarPreferenciasUsuario)
app.post('/v1/perfil-musical-usuario/:id_usuario/atualizar-ia', bodyParserJSON, controllerPerfilMusicalUsuario.atualizarPerfilPorIA)
app.get('/v1/perfil-musical-usuario/:id_usuario/completo', controllerPerfilMusicalUsuario.obterPerfilCompletoUsuario)
app.get('/v1/perfil-musical-usuario/:id_usuario/estatisticas', controllerPerfilMusicalUsuario.obterEstatisticasPerfil)
app.get('/v1/perfil-musical-usuario/:id_usuario/top-generos', controllerPerfilMusicalUsuario.obterTopGenerosPreferidos)
app.get('/v1/perfil-musical-usuario/:id_usuario/top-artistas', controllerPerfilMusicalUsuario.obterTopArtistasPreferidos)
app.get('/v1/perfil-musical-usuario/:id_usuario/padroes', controllerPerfilMusicalUsuario.obterPadroesComportamentais)
app.get('/v1/perfil-musical-usuario/comparar/:id_usuario1/:id_usuario2', controllerPerfilMusicalUsuario.compararPerfisMusicais)
app.get('/v1/perfil-musical-usuario/:id_usuario/resumo', controllerPerfilMusicalUsuario.obterResumoPerfilMusical)
app.get('/v1/perfil-musical-usuario/:id_usuario/analise-detalhada', controllerPerfilMusicalUsuario.obterAnalisePerfilDetalhada)

// Endpoint de Health Check
app.get('/health', (request, response) => {
    response.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
    })
})

// Endpoint de Info da API
app.get('/info', (request, response) => {
    response.status(200).json({
        name: 'Infinity Music Backend',
        version: '1.0.0',
        description: 'Backend completo para aplicação de streaming musical com IA',
        endpoints: {
            usuarios: 5,
            musicas_favoritas: 5,
            playlists: 8,
            historico_reproducao: 7,
            amizades: 9,
            artistas_seguidos: 8,
            conquistas_usuarios: 9,
            niveis_usuarios: 14,
            salas_escuta: 13,
            recomendacoes_ia: 12,
            dados_clima: 11,
            humor_usuario: 15,
            albuns_salvos: 14,
            playlists_salvas: 15,
            feedback_recomendacoes: 15,
            perfil_musical_usuario: 12
        },
        total_endpoints: 175,
        features: [
            'Gestão completa de usuários',
            'Sistema de playlists e favoritos',
            'Histórico de reprodução',
            'Rede social (amizades, seguidores)',
            'Gamificação (níveis, conquistas)',
            'Salas de escuta compartilhada',
            'Recomendações com IA',
            'Análise contextual (clima, humor)',
            'Feedback e aprendizado',
            'Perfil musical personalizado'
        ]
    })
})

// Middleware de erro
app.use((error, request, response, next) => {
    console.error(error)
    response.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
})

// Middleware para rotas não encontradas
app.use((request, response) => {
    response.status(404).json({
        status: 'ERROR',
        message: 'Endpoint não encontrado',
        path: request.path,
        method: request.method
    })
})