-- =============================================
-- Banco de Dados Completo para Aplicação de Música
-- =============================================

-- Limpar banco de dados existente (cuidado em produção)
-- DROP DATABASE IF EXISTS app_musicas;
-- CREATE DATABASE app_musicas;
-- USE app_musicas;

-- =============================================
-- Tabelas Principais
-- =============================================

-- Tabela de Usuários
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_usuario VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    nome_completo VARCHAR(100),
    biografia TEXT,
    url_avatar VARCHAR(255),
    data_nascimento DATE,
    pais VARCHAR(50),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    esta_ativo BOOLEAN DEFAULT TRUE,
    e_premium BOOLEAN DEFAULT FALSE,
    ultimo_login TIMESTAMP NULL,
    tempo_total_reproducao INT DEFAULT 0, -- em minutos
    INDEX idx_nome_usuario (nome_usuario),
    INDEX idx_email (email)
);

-- Tabela de Gêneros Musicais
CREATE TABLE generos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) UNIQUE NOT NULL,
    descricao TEXT,
    cor VARCHAR(7), -- hex color
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Artistas
CREATE TABLE artistas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    biografia TEXT,
    url_imagem VARCHAR(255),
    pais VARCHAR(50),
    ano_formacao INT,
    verificado BOOLEAN DEFAULT FALSE,
    ouvintes_mensais INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nome (nome)
);

-- Tabela de Álbuns
CREATE TABLE albuns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    id_artista INT NOT NULL,
    data_lancamento DATE,
    url_capa VARCHAR(255),
    total_faixas INT DEFAULT 0,
    duracao_minutos INT DEFAULT 0,
    gravadora VARCHAR(100),
    id_genero INT,
    pontuacao_popularidade DECIMAL(3,2) DEFAULT 0.00,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_artista) REFERENCES artistas(id) ON DELETE CASCADE,
    FOREIGN KEY (id_genero) REFERENCES generos(id) ON DELETE SET NULL,
    INDEX idx_titulo (titulo),
    INDEX idx_artista (id_artista),
    INDEX idx_data_lancamento (data_lancamento)
);

-- Tabela de Músicas
CREATE TABLE musicas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    id_artista INT NOT NULL,
    id_album INT,
    duracao_segundos INT NOT NULL,
    numero_faixa INT DEFAULT 1,
    url_arquivo VARCHAR(255),
    url_previsualizacao VARCHAR(255),
    letra TEXT,
    explicito BOOLEAN DEFAULT FALSE,
    contador_reproducoes INT DEFAULT 0,
    contador_curtidas INT DEFAULT 0,
    nivel_energia DECIMAL(3,2) DEFAULT 0.50, -- 0.00 a 1.00 para IA
    valencia DECIMAL(3,2) DEFAULT 0.50, -- positividade/negatividade para IA
    capacidade_danca DECIMAL(3,2) DEFAULT 0.50, -- capacidade de dança para IA
    acusticidade DECIMAL(3,2) DEFAULT 0.50, -- nível acústico para IA
    tempo DECIMAL(6,2) DEFAULT 120.00, -- BPM para IA
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_artista) REFERENCES artistas(id) ON DELETE CASCADE,
    FOREIGN KEY (id_album) REFERENCES albuns(id) ON DELETE SET NULL,
    INDEX idx_titulo (titulo),
    INDEX idx_artista (id_artista),
    INDEX idx_album (id_album),
    INDEX idx_contador_reproducoes (contador_reproducoes),
    INDEX idx_nivel_energia (nivel_energia),
    INDEX idx_valencia (valencia)
);

-- Tabela de Gêneros por Música (muitos-para-muitos)
CREATE TABLE musicas_generos (
    id_musica INT NOT NULL,
    id_genero INT NOT NULL,
    PRIMARY KEY (id_musica, id_genero),
    FOREIGN KEY (id_musica) REFERENCES musicas(id) ON DELETE CASCADE,
    FOREIGN KEY (id_genero) REFERENCES generos(id) ON DELETE CASCADE
);

-- Tabela de Playlists
CREATE TABLE playlists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    id_usuario INT NOT NULL,
    e_publica BOOLEAN DEFAULT FALSE,
    url_capa VARCHAR(255),
    total_musicas INT DEFAULT 0,
    duracao_total INT DEFAULT 0, -- em segundos
    contador_reproducoes INT DEFAULT 0,
    contador_curtidas INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_nome (nome),
    INDEX idx_usuario (id_usuario),
    INDEX idx_publica (e_publica)
);

-- Tabela de Músicas em Playlists
CREATE TABLE playlist_musicas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_playlist INT NOT NULL,
    id_musica INT NOT NULL,
    posicao INT NOT NULL,
    adicionada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    adicionada_por INT NOT NULL,
    FOREIGN KEY (id_playlist) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (id_musica) REFERENCES musicas(id) ON DELETE CASCADE,
    FOREIGN KEY (adicionada_por) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_playlist_musica_posicao (id_playlist, posicao),
    UNIQUE KEY unique_playlist_musica (id_playlist, id_musica),
    INDEX idx_playlist (id_playlist),
    INDEX idx_musica (id_musica)
);

-- =============================================
-- Tabelas de Interação do Usuário
-- =============================================

-- Músicas Favoritas do Usuário
CREATE TABLE musicas_favoritas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_musica INT NOT NULL,
    favoritada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_musica) REFERENCES musicas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_musica_favorita (id_usuario, id_musica),
    INDEX idx_usuario (id_usuario),
    INDEX idx_musica (id_musica)
);

-- Álbuns Salvos do Usuário
CREATE TABLE albuns_salvos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_album INT NOT NULL,
    salvo_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_album) REFERENCES albuns(id) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_album_salvo (id_usuario, id_album),
    INDEX idx_usuario (id_usuario),
    INDEX idx_album (id_album)
);

-- Playlists Salvas do Usuário
CREATE TABLE playlists_salvas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_playlist INT NOT NULL,
    salva_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_playlist) REFERENCES playlists(id) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_playlist_salva (id_usuario, id_playlist),
    INDEX idx_usuario (id_usuario),
    INDEX idx_playlist (id_playlist)
);

-- Artistas Seguidos pelo Usuário
CREATE TABLE artistas_seguidos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_artista INT NOT NULL,
    seguido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_artista) REFERENCES artistas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_artista_seguido (id_usuario, id_artista),
    INDEX idx_usuario (id_usuario),
    INDEX idx_artista (id_artista)
);

-- Histórico de Reprodução
CREATE TABLE historico_reproducao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_musica INT NOT NULL,
    reproduzida_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duracao_reproduzida INT DEFAULT 0, -- segundos reproduzidos
    tipo_dispositivo VARCHAR(50), -- mobile, web, desktop
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_musica) REFERENCES musicas(id) ON DELETE CASCADE,
    INDEX idx_usuario (id_usuario),
    INDEX idx_musica (id_musica),
    INDEX idx_reproduzida_em (reproduzida_em)
);

-- =============================================
-- Tabelas de Amizades e Salas
-- =============================================

-- Amizades entre Usuários
CREATE TABLE amizades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario1 INT NOT NULL,
    id_usuario2 INT NOT NULL,
    status ENUM('pendente', 'aceita', 'bloqueada') DEFAULT 'pendente',
    solicitada_por INT NOT NULL,
    criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario1) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario2) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (solicitada_por) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_amizade (id_usuario1, id_usuario2),
    INDEX idx_usuario1 (id_usuario1),
    INDEX idx_usuario2 (id_usuario2),
    INDEX idx_status (status)
);

-- Salas de Escuta Compartilhada
CREATE TABLE salas_escuta (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    id_criador INT NOT NULL,
    id_musica_atual INT NULL,
    esta_ativa BOOLEAN DEFAULT TRUE,
    e_publica BOOLEAN DEFAULT FALSE,
    max_participantes INT DEFAULT 10,
    posicao_atual INT DEFAULT 0, -- segundos da música atual
    esta_reproduzindo BOOLEAN DEFAULT FALSE,
    criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_criador) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_musica_atual) REFERENCES musicas(id) ON DELETE SET NULL,
    INDEX idx_criador (id_criador),
    INDEX idx_ativa (esta_ativa),
    INDEX idx_publica (e_publica)
);

-- Participantes das Salas
CREATE TABLE participantes_sala (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_sala INT NOT NULL,
    id_usuario INT NOT NULL,
    entrou_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    e_admin BOOLEAN DEFAULT FALSE,
    ultimo_visto TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sala) REFERENCES salas_escuta(id) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_sala_usuario (id_sala, id_usuario),
    INDEX idx_sala (id_sala),
    INDEX idx_usuario (id_usuario)
);

-- Fila de Músicas das Salas
CREATE TABLE fila_sala (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_sala INT NOT NULL,
    id_musica INT NOT NULL,
    adicionada_por INT NOT NULL,
    posicao INT NOT NULL,
    adicionada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sala) REFERENCES salas_escuta(id) ON DELETE CASCADE,
    FOREIGN KEY (id_musica) REFERENCES musicas(id) ON DELETE CASCADE,
    FOREIGN KEY (adicionada_por) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_sala (id_sala),
    INDEX idx_posicao (posicao)
);

-- =============================================
-- Tabelas de Gamificação
-- =============================================

-- Badges/Conquistas
CREATE TABLE conquistas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    url_icone VARCHAR(255),
    categoria VARCHAR(50), -- listening, social, discovery, etc.
    raridade ENUM('comum', 'raro', 'epico', 'lendario') DEFAULT 'comum',
    valor_pontos INT DEFAULT 0,
    criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_categoria (categoria),
    INDEX idx_raridade (raridade)
);

-- Badges Conquistadas pelos Usuários
CREATE TABLE conquistas_usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_conquista INT NOT NULL,
    conquistada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dados_progresso JSON, -- dados de progresso se for badge incremental
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_conquista) REFERENCES conquistas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_conquista (id_usuario, id_conquista),
    INDEX idx_usuario (id_usuario),
    INDEX idx_conquista (id_conquista)
);

-- Níveis do Usuário
CREATE TABLE niveis_usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL UNIQUE,
    nivel INT DEFAULT 1,
    pontos_experiencia INT DEFAULT 0,
    tempo_total_reproducao INT DEFAULT 0, -- minutos totais
    total_musicas_descobertas INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- =============================================
-- Tabelas de IA e Recomendações
-- =============================================

-- Perfil de Personalidade Musical do Usuário (IA)
CREATE TABLE perfil_musical_usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL UNIQUE,
    tipo_personalidade VARCHAR(50), -- explorador, nostalgico, energetico, etc.
    preferencia_energia DECIMAL(3,2) DEFAULT 0.50,
    preferencia_valencia DECIMAL(3,2) DEFAULT 0.50,
    preferencia_danca DECIMAL(3,2) DEFAULT 0.50,
    preferencia_acustica DECIMAL(3,2) DEFAULT 0.50,
    tempo_preferencia_min DECIMAL(6,2) DEFAULT 60.00,
    tempo_preferencia_max DECIMAL(6,2) DEFAULT 140.00,
    pesos_generos JSON, -- pesos para cada gênero
    pesos_artistas JSON, -- pesos para artistas favoritos
    padroes_hora_dia JSON, -- padrões de escuta por hora
    padroes_clima JSON, -- padrões por clima
    padroes_humor JSON, -- padrões por humor
    ultima_analise TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Recomendações da IA
CREATE TABLE recomendacoes_ia (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_musica INT NOT NULL,
    tipo_recomendacao ENUM('diaria', 'clima', 'horario', 'humor', 'similar', 'descoberta') NOT NULL,
    pontuacao_confianca DECIMAL(3,2) DEFAULT 0.50,
    dados_contexto JSON, -- dados contextuais (clima, hora, etc.)
    foi_reproduzida BOOLEAN DEFAULT FALSE,
    foi_curtida BOOLEAN DEFAULT NULL,
    criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expira_em TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_musica) REFERENCES musicas(id) ON DELETE CASCADE,
    INDEX idx_usuario (id_usuario),
    INDEX idx_tipo (tipo_recomendacao),
    INDEX idx_criada (criada_em),
    INDEX idx_expira (expira_em)
);

-- Feedback do Usuário sobre Recomendações
CREATE TABLE feedback_recomendacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_recomendacao INT NOT NULL,
    id_usuario INT NOT NULL,
    tipo_feedback ENUM('reproduzir', 'curtir', 'pular', 'nao_curtir', 'adicionar_playlist') NOT NULL,
    timestamp_feedback TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_recomendacao) REFERENCES recomendacoes_ia(id) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_recomendacao (id_recomendacao),
    INDEX idx_usuario (id_usuario),
    INDEX idx_tipo_feedback (tipo_feedback)
);

-- =============================================
-- Tabelas de Contexto para IA
-- =============================================

-- Dados de Clima
CREATE TABLE dados_clima (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    localizacao VARCHAR(100),
    temperatura DECIMAL(5,2),
    umidade DECIMAL(5,2),
    condicao_climatica VARCHAR(50), -- ensolarado, chuvoso, nublado, etc.
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (id_usuario),
    INDEX idx_timestamp (timestamp)
);

-- Estado Emocional/Humor do Usuário
CREATE TABLE humor_usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    tipo_humor VARCHAR(50), -- feliz, triste, energetico, relaxado, etc.
    intensidade DECIMAL(3,2) DEFAULT 0.50, -- 0.00 a 1.00
    origem VARCHAR(50), -- manual, detectado, etc.
    registrado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (id_usuario),
    INDEX idx_registrado (registrado_em)
);

-- =============================================
-- Views Úteis
-- =============================================

-- View de Estatísticas do Usuário
CREATE VIEW estatisticas_usuario AS
SELECT 
    u.id as id_usuario,
    u.nome_usuario,
    COUNT(DISTINCT pm.id_musica) as musicas_unicas_reproduzidas,
    COUNT(DISTINCT hr.id_musica) as total_musicas_historico,
    SUM(hr.duracao_reproduzida) as total_segundos_reproduzidos,
    COUNT(DISTINCT mf.id_musica) as total_musicas_favoritas,
    COUNT(DISTINCT asal.id_album) as total_albuns_salvos,
    COUNT(DISTINCT psal.id_playlist) as total_playlists_salvas,
    COUNT(DISTINCT CASE WHEN a.id_usuario1 = u.id THEN a.id_usuario2 ELSE a.id_usuario1 END) as total_amigos,
    nu.nivel,
    nu.pontos_experiencia,
    COUNT(DISTINCT cu.id_conquista) as total_conquistas
FROM usuarios u
LEFT JOIN historico_reproducao hr ON u.id = hr.id_usuario
LEFT JOIN playlist_musicas pm ON hr.id_musica = pm.id_musica
LEFT JOIN musicas_favoritas mf ON u.id = mf.id_usuario
LEFT JOIN albuns_salvos asal ON u.id = asal.id_usuario
LEFT JOIN playlists_salvas psal ON u.id = psal.id_usuario
LEFT JOIN amizades a ON (u.id = a.id_usuario1 OR u.id = a.id_usuario2) AND a.status = 'aceita'
LEFT JOIN niveis_usuarios nu ON u.id = nu.id_usuario
LEFT JOIN conquistas_usuarios cu ON u.id = cu.id_usuario
GROUP BY u.id, u.nome_usuario, nu.nivel, nu.pontos_experiencia;

-- View de Músicas Populares
CREATE VIEW musicas_populares AS
SELECT 
    m.id,
    m.titulo,
    a.nome as nome_artista,
    al.titulo as titulo_album,
    m.contador_reproducoes,
    m.contador_curtidas,
    (m.contador_reproducoes * 0.7 + m.contador_curtidas * 0.3) as pontuacao_popularidade,
    m.nivel_energia,
    m.valencia,
    m.capacidade_danca
FROM musicas m
JOIN artistas a ON m.id_artista = a.id
LEFT JOIN albuns al ON m.id_album = al.id
ORDER BY pontuacao_popularidade DESC;

-- =============================================
-- Triggers para Atualização Automática
-- =============================================

DELIMITER //

-- Trigger para atualizar total de músicas na playlist
CREATE TRIGGER atualizar_total_musicas_playlist 
AFTER INSERT ON playlist_musicas
FOR EACH ROW
BEGIN
    UPDATE playlists 
    SET total_musicas = (
        SELECT COUNT(*) 
        FROM playlist_musicas 
        WHERE id_playlist = NEW.id_playlist
    ),
    duracao_total = (
        SELECT SUM(m.duracao_segundos)
        FROM playlist_musicas pm
        JOIN musicas m ON pm.id_musica = m.id
        WHERE pm.id_playlist = NEW.id_playlist
    )
    WHERE id = NEW.id_playlist;
END//

-- Trigger para atualizar contador de reproduções da música
CREATE TRIGGER atualizar_contador_reproducoes_musica 
AFTER INSERT ON historico_reproducao
FOR EACH ROW
BEGIN
    UPDATE musicas 
    SET contador_reproducoes = contador_reproducoes + 1
    WHERE id = NEW.id_musica;
END//

-- Trigger para atualizar experiência do usuário
CREATE TRIGGER atualizar_experiencia_usuario 
AFTER INSERT ON historico_reproducao
FOR EACH ROW
BEGIN
    INSERT INTO niveis_usuarios (id_usuario, pontos_experiencia, tempo_total_reproducao)
    VALUES (NEW.id_usuario, 1, FLOOR(NEW.duracao_reproduzida / 60))
    ON DUPLICATE KEY UPDATE 
        pontos_experiencia = pontos_experiencia + 1,
        tempo_total_reproducao = tempo_total_reproducao + FLOOR(NEW.duracao_reproduzida / 60);
END//

DELIMITER ;

-- =============================================
-- Dados Iniciais (Opcional)
-- =============================================

-- Inserir gêneros musicais básicos
INSERT INTO generos (nome, descricao, cor) VALUES
('Rock', 'Rock and roll e suas variações', '#FF6B6B'),
('Pop', 'Música popular comercial', '#4ECDC4'),
('Hip Hop', 'Hip hop e rap', '#45B7D1'),
('Jazz', 'Jazz e suas variações', '#96CEB4'),
('Classica', 'Música clássica', '#FFEAA7'),
('Eletronica', 'Música eletrônica', '#DDA0DD'),
('Country', 'Música country', '#F4A460'),
('R&B', 'Rhythm and Blues', '#FF69B4'),
('Reggae', 'Reggae e dancehall', '#90EE90'),
('Metal', 'Heavy metal e variações', '#8B4513');

-- Inserir conquistas básicas
INSERT INTO conquistas (nome, descricao, categoria, raridade, valor_pontos) VALUES
('Primeira Música', 'Ouviu sua primeira música', 'listening', 'comum', 10),
('Explorador Musical', 'Descobriu 50 músicas diferentes', 'discovery', 'comum', 50),
('Borboleta Social', 'Fez 10 amigos', 'social', 'raro', 100),
('Mestre de Playlists', 'Criou 5 playlists', 'creation', 'comum', 25),
('Coruja Noturna', 'Ouviu música após meia-noite', 'listening', 'comum', 15),
('Pássaro Matinal', 'Ouviu música antes das 6h', 'listening', 'comum', 15),
('Especialista em Gênero', 'Ouviu 100 músicas do mesmo gênero', 'discovery', 'raro', 75),
('Anfitrião de Sala', 'Criou sua primeira sala de escuta', 'social', 'comum', 20),
('Colecionador de Conquistas', 'Conquistou 10 badges', 'achievement', 'raro', 100),
('Veterano Musical', '1000 horas de escuta', 'listening', 'epico', 200);

-- =============================================
-- Índices Adicionais para Performance
-- =============================================

-- Índices compostos para consultas frequentes
CREATE INDEX idx_historico_usuario_musica ON historico_reproducao(id_usuario, id_musica);
CREATE INDEX idx_musicas_favoritas_usuario_data ON musicas_favoritas(id_usuario, favoritada_em);
CREATE INDEX idx_recomendacoes_usuario_tipo ON recomendacoes_ia(id_usuario, tipo_recomendacao);
CREATE INDEX idx_participantes_sala_ativos ON participantes_sala(id_sala, id_usuario) WHERE ultimo_visto > DATE_SUB(NOW(), INTERVAL 1 HOUR);

-- Índices para busca de texto completo (se suportado)
-- ALTER TABLE musicas ADD FULLTEXT(titulo, letra);
-- ALTER TABLE artistas ADD FULLTEXT(nome, biografia);
-- ALTER TABLE albuns ADD FULLTEXT(titulo);
