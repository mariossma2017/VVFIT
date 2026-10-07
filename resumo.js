/* VV FIT — Resumo semanal
 * Cálculo do resumo de acompanhamento e geração de PDF (jsPDF vendorizado).
 *
 * Princípios (do pedido):
 *  - "Não realizado" (marcado ❌) é diferente de "não informado" (dia previsto,
 *    passado, sem nenhum registro). Campos vazios nunca viram zero automático.
 *  - Períodos em andamento não contam dias futuros como falta.
 *  - Usa o plano vigente em cada data (Planos.treinoDoDia).
 *  - Não inventa evolução, não estima perda de gordura, não faz diagnóstico.
 *  - Sempre mostra os critérios de cada percentual.
 */

const ResumoDados = {
  // Presets de período
  semanaAtual(refISO) {
    const inicio = Util.inicioDaSemana(refISO || Util.hojeISO());
    return { inicio, fim: Util.addDias(inicio, 6) };
  },
  ultimos14(refISO) {
    const fim = refISO || Util.hojeISO();
    return { inicio: Util.addDias(fim, -13), fim };
  },

  parseMinutos(txt) {
    if (!txt) return 0;
    const m = String(txt).match(/\d+/);
    return m ? Number(m[0]) : 0;
  },

  calcular(inicio, fim) {
    const hoje = Util.hojeISO();
    const fimEfetivo = fim > hoje ? hoje : fim; // não conta dias futuros
    const emAndamento = fim > hoje;

    const perfil = DB.getPerfil();

    /* ---------- Treinos ---------- */
    const treinoDias = []; // resumo por dia
    let treinoPrevistos = 0;
    let treinoComInfo = 0;
    let treinoRealizadosPontos = 0; // completo=1, parcial=0.5
    let treinoSemInfo = 0;
    let treinoNaoFeito = 0;

    /* ---------- AEJ / escada ---------- */
    let aejPrevistoDias = 0;
    let escadaPrevistoMin = 0;

    /* ---------- Alimentação ---------- */
    let refeicoesPrevistas = 0;
    let refeicoesInformadas = 0;
    let somaAdesaoAlimDia = 0;
    let diasAlimComInfo = 0;

    /* ---------- Água ---------- */
    let somaAguaDiasPreenchidos = 0;
    let diasAguaPreenchidos = 0;

    let cursor = inicio;
    while (cursor <= fimEfetivo) {
      const proto = Planos.treinoDoDia(cursor);
      const diaSemana = Util.isoParaDiaSemana(cursor);
      const planoDia = Planos.vigenteEm(cursor);

      // treino
      const pr = Adesao.previstoRealizadoTreino(cursor);
      if (pr.previsto && !pr.futuro) {
        treinoPrevistos++;
        let rotulo = "Não informado";
        if (pr.status === "completo") { treinoComInfo++; treinoRealizadosPontos += 1; rotulo = "Feito"; }
        else if (pr.status === "parcial") { treinoComInfo++; treinoRealizadosPontos += 0.5; rotulo = "Parcial"; }
        else if (pr.status === "nao_feito") { treinoComInfo++; treinoNaoFeito++; rotulo = "Não feito"; }
        else { treinoSemInfo++; }
        treinoDias.push({ data: cursor, diaSemana, nome: proto.nome, rotulo });
      } else if (proto && proto.tipo === "descanso") {
        treinoDias.push({ data: cursor, diaSemana, nome: "Descanso", rotulo: "Descanso" });
      }

      // AEJ previsto
      if (planoDia.aej && planoDia.aej.dias && planoDia.aej.dias.indexOf(diaSemana) !== -1) {
        aejPrevistoDias++;
      }
      // escada prevista
      if (proto && proto.cardio && proto.cardio.tempo) {
        escadaPrevistoMin += this.parseMinutos(proto.cardio.tempo);
      }

      // alimentação
      const refeicoesDia = Planos.refeicoesDoDia(cursor);
      refeicoesPrevistas += refeicoesDia.length;
      const regsComStatus = DB.getAlimentacao().filter((r) => r.data === cursor && r.status);
      refeicoesInformadas += regsComStatus.length;
      if (regsComStatus.length) {
        somaAdesaoAlimDia += Adesao.percentualAlimentacaoDia(cursor);
        diasAlimComInfo++;
      }

      // água
      const totalAgua = Adesao.totalAguaDia(cursor);
      if (totalAgua > 0) {
        somaAguaDiasPreenchidos += totalAgua;
        diasAguaPreenchidos++;
      }

      cursor = Util.addDias(cursor, 1);
    }

    const adesaoTreinoPct = treinoComInfo ? Math.round((treinoRealizadosPontos / treinoComInfo) * 100) : null;
    const adesaoAlimentarPct = diasAlimComInfo ? Math.round(somaAdesaoAlimDia / diasAlimComInfo) : null;
    const refeicoesSemInfo = Math.max(0, refeicoesPrevistas - refeicoesInformadas);
    const mediaHidratacaoL = diasAguaPreenchidos ? somaAguaDiasPreenchidos / diasAguaPreenchidos / 1000 : null;

    /* ---------- AEJ / escada realizados ---------- */
    const cardioPeriodo = DB.getCardio().filter((c) => c.data >= inicio && c.data <= fimEfetivo);
    const aejSessoes = cardioPeriodo.filter((c) => c.tipo === "aej");
    const escadaSessoes = cardioPeriodo.filter((c) => (c.tipo === "escada" || c.tipo === "cardio"));
    const aejMinTotal = aejSessoes.reduce((n, s) => n + (Number(s.minutos) || 0), 0);
    const escadaMinTotal = escadaSessoes.reduce((n, s) => n + (Number(s.minutos) || 0), 0);

    /* ---------- Peso ---------- */
    const evolucaoPeriodo = DB.getEvolucao()
      .filter((e) => e.data >= inicio && e.data <= fim)
      .slice()
      .sort((a, b) => a.data.localeCompare(b.data));
    const comPeso = evolucaoPeriodo.filter((e) => e.peso !== null && e.peso !== undefined && e.peso !== "");
    let peso = null;
    if (comPeso.length) {
      const ini = comPeso[0];
      const ult = comPeso[comPeso.length - 1];
      peso = {
        inicial: ini.peso, dataInicial: ini.data,
        final: ult.peso, dataFinal: ult.data,
        variacao: comPeso.length > 1 ? Number((ult.peso - ini.peso).toFixed(1)) : null
      };
    }

    /* ---------- Medidas ---------- */
    const medidas = [];
    (typeof CAMPOS_MEDIDAS !== "undefined" ? CAMPOS_MEDIDAS : [])
      .filter((c) => c.chave !== "peso")
      .forEach((campo) => {
        const pts = evolucaoPeriodo
          .filter((e) => e[campo.chave] !== null && e[campo.chave] !== undefined && e[campo.chave] !== "")
          .map((e) => ({ data: e.data, valor: Number(e[campo.chave]) }));
        if (pts.length < 2) return; // só mostra medida com registros comparáveis
        const ini = pts[0];
        const ult = pts[pts.length - 1];
        medidas.push({
          rotulo: campo.rotulo,
          inicial: ini.valor, final: ult.valor,
          dataInicial: ini.data, dataFinal: ult.data,
          variacao: Number((ult.valor - ini.valor).toFixed(1))
        });
      });

    /* ---------- Sono e disposição ---------- */
    const bemPeriodo = DB.getBemEstar().filter((b) => b.data >= inicio && b.data <= fimEfetivo);
    const sonos = bemPeriodo.filter((b) => b.sonoHoras !== null && b.sonoHoras !== undefined && b.sonoHoras !== "").map((b) => Number(b.sonoHoras));
    const disposicoes = bemPeriodo.filter((b) => b.disposicao !== null && b.disposicao !== undefined && b.disposicao !== "").map((b) => Number(b.disposicao));
    const bemEstar = {
      mediaSono: sonos.length ? Number(Util.media(sonos).toFixed(1)) : null,
      diasSono: sonos.length,
      mediaDisposicao: disposicoes.length ? Number(Util.media(disposicoes).toFixed(1)) : null,
      diasDisposicao: disposicoes.length
    };

    /* ---------- Evolução de cargas (só com registros comparáveis) ---------- */
    const cargasPorExercicio = {};
    DB.getTreinos()
      .filter((t) => t.data >= inicio && t.data <= fim)
      .slice()
      .sort((a, b) => (a.data + (a.criadoEm || "")).localeCompare(b.data + (b.criadoEm || "")))
      .forEach((t) => {
        (t.exercicios || []).forEach((ex) => {
          const c = parseFloat(ex.cargaDetalhe);
          if (isNaN(c)) return;
          if (!cargasPorExercicio[ex.nome]) cargasPorExercicio[ex.nome] = [];
          cargasPorExercicio[ex.nome].push({ data: t.data, carga: c });
        });
      });
    const evolucaoCargas = Object.entries(cargasPorExercicio)
      .filter(([, arr]) => arr.length >= 2)
      .map(([nome, arr]) => ({
        nome,
        inicial: arr[0].carga,
        final: arr[arr.length - 1].carga,
        variacao: Number((arr[arr.length - 1].carga - arr[0].carga).toFixed(1))
      }));

    /* ---------- Check-ins e observações ---------- */
    const checkinsPeriodo = DB.getCheckins().filter((c) => c.data >= inicio && c.data <= fim);
    const observacoes = [];
    DB.getTreinos().filter((t) => t.data >= inicio && t.data <= fim).forEach((t) => {
      if (t.observacoes) observacoes.push({ data: t.data, fonte: "Treino", texto: t.observacoes });
    });
    bemPeriodo.forEach((b) => { if (b.obs) observacoes.push({ data: b.data, fonte: "Bem-estar", texto: b.obs }); });
    checkinsPeriodo.forEach((c) => {
      if (c.observacoes) observacoes.push({ data: c.data, fonte: "Check-in", texto: c.observacoes });
      if (c.conquista) observacoes.push({ data: c.data, fonte: "Conquista", texto: c.conquista });
    });
    const pontosProfissional = [];
    checkinsPeriodo.forEach((c) => {
      if (c.dificuldades) pontosProfissional.push({ data: c.data, texto: "Dificuldades: " + c.dificuldades });
      if (c.dores) pontosProfissional.push({ data: c.data, texto: "Dores/desconfortos: " + c.dores });
    });

    return {
      nome: perfil.nome || "",
      fase: PROTOCOLO.fase ? PROTOCOLO.fase.nome : "Plano",
      periodo: { inicio, fim, fimEfetivo, emAndamento },
      geradoEm: new Date(),
      treino: {
        previstos: treinoPrevistos,
        comInfo: treinoComInfo,
        semInfo: treinoSemInfo,
        naoFeito: treinoNaoFeito,
        realizadosPontos: treinoRealizadosPontos,
        adesaoPct: adesaoTreinoPct,
        porDia: treinoDias
      },
      cardio: {
        aejPrevistoDias, aejSessoes: aejSessoes.length, aejMinTotal,
        escadaPrevistoMin, escadaSessoes: escadaSessoes.length, escadaMinTotal
      },
      alimentacao: {
        refeicoesPrevistas, refeicoesInformadas, refeicoesSemInfo,
        adesaoPct: adesaoAlimentarPct, diasComInfo: diasAlimComInfo
      },
      hidratacao: { mediaL: mediaHidratacaoL, diasPreenchidos: diasAguaPreenchidos },
      peso, medidas, bemEstar, evolucaoCargas,
      checkins: checkinsPeriodo.length,
      observacoes, pontosProfissional
    };
  }
};

/* ==================== Geração de PDF ==================== */
const ResumoPDF = {
  _sanitizarNome(nome) {
    return (nome || "Aluna")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "Aluna";
  },

  nomeArquivo(dados) {
    return `VVFIT_Resumo_${this._sanitizarNome(dados.nome)}_${dados.periodo.inicio}_a_${dados.periodo.fim}.pdf`;
  },

  async gerar(dados, opts) {
    opts = opts || {};
    if (!(window.jspdf && window.jspdf.jsPDF)) {
      throw new Error("Biblioteca de PDF não carregada.");
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    // As fontes padrão do jsPDF usam WinAnsi: acentos do português são OK, mas
    // alguns símbolos não. Troca os que não existem por equivalentes ASCII.
    const S = (t) => String(t == null ? "" : t)
      .replace(/→/g, "->").replace(/←/g, "<-").replace(/↔/g, "<->")
      .replace(/≈/g, "~").replace(/≥/g, ">=").replace(/≤/g, "<=");
    const M = 15;
    const larguraUtil = 210 - M * 2;
    let y = M;

    const novaPaginaSePreciso = (altura) => {
      if (y + altura > 297 - M) {
        doc.addPage();
        y = M;
      }
    };
    const titulo = (txt) => {
      novaPaginaSePreciso(10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(90, 58, 128);
      doc.text(S(txt), M, y);
      y += 5.5;
      doc.setDrawColor(220, 210, 232);
      doc.line(M, y - 2, 210 - M, y - 2);
      doc.setTextColor(40, 40, 40);
    };
    const linha = (txt, opt) => {
      opt = opt || {};
      doc.setFont("helvetica", opt.bold ? "bold" : "normal");
      doc.setFontSize(opt.size || 9.5);
      const linhas = doc.splitTextToSize(S(txt), opt.largura || larguraUtil);
      linhas.forEach((l) => {
        novaPaginaSePreciso(5);
        doc.text(l, opt.x || M, y);
        y += opt.lh || 4.6;
      });
    };
    const espaco = (n) => { y += (n || 3); };

    /* ---- Cabeçalho ---- */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(90, 58, 128);
    doc.text(S("VV FIT — Resumo de acompanhamento"), M, y);
    y += 7;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    linha(`Nome: ${dados.nome || "(não informado)"}`);
    linha(`Fase do plano: ${dados.fase}`);
    linha(`Período: ${Util.isoParaBR(dados.periodo.inicio)} a ${Util.isoParaBR(dados.periodo.fim)}${dados.periodo.emAndamento ? "  (período em andamento — dias futuros não contam como falta)" : ""}`);
    linha(`Gerado em: ${dados.geradoEm.toLocaleString("pt-BR")}`);
    espaco(4);

    /* ---- Treinos ---- */
    const tr = dados.treino;
    titulo("Treinos previstos e realizados");
    linha(`Previstos no período: ${tr.previstos}  |  Com registro: ${tr.comInfo}  |  Sem informação: ${tr.semInfo}`);
    linha(`Feitos + parciais: ${tr.realizadosPontos} ponto(s) (feito = 1, parcial = 0,5)  |  Marcados como não feito: ${tr.naoFeito}`);
    linha(`Adesão ao treino: ${tr.adesaoPct === null ? "sem dados (nenhum treino previsto com registro)" : tr.adesaoPct + "%"}`);
    linha("Critério: adesão = (feitos + 0,5 × parciais) ÷ treinos previstos COM registro. Dias sem informação ficam de fora do cálculo e são listados à parte.", { size: 8, lh: 4 });
    espaco(2);

    /* ---- Resumo dos treinos por dia ---- */
    if (tr.porDia.length) {
      titulo("Resumo dos treinos por dia");
      tr.porDia.forEach((d) => {
        linha(`${Util.isoParaBR(d.data)} (${DIAS_CURTO[d.diaSemana] || ""}) — ${d.nome}: ${d.rotulo}`, { size: 9, lh: 4.3 });
      });
      espaco(2);
    }

    /* ---- AEJ e cardio ---- */
    const c = dados.cardio;
    titulo("AEJ e cardio (registrados separadamente)");
    linha(`AEJ — sessões: ${c.aejSessoes}  |  minutos: ${c.aejMinTotal}  |  dias previstos no período: ${c.aejPrevistoDias}`);
    linha(`Cardio — sessões: ${c.escadaSessoes}  |  minutos: ${c.escadaMinTotal}  |  minutos previstos no período: ${c.escadaPrevistoMin}`);
    espaco(2);

    /* ---- Alimentação ---- */
    const a = dados.alimentacao;
    titulo("Adesão alimentar");
    linha(`Refeições previstas no período: ${a.refeicoesPrevistas}  |  com informação: ${a.refeicoesInformadas}  |  sem informação: ${a.refeicoesSemInfo}`);
    linha(`Adesão alimentar: ${a.adesaoPct === null ? "sem dados (nenhuma refeição registrada)" : a.adesaoPct + "%"}  (média dos ${a.diasComInfo} dia(s) com registro)`);
    linha("Critério: por dia, feito/substituição = 100%, parcial = 50%, não feito = 0%; média apenas dos dias com pelo menos uma refeição registrada. Refeições sem informação não entram como 0.", { size: 8, lh: 4 });
    espaco(2);

    /* ---- Hidratação ---- */
    const h = dados.hidratacao;
    titulo("Hidratação");
    const metaAguaL = (PROTOCOLO.agua.metaMlPadrao / 1000);
    const metaChaMl = PROTOCOLO.agua.chaMl || 0;
    const metaTxt = `Meta do plano: ${metaAguaL % 1 === 0 ? metaAguaL : metaAguaL.toFixed(1)} L de água/dia${metaChaMl ? ` + ${metaChaMl} ml de chá de ${PROTOCOLO.agua.chaTipo || "cavalinha"} (à parte)` : ""}.`;
    if (h.mediaL === null) {
      linha("Sem registros de água no período.");
      linha(metaTxt, { size: 8, lh: 4 });
    } else {
      linha(`Média nos dias preenchidos: ${h.mediaL.toFixed(2)} L/dia  |  dias com registro: ${h.diasPreenchidos}`);
      linha(metaTxt, { size: 8, lh: 4 });
    }
    espaco(2);

    /* ---- Peso ---- */
    titulo("Peso");
    if (!dados.peso) {
      linha("Peso inicial: não informado  |  Peso final: não informado");
    } else {
      const p = dados.peso;
      linha(`Peso inicial: ${p.inicial} kg (${Util.isoParaBR(p.dataInicial)})`);
      linha(`Peso final: ${p.final} kg (${Util.isoParaBR(p.dataFinal)})`);
      linha(`Variação: ${p.variacao === null ? "não informado (apenas um registro no período)" : (p.variacao > 0 ? "+" : "") + p.variacao + " kg"}`);
    }
    espaco(2);

    /* ---- Medidas ---- */
    if (dados.medidas.length) {
      titulo("Medidas e variações (quando disponíveis)");
      dados.medidas.forEach((m) => {
        const v = (m.variacao > 0 ? "+" : "") + m.variacao;
        linha(`${m.rotulo}: ${m.inicial} (${Util.isoParaBR(m.dataInicial)}) -> ${m.final} (${Util.isoParaBR(m.dataFinal)})  ${v}`, { size: 9, lh: 4.3 });
      });
      espaco(2);
    }

    /* ---- Evolução de cargas ---- */
    if (dados.evolucaoCargas.length) {
      titulo("Evolução de cargas (somente exercícios com registros comparáveis)");
      dados.evolucaoCargas.forEach((e) => {
        linha(`${e.nome}: ${e.inicial} kg → ${e.final} kg  (${e.variacao > 0 ? "+" : ""}${e.variacao} kg)`, { size: 9, lh: 4.3 });
      });
      espaco(2);
    }

    /* ---- Sono e disposição ---- */
    const b = dados.bemEstar;
    if (b.diasSono || b.diasDisposicao) {
      titulo("Sono e disposição (quando registrados)");
      if (b.diasSono) linha(`Sono médio: ${b.mediaSono} h/noite  (${b.diasSono} dia(s) registrado(s))`);
      if (b.diasDisposicao) linha(`Disposição média: ${b.mediaDisposicao} / 5  (${b.diasDisposicao} dia(s) registrado(s))`);
      espaco(2);
    }

    /* ---- Observações ---- */
    if (dados.observacoes.length) {
      titulo("Observações da usuária");
      dados.observacoes.forEach((o) => {
        linha(`${Util.isoParaBR(o.data)} — ${o.fonte}: ${o.texto}`, { size: 9, lh: 4.3 });
      });
      espaco(2);
    }

    /* ---- Pontos para o profissional ---- */
    if (dados.pontosProfissional.length) {
      titulo("Dificuldades e pontos para conversar com o profissional responsável");
      dados.pontosProfissional.forEach((o) => {
        linha(`${Util.isoParaBR(o.data)} — ${o.texto}`, { size: 9, lh: 4.3 });
      });
      espaco(2);
    }

    /* ---- Fotos (opcional, fora por padrão) ---- */
    if (opts.incluirFotos) {
      const metas = DB.getFotosMeta()
        .filter((m) => m.data >= dados.periodo.inicio && m.data <= dados.periodo.fim);
      if (metas.length) {
        titulo("Fotos de evolução (incluídas a pedido da usuária)");
        for (const m of metas) {
          for (const tipo of ["frontal", "lateral", "costas"]) {
            const fotoId = m[tipo + "FotoId"];
            if (!fotoId) continue;
            try {
              const dataUrl = await PhotoDB.obter(fotoId);
              if (!dataUrl) continue;
              const imgAltura = 60;
              novaPaginaSePreciso(imgAltura + 8);
              linha(`${Util.isoParaBR(m.data)} — ${tipo}`, { size: 9, lh: 4.3 });
              doc.addImage(dataUrl, "JPEG", M, y, 45, imgAltura, undefined, "FAST");
              y += imgAltura + 4;
            } catch (e) { /* ignora foto com erro */ }
          }
        }
      }
    }

    /* ---- Rodapé ---- */
    espaco(4);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    const rodape = doc.splitTextToSize(
      "Resumo gerado automaticamente pelo VV FIT a partir dos registros da própria usuária. " +
      "Não inclui diagnósticos, estimativas de composição corporal nem prescrições. " +
      "Percentuais consideram apenas dias/refeições com informação registrada.",
      larguraUtil
    );
    novaPaginaSePreciso(rodape.length * 3.5 + 4);
    rodape.forEach((l) => { doc.text(l, M, y); y += 3.5; });

    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(140, 140, 140);
      doc.text(`VV FIT — ${dados.nome || ""}  ·  pág. ${i}/${total}`, M, 297 - 8);
    }

    const blob = doc.output("blob");
    return { blob, filename: this.nomeArquivo(dados) };
  }
};

/* ==================== Baixar / compartilhar ==================== */
const ResumoCompartilhar = {
  baixar(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  },

  // Retorna: "shared" | "cancelled" | "downloaded"
  async compartilharOuBaixar(blob, filename) {
    try {
      const file = new File([blob], filename, { type: "application/pdf" });
      if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        try {
          await navigator.share({
            files: [file],
            title: "VV FIT — Resumo",
            text: "Resumo de acompanhamento VV FIT"
          });
          return "shared";
        } catch (e) {
          if (e && e.name === "AbortError") return "cancelled";
          // se o compartilhamento falhar por outro motivo, cai para o download
        }
      }
    } catch (e) {
      /* File/canShare não suportado — cai para download */
    }
    this.baixar(blob, filename);
    return "downloaded";
  },

  instrucoesWhatsApp() {
    return `
      <h3>Enviar pelo WhatsApp</h3>
      <p>Este navegador não permite abrir o compartilhamento de arquivos direto do app. O PDF foi <strong>baixado</strong> para o seu aparelho.</p>
      <ol class="lista-instrucoes">
        <li>Abra a conversa do WhatsApp com o profissional.</li>
        <li>Toque no clipe (📎) ou em "+" e escolha <strong>Documento</strong>.</li>
        <li>Selecione o arquivo <strong>VVFIT_Resumo…&nbsp;.pdf</strong> em "Downloads".</li>
        <li>Envie.</li>
      </ol>
      <p class="texto-suave">O aplicativo não envia nada sozinho: o arquivo só sai daqui quando você anexá-lo e enviar.</p>
      <div class="modal-actions">
        <button type="button" class="btn btn-primario" data-fechar-modal>Entendi</button>
      </div>
    `;
  }
};

