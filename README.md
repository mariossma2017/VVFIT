# VV FIT

Aplicativo pessoal (PWA) de acompanhamento de treino, alimentação e evolução
corporal, feito em HTML, CSS e JavaScript puro, **sem servidor, sem login e sem
mensalidade**. Todos os dados ficam salvos **apenas no aparelho da usuária**.

O protocolo vigente é a **Fase 1** da Verônica, transcrito integralmente do
documento **"Plano Verônica fase 1.pdf" (PROTOCOLO 2026 — Key Araújo)** e
armazenado em [`data.js`](data.js).

---

## 1. Estrutura dos arquivos

```
VVFIT/
├── index.html               → shell do app e ordem de carregamento dos scripts
├── style.css                → identidade visual (roxo/rosa), layout, responsividade
├── vendor/
│   └── jspdf.umd.min.js      → jsPDF 2.5.1 (vendorizado — usado só na exportação de PDF)
├── data.js                  → protocolo:
│                                • PROTOCOLO        = Fase 1 (plano vigente)
│                                • PROTOCOLO_LEGADO = plano anterior ("Treino VV.docx"),
│                                  usado só para o "previsto" de datas antigas
├── storage.js               → camada de dados: localStorage (registros) + IndexedDB (fotos)
├── core.js                  → utilitários, Planos (plano vigente por data),
│                              Adesao (cálculos), migração de dados, toast/modal, PWA
├── resumo.js                → cálculo do resumo de acompanhamento + geração de PDF (jsPDF)
├── app.js                   → roteador entre telas e inicialização
├── screens/
│   ├── inicio.js             → tela Início (resumo do dia, atalho para o PDF)
│   ├── treino.js             → tela Treino (ficha da Fase 1, status por botões,
│   │                            registro de AEJ e escada, cronômetros, histórico)
│   ├── alimentacao.js        → tela Alimentação (5 refeições da Fase 1, água)
│   ├── evolucao.js           → tela Evolução (medidas, sono/disposição, gráficos, fotos)
│   └── perfil.js             → tela Perfil (dados, fase do plano, suplementação,
│                                check-in, calendário, RESUMO SEMANAL EM PDF, backup)
├── manifest.json            → configuração do PWA
├── service-worker.js        → cache offline e atualização de versão (CACHE_VERSAO)
├── icon-*.png               → ícones do app
└── gen_icons.py             → script auxiliar para gerar ícones (não é necessário no dia a dia)
```

Não há backend nem build step. São arquivos estáticos servidos por `http://`.

---

## 2. Como o app funciona

### 2.1. Perfil
O app é de **uso individual**: existe **um** perfil (`vvfit_perfil`), com nome,
foto, peso atual/meta, altura, horário de treino, meta de água e observações,
editável em **Perfil → Editar perfil**. O plano em si (treinos e refeições) vive
no código (`data.js`), não no perfil — não há "planos de outros usuários" neste
repositório.

### 2.2. Plano da Fase 1 (fonte: PDF)
- **Alimentação — 5 refeições.** Cada refeição tem **uma composição**. As
  alternativas com "ou" (ex.: *"100 g peito de frango ou 80 g carne magra"*)
  são preservadas como **um único item**, nunca somadas.
- **Suplementação.** Transcrita em **Perfil → Suplementação** como
  *informativo do plano recebido*, com aviso explícito de que o app **não
  prescreve, não ajusta doses e não recomenda nada**. Há um campo livre de
  anotações de consulta.
- **Hidratação.** Meta de **3 L de água/dia + 500 ml de chá de cavalinha**
  (chá contabilizado à parte). Orientações do documento (sem açúcar, sem óleo,
  sal ≤ 6 g/dia) ficam em Perfil → Fase do plano.
- **Treinos** (segunda a sábado; domingo é descanso):
  - Segunda e sexta: Glúteo + Posterior completo
  - Terça: Upper + 15 min de escada
  - Quarta: Quadríceps completo
  - Quinta: Upper + 15 min de escada
  - Sábado: Abdômen + 20 min de escada
  - **AEJ**: 30 min de segunda a sábado
  - Descanso entre séries: 50 s (série normal) / 60 s (bi-série)
- **Sem calorias / macros / horários**: o PDF não traz esses números, então
  **eles não existem no app** (não foram inventados). Onde faria sentido
  mostrá-los, aparece a observação de que não constam no documento.
- **Refeição livre**: 1 por semana, a cada 2 semanas, após avaliação. **Feedback**
  a cada 2 semanas, em jejum, no sábado ou domingo. Ambos preservados em
  Perfil → Fase do plano.

### 2.3. Fase do plano e preservação do histórico
- A Fase 1 tem uma **data de início configurável** em
  **Perfil → Fase do plano** (`config.faseInicio`).
- Para qualquer data **anterior** a essa, o "previsto" (treino do dia,
  nº de refeições) é calculado pelo **plano anterior** (`PROTOCOLO_LEGADO`) —
  ver `Planos.vigenteEm(iso)` em `core.js`.
- Se a data ficar **em branco**, a Fase 1 vale para todas as datas.
- Sessões de treino registradas **antes** da data de início **não recebem** os
  exercícios da Fase 1 (o histórico fica exatamente como foi registrado).

### 2.4. Registro de acompanhamento
- **Treino**: status por exercício e status geral (Feito / Parcial / Não feito),
  salvos ao toque. Carga, repetições, RPE e observações são **sempre opcionais**
  (painel "Adicionar detalhes").
- **AEJ e escada**: registrados **separadamente**, por data, com **duração em
  minutos** (tela Treino, bloco "AEJ e escada — hoje").
- **Refeições**: Feito / Feito com substituição / Parcial / Não feito.
- **Água**: em ml (atalhos 200/300/500 + valor personalizado).
- **Peso e medidas**: tela Evolução.
- **Sono e disposição**: opcionais, na tela Evolução (registro diário de
  bem-estar, à parte das medidas).
- **"Não realizado" ≠ "não informado"**: campo vazio **nunca** vira zero nem
  descumprimento. Dia de treino passado sem registro conta como
  *"não informado"* e fica **de fora** do cálculo de adesão.

---

## 3. Onde os dados ficam salvos

| Dado | Local | Chave |
|---|---|---|
| Perfil, configurações | `localStorage` | `vvfit_perfil`, `vvfit_config` |
| Treinos | `localStorage` | `vvfit_treinos` |
| Refeições, água | `localStorage` | `vvfit_alimentacao`, `vvfit_agua` |
| **AEJ e escada** | `localStorage` | `vvfit_cardio` |
| **Sono e disposição** | `localStorage` | `vvfit_bemestar` |
| Medidas, check-ins | `localStorage` | `vvfit_evolucao`, `vvfit_checkins` |
| Fotos (binário) | `IndexedDB` | banco `vvfit_photos_db` |
| Versão do formato | `localStorage` | `vvfit_versaoDados` |

**Nada sai do aparelho.** Backup/restauração manual em **Perfil → Configurações
→ Exportar/Importar backup completo (JSON)** (inclui `cardio` e `bemestar`).
Também há exportação por categoria em **CSV**.

### Migração de dados
`core.js → Migracao` versiona o formato dos registros. A migração é sempre
**aditiva**: nenhum registro é apagado, remapeado ou zerado.
- **v1 → v2**: registro simplificado por botões (séries antigas viram
  `seriesLegado`, visíveis em "Adicionar detalhes").
- **v2 → v3** (Fase 1): apenas define `config.faseInicio` (padrão: data da
  primeira abertura após a atualização, se já houver histórico; editável em
  Perfil). Registros de refeição antigos mantêm o `refeicaoId` original
  (café/almoço/…) e continuam contando no histórico e nos relatórios.

---

## 4. Resumo semanal em PDF

Botão em **Perfil → Resumo semanal em PDF** (e atalho na tela Início).

**Períodos**: Semana (segunda a domingo) · Últimos 14 dias (feedback quinzenal)
· Personalizado.

**Conteúdo** (só seções com dados aparecem; alvo de 1–2 páginas):
nome, fase, período e data de geração; treinos previstos × realizados e
resumo por dia; adesão de treino e alimentar **com os critérios à vista**;
AEJ e escada (sessões e minutos, separados); hidratação média dos dias
preenchidos; peso inicial/final com datas e variação (ou "não informado");
medidas e variações quando disponíveis; evolução de cargas **só quando há
registros comparáveis**; sono e disposição quando registrados; observações da
usuária e pontos para o profissional.

**Regras**: períodos em andamento **não** contam dias futuros como falta; usa o
**plano vigente em cada data**; **não** inventa evolução, **não** estima perda de
gordura, **não** faz diagnóstico. Fotos ficam **fora por padrão** (caixa opcional).

**Arquivo**: `VVFIT_Resumo_<Nome>_<AAAA-MM-DD>_a_<AAAA-MM-DD>.pdf`
(ex.: `VVFIT_Resumo_Veronica_2026-09-07_a_2026-09-13.pdf`).

**Tecnologia**: [jsPDF 2.5.1](vendor/jspdf.umd.min.js), vendorizado (funciona
offline). As fontes padrão cobrem os acentos do português; símbolos fora do
Latin-1 (→, ≈) são trocados por equivalentes ASCII antes de escrever no PDF.

### Compartilhar (WhatsApp)
Botão **"Compartilhar PDF (WhatsApp)"**:
1. Se o navegador permitir compartilhar **arquivos** (`navigator.canShare({files})`),
   abre o **compartilhamento nativo** do celular — a pessoa escolhe o WhatsApp e
   o destinatário.
2. Se não permitir, o PDF é **baixado** e o app mostra uma orientação curta para
   anexá-lo manualmente no WhatsApp (Documento → Downloads).

O app **nunca** usa um link `wa.me` como se ele anexasse o PDF, e **nada é
enviado sem ação da usuária**.

---

## 5. Como testar localmente

Precisa de `http://` (Service Worker + `fetch`).

```bash
cd VVFIT
python -m http.server 8080
```

Abra `http://localhost:8080` no Chrome. Sem Python, qualquer servidor estático
serve (`npx serve`, extensão "Live Server" do VS Code, etc.).

Checklist de teste manual:
- Abrir com dados de uma versão anterior e conferir que treinos, refeições,
  água, medidas e check-ins continuam lá após a migração.
- Fase 1 na tela Alimentação (5 refeições, "ou" preservado) e Treino
  (exercícios e esquemas de séries).
- Resumo em PDF com dados completos, incompletos e período sem registros;
  acentos, textos longos e quebra de página.
- Baixar e compartilhar o PDF; alternativa quando o compartilhamento de
  arquivos não estiver disponível.
- Layout no celular (sem rolagem horizontal).

---

## 6. Como instalar no celular

1. Abra o link publicado no **Chrome** (Android) ou **Safari** (iPhone).
2. Menu → **"Adicionar à tela inicial"** / **"Instalar aplicativo"**.
3. O app abre em tela cheia e funciona offline; os dados continuam no aparelho.

No iPhone, `navigator.share` com arquivos costuma funcionar no Safari 16+; em
navegadores mais antigos o app cai automaticamente no download + instrução.

---

## 7. Como publicar / atualizar

**Publicação**: **GitHub Pages**, branch **`main`**, pasta raiz —
`https://mariossma2017.github.io/VVFIT/`. Cada push para `main` dispara um novo
build automático (1–2 min).

Para publicar uma alteração:
1. Edite os arquivos.
2. **Aumente `CACHE_VERSAO`** em [`service-worker.js`](service-worker.js)
   (ex.: `vvfit-v3.0.0` → `vvfit-v3.0.1`). **Obrigatório** — sem isso o celular
   continua com a versão em cache. Se adicionar/renomear arquivos, atualize
   também `ARQUIVOS_ESSENCIAIS` na mesma lista.
3. `git add -A && git commit && git push origin main` (sem `--force`).
4. Na próxima abertura, o service worker baixa a nova versão em segundo plano e
   mostra um aviso pedindo para fechar e abrir o app. **A atualização do cache
   não apaga `localStorage` nem `IndexedDB`** — os dados da usuária permanecem.

Alternativas de hospedagem (mesma pasta, arquivos estáticos): Netlify Drop,
Cloudflare Pages.

---

## 8. Funcionalidades

- Protocolo completo da Fase 1 (alimentação de 5 refeições + treinos de segunda
  a sábado + AEJ), transcrito do PDF, sem invenção de números.
- Suplementação como informativo (sem prescrição) + anotações de consulta.
- Registro rápido por botões (treino e alimentação), com detalhes opcionais.
- Registro separado de **AEJ** e **escada** com duração.
- Registro diário opcional de **sono** e **disposição**.
- Controle de água, medidas corporais, fotos de evolução com comparação.
- Check-in semanal com comparação automática.
- Calendário mensal com indicadores por dia.
- **Resumo semanal em PDF** (semana / 14 dias / personalizado) com download e
  compartilhamento nativo (WhatsApp), critérios de cálculo à vista, sem
  diagnóstico e sem estimativa de composição corporal.
- Backup/restauração completa (JSON) e exportação por categoria (CSV).
- 100% offline após o primeiro acesso; instalável como PWA.

## 9. Limitações conhecidas

- **Estimativas nutricionais**: o app não exibe calorias/macros porque o
  documento da Fase 1 não os traz. Se algum dia forem adicionados, devem ser
  marcados claramente como estimativa e com a base usada.
- **Service Worker**: só registra em `http(s)://` real (não no `file://` nem em
  alguns ambientes de pré-visualização). Em produção (GitHub Pages) funciona.
- **Compartilhamento de arquivo**: depende de `navigator.canShare({files})`.
  Onde não houver, o app baixa o PDF e orienta o anexo manual.
- **Sem sincronização entre aparelhos**: backup/restauração manual (JSON) é o
  único caminho.
- **Gráficos em SVG nativo** e **fotos sem compressão avançada** (IndexedDB),
  como nas versões anteriores.
