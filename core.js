/* VV FIT — núcleo: helpers, adesão, UI genérica (toast/modal), instalação PWA */

const Util = {
  uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  hojeISO() {
    return this.dataParaISO(new Date());
  },

  dataParaISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  },

  isoParaBR(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  },

  isoParaDiaSemana(iso) {
    const d = new Date(iso + "T00:00:00");
    const dias = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
    return dias[d.getDay()];
  },

  agoraHM() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  },

  formatarDuracao(seg) {
    const h = Math.floor(seg / 3600);
    const m = Math.floor((seg % 3600) / 60);
    const s = Math.floor(seg % 60);
    if (h > 0) return `${h}h ${String(m).padStart(2, "0")}min`;
    return `${m}min ${String(s).padStart(2, "0")}s`;
  },

  formatarMMSS(seg) {
    seg = Math.max(0, Math.round(seg));
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  },

  addDias(iso, n) {
    const d = new Date(iso + "T00:00:00");
    d.setDate(d.getDate() + n);
    return this.dataParaISO(d);
  },

  inicioDaSemana(iso) {
    // segunda-feira como início
    const d = new Date(iso + "T00:00:00");
    const diff = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - diff);
    return this.dataParaISO(d);
  },

  escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  },

  media(arr) {
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
};

/* ---------------- Toast ---------------- */
function mostrarToast(msg, tipo) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = "toast show" + (tipo ? " toast-" + tipo : "");
  clearTimeout(el._timeout);
  el._timeout = setTimeout(() => {
    el.className = "toast";
  }, 2600);
}

/* ---------------- Modal de confirmação ---------------- */
function confirmarAcao({ titulo, mensagem, textoConfirmar, textoCancelar, perigo }) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal-box" role="dialog" aria-modal="true">
        <h3>${Util.escapeHtml(titulo || "Confirmar ação")}</h3>
        <p>${Util.escapeHtml(mensagem || "Tem certeza?")}</p>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" data-acao="cancelar">${Util.escapeHtml(textoCancelar || "Cancelar")}</button>
          <button type="button" class="btn ${perigo ? "btn-perigo" : "btn-primario"}" data-acao="confirmar">${Util.escapeHtml(textoConfirmar || "Confirmar")}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.remove();
        resolve(false);
      }
      const acao = e.target.getAttribute("data-acao");
      if (acao === "confirmar") {
        overlay.remove();
        resolve(true);
      } else if (acao === "cancelar") {
        overlay.remove();
        resolve(false);
      }
    });
  });
}

function abrirModal(conteudoHtml, opts) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `<div class="modal-box modal-box-lg" role="dialog" aria-modal="true">${conteudoHtml}</div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay && !(opts && opts.semFecharFora)) {
      overlay.remove();
    }
    if (e.target.closest("[data-fechar-modal]")) {
      overlay.remove();
    }
  });
  return overlay;
}

/* ---------------- Planos (plano vigente por data) ----------------
 * A partir da Fase 1, o plano passa a ter data de início configurável
 * (config.faseInicio). Para qualquer data anterior a essa, o "previsto"
 * é calculado com o plano anterior (PROTOCOLO_LEGADO), preservando a
 * leitura correta do histórico. Se não houver data configurada, a
 * Fase 1 vale para todas as datas.
 */
const Planos = {
  get ATIVO() {
    return PROTOCOLO;
  },
  get LEGADO() {
    return typeof PROTOCOLO_LEGADO !== "undefined" ? PROTOCOLO_LEGADO : PROTOCOLO;
  },
  faseInicio() {
    return DB.getFaseInicio();
  },
  vigenteEm(iso) {
    const ini = this.faseInicio();
    if (!ini) return this.ATIVO;
    return iso >= ini ? this.ATIVO : this.LEGADO;
  },
  ehFase1Em(iso) {
    return this.vigenteEm(iso) === this.ATIVO;
  },
  treinoDoDia(iso) {
    const dia = Util.isoParaDiaSemana(iso);
    return this.vigenteEm(iso).treinos[dia];
  },
  refeicoesDoDia(iso) {
    return this.vigenteEm(iso).refeicoes || [];
  },
  nomeFaseEm(iso) {
    const p = this.vigenteEm(iso);
    return p.fase ? p.fase.nome : "Plano";
  }
};

/* ---------------- Cálculo de adesão ---------------- */
const Adesao = {
  treinoDoDia(iso) {
    return Planos.treinoDoDia(iso);
  },

  // Distingue "não informado" (dia de treino passado, sem nenhum registro) de
  // "não feito" (marcado explicitamente) e de dias futuros. Usado no resumo.
  previstoRealizadoTreino(iso) {
    const proto = Planos.treinoDoDia(iso);
    if (!proto || proto.tipo !== "treino") return { previsto: false };
    if (iso > Util.hojeISO()) return { previsto: true, futuro: true };
    const sessoes = DB.getTreinos().filter((t) => t.data === iso);
    if (!sessoes.length) return { previsto: true, status: "nao_informado" };
    const st = sessoes[sessoes.length - 1].status || "nao_realizado";
    const norm = st === "completo" ? "completo" : st === "parcial" ? "parcial" : "nao_feito";
    return { previsto: true, status: norm };
  },

  statusTreinoNoDia(iso) {
    const treinoProtocolo = this.treinoDoDia(iso);
    if (!treinoProtocolo || treinoProtocolo.tipo === "descanso") return "descanso";
    const sessoes = DB.getTreinos().filter((t) => t.data === iso);
    if (!sessoes.length) return "nao_realizado";
    const ultima = sessoes[sessoes.length - 1];
    return ultima.status || "nao_realizado";
  },

  percentualTreinoSemana(iso) {
    const inicio = Util.inicioDaSemana(iso);
    let previstos = 0;
    let feitos = 0;
    for (let i = 0; i < 7; i++) {
      const d = Util.addDias(inicio, i);
      if (d > Util.hojeISO()) continue;
      const proto = this.treinoDoDia(d);
      if (proto && proto.tipo === "treino") {
        previstos++;
        const st = this.statusTreinoNoDia(d);
        if (st === "completo") feitos++;
        else if (st === "parcial") feitos += 0.5;
      }
    }
    if (previstos === 0) return 100;
    return Util.clamp(Math.round((feitos / previstos) * 100), 0, 100);
  },

  percentualAlimentacaoDia(iso) {
    // considera apenas refeições com algum status marcado; refeições sem
    // nenhum toque do usuário não contam nem a favor nem contra o percentual.
    const registros = DB.getAlimentacao().filter((r) => r.data === iso && r.status);
    if (!registros.length) return 0;
    let pontos = 0;
    registros.forEach((r) => {
      if (r.status === "feito" || r.status === "substituicao") pontos += 100;
      else if (r.status === "parcial") pontos += 50;
      // "nao_feito" soma 0 pontos
    });
    return Util.clamp(Math.round(pontos / registros.length), 0, 100);
  },

  percentualAlimentacaoSemana(iso) {
    const inicio = Util.inicioDaSemana(iso);
    let soma = 0;
    let dias = 0;
    for (let i = 0; i < 7; i++) {
      const d = Util.addDias(inicio, i);
      if (d > Util.hojeISO()) continue;
      const temRegistro = DB.getAlimentacao().some((r) => r.data === d && r.status);
      if (!temRegistro) continue;
      soma += this.percentualAlimentacaoDia(d);
      dias++;
    }
    if (!dias) return 0;
    return Math.round(soma / dias);
  },

  percentualAguaDia(iso) {
    const meta = DB.getPerfil().metaAguaMl || PROTOCOLO.agua.metaMlPadrao;
    const total = DB.getAgua()
      .filter((a) => a.data === iso)
      .reduce((s, a) => s + a.ml, 0);
    return Util.clamp(Math.round((total / meta) * 100), 0, 100);
  },

  totalAguaDia(iso) {
    return DB.getAgua()
      .filter((a) => a.data === iso)
      .reduce((s, a) => s + a.ml, 0);
  },

  statusAguaDia(iso) {
    const total = this.totalAguaDia(iso);
    if (total <= 0) return { label: "Não registrada", icone: "❌", classe: "adesao-baixa" };
    const pct = this.percentualAguaDia(iso);
    if (pct >= 100) return { label: "Meta atingida", icone: "✅", classe: "adesao-excelente" };
    return { label: "Parcial", icone: "⚠️", classe: "adesao-parcial" };
  },

  percentualAguaSemana(iso) {
    const inicio = Util.inicioDaSemana(iso);
    let soma = 0;
    let dias = 0;
    for (let i = 0; i < 7; i++) {
      const d = Util.addDias(inicio, i);
      if (d > Util.hojeISO()) continue;
      if (this.totalAguaDia(d) <= 0) continue;
      soma += this.percentualAguaDia(d);
      dias++;
    }
    if (!dias) return 0;
    return Math.round(soma / dias);
  },

  resumoSemanal(iso) {
    const treino = this.percentualTreinoSemana(iso);
    const alimentacao = this.percentualAlimentacaoSemana(iso);
    const agua = this.percentualAguaSemana(iso);
    const cfg = DB.getConfig().pesosAdesao;
    const somaPesos = (cfg.treino || 0) + (cfg.alimentacao || 0) + (cfg.agua || 0);
    const geral = Math.round(
      (treino * (cfg.treino || 0) + alimentacao * (cfg.alimentacao || 0) + agua * (cfg.agua || 0)) / (somaPesos || 1)
    );
    return { treino, alimentacao, agua, geral };
  },

  percentualCheckinDia(iso) {
    const inicioSemana = Util.inicioDaSemana(iso);
    const fimSemana = Util.addDias(inicioSemana, 6);
    const existe = DB.getCheckins().some((c) => c.data >= inicioSemana && c.data <= fimSemana);
    return existe ? 100 : 0;
  },

  percentualDia(iso) {
    const cfg = DB.getConfig().pesosAdesao;
    const t = this.percentualTreinoSemana(iso);
    const a = this.percentualAlimentacaoDia(iso);
    const ag = this.percentualAguaDia(iso);
    const c = this.percentualCheckinDia(iso);
    const total =
      (t * cfg.treino + a * cfg.alimentacao + ag * cfg.agua + c * cfg.checkin) /
      (cfg.treino + cfg.alimentacao + cfg.agua + cfg.checkin || 1);
    return Math.round(total);
  },

  classificacao(pct) {
    if (pct >= 90) return { label: "Excelente adesão", classe: "adesao-excelente" };
    if (pct >= 75) return { label: "Boa adesão", classe: "adesao-boa" };
    if (pct >= 60) return { label: "Adesão parcial", classe: "adesao-parcial" };
    return { label: "Precisa de atenção", classe: "adesao-baixa" };
  },

  sequenciaDias() {
    let streak = 0;
    let d = Util.hojeISO();
    // conta dias consecutivos (a partir de hoje/ontem) com adesão geral >= 60%
    let cursor = d;
    // se hoje ainda não tem registros suficientes, começa a contagem de ontem
    for (let i = 0; i < 365; i++) {
      const pct = this.percentualDiaSimples(cursor);
      if (pct === null) break;
      if (pct >= 60) {
        streak++;
        cursor = Util.addDias(cursor, -1);
      } else {
        break;
      }
    }
    return streak;
  },

  percentualDiaSimples(iso) {
    // versão sem considerar treino semanal, apenas o dia isolado, usado na sequência
    const proto = this.treinoDoDia(iso);
    const temTreino = proto && proto.tipo === "treino";
    const stTreino = temTreino ? this.statusTreinoNoDia(iso) : "descanso";
    const treinoOk = !temTreino || stTreino === "completo" || stTreino === "parcial";
    const alimentacaoPct = this.percentualAlimentacaoDia(iso);
    const aguaPct = this.percentualAguaDia(iso);
    const semRegistro =
      !temTreino === false &&
      stTreino === "nao_realizado" &&
      alimentacaoPct === 0 &&
      aguaPct === 0;
    if (semRegistro && iso !== Util.hojeISO()) return null;
    let pontos = 0;
    let base = 0;
    if (temTreino) {
      base += 50;
      pontos += treinoOk ? 50 : 0;
    }
    base += 50;
    pontos += (alimentacaoPct / 100) * 30 + (aguaPct / 100) * 20;
    if (base === 0) return 100;
    return Math.round((pontos / base) * 100);
  }
};

/* ---------------- Som de fim de descanso (opcional) ---------------- */
function tocarBipDescanso() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
    osc.onended = () => ctx.close();
  } catch (e) {
    /* som opcional — silencioso se não suportado */
  }
}

/* ---------------- Instalação PWA ---------------- */
let eventoInstalacaoAdiado = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  eventoInstalacaoAdiado = e;
  const btn = document.getElementById("btn-instalar-app");
  if (btn) btn.classList.remove("hidden");
});

async function instalarApp() {
  if (eventoInstalacaoAdiado) {
    eventoInstalacaoAdiado.prompt();
    const { outcome } = await eventoInstalacaoAdiado.userChoice;
    eventoInstalacaoAdiado = null;
    const btn = document.getElementById("btn-instalar-app");
    if (btn) btn.classList.add("hidden");
    if (outcome === "accepted") mostrarToast("Aplicativo instalado!", "sucesso");
  } else {
    mostrarInstrucoesInstalacao();
  }
}

function mostrarInstrucoesInstalacao() {
  abrirModal(`
    <h3>Instalar o VV FIT</h3>
    <p><strong>Android e Google Chrome</strong></p>
    <ol class="lista-instrucoes">
      <li>Abra o aplicativo no Google Chrome.</li>
      <li>Toque no menu de três pontos.</li>
      <li>Selecione "Adicionar à tela inicial" ou "Instalar aplicativo".</li>
      <li>Confirme a instalação.</li>
    </ol>
    <div class="modal-actions">
      <button type="button" class="btn btn-primario" data-fechar-modal>Entendi</button>
    </div>
  `);
}

/* ---------------- Migração de dados (registro simplificado por botões) ---------------- */
const Migracao = {
  VERSAO_ATUAL: 3,

  executar() {
    const atual = DB.getVersaoDados() || 1;
    if (atual >= this.VERSAO_ATUAL) return;
    if (atual < 2) this._migrarParaV2();
    if (atual < 3) this._migrarParaV3();
    DB.setVersaoDados(this.VERSAO_ATUAL);
  },

  /*
   * v2 → v3: entrada da Fase 1.
   * Migração PURAMENTE ADITIVA. Nenhum registro (treinos, refeições, água,
   * medidas, check-ins, fotos) é alterado, remapeado ou apagado. Os registros
   * antigos de refeição mantêm o refeicaoId original (café/almoço/…): eles
   * continuam contando no histórico e nos relatórios, e a tela de hoje passa
   * a mostrar as 5 refeições da Fase 1.
   *
   * A migração faz apenas duas coisas, ambas sem tocar em nenhum registro:
   *  1. Define uma data de início para a Fase 1 (config.faseInicio), para que
   *     o "previsto" de datas anteriores continue sendo calculado pelo plano
   *     antigo. Se já houver histórico, a data padrão é hoje; a usuária pode
   *     ajustá-la em Perfil → Fase do plano.
   *  2. Atualiza a META de água do perfil para a da Fase 1 (3 L/dia), mas
   *     SOMENTE se ela ainda estivesse na meta padrão do plano anterior
   *     (2350 ml) ou vazia — uma meta personalizada pela usuária é mantida.
   *     Os lançamentos de água (vvfit_agua) não são tocados.
   */
  _migrarParaV3() {
    const cfg = DB.getConfig();
    if (!cfg.faseInicio) {
      const temHistorico =
        (DB.getTreinos() || []).length ||
        (DB.getAlimentacao() || []).length ||
        (DB.getAgua() || []).length ||
        (DB.getEvolucao() || []).length ||
        (DB.getCheckins() || []).length;
      cfg.faseInicio = temHistorico ? Util.hojeISO() : null;
      DB.setConfig(cfg);
    }

    const META_AGUA_LEGADO = 2350; // PROTOCOLO_LEGADO.agua.metaMlPadrao
    const perfil = DB.getPerfil();
    if (!perfil.metaAguaMl || perfil.metaAguaMl === META_AGUA_LEGADO) {
      perfil.metaAguaMl = (typeof PROTOCOLO !== "undefined" && PROTOCOLO.agua)
        ? PROTOCOLO.agua.metaMlPadrao
        : 3000;
      DB.setPerfil(perfil);
    }
  },

  // v1 → v2: treino passa a ter status por exercício (feito/parcial/não feito)
  // em vez de séries obrigatórias; alimentação passa a ter um vocabulário de
  // status simplificado (feito/substituição/parcial/não feito). Nenhum dado
  // antigo é descartado — cargas, repetições e observações ficam preservadas
  // dentro de "seriesLegado" para consulta em "Adicionar detalhes".
  _migrarParaV2() {
    const treinos = DB.getTreinos().map((t) => {
      const exercicios = (t.exercicios || []).map((ex) => {
        let status = null;
        if (ex.series && ex.series.length) {
          const concluidas = ex.series.filter((s) => s.concluida);
          if (concluidas.length === ex.series.length) status = "feito";
          else if (concluidas.length > 0) status = "parcial";
        }
        const migrado = Object.assign({}, ex, {
          status,
          cargaDetalhe: "",
          repsDetalhe: "",
          rpeDetalhe: "",
          observacaoDetalhe: "",
          seriesLegado: ex.series && ex.series.length ? ex.series : null
        });
        delete migrado.series;
        delete migrado.concluido;
        return migrado;
      });
      return Object.assign({}, t, { exercicios, statusGeralManual: true });
    });
    DB.setTreinos(treinos);

    const mapaStatusAlimentacao = {
      opcao1: "feito",
      opcao2: "feito",
      substituicao: "substituicao",
      parcial: "parcial",
      nao_seguiu: "nao_feito",
      ainda_nao: null
    };
    const alimentacao = DB.getAlimentacao().map((r) => {
      const statusAntigo = r.status;
      const novoStatus = Object.prototype.hasOwnProperty.call(mapaStatusAlimentacao, statusAntigo)
        ? mapaStatusAlimentacao[statusAntigo]
        : statusAntigo || null;
      const opcaoEscolhida = statusAntigo === "opcao1" ? "opcao1" : statusAntigo === "opcao2" ? "opcao2" : null;
      const substituicaoTexto = statusAntigo === "substituicao" ? r.alimentosDiferentes || "" : "";
      return Object.assign({}, r, { status: novoStatus, opcaoEscolhida, substituicaoTexto });
    });
    DB.setAlimentacao(alimentacao);
  }
};
