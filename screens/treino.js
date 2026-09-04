/* VV FIT — Tela Treino
 * Registro rápido por botões grandes de status (Feito / Parcial / Não feito).
 * Carga, repetições e RPE são sempre opcionais, dentro de "Adicionar detalhes".
 */

let diaTreinoSelecionado = Util.isoParaDiaSemana(Util.hojeISO());
let bannerDesfazer = null; // { sessaoId, exerciciosAntes } — some após qualquer outra ação
const descansosAtivos = {}; // { [nomeExercicio]: { segundosRestantes, total, intervalId } }
let cronTreinoInterval = null;

function renderTreino() {
  renderVisaoTreinoDia();
}

function renderVisaoTreinoDia() {
  const container = document.getElementById("tela-treino");
  const dia = diaTreinoSelecionado;

  container.innerHTML = `
    <div class="dias-semana-scroll" id="seletor-dias-treino">
      ${PROTOCOLO.ordemDiasSemana
        .map((d) => {
          const p = PROTOCOLO.treinos[d];
          const status = p.tipo === "descanso" ? "descanso" : Adesao.statusTreinoNoDia(diaISOparaEsteDia(d));
          const icone =
            p.tipo === "descanso"
              ? "🌙"
              : status === "completo"
              ? "✅"
              : status === "parcial"
              ? "⚠️"
              : "⏳";
          return `<div class="dia-pill ${d === dia ? "selecionado" : ""}" data-dia="${d}">
            <div class="dia-nome">${DIAS_CURTO[d]}</div>
            <div class="dia-status">${icone}</div>
          </div>`;
        })
        .join("")}
    </div>
    <div class="card" id="card-cardio-dia">${renderRegistroCardio(Util.hojeISO())}</div>
    <div id="conteudo-dia-treino"></div>
  `;

  document.querySelectorAll("#seletor-dias-treino .dia-pill").forEach((el) => {
    el.addEventListener("click", () => selecionarDiaTreino(el.getAttribute("data-dia")));
  });

  ligarEventosRegistroCardio(Util.hojeISO());
  renderConteudoDia(dia);
}

/* ---------------- Registro de AEJ e escada (separados, por data) ---------------- */
function renderRegistroCardio(data) {
  const proto = Planos.vigenteEm(data);
  const diaSemana = Util.isoParaDiaSemana(data);
  const treinoDia = proto.treinos[diaSemana];
  const aejPrevisto = proto.aej && proto.aej.dias && proto.aej.dias.indexOf(diaSemana) !== -1
    ? proto.aej.minutos
    : null;
  const escadaPrevista = treinoDia && treinoDia.cardio && treinoDia.cardio.tempo ? treinoDia.cardio.tempo : null;

  const sessoes = DB.getCardio().filter((c) => c.data === data);
  const totalAej = sessoes.filter((s) => s.tipo === "aej").reduce((n, s) => n + (Number(s.minutos) || 0), 0);
  const totalEscada = sessoes.filter((s) => s.tipo === "escada").reduce((n, s) => n + (Number(s.minutos) || 0), 0);

  return `
    <div class="card-titulo-linha">
      <h3>🚶 AEJ e escada — hoje</h3>
      <span class="texto-suave">${Util.isoParaBR(data)}</span>
    </div>
    <p class="texto-suave">
      Previsto hoje: AEJ ${aejPrevisto ? aejPrevisto + " min" : "—"}${escadaPrevista ? " · escada " + Util.escapeHtml(escadaPrevista) : ""}
    </p>
    <div class="grid-stats">
      <div class="stat-box"><span class="valor">${totalAej || 0}</span><span class="rotulo">AEJ (min)</span></div>
      <div class="stat-box"><span class="valor">${totalEscada || 0}</span><span class="rotulo">Escada (min)</span></div>
    </div>
    <div class="linha-campos mt-16">
      <div class="campo-grupo">
        <label for="cardio-aej-min">AEJ realizado (min)</label>
        <input type="number" id="cardio-aej-min" inputmode="numeric" min="0" placeholder="Ex: 30">
      </div>
      <button type="button" class="btn btn-secundario btn-pequeno" id="btn-add-aej">Registrar AEJ</button>
    </div>
    <div class="linha-campos">
      <div class="campo-grupo">
        <label for="cardio-escada-min">Escada realizada (min)</label>
        <input type="number" id="cardio-escada-min" inputmode="numeric" min="0" placeholder="Ex: 15">
      </div>
      <button type="button" class="btn btn-secundario btn-pequeno" id="btn-add-escada">Registrar escada</button>
    </div>
    ${sessoes.length ? `
      <div class="secao-titulo">Sessões de hoje</div>
      ${sessoes.map((s) => `
        <div class="agua-lista-item">
          <span>${s.tipo === "aej" ? "AEJ" : "Escada"} — ${Number(s.minutos) || 0} min${s.criadoEm ? " · " + new Date(s.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : ""}</span>
          <button type="button" class="btn-icone btn-pequeno" data-remover-cardio="${s.id}" style="width:30px;height:30px;min-height:30px;">✕</button>
        </div>
      `).join("")}
    ` : ""}
    <p class="texto-suave mt-8">Campo vazio não conta como zero: registre apenas o que realmente fez.</p>
  `;
}

function ligarEventosRegistroCardio(data) {
  const recarregar = () => {
    const card = document.getElementById("card-cardio-dia");
    if (card) {
      card.innerHTML = renderRegistroCardio(data);
      ligarEventosRegistroCardio(data);
    }
  };
  const addSessao = (tipo, inputId) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    const min = Number(input.value);
    if (!min || min <= 0) {
      mostrarToast("Informe os minutos.", "erro");
      return;
    }
    DB.addCardio({ id: Util.uuid(), data, tipo, minutos: min, obs: "", criadoEm: new Date().toISOString() });
    mostrarToast(`${tipo === "aej" ? "AEJ" : "Escada"} registrado`, "sucesso");
    recarregar();
  };
  const btnAej = document.getElementById("btn-add-aej");
  if (btnAej) btnAej.addEventListener("click", () => addSessao("aej", "cardio-aej-min"));
  const btnEscada = document.getElementById("btn-add-escada");
  if (btnEscada) btnEscada.addEventListener("click", () => addSessao("escada", "cardio-escada-min"));
  document.querySelectorAll("[data-remover-cardio]").forEach((btn) => {
    btn.addEventListener("click", () => {
      DB.removeCardio(btn.getAttribute("data-remover-cardio"));
      recarregar();
    });
  });
}

function diaISOparaEsteDia(diaSemanaAlvo) {
  // retorna a data ISO mais recente (<= hoje) cujo dia da semana bate com diaSemanaAlvo
  const hoje = Util.hojeISO();
  for (let i = 0; i < 7; i++) {
    const d = Util.addDias(hoje, -i);
    if (Util.isoParaDiaSemana(d) === diaSemanaAlvo) return d;
  }
  return hoje;
}

function selecionarDiaTreino(dia) {
  pararTodosOsDescansos();
  pararCronTreinoDisplay();
  diaTreinoSelecionado = dia;
  bannerDesfazer = null;
  document.querySelectorAll("#seletor-dias-treino .dia-pill").forEach((el) => {
    el.classList.toggle("selecionado", el.getAttribute("data-dia") === dia);
  });
  renderConteudoDia(dia);
}

/* ---------------- Modelo de dados da sessão do dia ---------------- */

function obterSessaoTreino(data, diaSemana) {
  const sessao = DB.getTreinos().find((t) => t.data === data && t.diaSemana === diaSemana) || null;
  if (sessao) reconciliarExerciciosComProtocolo(sessao, diaSemana);
  return sessao;
}

// Garante que sessões já salvas ganhem exercícios adicionados/corrigidos
// posteriormente no protocolo (data.js), sem apagar nenhum status já registrado.
function reconciliarExerciciosComProtocolo(sessao, diaSemana) {
  // Não injeta exercícios da Fase 1 em sessões anteriores ao início da Fase 1:
  // o histórico antigo é preservado exatamente como foi registrado.
  const faseInicio = DB.getFaseInicio();
  if (faseInicio && sessao.data < faseInicio) return;
  const proto = PROTOCOLO.treinos[diaSemana];
  if (!proto || !proto.exercicios) return;
  let alterou = false;
  proto.exercicios.forEach((ex) => {
    if (!sessao.exercicios.some((e) => e.nome === ex.nome)) {
      sessao.exercicios.push({
        nome: ex.nome,
        ordem: ex.ordem,
        status: null,
        cargaDetalhe: "",
        repsDetalhe: "",
        rpeDetalhe: "",
        observacaoDetalhe: ""
      });
      alterou = true;
    }
  });
  if (alterou) {
    sessao.exercicios.sort((a, b) => a.ordem - b.ordem);
    salvarSessaoTreino(sessao);
  }
}

function obterOuCriarSessaoTreino(data, diaSemana) {
  let sessao = obterSessaoTreino(data, diaSemana);
  if (sessao) return sessao;
  const proto = PROTOCOLO.treinos[diaSemana];
  sessao = {
    id: Util.uuid(),
    data,
    diaSemana,
    treinoNome: proto.nome,
    exercicios: proto.exercicios.map((ex) => ({
      nome: ex.nome,
      ordem: ex.ordem,
      status: null,
      cargaDetalhe: "",
      repsDetalhe: "",
      rpeDetalhe: "",
      observacaoDetalhe: ""
    })),
    status: null,
    statusGeralManual: false,
    duracaoSeg: null,
    rpeGeral: "",
    comoSenti: "",
    observacoes: "",
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString()
  };
  DB.addTreino(sessao);
  return sessao;
}

function salvarSessaoTreino(sessao) {
  sessao.atualizadoEm = new Date().toISOString();
  if (!sessao.statusGeralManual) {
    sessao.status = calcularStatusGeralAuto(sessao.exercicios);
  }
  DB.updateTreino(sessao.id, sessao);
}

function calcularStatusGeralAuto(exercicios) {
  const marcados = exercicios.filter((e) => e.status);
  if (!marcados.length) return "nao_realizado";
  if (exercicios.every((e) => e.status === "feito")) return "completo";
  if (exercicios.some((e) => e.status === "feito" || e.status === "parcial")) return "parcial";
  return "nao_realizado";
}

function definirStatusExercicio(sessao, nomeExercicio, novoStatus) {
  const ex = sessao.exercicios.find((e) => e.nome === nomeExercicio);
  if (!ex) return;
  ex.status = ex.status === novoStatus ? null : novoStatus;
  salvarSessaoTreino(sessao);
}

function definirStatusGeralManual(sessao, novoStatus) {
  if (sessao.statusGeralManual && sessao.status === novoStatus) {
    sessao.statusGeralManual = false;
    sessao.status = calcularStatusGeralAuto(sessao.exercicios);
  } else {
    sessao.statusGeralManual = true;
    sessao.status = novoStatus;
  }
  salvarSessaoTreino(sessao);
}

/* ---------------- Renderização do dia ---------------- */

function renderConteudoDia(dia) {
  const el = document.getElementById("conteudo-dia-treino");
  if (!el) return;
  const proto = PROTOCOLO.treinos[dia];

  if (proto.tipo === "descanso") {
    el.innerHTML = `
      <div class="card texto-centro">
        <div class="emoji-lg">🌙</div>
        <h2>Dia de descanso</h2>
        <p class="texto-suave">Recuperação também é parte do protocolo. Aproveite para dormir bem e manter a hidratação em dia.</p>
      </div>
    `;
    return;
  }

  const dataAlvo = diaISOparaEsteDia(dia);
  const sessao = obterSessaoTreino(dataAlvo, dia);
  const exerciciosStatus = proto.exercicios.map((ex) => {
    const registro = sessao ? sessao.exercicios.find((e) => e.nome === ex.nome) : null;
    return { proto: ex, registro };
  });

  el.innerHTML = `
    ${bannerDesfazer && bannerDesfazer.sessaoId === (sessao && sessao.id) ? `
      <div class="card banner-desfazer">
        <span>Marcações atualizadas em massa.</span>
        <button type="button" class="btn btn-pequeno btn-outline" id="btn-desfazer-massa">Desfazer</button>
      </div>
    ` : ""}

    <div class="card cronometro-discreto">
      <div class="card-titulo-linha">
        <span class="texto-suave">⏱ Cronômetro do treino: <strong id="cron-treino-valor">${Util.formatarMMSS(obterCronTreinoSegundos(dataAlvo, dia))}</strong></span>
        <div id="cron-treino-botoes">${renderBotoesCronTreino(dataAlvo, dia)}</div>
      </div>
    </div>

    <div class="grid-2">
      <button type="button" class="btn btn-secundario btn-pequeno" id="btn-marcar-todos-feitos">✅ Marcar todos como feitos</button>
      <button type="button" class="btn btn-outline btn-pequeno" id="btn-limpar-marcacoes">🧹 Limpar marcações do treino</button>
    </div>

    <div class="card mt-16">
      <h2>${Util.escapeHtml(proto.nome)}</h2>
      <div class="tag-lista">
        ${proto.grupos.map((g) => `<span class="tag">${Util.escapeHtml(g)}</span>`).join("")}
      </div>
      ${proto.observacaoDia ? `<p class="mt-8">${Util.escapeHtml(proto.observacaoDia)}</p>` : ""}
      ${proto.aquecimento ? `
        <div class="secao-titulo">Aquecimento</div>
        <p class="texto-suave">${Util.escapeHtml(proto.aquecimento.equipamento || "—")}${proto.aquecimento.tempo ? " · " + Util.escapeHtml(proto.aquecimento.tempo) : ""}</p>
        ${proto.aquecimento.intensidade ? `<p class="texto-suave">${Util.escapeHtml(proto.aquecimento.intensidade)}</p>` : ""}
      ` : ""}
    </div>

    <div class="secao-titulo">Exercícios (${proto.exercicios.length})</div>
    <div id="lista-exercicios">
      ${exerciciosStatus.map(({ proto: ex, registro }) => renderExercicioItem(ex, registro)).join("")}
    </div>

    ${proto.cardio ? `
      <div class="card">
        <h3>Escada (fim do treino)</h3>
        <p class="texto-suave">${Util.escapeHtml(proto.cardio.equipamento)}${proto.cardio.tempo ? " · " + Util.escapeHtml(proto.cardio.tempo) : ""}</p>
        ${proto.cardio.intensidade ? `<p class="texto-suave">${Util.escapeHtml(proto.cardio.intensidade)}</p>` : ""}
        ${proto.cardio.objetivo ? `<p class="mt-8">${Util.escapeHtml(proto.cardio.objetivo)}</p>` : ""}
        <p class="texto-suave mt-8">Registre a escada realizada no bloco "AEJ e escada" acima.</p>
      </div>
    ` : ""}

    ${proto.progressao ? `
      <div class="card">
        <h3>Orientação de progressão</h3>
        <p>${Util.escapeHtml(proto.progressao)}</p>
      </div>
    ` : ""}

    <div class="card">
      <h3>Status geral do treino</h3>
      <p class="texto-suave">${sessao && sessao.statusGeralManual ? "Ajustado manualmente." : "Calculado automaticamente a partir dos exercícios."}</p>
      <div class="status-botoes-geral">
        <button type="button" class="btn-status ${sessao && sessao.status === "completo" ? "ativo-feito" : ""}" data-status-geral="completo">✅ Treino feito</button>
        <button type="button" class="btn-status ${sessao && sessao.status === "parcial" ? "ativo-parcial" : ""}" data-status-geral="parcial">⚠️ Treino parcial</button>
        <button type="button" class="btn-status ${sessao && sessao.status === "nao_realizado" ? "ativo-nao-feito" : ""}" data-status-geral="nao_realizado">❌ Treino não feito</button>
      </div>
      ${sessao && sessao.statusGeralManual ? `<button type="button" class="btn-discreto" id="btn-recalcular-status">🔄 Recalcular automaticamente</button>` : ""}
      <button type="button" class="btn-discreto" id="btn-toggle-detalhes-treino">Adicionar detalhes do treino</button>
      <div class="hidden" id="detalhes-treino-geral">
        <label for="detalhe-rpe-geral">RPE geral do treino (1-10)</label>
        <input type="number" id="detalhe-rpe-geral" min="1" max="10" inputmode="numeric" value="${sessao ? sessao.rpeGeral || "" : ""}">
        <label for="detalhe-como-senti">Como me senti hoje?</label>
        <select id="detalhe-como-senti">
          <option value="">Selecione</option>
          <option value="otima" ${sessao && sessao.comoSenti === "otima" ? "selected" : ""}>Ótima</option>
          <option value="boa" ${sessao && sessao.comoSenti === "boa" ? "selected" : ""}>Boa</option>
          <option value="cansada" ${sessao && sessao.comoSenti === "cansada" ? "selected" : ""}>Cansada</option>
          <option value="dolorida" ${sessao && sessao.comoSenti === "dolorida" ? "selected" : ""}>Dolorida</option>
          <option value="desmotivada" ${sessao && sessao.comoSenti === "desmotivada" ? "selected" : ""}>Desmotivada</option>
        </select>
        <label for="detalhe-obs-treino">Observações</label>
        <textarea id="detalhe-obs-treino" placeholder="Algo a registrar sobre este treino?">${sessao ? Util.escapeHtml(sessao.observacoes || "") : ""}</textarea>
        <button type="button" class="btn btn-outline btn-pequeno mt-8" id="btn-salvar-detalhes-treino">Salvar detalhes</button>
      </div>
    </div>

    <div class="secao-titulo">Histórico deste treino</div>
    <div id="historico-dia">${renderHistoricoDia(dia)}</div>
  `;

  ligarEventosDia(dia, dataAlvo);
}

function renderExercicioItem(ex, registro) {
  const status = registro ? registro.status : null;
  const classeStatus =
    status === "feito" ? "ex-feito" : status === "parcial" ? "ex-parcial" : status === "nao_feito" ? "ex-nao-feito" : "ex-pendente";
  const ultimo = ultimoRegistroExercicio(ex.nome);
  const melhorCargaVal = melhorCarga(ex.nome);
  const sugerir = sugerirProgressao(ex.nome, ex.repeticoes);
  const descanso = descansosAtivos[ex.nome];

  return `
    <div class="exercicio-card ${classeStatus}" data-ex-nome="${Util.escapeHtml(ex.nome)}">
      <div class="exercicio-cabecalho">
        <div class="num">${ex.ordem}</div>
        <div class="info-principal">
          <div class="nome-exercicio">${Util.escapeHtml(ex.nome)}</div>
          <div class="meta-linha">${Util.escapeHtml(esquemaExercicio(ex))}${ex.equipamento ? " · " + Util.escapeHtml(ex.equipamento) : ""}</div>
        </div>
        <div class="seta-expandir">▼</div>
      </div>
      <div class="exercicio-detalhe">
        ${ex.cadencia ? detalheItem("Cadência", ex.cadencia) : ""}
        ${detalheItem("Descanso", ex.descanso || "—")}
        ${ex.intensidade ? detalheItem("Intensidade / RPE", ex.intensidade) : ""}
        ${ex.grupoMuscular ? detalheItem("Grupo muscular", ex.grupoMuscular) : ""}
        ${ex.execucao ? detalheItem("Execução correta", ex.execucao) : ""}
        ${ex.errosComuns ? detalheItem("Erros comuns", ex.errosComuns) : ""}
        ${ex.objetivo ? detalheItem("Objetivo do exercício", ex.objetivo) : ""}
        <button type="button" class="btn-discreto" data-iniciar-descanso="${parseDescansoSegundos(ex.descanso)}">⏱ Iniciar descanso opcional (${ex.descanso || "—"})</button>
      </div>

      <div class="exercicio-rodape">
        <div class="status-botoes-linha">
          <button type="button" class="btn-status ${status === "feito" ? "ativo-feito" : ""}" data-status="feito">✅ Feito</button>
          <button type="button" class="btn-status ${status === "parcial" ? "ativo-parcial" : ""}" data-status="parcial">⚠️ Parcial</button>
          <button type="button" class="btn-status ${status === "nao_feito" ? "ativo-nao-feito" : ""}" data-status="nao_feito">❌ Não feito</button>
        </div>

        <div class="cronometro-descanso-inline ${descanso ? "" : "hidden"}" data-descanso-inline>
          <span class="texto-suave">Descanso: <strong data-descanso-valor>${descanso ? Util.formatarMMSS(descanso.segundosRestantes) : "00:00"}</strong></span>
          <div class="cronometro-controles-inline">
            <button type="button" class="btn-icone btn-pequeno" data-descanso-menos>−15s</button>
            <button type="button" class="btn btn-secundario btn-pequeno" data-descanso-pular>Pular</button>
            <button type="button" class="btn-icone btn-pequeno" data-descanso-mais>+15s</button>
          </div>
        </div>

        ${ultimo || melhorCargaVal > 0 || sugerir ? `
          <div class="ultimo-registro">
            ${ultimo ? `Último registro: ${resumoUltimoRegistro(ultimo.exercicio)}` : ""}
            ${melhorCargaVal > 0 ? ` · Melhor carga: ${melhorCargaVal}kg` : ""}
          </div>
        ` : ""}
        ${sugerir ? `<div class="sugestao-progressao">💪 Nas duas últimas sessões você completou o exercício no limite superior de repetições. Pode ser um bom momento para tentar um pouco mais de carga.</div>` : ""}

        <button type="button" class="btn-discreto" data-toggle-detalhes-registro>Adicionar detalhes</button>
        <div class="detalhes-registro-exercicio hidden" data-detalhes-registro>
          <label>Carga utilizada (kg)</label>
          <input type="number" step="0.5" inputmode="decimal" data-campo-detalhe="cargaDetalhe" value="${registro ? registro.cargaDetalhe || "" : ""}" placeholder="Opcional">
          <label>Repetições realizadas</label>
          <input type="number" inputmode="numeric" data-campo-detalhe="repsDetalhe" value="${registro ? registro.repsDetalhe || "" : ""}" placeholder="Opcional">
          <label>RPE</label>
          <input type="number" min="1" max="10" inputmode="numeric" data-campo-detalhe="rpeDetalhe" value="${registro ? registro.rpeDetalhe || "" : ""}" placeholder="Opcional">
          <label>Observação</label>
          <textarea data-campo-detalhe="observacaoDetalhe" placeholder="Opcional">${registro ? Util.escapeHtml(registro.observacaoDetalhe || "") : ""}</textarea>
          ${registro && registro.seriesLegado && registro.seriesLegado.length ? `
            <div class="detalhe-item mt-8">
              <div class="rotulo">Registro anterior (formato antigo)</div>
              <div class="valor-texto">${resumoSeriesLegado(registro.seriesLegado)}</div>
            </div>
          ` : ""}
          <button type="button" class="btn btn-outline btn-pequeno mt-8" data-salvar-detalhes-registro>Salvar detalhes</button>
        </div>
      </div>
    </div>
  `;
}

function detalheItem(rotulo, valor) {
  return `<div class="detalhe-item"><div class="rotulo">${Util.escapeHtml(rotulo)}</div><div class="valor-texto">${Util.escapeHtml(valor)}</div></div>`;
}

// Esquema de séries/repetições: usa ex.esquema quando o documento traz um
// formato irregular (ex.: "1x25 + 3x20"); caso contrário monta "SÉRIESxREPS".
function esquemaExercicio(ex) {
  if (ex.esquema) return ex.esquema;
  const s = ex.series;
  const r = ex.repeticoes;
  if (s === null || s === undefined || s === "") return String(r || "");
  return `${s}x${r}`;
}

function resumoUltimoRegistro(ex) {
  if (ex.cargaDetalhe || ex.repsDetalhe) {
    return `${ex.cargaDetalhe ? ex.cargaDetalhe + "kg" : "—"} × ${ex.repsDetalhe ? ex.repsDetalhe + " reps" : "—"}`;
  }
  if (ex.seriesLegado && ex.seriesLegado.length) return resumoSeriesLegado(ex.seriesLegado);
  return "sem detalhes numéricos";
}

function resumoSeriesLegado(series) {
  const feitas = series.filter((s) => s.concluida);
  if (!feitas.length) return "sem séries concluídas registradas";
  const cargas = feitas.map((s) => s.carga).filter((c) => c !== null && c !== undefined && c !== "");
  const reps = feitas.map((s) => s.reps).filter((r) => r !== null && r !== undefined && r !== "");
  return `${cargas.length ? cargas.join("/") + "kg" : "—"} × ${reps.length ? reps.join("/") : "—"} reps (${feitas.length} série(s))`;
}

function ultimoRegistroExercicio(nome) {
  const sessoes = DB.getTreinos()
    .filter((t) => (t.exercicios || []).some((e) => e.nome === nome && (e.cargaDetalhe || e.repsDetalhe || (e.seriesLegado && e.seriesLegado.length))))
    .sort((a, b) => (a.data + (a.criadoEm || "")).localeCompare(b.data + (b.criadoEm || "")));
  if (!sessoes.length) return null;
  const ultima = sessoes[sessoes.length - 1];
  return { data: ultima.data, exercicio: ultima.exercicios.find((e) => e.nome === nome) };
}

function melhorCarga(nome) {
  let melhor = 0;
  DB.getTreinos().forEach((t) => {
    (t.exercicios || []).forEach((ex) => {
      if (ex.nome !== nome) return;
      const c = parseFloat(ex.cargaDetalhe);
      if (!isNaN(c) && c > melhor) melhor = c;
      (ex.seriesLegado || []).forEach((s) => {
        const cl = parseFloat(s.carga);
        if (!isNaN(cl) && cl > melhor) melhor = cl;
      });
    });
  });
  return melhor;
}

function parseUpperRep(str) {
  if (!str) return null;
  const nums = String(str).match(/\d+/g);
  if (!nums) return null;
  return Math.max(...nums.map(Number));
}

function sugerirProgressao(nome, repeticoesProtocolo) {
  const upper = parseUpperRep(repeticoesProtocolo);
  if (!upper) return false;
  const sessoes = DB.getTreinos()
    .filter((t) => (t.exercicios || []).some((e) => e.nome === nome && e.status === "feito"))
    .sort((a, b) => (a.data + (a.criadoEm || "")).localeCompare(b.data + (b.criadoEm || "")));
  if (sessoes.length < 2) return false;
  const ultimas2 = sessoes.slice(-2);
  return ultimas2.every((t) => {
    const ex = t.exercicios.find((e) => e.nome === nome);
    if (ex.repsDetalhe !== "" && ex.repsDetalhe !== undefined && ex.repsDetalhe !== null) {
      return parseFloat(ex.repsDetalhe) >= upper;
    }
    if (ex.seriesLegado && ex.seriesLegado.length) {
      return ex.seriesLegado.every((s) => s.concluida && parseFloat(s.reps) >= upper);
    }
    return false;
  });
}

/* ---------------- Histórico por dia ---------------- */
function renderHistoricoDia(dia) {
  const sessoes = DB.getTreinos()
    .filter((t) => t.diaSemana === dia)
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 4);

  if (!sessoes.length) {
    return `<p class="texto-suave">Nenhum treino registrado ainda para este dia.</p>`;
  }

  return sessoes
    .map((s) => {
      const feitos = (s.exercicios || []).filter((e) => e.status === "feito").length;
      const parciais = (s.exercicios || []).filter((e) => e.status === "parcial").length;
      return `
    <div class="card">
      <div class="card-titulo-linha">
        <strong>${Util.isoParaBR(s.data)}</strong>
        <span class="badge-adesao ${s.status === "completo" ? "adesao-excelente" : s.status === "parcial" ? "adesao-parcial" : "adesao-baixa"}">${rotuloStatusTreino(s.status)}</span>
      </div>
      <p class="texto-suave">Duração: ${s.duracaoSeg ? Util.formatarDuracao(s.duracaoSeg) : "—"} · RPE geral: ${s.rpeGeral || "—"}</p>
      <p class="texto-suave">Exercícios feitos: ${feitos}/${(s.exercicios || []).length}${parciais ? ` · Parciais: ${parciais}` : ""}</p>
      ${s.observacoes ? `<p class="mt-8">${Util.escapeHtml(s.observacoes)}</p>` : ""}
    </div>
  `;
    })
    .join("");
}

/* ---------------- Eventos ---------------- */

function ligarEventosDia(dia, dataAlvo) {
  document.querySelectorAll(".exercicio-cabecalho").forEach((h) => {
    h.addEventListener("click", () => {
      h.closest(".exercicio-card").classList.toggle("aberto");
    });
  });

  document.querySelectorAll("[data-toggle-detalhes-registro]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const painel = btn.nextElementSibling;
      painel.classList.toggle("hidden");
    });
  });

  const btnToggleDetalhesTreino = document.getElementById("btn-toggle-detalhes-treino");
  if (btnToggleDetalhesTreino) {
    btnToggleDetalhesTreino.addEventListener("click", () => {
      document.getElementById("detalhes-treino-geral").classList.toggle("hidden");
    });
  }

  // botões de status por exercício
  document.querySelectorAll(".exercicio-card").forEach((card) => {
    const nome = card.getAttribute("data-ex-nome");
    card.querySelectorAll(".status-botoes-linha [data-status]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        bannerDesfazer = null;
        const sessao = obterOuCriarSessaoTreino(dataAlvo, dia);
        definirStatusExercicio(sessao, nome, btn.getAttribute("data-status"));
        mostrarToast("Salvo", "sucesso");
        renderConteudoDia(dia);
      });
    });

    // salvar detalhes opcionais (carga/reps/rpe/observação)
    const btnSalvarDetalhes = card.querySelector("[data-salvar-detalhes-registro]");
    if (btnSalvarDetalhes) {
      btnSalvarDetalhes.addEventListener("click", () => {
        const sessao = obterOuCriarSessaoTreino(dataAlvo, dia);
        const ex = sessao.exercicios.find((e) => e.nome === nome);
        if (ex) {
          card.querySelectorAll("[data-campo-detalhe]").forEach((input) => {
            ex[input.getAttribute("data-campo-detalhe")] = input.value;
          });
          salvarSessaoTreino(sessao);
          mostrarToast("Detalhes salvos", "sucesso");
        }
      });
    }

    // cronômetro de descanso opcional inline
    const btnIniciarDescanso = card.querySelector("[data-iniciar-descanso]");
    if (btnIniciarDescanso) {
      btnIniciarDescanso.addEventListener("click", (e) => {
        e.stopPropagation();
        iniciarDescansoInline(nome, Number(btnIniciarDescanso.getAttribute("data-iniciar-descanso")), dia);
      });
    }
    const inlineBox = card.querySelector("[data-descanso-inline]");
    if (inlineBox) {
      const btnMenos = inlineBox.querySelector("[data-descanso-menos]");
      const btnMais = inlineBox.querySelector("[data-descanso-mais]");
      const btnPular = inlineBox.querySelector("[data-descanso-pular]");
      if (btnMenos) btnMenos.addEventListener("click", () => ajustarDescansoInline(nome, -15));
      if (btnMais) btnMais.addEventListener("click", () => ajustarDescansoInline(nome, 15));
      if (btnPular) btnPular.addEventListener("click", () => finalizarDescansoInline(nome, dia));
    }
  });

  // status geral do treino
  document.querySelectorAll("[data-status-geral]").forEach((btn) => {
    btn.addEventListener("click", () => {
      bannerDesfazer = null;
      const sessao = obterOuCriarSessaoTreino(dataAlvo, dia);
      definirStatusGeralManual(sessao, btn.getAttribute("data-status-geral"));
      mostrarToast("Status do treino atualizado", "sucesso");
      renderConteudoDia(dia);
    });
  });

  const btnRecalcular = document.getElementById("btn-recalcular-status");
  if (btnRecalcular) {
    btnRecalcular.addEventListener("click", () => {
      const sessao = obterOuCriarSessaoTreino(dataAlvo, dia);
      sessao.statusGeralManual = false;
      salvarSessaoTreino(sessao);
      renderConteudoDia(dia);
    });
  }

  const btnSalvarDetalhesTreino = document.getElementById("btn-salvar-detalhes-treino");
  if (btnSalvarDetalhesTreino) {
    btnSalvarDetalhesTreino.addEventListener("click", () => {
      const sessao = obterOuCriarSessaoTreino(dataAlvo, dia);
      sessao.rpeGeral = document.getElementById("detalhe-rpe-geral").value;
      sessao.comoSenti = document.getElementById("detalhe-como-senti").value;
      sessao.observacoes = document.getElementById("detalhe-obs-treino").value;
      salvarSessaoTreino(sessao);
      mostrarToast("Detalhes do treino salvos", "sucesso");
    });
  }

  // ações rápidas
  const btnMarcarTodos = document.getElementById("btn-marcar-todos-feitos");
  if (btnMarcarTodos) {
    btnMarcarTodos.addEventListener("click", async () => {
      const ok = await confirmarAcao({
        titulo: "Marcar todos como feitos",
        mensagem: "Todos os exercícios deste treino serão marcados como feitos. Deseja continuar?",
        textoConfirmar: "Marcar todos"
      });
      if (!ok) return;
      const sessao = obterOuCriarSessaoTreino(dataAlvo, dia);
      const exerciciosAntes = JSON.parse(JSON.stringify(sessao.exercicios));
      sessao.exercicios.forEach((e) => (e.status = "feito"));
      salvarSessaoTreino(sessao);
      bannerDesfazer = { sessaoId: sessao.id, exerciciosAntes };
      mostrarToast("Todos os exercícios marcados como feitos", "sucesso");
      renderConteudoDia(dia);
    });
  }

  const btnLimpar = document.getElementById("btn-limpar-marcacoes");
  if (btnLimpar) {
    btnLimpar.addEventListener("click", async () => {
      const sessao = obterSessaoTreino(dataAlvo, dia);
      if (!sessao) {
        mostrarToast("Nada para limpar neste treino.", "erro");
        return;
      }
      const ok = await confirmarAcao({
        titulo: "Limpar marcações",
        mensagem: "Todas as marcações de status deste treino serão removidas. Os detalhes opcionais preenchidos (carga, reps, RPE, observações) não serão apagados. Deseja continuar?",
        perigo: true,
        textoConfirmar: "Limpar"
      });
      if (!ok) return;
      const exerciciosAntes = JSON.parse(JSON.stringify(sessao.exercicios));
      sessao.exercicios.forEach((e) => (e.status = null));
      sessao.statusGeralManual = false;
      salvarSessaoTreino(sessao);
      bannerDesfazer = { sessaoId: sessao.id, exerciciosAntes };
      mostrarToast("Marcações limpas", "sucesso");
      renderConteudoDia(dia);
    });
  }

  const btnDesfazer = document.getElementById("btn-desfazer-massa");
  if (btnDesfazer && bannerDesfazer) {
    btnDesfazer.addEventListener("click", () => {
      const sessao = obterSessaoTreino(dataAlvo, dia);
      if (sessao && bannerDesfazer) {
        sessao.exercicios = bannerDesfazer.exerciciosAntes;
        sessao.statusGeralManual = false;
        salvarSessaoTreino(sessao);
      }
      bannerDesfazer = null;
      mostrarToast("Alteração desfeita", "sucesso");
      renderConteudoDia(dia);
    });
  }

  ligarEventosCronTreino(dataAlvo, dia);
}

/* ---------------- Cronômetro de descanso inline (opcional, por exercício) ---------------- */

function iniciarDescansoInline(nome, segundos, dia) {
  pararDescansoInline(nome);
  descansosAtivos[nome] = { segundosRestantes: segundos, total: segundos };
  const card = document.querySelector(`.exercicio-card[data-ex-nome="${cssEscape(nome)}"]`);
  if (card) {
    card.querySelector("[data-descanso-inline]").classList.remove("hidden");
    atualizarValorDescansoInline(nome, card);
  }
  descansosAtivos[nome].intervalId = setInterval(() => {
    const d = descansosAtivos[nome];
    if (!d) return;
    d.segundosRestantes--;
    const cardAtual = document.querySelector(`.exercicio-card[data-ex-nome="${cssEscape(nome)}"]`);
    if (cardAtual) atualizarValorDescansoInline(nome, cardAtual);
    if (d.segundosRestantes <= 0) finalizarDescansoInline(nome, dia);
  }, 1000);
}

function atualizarValorDescansoInline(nome, card) {
  const d = descansosAtivos[nome];
  const valorEl = card.querySelector("[data-descanso-valor]");
  if (valorEl && d) valorEl.textContent = Util.formatarMMSS(d.segundosRestantes);
}

function ajustarDescansoInline(nome, delta) {
  const d = descansosAtivos[nome];
  if (!d) return;
  d.segundosRestantes = Math.max(0, d.segundosRestantes + delta);
  const card = document.querySelector(`.exercicio-card[data-ex-nome="${cssEscape(nome)}"]`);
  if (card) atualizarValorDescansoInline(nome, card);
}

function finalizarDescansoInline(nome, dia) {
  pararDescansoInline(nome);
  delete descansosAtivos[nome];
  const cfg = DB.getConfig();
  if (cfg.vibrarDescanso && navigator.vibrate) navigator.vibrate([300, 150, 300]);
  if (cfg.somDescanso) tocarBipDescanso();
  const card = document.querySelector(`.exercicio-card[data-ex-nome="${cssEscape(nome)}"]`);
  if (card) {
    const box = card.querySelector("[data-descanso-inline]");
    if (box) box.classList.add("hidden");
  }
}

function pararDescansoInline(nome) {
  if (descansosAtivos[nome] && descansosAtivos[nome].intervalId) {
    clearInterval(descansosAtivos[nome].intervalId);
  }
}

function pararTodosOsDescansos() {
  Object.keys(descansosAtivos).forEach((nome) => pararDescansoInline(nome));
  for (const k in descansosAtivos) delete descansosAtivos[k];
}

function cssEscape(str) {
  return String(str).replace(/["\\]/g, "\\$&");
}

/* ---------------- Cronômetro geral do treino (opcional) ---------------- */

function chaveCronTreino(data, dia) {
  return `vvfit_cron_treino_${data}_${dia}`;
}

function obterEstadoCronTreino(data, dia) {
  try {
    const raw = localStorage.getItem(chaveCronTreino(data, dia));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function salvarEstadoCronTreino(data, dia, estado) {
  localStorage.setItem(chaveCronTreino(data, dia), JSON.stringify(estado));
}

function limparEstadoCronTreino(data, dia) {
  localStorage.removeItem(chaveCronTreino(data, dia));
}

function obterCronTreinoSegundos(data, dia) {
  const estado = obterEstadoCronTreino(data, dia);
  if (!estado) return 0;
  if (estado.pausado) return (estado.pausadoAcumuladoMs || 0) / 1000;
  return (Date.now() - estado.inicioTimestamp - (estado.pausadoAcumuladoMsBase || 0)) / 1000;
}

function renderBotoesCronTreino(data, dia) {
  const estado = obterEstadoCronTreino(data, dia);
  if (!estado) {
    return `<button type="button" class="btn btn-pequeno btn-outline" id="btn-cron-treino-iniciar">Iniciar</button>`;
  }
  if (estado.pausado) {
    return `
      <button type="button" class="btn btn-pequeno btn-secundario" id="btn-cron-treino-retomar">Retomar</button>
      <button type="button" class="btn btn-pequeno btn-outline" id="btn-cron-treino-salvar">Salvar e encerrar</button>
    `;
  }
  return `
    <button type="button" class="btn btn-pequeno btn-secundario" id="btn-cron-treino-pausar">Pausar</button>
    <button type="button" class="btn btn-pequeno btn-outline" id="btn-cron-treino-salvar">Salvar e encerrar</button>
  `;
}

function ligarEventosCronTreino(data, dia) {
  pararCronTreinoDisplay();

  const btnIniciar = document.getElementById("btn-cron-treino-iniciar");
  if (btnIniciar) {
    btnIniciar.addEventListener("click", () => {
      salvarEstadoCronTreino(data, dia, { inicioTimestamp: Date.now(), pausadoAcumuladoMsBase: 0, pausado: false });
      atualizarBotoesCronTreino(data, dia);
      iniciarCronTreinoDisplay(data, dia);
    });
  }

  const btnPausar = document.getElementById("btn-cron-treino-pausar");
  if (btnPausar) {
    btnPausar.addEventListener("click", () => {
      const estado = obterEstadoCronTreino(data, dia);
      if (!estado) return;
      const decorridoMs = Date.now() - estado.inicioTimestamp - (estado.pausadoAcumuladoMsBase || 0);
      salvarEstadoCronTreino(data, dia, { pausado: true, pausadoAcumuladoMs: decorridoMs, inicioTimestamp: estado.inicioTimestamp, pausadoAcumuladoMsBase: estado.pausadoAcumuladoMsBase || 0 });
      atualizarBotoesCronTreino(data, dia);
      pararCronTreinoDisplay();
    });
  }

  const btnRetomar = document.getElementById("btn-cron-treino-retomar");
  if (btnRetomar) {
    btnRetomar.addEventListener("click", () => {
      const estado = obterEstadoCronTreino(data, dia);
      if (!estado) return;
      salvarEstadoCronTreino(data, dia, {
        inicioTimestamp: Date.now(),
        pausadoAcumuladoMsBase: estado.pausadoAcumuladoMs || 0,
        pausado: false
      });
      atualizarBotoesCronTreino(data, dia);
      iniciarCronTreinoDisplay(data, dia);
    });
  }

  const btnSalvar = document.getElementById("btn-cron-treino-salvar");
  if (btnSalvar) {
    btnSalvar.addEventListener("click", () => {
      const segundos = Math.round(obterCronTreinoSegundos(data, dia));
      const sessao = obterOuCriarSessaoTreino(data, dia);
      sessao.duracaoSeg = segundos;
      salvarSessaoTreino(sessao);
      limparEstadoCronTreino(data, dia);
      pararCronTreinoDisplay();
      mostrarToast(`Tempo salvo: ${Util.formatarDuracao(segundos)}`, "sucesso");
      renderConteudoDia(dia);
    });
  }

  const estado = obterEstadoCronTreino(data, dia);
  if (estado && !estado.pausado) {
    iniciarCronTreinoDisplay(data, dia);
  }
}

function atualizarBotoesCronTreino(data, dia) {
  const el = document.getElementById("cron-treino-botoes");
  if (el) el.innerHTML = renderBotoesCronTreino(data, dia);
  ligarEventosCronTreino(data, dia);
}

function iniciarCronTreinoDisplay(data, dia) {
  pararCronTreinoDisplay();
  cronTreinoInterval = setInterval(() => {
    const valorEl = document.getElementById("cron-treino-valor");
    if (!valorEl) {
      pararCronTreinoDisplay();
      return;
    }
    valorEl.textContent = Util.formatarMMSS(obterCronTreinoSegundos(data, dia));
  }, 1000);
}

function pararCronTreinoDisplay() {
  if (cronTreinoInterval) {
    clearInterval(cronTreinoInterval);
    cronTreinoInterval = null;
  }
}

function parseDescansoSegundos(str) {
  if (!str) return 60;
  const nums = String(str).match(/\d+/g);
  if (!nums) return 60;
  return Number(nums[0]);
}
