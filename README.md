# VV FIT

Aplicativo pessoal (PWA) de acompanhamento de treino, alimentação e evolução corporal, feito em HTML, CSS e JavaScript puro, sem servidor, sem login e sem mensalidade. Todos os dados ficam salvos apenas no aparelho da usuária.

O conteúdo do protocolo (treinos, plano alimentar, macros) foi extraído integralmente do documento **"Treino VV.docx"** e está em [`data.js`](data.js).

## Versão 2 — registro rápido por botões

A partir da versão 2, o registro diário deixou de exigir preenchimento de carga, repetições, RPE ou quantidades consumidas. Treino e alimentação agora funcionam principalmente com **botões grandes de status** (Feito / Parcial / Não feito, e variações), salvos imediatamente ao toque. Carga, repetições, RPE, horários e observações continuam disponíveis, mas sempre dentro de um painel opcional "Adicionar detalhes" — nunca obrigatórios. Registros feitos na versão 1 (com séries detalhadas) são convertidos automaticamente na primeira abertura do app: nada é apagado, e o detalhamento antigo fica visível dentro de "Adicionar detalhes".

## 1. Estrutura dos arquivos

```
VV FIT/
├── index.html              → estrutura da página (shell do app)
├── style.css                → todo o visual (cores, layout, responsividade)
├── data.js                  → protocolo oficial (fonte: Treino VV.docx) — somente leitura
├── storage.js                → camada de dados: localStorage (registros) + IndexedDB (fotos)
├── core.js                   → utilitários, cálculo de adesão, toast, modal, instalação PWA
├── app.js                    → roteador entre telas e inicialização do app
├── screens/
│   ├── inicio.js              → tela Início
│   ├── treino.js              → tela Treino (ficha, execução, cronômetros, histórico)
│   ├── alimentacao.js         → tela Alimentação (refeições, água)
│   ├── evolucao.js            → tela Evolução (medidas, gráficos, fotos)
│   └── perfil.js               → tela Perfil (dados, check-in, calendário, relatórios, backup)
├── manifest.json             → configuração do PWA (nome, ícones, cores)
├── service-worker.js         → cache offline e atualização de versão
├── icon-192.png / icon-512.png            → ícones do app
├── icon-maskable-192.png / icon-maskable-512.png → ícones adaptativos (Android)
└── gen_icons.py               → script usado para gerar os ícones (não é necessário no dia a dia)
```

Não existe backend, banco de dados externo ou build step: são arquivos estáticos que podem ser abertos diretamente por um servidor de arquivos simples.

## 2. Como testar localmente

O app usa `fetch` e Service Worker, que exigem que os arquivos sejam servidos por `http://` (não funciona abrindo o `index.html` direto com duplo clique, protocolo `file://`).

**Opção mais simples (Python, já costuma vir instalado):**

```bash
cd "VV FIT"
python -m http.server 8080
```

Depois abra `http://localhost:8080` no Google Chrome (no computador) ou, se o celular estiver na mesma rede Wi-Fi, `http://SEU_IP_LOCAL:8080`.

**Alternativa (Node.js):**

```bash
npx serve "VV FIT"
```

## 3. Como publicar gratuitamente

Recomendado para quem não tem experiência técnica: **Netlify Drop**.

### Netlify Drop (mais simples)
1. Acesse `app.netlify.com/drop` no navegador.
2. Arraste a pasta **VV FIT** inteira para a página.
3. Em poucos segundos o Netlify gera um link público (ex: `https://algum-nome.netlify.app`).
4. Abra esse link no celular pelo Google Chrome — pronto para instalar.

Não é necessário criar conta para o primeiro deploy, nem comprar domínio.

### GitHub Pages (alternativa)
1. Crie um repositório no GitHub e envie o conteúdo da pasta **VV FIT** para a raiz dele.
2. Em **Settings → Pages**, selecione a branch principal e a pasta `/root`.
3. O GitHub fornece uma URL como `https://usuario.github.io/repositorio/`.

### Cloudflare Pages (alternativa)
Funciona de forma parecida ao GitHub Pages, conectando o repositório e publicando automaticamente a cada atualização.

## 4. Como instalar no Android

1. Abra o link publicado no **Google Chrome** do celular.
2. Toque no menu de três pontos (canto superior direito).
3. Selecione **"Adicionar à tela inicial"** ou **"Instalar aplicativo"**.
4. Confirme a instalação.

O app também mostra um botão **"Instalar aplicativo"** na tela, que abre o instalador automático do Chrome quando disponível, ou repete essas instruções.

Depois de instalado, o VV FIT abre em tela cheia, sem a barra de endereço do navegador, e funciona mesmo sem internet (os dados continuam salvos no aparelho).

## 5. Como atualizar o aplicativo no futuro

1. Edite os arquivos necessários (ex: corrigir um exercício em `data.js`, ajustar uma tela em `screens/`).
2. Abra [`service-worker.js`](service-worker.js) e aumente o número da constante `CACHE_VERSAO` (ex: de `"vvfit-v1.0.0"` para `"vvfit-v1.0.1"`). Isso é obrigatório — sem esse passo o celular continua usando a versão antiga em cache.
3. Publique novamente os arquivos atualizados (repita o passo de publicação usado antes).
4. Da próxima vez que a usuária abrir o app, o service worker baixa a nova versão em segundo plano e mostra um aviso pedindo para fechar e abrir o app novamente.

## 6. Como fazer backup

Dentro do app: **Perfil → Configurações → Exportar backup completo (JSON)**. Isso baixa um arquivo `vvfit_backup_AAAA-MM-DD.json` contendo perfil, treinos, alimentação, água, medidas, check-ins e fotos.

Guarde esse arquivo em um local seguro (Google Drive, e-mail para você mesma, etc). Para restaurar, use **Importar backup (JSON)** na mesma tela e selecione o arquivo.

Também é possível exportar registros individuais em **CSV** (treinos, alimentação, água, evolução, check-ins) para abrir em planilhas.

**Importante:** os dados ficam salvos apenas no navegador do aparelho. Se o Chrome for desinstalado, o app for removido ou o histórico/dados do navegador forem limpos, as informações são perdidas — por isso o backup é essencial.

## 7. Funcionalidades implementadas

- Protocolo completo (5 dias de treino + 2 dias de descanso, plano alimentar de 4 refeições) extraído do documento original, sem alterações.
- Navegação inferior fixa com 5 áreas: Início, Treino, Alimentação, Evolução, Perfil.
- Tela Início com saudação, data, treino do dia, protocolo do dia, adesão semanal, água, sequência de dias e frase de incentivo.
- Cards de exercício expansíveis (nome/séries/repetições/aparelho → cadência/descanso/intensidade/execução/erros comuns/objetivo).
- Registro de cargas por série (carga, repetições, RPE, concluída), com histórico, melhor carga e sugestão visual de progressão (após 2 sessões seguidas no limite superior de repetições).
- Modo "Treino em andamento": cronômetro geral, cronômetro de descanso com vibração/som e ajuste de ±15s, pausa, navegação entre exercícios, finalização com resumo (tempo, séries, carga total, RPE, observações, status completo/parcial/não realizado).
- Histórico de treinos por dia, com frequência semanal/mensal e gráficos de evolução de carga.
- Plano alimentar completo com 2 opções por refeição, substituições e finalidade de cada refeição.
- Registro de refeições (status, horário real, foto, fome/saciedade, observações) e indicador diário (dentro/parcial/fora do plano).
- Controle de água com atalhos (200/300/500ml), valor personalizado, remoção de lançamento e barra de progresso.
- Registro de medidas corporais (peso, cintura, abdômen, quadril, coxas, braços, peito, panturrilha) com gráficos individuais em SVG.
- Fotos de evolução (frontal/lateral/costas) com comparação lado a lado e slider deslizante entre duas datas.
- Check-in semanal completo, com comparação automática ao check-in anterior.
- Calendário mensal com indicadores de treino, alimentação, água e check-in por dia.
- Relatórios por período, com impressão/PDF pelo navegador e compartilhamento via Web Share API quando disponível.
- Backup/restauração completa em JSON, exportação em CSV, exclusão seletiva de dados (treino, alimentação, fotos) e exclusão total, sempre com confirmação.
- Perfil editável (nome, foto, peso, meta de peso, horário de treino, meta de água, observações).
- Funcionamento 100% offline após o primeiro acesso, instalável como aplicativo no Android via Chrome.

## 8. Limitações técnicas existentes

- **Gráficos em SVG nativo:** em vez de depender da biblioteca Chart.js (que exigiria carregamento externo), os gráficos de evolução foram implementados em SVG puro, garantindo funcionamento 100% offline sem dependências externas.
- **Fotos armazenadas como imagem:** as fotos são salvas no IndexedDB do navegador; não há compressão avançada, então um número muito grande de fotos em alta resolução pode ocupar bastante espaço no aparelho.
- **Sem notificações push:** o app não envia lembretes fora do horário em que estiver aberto (não há backend nem permissão de notificação push configurada), conforme pedido de não depender de serviços externos.
- **Armazenamento local apenas:** não há sincronização entre aparelhos. Um backup/restauração manual (JSON) é o único jeito de mover os dados de um celular para outro.
- **Cálculo de sequência de dias e adesão:** os pesos de adesão (treino/alimentação/água/check-in) são configuráveis, mas os critérios de "dia válido" seguem uma lógica simples definida em `core.js` — podem ser ajustados conforme necessidade.
