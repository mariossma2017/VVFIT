/* VV FIT — Tela Perfil (perfil, check-in, calendário, relatórios, backup) */

let mesCalendarioAtual = new Date();

function renderPerfil() {
  const container = document.getElementById("tela-perfil");
  const perfil = DB.getPerfil();
  const base = PROTOCOLO.perfilBase;

  container.innerHTML = `
    <div class="card perfil-cabecalho">
      <div class="avatar-perfil" id="avatar-perfil">
        ${perfil.fotoDataUrl ? `<img src="${perfil.fotoDataUrl}" alt="Foto de perfil">` : (perfil.nome ? perfil.nome.charAt(0).toUpperCase() : "VV")}
      </div>
      <h2>${Util.escapeHtml(perfil.nome || "Minha conta")}</h2>
      <p class="texto-suave">${base.objetivo}</p>
      <button type="button" class="btn btn-outline mt-8" id="btn-editar-perfil">Editar perfil</button>
    </div>

    <div class="card">
      <h3>Dados do protocolo</h3>
      <div class="grid-stats">
        <div class="stat-box"><span class="valor">${base.idade}</span><span class="rotulo">Idade</span></div>
        <div class="stat-box"><span class="valor">${(base.alturaCm / 100).toFixed(2)}m</span><span class="rotulo">Altura</span></div>
        <div class="stat-box"><span class="valor">${perfil.pesoAtualKg}kg</span><span class="rotulo">Peso atual</span></div>
        <div class="stat-box"><span class="valor">${perfil.metaPesoKg ? perfil.metaPesoKg + "kg" : "—"}</span><span class="rotulo">Meta de peso</span></div>
      </div>
      <div class="divider"></div>
      <p class="texto-suave"><strong>Frequência de treino:</strong> ${base.frequenciaTreino}</p>
      <p class="texto-suave"><strong>Dias de treino:</strong> ${base.diasTreino.map((d) => DIAS_LABEL[d]).join(", ")}</p>
      <p class="texto-suave"><strong>Dias de descanso:</strong> ${base.diasDescanso.map((d) => DIAS_LABEL[d]).join(", ")}</p>
      <p class="texto-suave"><strong>Horário do treino:</strong> ${Util.escapeHtml(perfil.horarioTreino || base.horarioTreinoHabitual)}</p>
      <p class="texto-suave"><strong>Meta calórica:</strong> ~${PROTOCOLO.gastoEnergetico.metaCaloricaKcal} kcal/dia</p>
      <p class="texto-suave"><strong>Proteína:</strong> ${PROTOCOLO.macros.proteina.quantidadeG}g · <strong>Carboidrato:</strong> ${PROTOCOLO.macros.carboidrato.quantidadeG}g · <strong>Gordura:</strong> ${PROTOCOLO.macros.gordura.quantidadeG}g</p>
      <p class="texto-suave"><strong>Meta de água:</strong> ${((perfil.metaAguaMl || PROTOCOLO.agua.metaMlPadrao) / 1000).toFixed(1)}L/dia</p>
      ${perfil.observacoes ? `<div class="divider"></div><p class="texto-suave"><strong>Observações:</strong> ${Util.escapeHtml(perfil.observacoes)}</p>` : ""}
    </div>

    <div class="card">
      <div class="card-titulo-linha">
        <h3>Check-in semanal</h3>
        <button type="button" class="btn btn-pequeno btn-primario" id="btn-novo-checkin">+ Novo check-in</button>
      </div>
      <div id="lista-checkins">${renderListaCheckins()}</div>
    </div>

    <div class="card">
      <h3>Calendário</h3>
      <div id="area-calendario">${renderCalendario(mesCalendarioAtual)}</div>
    </div>

    <div class="card">
      <h3>Relatórios</h3>
      <div id="area-relatorio">${renderFormRelatorio()}</div>
    </div>

    <div class="card">
      <h3>Configurações</h3>
      <div id="area-config">${renderConfiguracoes()}</div>
    </div>
  `;

  document.getElementById("btn-editar-perfil").addEventListener("click", abrirEditarPerfil);
  document.getElementById("btn-novo-checkin").addEventListener("click", abrirFormularioCheckin);
  ligarEventosCalendario();
  ligarEventosRelatorio();
  ligarEventosConfiguracoes();
  ligarEventosListaCheckins();
}

/* ================= EDITAR PERFIL ================= */
function abrirEditarPerfil() {
  const perfil = DB.getPerfil();
  const overlay = abrirModal(`
    <h3>Editar perfil</h3>
    <label for="edit-foto">Foto de perfil</label>
    <div class="avatar-perfil" id="preview-avatar-edit" style="cursor:pointer;">
      ${perfil.fotoDataUrl ? `<img src="${perfil.fotoDataUrl}" alt="Foto">` : "+"}
    </div>
    <input type="file" accept="image/*" class="hidden" id="input-foto-perfil">
    <label for="edit-nome">Nome</label>
    <input type="text" id="edit-nome" value="${Util.escapeHtml(perfil.nome || "")}" placeholder="Como podemos te chamar?">
    <label for="edit-peso">Peso atual (kg)</label>
    <input type="number" step="0.1" inputmode="decimal" id="edit-peso" value="${perfil.pesoAtualKg || ""}">
    <label for="edit-meta-peso">Meta de peso (kg)</label>
    <input type="number" step="0.1" inputmode="decimal" id="edit-meta-peso" value="${perfil.metaPesoKg || ""}">
    <label for="edit-horario-treino">Horário do treino</label>
    <input type="time" id="edit-horario-treino" value="${perfil.horarioTreino || PROTOCOLO.perfilBase.horarioTreinoHabitual}">
    <label for="edit-meta-agua">Meta de água (litros/dia)</label>
    <input type="number" step="0.1" inputmode="decimal" id="edit-meta-agua" value="${((perfil.metaAguaMl || PROTOCOLO.agua.metaMlPadrao) / 1000).toFixed(1)}">
    <label for="edit-obs">Observações pessoais</label>
    <textarea id="edit-obs" placeholder="Anotações livres">${Util.escapeHtml(perfil.observacoes || "")}</textarea>
    <div class="modal-actions">
      <button type="button" class="btn btn-secondary" data-fechar-modal>Cancelar</button>
      <button type="button" class="btn btn-primario" id="btn-salvar-perfil">Salvar</button>
    </div>
  `, { semFecharFora: true });

  let novaFoto = null;
  const previewAvatar = overlay.querySelector("#preview-avatar-edit");
  const inputFoto = overlay.querySelector("#input-foto-perfil");
  previewAvatar.addEventListener("click", () => inputFoto.click());
  inputFoto.addEventListener("change", () => {
    const file = inputFoto.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      novaFoto = reader.result;
      previewAvatar.innerHTML = `<img src="${novaFoto}" alt="Foto">`;
    };
    reader.readAsDataURL(file);
  });

  overlay.querySelector("#btn-salvar-perfil").addEventListener("click", () => {
    const p = DB.getPerfil();
    p.nome = overlay.querySelector("#edit-nome").value.trim();
    const pesoVal = overlay.querySelector("#edit-peso").value;
    if (pesoVal) p.pesoAtualKg = parseFloat(pesoVal);
    const metaPesoVal = overlay.querySelector("#edit-meta-peso").value;
    p.metaPesoKg = metaPesoVal ? parseFloat(metaPesoVal) : null;
    p.horarioTreino = overlay.querySelector("#edit-horario-treino").value;
    const metaAguaVal = overlay.querySelector("#edit-meta-agua").value;
    if (metaAguaVal) p.metaAguaMl = Math.round(parseFloat(metaAguaVal) * 1000);
    p.observacoes = overlay.querySelector("#edit-obs").value;
    if (novaFoto) p.fotoDataUrl = novaFoto;
    DB.setPerfil(p);
    overlay.remove();
    mostrarToast("Perfil atualizado!", "sucesso");
    atualizarTituloTopo();
    renderPerfil();
  });
}

/* ================= CHECK-IN SEMANAL ================= */
function abrirFormularioCheckin() {
  const perfil = DB.getPerfil();
  const overlay = abrirModal(`
    <h3>Check-in semanal</h3>
    <label for="ci-data">Data</label>
    <input type="date" id="ci-data" value="${Util.hojeISO()}" max="${Util.hojeISO()}">
    <label for="ci-peso">Peso atual (kg)</label>
    <input type="number" step="0.1" inputmode="decimal" id="ci-peso" value="${perfil.pesoAtualKg || ""}">
    <label for="ci-medidas">Medidas (cintura/quadril/outras — texto livre)</label>
    <textarea id="ci-medidas" placeholder="Ex: cintura 78cm, quadril 102cm"></textarea>
    <div class="linha-campos">
      <div class="campo-grupo"><label for="ci-treinos-planejados">Treinos planejados</label><input type="number" id="ci-treinos-planejados" value="5"></div>
      <div class="campo-grupo"><label for="ci-treinos-realizados">Treinos realizados</label><input type="number" id="ci-treinos-realizados"></div>
    </div>
    <div class="linha-campos">
      <div class="campo-grupo"><label for="ci-media-agua">Média de água (L)</label><input type="number" step="0.1" id="ci-media-agua"></div>
      <div class="campo-grupo"><label for="ci-media-sono">Média de sono (h)</label><input type="number" step="0.1" id="ci-media-sono"></div>
    </div>
    ${["Qualidade do sono", "Energia", "Fome", "Estresse", "Dificuldade de seguir a dieta", "Desempenho nos treinos"]
      .map((label, i) => {
        const ids = ["ci-qualidade-sono", "ci-energia", "ci-fome", "ci-estresse", "ci-dificuldade-dieta", "ci-desempenho-treinos"];
        return `<label for="${ids[i]}">${label} (1-5)</label><input type="number" min="1" max="5" id="${ids[i]}">`;
      })
      .join("")}
    <label for="ci-ciclo">Ciclo menstrual</label>
    <input type="text" id="ci-ciclo" placeholder="Fase / observações">
    <label for="ci-dores">Dores ou desconfortos</label>
    <textarea id="ci-dores"></textarea>
    <label for="ci-dificuldades">Principais dificuldades</label>
    <textarea id="ci-dificuldades"></textarea>
    <label for="ci-conquista">Principal conquista da semana</label>
    <textarea id="ci-conquista"></textarea>
    <label for="ci-obs">Observações</label>
    <textarea id="ci-obs"></textarea>
    <div class="modal-actions">
      <button type="button" class="btn btn-secondary" data-fechar-modal>Cancelar</button>
      <button type="button" class="btn btn-primario" id="btn-salvar-checkin">Salvar check-in</button>
    </div>
  `, { semFecharFora: true });

  overlay.querySelector("#btn-salvar-checkin").addEventListener("click", () => {
    const g = (id) => overlay.querySelector("#" + id).value;
    const checkin = {
      id: Util.uuid(),
      data: g("ci-data") || Util.hojeISO(),
      peso: g("ci-peso") ? parseFloat(g("ci-peso")) : null,
      medidas: g("ci-medidas"),
      treinosPlanejados: g("ci-treinos-planejados") ? parseInt(g("ci-treinos-planejados")) : null,
      treinosRealizados: g("ci-treinos-realizados") ? parseInt(g("ci-treinos-realizados")) : null,
      mediaAgua: g("ci-media-agua") ? parseFloat(g("ci-media-agua")) : null,
      mediaSono: g("ci-media-sono") ? parseFloat(g("ci-media-sono")) : null,
      qualidadeSono: g("ci-qualidade-sono"),
      energia: g("ci-energia"),
      fome: g("ci-fome"),
      estresse: g("ci-estresse"),
      dificuldadeDieta: g("ci-dificuldade-dieta"),
      desempenhoTreinos: g("ci-desempenho-treinos"),
      cicloMenstrual: g("ci-ciclo"),
      dores: g("ci-dores"),
      dificuldades: g("ci-dificuldades"),
      conquista: g("ci-conquista"),
      observacoes: g("ci-obs")
    };
    DB.addCheckin(checkin);
    if (checkin.peso) {
      const p = DB.getPerfil();
      p.pesoAtualKg = checkin.peso;
      DB.setPerfil(p);
    }
    overlay.remove();
    mostrarToast("Check-in registrado!", "sucesso");
    if (document.getElementById("tela-perfil").classList.contains("ativa")) renderPerfil();
  });
}

function renderListaCheckins() {
  const checkins = [...DB.getCheckins()].reverse();
  if (!checkins.length) return `<p class="texto-suave">Nenhum check-in registrado ainda.</p>`;
  return checkins
    .slice(0, 8)
    .map((c, idxRev) => {
      const idxOriginal = DB.getCheckins().findIndex((x) => x.id === c.id);
      const anterior = idxOriginal > 0 ? DB.getCheckins()[idxOriginal - 1] : null;
      let comparacao = "";
      if (anterior && c.peso && anterior.peso) {
        const dif = (c.peso - anterior.peso).toFixed(1);
        comparacao = `<p class="texto-suave">Variação de peso desde o check-in anterior: ${dif > 0 ? "+" : ""}${dif}kg</p>`;
      }
      return `
      <div class="card" data-checkin-id="${c.id}">
        <div class="card-titulo-linha">
          <strong>${Util.isoParaBR(c.data)}</strong>
          <button type="button" class="btn-icone btn-pequeno" data-excluir-checkin="${c.id}" style="width:30px;height:30px;min-height:30px;">✕</button>
        </div>
        <p class="texto-suave">${c.peso ? "Peso: " + c.peso + "kg · " : ""}${c.treinosRealizados !== null && c.treinosRealizados !== undefined ? "Treinos: " + c.treinosRealizados + "/" + (c.treinosPlanejados || "—") : ""}</p>
        ${comparacao}
        ${c.conquista ? `<p class="texto-suave mt-8"><strong>Conquista:</strong> ${Util.escapeHtml(c.conquista)}</p>` : ""}
      </div>
    `;
    })
    .join("");
}

function ligarEventosListaCheckins() {
  document.querySelectorAll("[data-excluir-checkin]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const ok = await confirmarAcao({ titulo: "Excluir check-in", mensagem: "Deseja excluir este check-in?", perigo: true });
      if (!ok) return;
      const arr = DB.getCheckins().filter((c) => c.id !== btn.getAttribute("data-excluir-checkin"));
      DB.setCheckins(arr);
      renderPerfil();
    });
  });
}

/* ================= CALENDÁRIO ================= */
function renderCalendario(mesRef) {
  const ano = mesRef.getFullYear();
  const mes = mesRef.getMonth();
  const primeiroDia = new Date(ano, mes, 1);
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const offset = (primeiroDia.getDay() + 6) % 7; // segunda = 0

  const nomesMes = mesRef.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const diasCabecalho = ["S", "T", "Q", "Q", "S", "S", "D"];

  let celulas = "";
  for (let i = 0; i < offset; i++) celulas += `<div class="calendario-dia vazio"></div>`;

  for (let dia = 1; dia <= diasNoMes; dia++) {
    const iso = Util.dataParaISO(new Date(ano, mes, dia));
    const proto = Adesao.treinoDoDia(iso);
    const ehHoje = iso === Util.hojeISO();
    const ehFuturo = iso > Util.hojeISO();
    let pontoTreino = "";
    if (!ehFuturo) {
      if (proto.tipo === "descanso") {
        pontoTreino = `<span class="ponto ponto-descanso"></span>`;
      } else {
        const status = Adesao.statusTreinoNoDia(iso);
        const classe = status === "completo" ? "ponto-treino-completo" : status === "parcial" ? "ponto-treino-parcial" : "ponto-treino-nao";
        pontoTreino = `<span class="ponto ${classe}"></span>`;
      }
    }
    const temAlimentacaoRegistro = DB.getAlimentacao().some((r) => r.data === iso && r.status);
    let pontoAlimentacao = "";
    if (!ehFuturo && temAlimentacaoRegistro) {
      const pctAlim = Adesao.percentualAlimentacaoDia(iso);
      const classeAlim = pctAlim >= 90 ? "ponto-treino-completo" : pctAlim >= 60 ? "ponto-treino-parcial" : "ponto-treino-nao";
      pontoAlimentacao = `<span class="ponto ${classeAlim}"></span>`;
    }
    const pctAgua = Adesao.percentualAguaDia(iso);
    const temCheckin = DB.getCheckins().some((c) => c.data === iso);

    celulas += `
      <div class="calendario-dia ${ehHoje ? "hoje" : ""}" data-dia-calendario="${iso}">
        <div>${dia}</div>
        <div class="pontos">
          ${pontoTreino}
          ${pontoAlimentacao}
          ${pctAgua >= 100 ? `<span class="ponto ponto-agua"></span>` : ""}
          ${temCheckin ? `<span class="ponto ponto-checkin"></span>` : ""}
        </div>
      </div>
    `;
  }

  return `
    <div class="card-titulo-linha">
      <button type="button" class="btn-icone btn-pequeno" id="btn-mes-anterior">←</button>
      <strong>${capitalizar(nomesMes)}</strong>
      <button type="button" class="btn-icone btn-pequeno" id="btn-mes-proximo">→</button>
    </div>
    <div class="calendario-grid mt-8">
      ${diasCabecalho.map((d) => `<div class="calendario-cabecalho-dia">${d}</div>`).join("")}
      ${celulas}
    </div>
    <p class="texto-suave mt-16">Primeiro ponto: treino (verde feito, amarelo parcial, vermelho não feito, lilás descanso). Segundo ponto: alimentação (verde ≥90%, amarelo 60-89%, vermelho abaixo de 60%). Azul: meta de água atingida. Roxo: check-in.</p>
  `;
}

function ligarEventosCalendario() {
  const btnAnterior = document.getElementById("btn-mes-anterior");
  const btnProximo = document.getElementById("btn-mes-proximo");
  if (btnAnterior) {
    btnAnterior.addEventListener("click", () => {
      mesCalendarioAtual = new Date(mesCalendarioAtual.getFullYear(), mesCalendarioAtual.getMonth() - 1, 1);
      document.getElementById("area-calendario").innerHTML = renderCalendario(mesCalendarioAtual);
      ligarEventosCalendario();
    });
  }
  if (btnProximo) {
    btnProximo.addEventListener("click", () => {
      mesCalendarioAtual = new Date(mesCalendarioAtual.getFullYear(), mesCalendarioAtual.getMonth() + 1, 1);
      document.getElementById("area-calendario").innerHTML = renderCalendario(mesCalendarioAtual);
      ligarEventosCalendario();
    });
  }
  document.querySelectorAll("[data-dia-calendario]").forEach((el) => {
    el.addEventListener("click", () => abrirResumoDia(el.getAttribute("data-dia-calendario")));
  });
}

function abrirResumoDia(iso) {
  const proto = Adesao.treinoDoDia(iso);
  const sessoesTreino = DB.getTreinos().filter((t) => t.data === iso);
  const registrosAlimentacao = DB.getAlimentacao().filter((r) => r.data === iso && r.status);
  const pctAlimentacao = Adesao.percentualAlimentacaoDia(iso);
  const agua = Adesao.totalAguaDia(iso);
  const checkin = DB.getCheckins().find((c) => c.data === iso);
  const observacoesDoDia = [];
  sessoesTreino.forEach((s) => { if (s.observacoes) observacoesDoDia.push(`Treino: ${s.observacoes}`); });
  registrosAlimentacao.forEach((r) => { if (r.observacoes) observacoesDoDia.push(`Alimentação (${r.refeicaoId}): ${r.observacoes}`); });
  if (checkin && checkin.observacoes) observacoesDoDia.push(`Check-in: ${checkin.observacoes}`);

  abrirModal(`
    <h3>${Util.isoParaBR(iso)} — ${DIAS_LABEL[Util.isoParaDiaSemana(iso)]}</h3>
    <div class="secao-titulo">Treino</div>
    ${proto.tipo === "descanso" ? "<p>Dia de descanso.</p>" : sessoesTreino.length ? sessoesTreino.map((s) => {
      const feitos = (s.exercicios || []).filter((e) => e.status === "feito").length;
      return `<p>${Util.escapeHtml(s.treinoNome)} — ${rotuloStatusTreino(s.status)} (${s.duracaoSeg ? Util.formatarDuracao(s.duracaoSeg) : "—"})</p><p class="texto-suave">Exercícios feitos: ${feitos}/${(s.exercicios || []).length}</p>`;
    }).join("") : `<p class="texto-suave">Nenhum registro (${Util.escapeHtml(proto.nome)}).</p>`}
    <div class="secao-titulo">Alimentação</div>
    ${registrosAlimentacao.length ? `<p>${pctAlimentacao}% de adesão · ${registrosAlimentacao.length}/${PROTOCOLO.refeicoes.length} refeições registradas</p>` : `<p class="texto-suave">Nenhuma refeição registrada.</p>`}
    <div class="secao-titulo">Água</div>
    <p>${(agua / 1000).toFixed(2)}L</p>
    <div class="secao-titulo">Check-in</div>
    ${checkin ? `<p>Registrado — peso ${checkin.peso ? checkin.peso + "kg" : "—"}</p>` : `<p class="texto-suave">Nenhum check-in nesta data.</p>`}
    <div class="secao-titulo">Observações</div>
    ${observacoesDoDia.length ? `<ul class="lista-simples">${observacoesDoDia.map((o) => `<li>${Util.escapeHtml(o)}</li>`).join("")}</ul>` : `<p class="texto-suave">Nenhuma observação registrada neste dia.</p>`}
    <div class="modal-actions">
      <button type="button" class="btn btn-primario" data-fechar-modal>Fechar</button>
    </div>
  `);
}

/* ================= RELATÓRIOS ================= */
function renderFormRelatorio() {
  return `
    <div class="linha-campos">
      <div class="campo-grupo"><label for="rel-inicio">De</label><input type="date" id="rel-inicio" value="${Util.addDias(Util.hojeISO(), -29)}"></div>
      <div class="campo-grupo"><label for="rel-fim">Até</label><input type="date" id="rel-fim" value="${Util.hojeISO()}" max="${Util.hojeISO()}"></div>
    </div>
    <button type="button" class="btn btn-outline" id="btn-gerar-relatorio">Gerar relatório</button>
    <div id="resultado-relatorio" class="mt-16"></div>
  `;
}

function ligarEventosRelatorio() {
  const btn = document.getElementById("btn-gerar-relatorio");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const inicio = document.getElementById("rel-inicio").value;
    const fim = document.getElementById("rel-fim").value;
    if (!inicio || !fim || inicio > fim) {
      mostrarToast("Selecione um período válido.", "erro");
      return;
    }
    document.getElementById("resultado-relatorio").innerHTML = gerarRelatorio(inicio, fim);
    ligarEventosAcoesRelatorio(inicio, fim);
  });
}

function gerarRelatorio(inicio, fim) {
  const evolucao = DB.getEvolucao().filter((e) => e.data >= inicio && e.data <= fim);
  const pesoInicialPeriodo = evolucao.length ? evolucao[0].peso : null;
  const pesoFinalPeriodo = evolucao.length ? evolucao[evolucao.length - 1].peso : null;
  const varPeso = pesoInicialPeriodo !== null && pesoFinalPeriodo !== null ? (pesoFinalPeriodo - pesoInicialPeriodo).toFixed(1) : null;

  let diasTreinoPrevistos = 0;
  let diasTreinoRealizados = 0;
  let cursor = inicio;
  const diasAlimentacaoComRegistro = new Set();
  let somaAdesaoAlim = 0;
  let contDiasAlim = 0;
  let somaAgua = 0;
  let contDiasAgua = 0;

  while (cursor <= fim) {
    const proto = Adesao.treinoDoDia(cursor);
    if (proto.tipo === "treino") {
      diasTreinoPrevistos++;
      const status = Adesao.statusTreinoNoDia(cursor);
      if (status === "completo") diasTreinoRealizados++;
      else if (status === "parcial") diasTreinoRealizados += 0.5;
    }
    const registrosDia = DB.getAlimentacao().filter((r) => r.data === cursor);
    if (registrosDia.length) diasAlimentacaoComRegistro.add(cursor);
    somaAdesaoAlim += Adesao.percentualAlimentacaoDia(cursor);
    contDiasAlim++;
    somaAgua += Adesao.totalAguaDia(cursor);
    contDiasAgua++;
    cursor = Util.addDias(cursor, 1);
  }

  const adesaoTreinoPct = diasTreinoPrevistos ? Math.round((diasTreinoRealizados / diasTreinoPrevistos) * 100) : 100;
  const adesaoAlimentarPct = contDiasAlim ? Math.round(somaAdesaoAlim / contDiasAlim) : 0;
  const mediaHidratacaoL = contDiasAgua ? (somaAgua / contDiasAgua / 1000).toFixed(2) : "0.00";

  const checkinsPeriodo = DB.getCheckins().filter((c) => c.data >= inicio && c.data <= fim);

  const exerciciosComEvolucao = {};
  DB.getTreinos()
    .filter((t) => t.data >= inicio && t.data <= fim)
    .forEach((t) => {
      (t.exercicios || []).forEach((ex) => {
        const cargas = [];
        const cd = parseFloat(ex.cargaDetalhe);
        if (!isNaN(cd)) cargas.push(cd);
        (ex.seriesLegado || []).forEach((s) => {
          const c = parseFloat(s.carga);
          if (s.concluida && !isNaN(c)) cargas.push(c);
        });
        if (cargas.length) {
          if (!exerciciosComEvolucao[ex.nome]) exerciciosComEvolucao[ex.nome] = [];
          exerciciosComEvolucao[ex.nome].push(Math.max(...cargas));
        }
      });
    });

  return `
    <div id="conteudo-relatorio-impressao">
      <h3>Relatório — ${Util.isoParaBR(inicio)} a ${Util.isoParaBR(fim)}</h3>
      <div class="grid-stats">
        <div class="stat-box"><span class="valor">${pesoInicialPeriodo !== null ? pesoInicialPeriodo + "kg" : "—"}</span><span class="rotulo">Peso inicial</span></div>
        <div class="stat-box"><span class="valor">${pesoFinalPeriodo !== null ? pesoFinalPeriodo + "kg" : "—"}</span><span class="rotulo">Peso atual</span></div>
        <div class="stat-box"><span class="valor">${varPeso !== null ? (varPeso > 0 ? "+" : "") + varPeso + "kg" : "—"}</span><span class="rotulo">Variação de peso</span></div>
        <div class="stat-box"><span class="valor">${mediaHidratacaoL}L</span><span class="rotulo">Média hidratação/dia</span></div>
        <div class="stat-box"><span class="valor">${diasTreinoRealizados}/${diasTreinoPrevistos}</span><span class="rotulo">Treinos realizados</span></div>
        <div class="stat-box"><span class="valor">${adesaoTreinoPct}%</span><span class="rotulo">Adesão treino</span></div>
        <div class="stat-box"><span class="valor">${adesaoAlimentarPct}%</span><span class="rotulo">Adesão alimentar</span></div>
        <div class="stat-box"><span class="valor">${checkinsPeriodo.length}</span><span class="rotulo">Check-ins no período</span></div>
      </div>

      <div class="secao-titulo">Evolução de cargas (melhor carga por exercício no período)</div>
      ${Object.keys(exerciciosComEvolucao).length ? `<ul class="lista-simples">${Object.entries(exerciciosComEvolucao).map(([nome, cargas]) => `<li>${Util.escapeHtml(nome)}: ${Math.max(...cargas)}kg</li>`).join("")}</ul>` : `<p class="texto-suave">Sem registros de carga no período.</p>`}

      <div class="secao-titulo">Observações dos check-ins</div>
      ${checkinsPeriodo.length ? `<ul class="lista-simples">${checkinsPeriodo.map((c) => `<li><strong>${Util.isoParaBR(c.data)}:</strong> ${Util.escapeHtml(c.observacoes || c.conquista || "sem observações")}</li>`).join("")}</ul>` : `<p class="texto-suave">Nenhum check-in no período.</p>`}
    </div>
    <div class="modal-actions">
      <button type="button" class="btn btn-secundario" id="btn-imprimir-relatorio">Imprimir / salvar PDF</button>
      <button type="button" class="btn btn-outline" id="btn-compartilhar-relatorio">Compartilhar</button>
    </div>
  `;
}

function ligarEventosAcoesRelatorio(inicio, fim) {
  const btnImprimir = document.getElementById("btn-imprimir-relatorio");
  if (btnImprimir) btnImprimir.addEventListener("click", () => window.print());
  const btnCompartilhar = document.getElementById("btn-compartilhar-relatorio");
  if (btnCompartilhar) {
    btnCompartilhar.addEventListener("click", async () => {
      const texto = `Relatório VV FIT — ${Util.isoParaBR(inicio)} a ${Util.isoParaBR(fim)}`;
      if (navigator.share) {
        try {
          await navigator.share({ title: "VV FIT — Relatório", text: texto });
        } catch (e) {
          /* usuário cancelou */
        }
      } else {
        mostrarToast("Compartilhamento não disponível neste navegador. Use Imprimir / salvar PDF.", "erro");
      }
    });
  }
}

/* ================= CONFIGURAÇÕES / BACKUP ================= */
function renderConfiguracoes() {
  const cfg = DB.getConfig();
  return `
    <div class="secao-titulo">Pesos de adesão (%)</div>
    <div class="linha-campos">
      <div class="campo-grupo"><label for="cfg-treino">Treino</label><input type="number" id="cfg-treino" value="${cfg.pesosAdesao.treino}"></div>
      <div class="campo-grupo"><label for="cfg-alimentacao">Alimentação</label><input type="number" id="cfg-alimentacao" value="${cfg.pesosAdesao.alimentacao}"></div>
    </div>
    <div class="linha-campos">
      <div class="campo-grupo"><label for="cfg-agua">Água</label><input type="number" id="cfg-agua" value="${cfg.pesosAdesao.agua}"></div>
      <div class="campo-grupo"><label for="cfg-checkin">Check-in</label><input type="number" id="cfg-checkin" value="${cfg.pesosAdesao.checkin}"></div>
    </div>
    <button type="button" class="btn btn-outline mt-8" id="btn-salvar-pesos">Salvar pesos</button>

    <div class="divider"></div>
    <div class="lista-config-item" id="item-som-descanso">
      <div><div class="titulo-item">Som no fim do descanso</div><div class="desc-item">Bipe curto ao terminar o cronômetro</div></div>
      <input type="checkbox" id="check-som-descanso" ${cfg.somDescanso ? "checked" : ""}>
    </div>
    <div class="lista-config-item" id="item-vibrar-descanso">
      <div><div class="titulo-item">Vibração no fim do descanso</div><div class="desc-item">Quando suportado pelo aparelho</div></div>
      <input type="checkbox" id="check-vibrar-descanso" ${cfg.vibrarDescanso ? "checked" : ""}>
    </div>

    <div class="secao-titulo">Backup e segurança</div>
    <div class="lista-config-item" id="btn-exportar-backup"><div class="titulo-item">Exportar backup completo (JSON)</div><div class="desc-item">Perfil, treinos, alimentação, água, medidas, check-ins e fotos</div></div>
    <div class="lista-config-item" id="btn-importar-backup"><div class="titulo-item">Importar backup (JSON)</div><div class="desc-item">Restaura um backup exportado anteriormente</div></div>
    <input type="file" accept="application/json" class="hidden" id="input-importar-backup">
    <div class="lista-config-item" id="btn-exportar-csv"><div class="titulo-item">Exportar registros em CSV</div><div class="desc-item">Planilha por categoria de registro</div></div>

    <div class="secao-titulo">Apagar dados</div>
    <div class="lista-config-item" id="btn-apagar-treinos"><div class="titulo-item">Apagar somente registros de treino</div><div class="desc-item">O protocolo continua intacto</div></div>
    <div class="lista-config-item" id="btn-apagar-alimentacao"><div class="titulo-item">Apagar somente registros alimentares</div><div class="desc-item">Inclui registros de água</div></div>
    <div class="lista-config-item" id="btn-apagar-fotos"><div class="titulo-item">Apagar fotos</div><div class="desc-item">Fotos de evolução e de refeições</div></div>
    <div class="lista-config-item" id="btn-restaurar-app"><div class="titulo-item">Restaurar aplicativo</div><div class="desc-item">Volta às configurações iniciais</div></div>
    <div class="lista-config-item" id="btn-apagar-tudo"><div class="titulo-item" style="color:var(--perigo);">Apagar todos os dados</div><div class="desc-item">Ação permanente e irreversível</div></div>

    <div class="aviso-armazenamento">
      Os dados ficam armazenados neste aparelho. Caso o navegador seja apagado, o aplicativo seja desinstalado ou os dados do Chrome sejam limpos, as informações poderão ser perdidas. Faça backups regularmente.
    </div>
  `;
}

function ligarEventosConfiguracoes() {
  const btnSalvarPesos = document.getElementById("btn-salvar-pesos");
  if (btnSalvarPesos) {
    btnSalvarPesos.addEventListener("click", () => {
      const cfg = DB.getConfig();
      cfg.pesosAdesao = {
        treino: Number(document.getElementById("cfg-treino").value) || 0,
        alimentacao: Number(document.getElementById("cfg-alimentacao").value) || 0,
        agua: Number(document.getElementById("cfg-agua").value) || 0,
        checkin: Number(document.getElementById("cfg-checkin").value) || 0
      };
      DB.setConfig(cfg);
      mostrarToast("Pesos de adesão salvos!", "sucesso");
    });
  }

  const checkSom = document.getElementById("check-som-descanso");
  if (checkSom) checkSom.addEventListener("change", () => { const cfg = DB.getConfig(); cfg.somDescanso = checkSom.checked; DB.setConfig(cfg); });
  const checkVibrar = document.getElementById("check-vibrar-descanso");
  if (checkVibrar) checkVibrar.addEventListener("change", () => { const cfg = DB.getConfig(); cfg.vibrarDescanso = checkVibrar.checked; DB.setConfig(cfg); });

  const btnExportarBackup = document.getElementById("btn-exportar-backup");
  if (btnExportarBackup) btnExportarBackup.addEventListener("click", exportarBackupJSON);

  const btnImportarBackup = document.getElementById("btn-importar-backup");
  const inputImportar = document.getElementById("input-importar-backup");
  if (btnImportarBackup) btnImportarBackup.addEventListener("click", () => inputImportar.click());
  if (inputImportar) inputImportar.addEventListener("change", importarBackupJSON);

  const btnExportarCSV = document.getElementById("btn-exportar-csv");
  if (btnExportarCSV) btnExportarCSV.addEventListener("click", abrirSeletorCSV);

  const btnApagarTreinos = document.getElementById("btn-apagar-treinos");
  if (btnApagarTreinos) btnApagarTreinos.addEventListener("click", async () => {
    const ok = await confirmarAcao({ titulo: "Apagar registros de treino", mensagem: "Todos os treinos registrados serão apagados. O protocolo de exercícios não será alterado. Confirma?", perigo: true, textoConfirmar: "Apagar" });
    if (ok) {
      DB.clearTreinos();
      Object.keys(localStorage).filter((k) => k.startsWith("vvfit_cron_treino_")).forEach((k) => localStorage.removeItem(k));
      mostrarToast("Registros de treino apagados.", "sucesso");
      renderPerfil();
    }
  });

  const btnApagarAlimentacao = document.getElementById("btn-apagar-alimentacao");
  if (btnApagarAlimentacao) btnApagarAlimentacao.addEventListener("click", async () => {
    const ok = await confirmarAcao({ titulo: "Apagar registros alimentares", mensagem: "Todos os registros de alimentação e água serão apagados. O plano alimentar não será alterado. Confirma?", perigo: true, textoConfirmar: "Apagar" });
    if (ok) { DB.clearAlimentacao(); DB.clearAgua(); mostrarToast("Registros alimentares apagados.", "sucesso"); renderPerfil(); }
  });

  const btnApagarFotos = document.getElementById("btn-apagar-fotos");
  if (btnApagarFotos) btnApagarFotos.addEventListener("click", async () => {
    const ok = await confirmarAcao({ titulo: "Apagar fotos", mensagem: "Todas as fotos (evolução e refeições) serão apagadas permanentemente. Confirma?", perigo: true, textoConfirmar: "Apagar" });
    if (ok) {
      await PhotoDB.limparTudo();
      DB.clearFotosMeta();
      const alim = DB.getAlimentacao().map((r) => { const c = Object.assign({}, r); delete c.fotoId; return c; });
      DB.setAlimentacao(alim);
      mostrarToast("Fotos apagadas.", "sucesso");
      renderPerfil();
    }
  });

  const btnRestaurarApp = document.getElementById("btn-restaurar-app");
  if (btnRestaurarApp) btnRestaurarApp.addEventListener("click", async () => {
    const ok = await confirmarAcao({ titulo: "Restaurar aplicativo", mensagem: "O aplicativo voltará às configurações iniciais. Todos os registros pessoais serão apagados (o protocolo permanece). Deseja continuar?", perigo: true, textoConfirmar: "Restaurar" });
    if (ok) await apagarTudoCompleto();
  });

  const btnApagarTudo = document.getElementById("btn-apagar-tudo");
  if (btnApagarTudo) btnApagarTudo.addEventListener("click", async () => {
    const ok = await confirmarAcao({ titulo: "Apagar todos os dados", mensagem: "Esta ação é permanente e irá apagar todos os seus registros, fotos e configurações deste aparelho. Não é possível desfazer. Deseja continuar?", perigo: true, textoConfirmar: "Apagar tudo" });
    if (ok) await apagarTudoCompleto();
  });
}

async function apagarTudoCompleto() {
  DB.apagarTudo();
  await PhotoDB.limparTudo();
  // remove também chaves auxiliares (ex: cronômetros de treino em andamento)
  Object.keys(localStorage)
    .filter((k) => k.startsWith("vvfit_"))
    .forEach((k) => localStorage.removeItem(k));
  mostrarToast("Aplicativo restaurado.", "sucesso");
  setTimeout(() => window.location.reload(), 800);
}

/* ---------------- Backup JSON ---------------- */
async function exportarBackupJSON() {
  const backup = {
    versao: PROTOCOLO.versao,
    exportadoEm: new Date().toISOString(),
    perfil: DB.getPerfil(),
    config: DB.getConfig(),
    treinos: DB.getTreinos(),
    alimentacao: DB.getAlimentacao(),
    agua: DB.getAgua(),
    evolucao: DB.getEvolucao(),
    checkins: DB.getCheckins(),
    fotosMeta: DB.getFotosMeta(),
    fotos: {}
  };
  const todasFotos = await PhotoDB.listarTudo();
  todasFotos.forEach((f) => { backup.fotos[f.id] = f.dataUrl; });

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vvfit_backup_${Util.hojeISO()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  mostrarToast("Backup exportado!", "sucesso");
}

async function importarBackupJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const ok = await confirmarAcao({
    titulo: "Importar backup",
    mensagem: "Isso substituirá todos os dados atuais pelos dados do arquivo de backup. Deseja continuar?",
    perigo: true,
    textoConfirmar: "Importar"
  });
  if (!ok) {
    e.target.value = "";
    return;
  }
  try {
    const texto = await file.text();
    const backup = JSON.parse(texto);
    if (backup.perfil) DB.setPerfil(backup.perfil);
    if (backup.config) DB.setConfig(backup.config);
    if (backup.treinos) DB.setTreinos(backup.treinos);
    if (backup.alimentacao) DB.setAlimentacao(backup.alimentacao);
    if (backup.agua) DB.setAgua(backup.agua);
    if (backup.evolucao) DB.setEvolucao(backup.evolucao);
    if (backup.checkins) DB.setCheckins(backup.checkins);
    if (backup.fotosMeta) DB.setFotosMeta(backup.fotosMeta);
    if (backup.fotos) {
      await PhotoDB.limparTudo();
      for (const [id, dataUrl] of Object.entries(backup.fotos)) {
        await PhotoDB.salvar(id, dataUrl);
      }
    }
    mostrarToast("Backup importado com sucesso!", "sucesso");
    setTimeout(() => window.location.reload(), 900);
  } catch (err) {
    console.error(err);
    mostrarToast("Não foi possível importar este arquivo.", "erro");
  }
  e.target.value = "";
}

/* ---------------- Exportação CSV ---------------- */
function abrirSeletorCSV() {
  abrirModal(`
    <h3>Exportar CSV</h3>
    <p class="texto-suave">Escolha a categoria de registros para exportar.</p>
    <div class="botoes-rapidos">
      <button type="button" class="btn btn-secundario" data-csv="treinos">Treinos</button>
      <button type="button" class="btn btn-secundario" data-csv="alimentacao">Alimentação</button>
      <button type="button" class="btn btn-secundario" data-csv="agua">Água</button>
      <button type="button" class="btn btn-secundario" data-csv="evolucao">Evolução (medidas)</button>
      <button type="button" class="btn btn-secundario" data-csv="checkins">Check-ins</button>
    </div>
    <div class="modal-actions">
      <button type="button" class="btn btn-outline" data-fechar-modal>Fechar</button>
    </div>
  `);
  document.querySelectorAll("[data-csv]").forEach((btn) => {
    btn.addEventListener("click", () => exportarCSV(btn.getAttribute("data-csv")));
  });
}

function exportarCSV(categoria) {
  let linhas = [];
  if (categoria === "treinos") {
    linhas.push(["data", "diaSemana", "treino", "status", "duracaoSeg", "rpeGeral", "exercicio", "statusExercicio", "cargaDetalhe", "repsDetalhe", "rpeDetalhe", "observacaoDetalhe"]);
    DB.getTreinos().forEach((t) => {
      (t.exercicios || []).forEach((ex) => {
        linhas.push([t.data, t.diaSemana, t.treinoNome, t.status, t.duracaoSeg, t.rpeGeral, ex.nome, ex.status, ex.cargaDetalhe, ex.repsDetalhe, ex.rpeDetalhe, ex.observacaoDetalhe]);
      });
    });
  } else if (categoria === "alimentacao") {
    linhas.push(["data", "refeicaoId", "status", "opcaoEscolhida", "substituicaoTexto", "horarioReal", "fome", "saciedade", "observacoes"]);
    DB.getAlimentacao().forEach((r) => {
      linhas.push([r.data, r.refeicaoId, r.status, r.opcaoEscolhida, r.substituicaoTexto, r.horarioReal, r.fome, r.saciedade, r.observacoes]);
    });
  } else if (categoria === "agua") {
    linhas.push(["data", "hora", "ml"]);
    DB.getAgua().forEach((a) => linhas.push([a.data, a.hora, a.ml]));
  } else if (categoria === "evolucao") {
    linhas.push(["data", ...CAMPOS_MEDIDAS.map((c) => c.chave), "observacoes"]);
    DB.getEvolucao().forEach((e) => linhas.push([e.data, ...CAMPOS_MEDIDAS.map((c) => e[c.chave]), e.observacoes]));
  } else if (categoria === "checkins") {
    linhas.push(["data", "peso", "treinosPlanejados", "treinosRealizados", "mediaAgua", "mediaSono", "qualidadeSono", "energia", "fome", "estresse", "conquista", "dificuldades", "observacoes"]);
    DB.getCheckins().forEach((c) =>
      linhas.push([c.data, c.peso, c.treinosPlanejados, c.treinosRealizados, c.mediaAgua, c.mediaSono, c.qualidadeSono, c.energia, c.fome, c.estresse, c.conquista, c.dificuldades, c.observacoes])
    );
  }

  const csv = linhas
    .map((linha) => linha.map((v) => `"${String(v === null || v === undefined ? "" : v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vvfit_${categoria}_${Util.hojeISO()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  document.querySelector(".modal-overlay")?.remove();
  mostrarToast("CSV exportado!", "sucesso");
}
