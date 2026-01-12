# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.2.0] - 2026-01-12

### Adicionado
- Preferência de tema por usuário (claro/escuro/sistema)
- Seletor de tema na barra lateral com 3 opções (Sol, Lua, Monitor)
- Sincronização automática com tema do sistema operacional
- Persistência da preferência de tema no banco de dados

### Alterado
- Tema agora é individual para cada membro da família
- Cada usuário pode escolher seu próprio tema ao fazer login

## [1.1.0] - 2026-01-12

### Adicionado
- Exibição da versão do app no rodapé da sidebar
- Visualizador de changelog integrado ao app (clique na versão)
- Arquivo `version.ts` centralizado para controle de versão

## [1.0.0] - 2026-01-12

### Adicionado
- **Sistema de Autenticação por PIN**
  - Bloqueio de configurações com PIN de adulto
  - Rastreamento de qual usuário desbloqueou as configurações
  - Adultos podem ver e alterar PINs de crianças
  - Crianças só podem ver/alterar seu próprio PIN
  - Modal de alteração de PIN com confirmação

- **Integração com Telegram**
  - Configuração de Bot Token e Chat ID
  - Botão de teste para verificar configuração
  - Notificações de tarefas concluídas e prêmios resgatados

- **Integração com Google Calendar**
  - Conexão OAuth com Google Calendar
  - Sincronização de eventos da família
  - Suporte a eventos de aniversário automáticos

- **Portal Kids**
  - Interface dedicada para crianças
  - Visualização de tarefas e pontos
  - Resgate de recompensas
  - Design responsivo e amigável

- **Sistema de Tarefas**
  - Categorias: Escola, Casa, Saúde, Pessoal
  - Recorrência: diária, dias úteis, fins de semana, semanal
  - Sistema de pontos por conclusão
  - Streaks de conclusão consecutiva

- **Loja de Recompensas**
  - Categorias: Digital, Lazer, Guloseimas, Eventos
  - Sistema de aprovação por adultos
  - Histórico de resgates

- **Calendário Familiar**
  - Visualização mensal responsiva
  - Categorias de eventos com cores
  - Suporte a múltiplos participantes

- **Controle de Dispositivos**
  - Cadastro de dispositivos por MAC
  - Bloqueio/desbloqueio de acesso
  - Lista branca de dispositivos
  - Lista branca de domínios (sites sempre permitidos)
  - Atribuição de dispositivos a membros

- **Design Responsivo**
  - Layout adaptável para mobile, tablet e desktop
  - Modais em formato bottom-sheet no mobile
  - Navegação otimizada para toque

- **Tema Claro/Escuro**
  - Alternância entre modo dia e noite
  - Persistência de preferência

### Técnico
- Frontend em React 19 com TypeScript
- Estilização com Tailwind CSS
- Backend em Node.js com Express
- Banco de dados SQLite
- Build com Vite
- Testes com Vitest

---

## Convenções de Versionamento

- **MAJOR (X.0.0)**: Mudanças incompatíveis com versões anteriores
- **MINOR (0.X.0)**: Novas funcionalidades compatíveis
- **PATCH (0.0.X)**: Correções de bugs compatíveis
