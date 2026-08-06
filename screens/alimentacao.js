/* VV FIT — Tela Alimentação
 * Registro rápido por 4 botões grandes de status por refeição.
 * Opção escolhida, substituição e detalhes (observação/foto/horário/fome/saciedade)
 * são sempre opcionais.
 */

let dataAlimentacaoSelecionada = Util.hojeISO();

const STATUS_REFEICAO_LABEL = {
  feito: "✅ Feito conforme o plano",
  substituicao: "🔄 Feito com substituição",
  parcial: "⚠️ Feito parcialmente",
  nao_feito: "❌ Não feito"
};

function renderAlimentacao() {
  const container = document.getElementById("tela-alimentacao");
  const data = dataAlimentacaoSelecionada;
  const registros = DB.getAlimentacao().filter((r) => r.data === data && r.status);
  const previstas = PROTOCOLO.refeicoes.length;
  const feitas = registros.filter((r) => r.status === "feito" || r.status === "substituicao").length;
  const parciais = registros.filter((r) => r.status === "parcial").length;
  const naoFeitas = registros.filter((r) => r.status === "nao_feito").length;
  const pct = Adesao.percentualAlimentacaoDia(data);
  const aguaStatus = Adesao.statusAguaDia(data);

  container.innerHTML = `
    <div class="card">
      <div class="card-titulo-linha">
        <h2>Alimentação</h2>
        <input type="date" id="input-data-alimentacao" value="${data}" max="${Util.hojeISO()}">
      </div>
      <p class="texto-suave">${Util.escapeHtml(PROTOCOLO.gastoEnergetico.metaCaloricaKcal)} kcal/dia · P ${PROTOCOLO.macros.proteina.quantidadeG}g · C ${PROTOCOLO.macros.carboidrato.quantidadeG}g · G ${PROTOCOLO.macros.gordura.quantidadeG}g</p>
      <div class="progress-bar-track mt-8"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
      <p class="texto-suave mt-8">${pct}% de adesão hoje</p>
      <div class="grid-stats">
        <div class="stat-box"><span class="valor">${previstas}</span><span class="rotulo">Previstas</span></div>
        <div class="stat-box"><span class="valor">${feitas}</span><span class="rotulo">Feitas</span></div>
        <div class="stat-box"><span class="valor">${parciais}</span><span class="rotulo">Parciais</span></div>
        <div class="stat-box"><span class="valor">${naoFeitas}</span><span class="rotulo">Não feitas</span></div>
      </div>
      <div class="grid-2 mt-16">
        <button type="button" class="btn btn-secundario btn-pequeno" id="btn-marcar-todas-feitas">✅ Marcar todas como feitas</button>
        <button type="button" class="btn btn-outline btn-pequeno" id="btn-limpar-marcacoes-dia">🧹 Limpar marcações do dia</button>
      </div>
    </div>

    <div id="lista-refeicoes">
      ${PROTOCOLO.refeicoes.map((r) => renderCardRefeicao(r, data)).join("")}
    </div>

    <div class="card">
      <div class="card-titulo-linha">
        <h3>💧 Água</h3>
        <span class="indicador-dia ${aguaStatus.classe}">${aguaStatus.icone} ${aguaStatus.label}</span>
      </div>
      ${renderBlocoAgua(data)}
    </div>

    <div class="secao-titulo">Histórico recente</div>
    <div id="historico-alimentacao">${renderHistoricoAlimentacao()}</div>
  `;

  document.getElementById("input-data-alimentacao").addEventListener("change", (e) => {
    dataAlimentacaoSelecionada = e.target.value || Util.hojeISO();
    renderAlimentacao();
  });

  ligarEventosResumoDia(data);
  ligarEventosRefeicoes();
  ligarEventosAgua();
}

function statusClasseRefeicao(status) {
  if (status === "feito" || status === "substituicao") return "ref-feito";
  if (status === "parcial") return "ref-parcial";
  if (status === "nao_feito") return "ref-nao-feito";
  return "ref-pendente";
}

function renderCardRefeicao(refeicao, data) {
  const registro = DB.getAlimentacao().find((r) => r.data === data && r.refeicaoId === refeicao.id) || {};
  const status = registro.status || null;

  return `
    <div class="card refeicao-card ${statusClasseRefeicao(status)}" data-refeicao-id="${refeicao.id}">
      <div class="refeicao-header">
        <div>
          <h3>${refeicao.ordem}️⃣ ${Util.escapeHtml(refeicao.nome)}</h3>
          <div class="refeicao-horario">${refeicao.horario} · ~${refeicao.kcalAprox} kcal</div>
        </div>
      </div>

      ${refeicao.opcoes.map((op) => renderOpcaoRefeicao(op)).join("")}

      <div class="secao-titulo">Substituições equivalentes</div>
      <ul class="lista-simples">
        ${refeicao.substituicoes.map((s) => `<li>${Util.escapeHtml(s)}</li>`).join("")}
      </ul>

      <p class="texto-suave mt-8"><strong>Por quê essa refeição:</strong> ${Util.escapeHtml(refeicao.finalidade)}</p>

      <div class="divider"></div>
      <h4>Como foi esta refeição?</h4>
      <div class="status-botoes-refeicao">
        <button type="button" class="btn-status ${status === "feito" ? "ativo-feito" : ""}" data-status="feito">✅ Feito conforme o plano</button>
        <button type="button" class="btn-status ${status === "substituicao" ? "ativo-substituicao" : ""}" data-status="substituicao">🔄 Feito com substituição</button>
        <button type="button" class="btn-status ${status === "parcial" ? "ativo-parcial" : ""}" data-status="parcial">⚠️ Feito parcialmente</button>
        <button type="button" class="btn-status ${status === "nao_feito" ? "ativo-nao-feito" : ""}" data-status="nao_feito">❌ Não feito</button>
      </div>

      <div class="chip-opcoes mt-8 ${status === "feito" ? "" : "hidden"}" data-bloco-opcao>
        <div class="chip ${registro.opcaoEscolhida === "opcao1" ? "selecionado" : ""}" data-opcao="opcao1">Opção 1</div>
        <div class="chip ${registro.opcaoEscolhida === "opcao2" ? "selecionado" : ""}" data-opcao="opcao2">Opção 2</div>
      </div>

      <div class="mt-8 ${status === "substituicao" ? "" : "hidden"}" data-bloco-substituicao>
        <input type="text" data-campo="substituicaoTexto" placeholder="O que você comeu no lugar? (opcional)" value="${Util.escapeHtml(registro.substituicaoTexto || "")}">
      </div>

      <button type="button" class="btn-discreto mt-8" data-toggle-obs>Adicionar observação</button>
      <div class="detalhes-registro-exercicio hidden" data-bloco-obs>
        <label>Horário real</label>
        <input type="time" data-campo="horarioReal" value="${registro.horarioReal || ""}">
        <label>Fome antes da refeição (1-5)</label>
        <input type="number" min="1" max="5" data-campo="fome" value="${registro.fome || ""}">
        <label>Saciedade após a refeição (1-5)</label>
        <input type="number" min="1" max="5" data-campo="saciedade" value="${registro.saciedade || ""}">
        <label>Observações</label>
        <textarea data-campo="observacoes" placeholder="Alguma observação sobre esta refeição?">${Util.escapeHtml(registro.observacoes || "")}</textarea>
        <label>Foto da refeição</label>
        <div class="foto-slot" data-foto-refeicao style="max-width:140px;">
          ${registro.fotoId ? `+ Trocar foto` : "+ Adicionar foto"}
        </div>
        <input type="file" accept="image/*" capture="environment" class="hidden" data-input-foto-refeicao>
        <button type="button" class="btn btn-outline btn-pequeno mt-8" data-salvar-obs-refeicao>Salvar observação</button>
      </div>
    </div>
  `;
}

function renderOpcaoRefeicao(opcao) {
  return `
    <div class="opcao-bloco">
      <h4>${Util.escapeHtml(opcao.nome)}</h4>
      <ul class="opcao-item-lista">
        ${opcao.itens
          .map(
            (item) =>
              `<li>${Util.escapeHtml(item.alimento)}${item.quantidade ? " (" + Util.escapeHtml(item.quantidade) + ")" : ""}</li>`
          )
          .join("")}
      </ul>
      <div class="macro-linha">P ${opcao.totalAprox.proteinaG}g · C ${opcao.totalAprox.carboidratoG}g · G ${opcao.totalAprox.gorduraG}g · ≈${opcao.totalAprox.kcal} kcal</div>
      ${opcao.observacao ? `<p class="texto-suave mt-8">${Util.escapeHtml(opcao.observacao)}</p>` : ""}
    </div>
  `;
}

function salvarRegistroRefeicao(data, refeicaoId, patch) {
  const registroExistente = DB.getAlimentacao().find((r) => r.data === data && r.refeicaoId === refeicaoId) || {};
  const registro = Object.assign(
    {
      id: registroExistente.id || Util.uuid(),
      data,
      refeicaoId,
      status: registroExistente.status || null,
      opcaoEscolhida: registroExistente.opcaoEscolhida || null,
      substituicaoTexto: registroExistente.substituicaoTexto || "",
      horarioReal: registroExistente.horarioReal || "",
      fome: registroExistente.fome || "",
      saciedade: registroExistente.saciedade || "",
      observacoes: registroExistente.observacoes || "",
      fotoId: registroExistente.fotoId || null
    },
    patch
  );
  DB.addOrUpdateRefeicaoRegistro(registro);
  return registro;
}

function ligarEventosRefeicoes() {
  document.querySelectorAll(".refeicao-card").forEach((card) => {
    const refeicaoId = card.getAttribute("data-refeicao-id");
    const data = dataAlimentacaoSelecionada;

    card.querySelectorAll(".status-botoes-refeicao [data-status]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const registroExistente = DB.getAlimentacao().find((r) => r.data === data && r.refeicaoId === refeicaoId);
        const statusAtual = registroExistente ? registroExistente.status : null;
        const novoStatus = statusAtual === btn.getAttribute("data-status") ? null : btn.getAttribute("data-status");
        salvarRegistroRefeicao(data, refeicaoId, { status: novoStatus });
        mostrarToast("Salvo", "sucesso");
        renderAlimentacao();
      });
    });

    const blocoOpcao = card.querySelector("[data-bloco-opcao]");
    if (blocoOpcao) {
      blocoOpcao.querySelectorAll(".chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          const registroExistente = DB.getAlimentacao().find((r) => r.data === data && r.refeicaoId === refeicaoId);
          const opcaoAtual = registroExistente ? registroExistente.opcaoEscolhida : null;
          const valor = chip.getAttribute("data-opcao");
          salvarRegistroRefeicao(data, refeicaoId, { opcaoEscolhida: opcaoAtual === valor ? null : valor });
          renderAlimentacao();
        });
      });
    }

    const inputSubstituicao = card.querySelector('[data-campo="substituicaoTexto"]');
    if (inputSubstituicao) {
      inputSubstituicao.addEventListener("change", () => {
        salvarRegistroRefeicao(data, refeicaoId, { substituicaoTexto: inputSubstituicao.value });
        mostrarToast("Salvo", "sucesso");
      });
    }

    const btnToggleObs = card.querySelector("[data-toggle-obs]");
    const blocoObs = card.querySelector("[data-bloco-obs]");
    if (btnToggleObs && blocoObs) {
      btnToggleObs.addEventListener("click", () => blocoObs.classList.toggle("hidden"));
    }

    const fotoSlot = card.querySelector("[data-foto-refeicao]");
    const fotoInput = card.querySelector("[data-input-foto-refeicao]");
    let novaFotoDataUrl = null;
    if (fotoSlot && fotoInput) {
      fotoSlot.addEventListener("click", () => fotoInput.click());
      fotoInput.addEventListener("change", () => {
        const file = fotoInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          novaFotoDataUrl = reader.result;
          fotoSlot.innerHTML = `<img src="${novaFotoDataUrl}" alt="Foto da refeição">`;
        };
        reader.readAsDataURL(file);
      });
    }

    const btnSalvarObs = card.querySelector("[data-salvar-obs-refeicao]");
    if (btnSalvarObs) {
      btnSalvarObs.addEventListener("click", async () => {
        const registroExistente = DB.getAlimentacao().find((r) => r.data === data && r.refeicaoId === refeicaoId);
        let fotoId = registroExistente ? registroExistente.fotoId : null;
        if (novaFotoDataUrl) {
          fotoId = fotoId || Util.uuid();
          await PhotoDB.salvar(fotoId, novaFotoDataUrl);
        }
        salvarRegistroRefeicao(data, refeicaoId, {
          horarioReal: card.querySelector('[data-campo="horarioReal"]').value,
          fome: card.querySelector('[data-campo="fome"]').value,
          saciedade: card.querySelector('[data-campo="saciedade"]').value,
          observacoes: card.querySelector('[data-campo="observacoes"]').value,
          fotoId
        });
        mostrarToast("Observação salva", "sucesso");
      });
    }
  });
}

function ligarEventosResumoDia(data) {
  const btnMarcarTodas = document.getElementById("btn-marcar-todas-feitas");
  if (btnMarcarTodas) {
    btnMarcarTodas.addEventListener("click", async () => {
      const ok = await confirmarAcao({
        titulo: "Marcar todas as refeições como feitas",
        mensagem: "Todas as refeições de hoje serão marcadas como feitas conforme o plano. Deseja continuar?",
        textoConfirmar: "Marcar todas"
      });
      if (!ok) return;
      PROTOCOLO.refeicoes.forEach((r) => salvarRegistroRefeicao(data, r.id, { status: "feito" }));
      mostrarToast("Refeições marcadas como feitas", "sucesso");
      renderAlimentacao();
    });
  }

  const btnLimpar = document.getElementById("btn-limpar-marcacoes-dia");
  if (btnLimpar) {
    btnLimpar.addEventListener("click", async () => {
      const ok = await confirmarAcao({
        titulo: "Limpar marcações do dia",
        mensagem: "As marcações de status das refeições de hoje serão removidas. As observações preenchidas não serão apagadas. Deseja continuar?",
        perigo: true,
        textoConfirmar: "Limpar"
      });
      if (!ok) return;
      PROTOCOLO.refeicoes.forEach((r) => salvarRegistroRefeicao(data, r.id, { status: null, opcaoEscolhida: null, substituicaoTexto: "" }));
      mostrarToast("Marcações limpas", "sucesso");
      renderAlimentacao();
    });
  }
}

/* ---------------- Água ---------------- */
function renderBlocoAgua(data) {
  const perfil = DB.getPerfil();
  const meta = perfil.metaAguaMl || PROTOCOLO.agua.metaMlPadrao;
  const lancamentos = DB.getAgua().filter((a) => a.data === data);
  const total = lancamentos.reduce((s, a) => s + a.ml, 0);
  const pct = Util.clamp(Math.round((total / meta) * 100), 0, 100);

  return `
    <p class="texto-suave">Meta: ${(meta / 1000).toFixed(1)}L/dia (${PROTOCOLO.agua.metaLitrosMin}-${PROTOCOLO.agua.metaLitrosMax}L)</p>
    <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
    <p class="texto-suave mt-8">${(total / 1000).toFixed(2)}L registrados (${pct}%)</p>
    <div class="agua-botoes">
      <button type="button" class="agua-botao" data-agua-add="200">+200ml</button>
      <button type="button" class="agua-botao" data-agua-add="300">+300ml</button>
      <button type="button" class="agua-botao" data-agua-add="500">+500ml</button>
    </div>
    <div class="linha-campos">
      <input type="number" id="input-agua-custom" placeholder="Quantidade personalizada (ml)" inputmode="numeric">
      <button type="button" class="btn btn-secundario btn-pequeno" id="btn-agua-custom-add">Adicionar</button>
    </div>
    ${lancamentos.length ? `
      <div class="secao-titulo">Lançamentos de hoje</div>
      ${lancamentos
        .map(
          (a) => `
        <div class="agua-lista-item">
          <span>${a.hora || ""} — ${a.ml}ml</span>
          <button type="button" class="btn-icone btn-pequeno" data-remover-agua="${a.id}" style="width:30px;height:30px;min-height:30px;">✕</button>
        </div>
      `
        )
        .join("")}
    ` : ""}
  `;
}

function ligarEventosAgua() {
  document.querySelectorAll("[data-agua-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      adicionarAgua(Number(btn.getAttribute("data-agua-add")));
    });
  });
  const btnCustom = document.getElementById("btn-agua-custom-add");
  if (btnCustom) {
    btnCustom.addEventListener("click", () => {
      const input = document.getElementById("input-agua-custom");
      const val = Number(input.value);
      if (!val || val <= 0) {
        mostrarToast("Informe uma quantidade válida.", "erro");
        return;
      }
      adicionarAgua(val);
    });
  }
  document.querySelectorAll("[data-remover-agua]").forEach((btn) => {
    btn.addEventListener("click", () => {
      DB.removeAgua(btn.getAttribute("data-remover-agua"));
      renderAlimentacao();
    });
  });
}

function adicionarAgua(ml) {
  DB.addAgua({ id: Util.uuid(), data: dataAlimentacaoSelecionada, ml, hora: Util.agoraHM() });
  mostrarToast(`+${ml}ml registrados`, "sucesso");
  renderAlimentacao();
}

/* ---------------- Histórico ---------------- */
function renderHistoricoAlimentacao() {
  const dias = [];
  for (let i = 1; i <= 7; i++) {
    dias.push(Util.addDias(Util.hojeISO(), -i));
  }
  const linhas = dias
    .map((d) => {
      const registros = DB.getAlimentacao().filter((r) => r.data === d && r.status);
      const agua = Adesao.totalAguaDia(d);
      if (!registros.length && !agua) return "";
      const pct = Adesao.percentualAlimentacaoDia(d);
      return `<li><strong>${Util.isoParaBR(d)}</strong> — ${registros.length}/${PROTOCOLO.refeicoes.length} refeições (${pct}%) · água ${(agua / 1000).toFixed(2)}L</li>`;
    })
    .filter(Boolean);

  if (!linhas.length) return `<p class="texto-suave">Sem histórico nos últimos 7 dias.</p>`;
  return `<ul class="lista-simples">${linhas.join("")}</ul>`;
}
