/* VV FIT — Tela Início */

const FRASES_INCENTIVO = [
  "Consistência vale mais que perfeição. Um passo de cada vez.",
  "Você não precisa ser perfeita hoje, só precisa aparecer.",
  "Cada treino é um depósito na conta da sua evolução.",
  "O resultado de hoje é reflexo das pequenas escolhas de ontem.",
  "Progresso não é sempre visível na balança — confie no processo.",
  "Descansar também faz parte do plano. Respeite os seus dias.",
  "Beber água, comer bem e treinar com técnica: o essencial resolve.",
  "Sua constância de hoje é o resultado que você vai ver amanhã.",
  "Ir com calma também é ir para frente.",
  "Registrar seu progresso é tão importante quanto o treino em si."
];

function fraseDoDia() {
  const dia = new Date().getDate() + new Date().getMonth() * 31;
  return FRASES_INCENTIVO[dia % FRASES_INCENTIVO.length];
}

function renderInicio() {
  const container = document.getElementById("tela-inicio");
  const perfil = DB.getPerfil();
  const hoje = Util.hojeISO();
  const diaSemana = Util.isoParaDiaSemana(hoje);
  const treinoHoje = PROTOCOLO.treinos[diaSemana];
  const ehDescanso = treinoHoje.tipo === "descanso";

  const nomeExibicao = perfil.nome ? perfil.nome : "";
  const saudacaoBase = horaSaudacao();
  const saudacao = nomeExibicao ? `${saudacaoBase}, ${nomeExibicao}` : saudacaoBase;

  const dataFormatada = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  const statusTreinoHoje = ehDescanso ? null : Adesao.statusTreinoNoDia(hoje);
  const pctAlimentacaoHoje = Adesao.percentualAlimentacaoDia(hoje);
  const refeicoesFeitasHoje = DB.getAlimentacao().filter(
    (r) => r.data === hoje && (r.status === "feito" || r.status === "substituicao")
  ).length;
  const aguaStatus = Adesao.statusAguaDia(hoje);
  const aguaHojeMl = Adesao.totalAguaDia(hoje);
  const metaAguaMl = perfil.metaAguaMl || PROTOCOLO.agua.metaMlPadrao;
  const pctAgua = Adesao.percentualAguaDia(hoje);

  const resumo = Adesao.resumoSemanal(hoje);
  const treinosConcluidosSemana = contarTreinosConcluidosSemana(hoje);
  const pesoRecente = pesoMaisRecente();
  const streak = Adesao.sequenciaDias();

  container.innerHTML = `
    <div class="card card-destaque">
      <h2>${Util.escapeHtml(saudacao)}</h2>
      <p class="texto-suave">${capitalizar(dataFormatada)} · ${DIAS_LABEL[diaSemana]}</p>
      <p class="frase-incentivo">${Util.escapeHtml(fraseDoDia())}</p>
    </div>

    <div class="card">
      <h3>Acompanhamento de hoje</h3>

      <div class="secao-titulo">Treino</div>
      ${ehDescanso ? `
        <p class="texto-suave">🌙 Hoje é dia de descanso.</p>
      ` : `
        <p class="texto-suave">${Util.escapeHtml(treinoHoje.nome)} — <strong>${rotuloStatusTreino(statusTreinoHoje)}</strong></p>
        <div class="status-botoes-geral">
          <button type="button" class="btn-status ${statusTreinoHoje === "completo" ? "ativo-feito" : ""}" data-inicio-status-treino="completo">✅ Feito</button>
          <button type="button" class="btn-status ${statusTreinoHoje === "parcial" ? "ativo-parcial" : ""}" data-inicio-status-treino="parcial">⚠️ Parcial</button>
          <button type="button" class="btn-status ${statusTreinoHoje === "nao_realizado" ? "ativo-nao-feito" : ""}" data-inicio-status-treino="nao_realizado">❌ Não feito</button>
        </div>
        <button type="button" class="btn btn-outline btn-pequeno mt-8" id="btn-abrir-treino-hoje">Ver ficha completa do treino</button>
      `}

      <div class="secao-titulo">Alimentação</div>
      <p class="texto-suave">${pctAlimentacaoHoje}% de adesão · ${refeicoesFeitasHoje}/${PROTOCOLO.refeicoes.length} refeições concluídas</p>
      <button type="button" class="btn btn-outline btn-pequeno" id="btn-registrar-alimentacao-inicio">Registrar refeições</button>

      <div class="secao-titulo">Água</div>
      <div class="card-titulo-linha">
        <span class="texto-suave">${(aguaHojeMl / 1000).toFixed(2)}L de ${(metaAguaMl / 1000).toFixed(1)}L</span>
        <span class="indicador-dia ${aguaStatus.classe}">${aguaStatus.icone} ${aguaStatus.label}</span>
      </div>
      <div class="progress-bar-track mt-8"><div class="progress-bar-fill" style="width:${Util.clamp(pctAgua, 0, 100)}%"></div></div>
      <div class="agua-botoes mt-8">
        <button type="button" class="agua-botao" data-inicio-agua-add="200">+200ml</button>
        <button type="button" class="agua-botao" data-inicio-agua-add="300">+300ml</button>
        <button type="button" class="agua-botao" data-inicio-agua-add="500">+500ml</button>
      </div>
    </div>

    <div class="card">
      <h3>Adesão da semana</h3>
      <div class="grid-stats">
        <div class="stat-box"><span class="valor">${resumo.treino}%</span><span class="rotulo">Treino</span></div>
        <div class="stat-box"><span class="valor">${resumo.alimentacao}%</span><span class="rotulo">Alimentação</span></div>
        <div class="stat-box"><span class="valor">${resumo.agua}%</span><span class="rotulo">Água</span></div>
        <div class="stat-box"><span class="valor">${resumo.geral}%</span><span class="rotulo">Geral</span></div>
      </div>
    </div>

    <div class="card">
      <h3>Resumo da semana</h3>
      <div class="grid-stats">
        <div class="stat-box">
          <span class="valor">${treinosConcluidosSemana}</span>
          <span class="rotulo">Treinos feitos</span>
        </div>
        <div class="stat-box">
          <span class="valor">${streak}</span>
          <span class="rotulo">Dias seguidos</span>
        </div>
        <div class="stat-box">
          <span class="valor">${pesoRecente !== null ? pesoRecente.toFixed(1) + "kg" : "—"}</span>
          <span class="rotulo">Peso mais recente</span>
        </div>
      </div>
    </div>

    <button type="button" class="btn btn-outline" id="btn-checkin-inicio">Fazer check-in semanal</button>
  `;

  if (!ehDescanso) {
    document.querySelectorAll("[data-inicio-status-treino]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sessao = obterOuCriarSessaoTreino(hoje, diaSemana);
        definirStatusGeralManual(sessao, btn.getAttribute("data-inicio-status-treino"));
        mostrarToast("Status do treino atualizado", "sucesso");
        renderInicio();
      });
    });
    document.getElementById("btn-abrir-treino-hoje").addEventListener("click", () => {
      navegarPara("treino");
      setTimeout(() => selecionarDiaTreino(diaSemana), 0);
    });
  }

  document.querySelectorAll("[data-inicio-agua-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      DB.addAgua({ id: Util.uuid(), data: hoje, ml: Number(btn.getAttribute("data-inicio-agua-add")), hora: Util.agoraHM() });
      mostrarToast(`+${btn.getAttribute("data-inicio-agua-add")}ml registrados`, "sucesso");
      renderInicio();
    });
  });

  document.getElementById("btn-registrar-alimentacao-inicio").addEventListener("click", () => {
    navegarPara("alimentacao");
  });
  document.getElementById("btn-checkin-inicio").addEventListener("click", () => {
    abrirFormularioCheckin();
  });
}

function horaSaudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function capitalizar(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function contarTreinosConcluidosSemana(iso) {
  const inicio = Util.inicioDaSemana(iso);
  const fim = Util.addDias(inicio, 6);
  const sessoes = DB.getTreinos().filter((t) => t.data >= inicio && t.data <= fim && t.status === "completo");
  const dias = new Set(sessoes.map((s) => s.data));
  return dias.size;
}

function pesoMaisRecente() {
  const evolucao = DB.getEvolucao();
  if (!evolucao.length) {
    const perfil = DB.getPerfil();
    return perfil.pesoAtualKg || null;
  }
  return evolucao[evolucao.length - 1].peso;
}

function rotuloStatusTreino(status) {
  const map = {
    completo: "Treino feito",
    parcial: "Treino parcial",
    nao_realizado: "Ainda não registrado"
  };
  return map[status] || "Ainda não registrado";
}
