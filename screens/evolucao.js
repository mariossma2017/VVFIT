/* VV FIT — Tela Evolução */

const CAMPOS_MEDIDAS = [
  { chave: "peso", rotulo: "Peso (kg)" },
  { chave: "cintura", rotulo: "Cintura (cm)" },
  { chave: "abdomen", rotulo: "Abdômen (cm)" },
  { chave: "quadril", rotulo: "Quadril (cm)" },
  { chave: "coxaDireita", rotulo: "Coxa direita (cm)" },
  { chave: "coxaEsquerda", rotulo: "Coxa esquerda (cm)" },
  { chave: "bracoDireito", rotulo: "Braço direito (cm)" },
  { chave: "bracoEsquerdo", rotulo: "Braço esquerdo (cm)" },
  { chave: "peito", rotulo: "Peito (cm)" },
  { chave: "panturrilha", rotulo: "Panturrilha (cm)" }
];

const GRAFICOS_PRINCIPAIS = [
  { chave: "peso", rotulo: "Peso", cor: "#7c4da0", unidade: "kg" },
  { chave: "cintura", rotulo: "Cintura", cor: "#c47882", unidade: "cm" },
  { chave: "abdomen", rotulo: "Abdômen", cor: "#4f9d69", unidade: "cm" },
  { chave: "quadril", rotulo: "Quadril", cor: "#6fb2d8", unidade: "cm" }
];

function renderEvolucao() {
  const container = document.getElementById("tela-evolucao");
  container.innerHTML = `
    <div class="card">
      <h2>Registrar medidas</h2>
      <form id="form-evolucao">
        <label for="ev-data">Data</label>
        <input type="date" id="ev-data" value="${Util.hojeISO()}" max="${Util.hojeISO()}" required>
        <div class="linha-campos">
          ${CAMPOS_MEDIDAS.slice(0, 2)
            .map((c) => `<div class="campo-grupo"><label for="ev-${c.chave}">${c.rotulo}</label><input type="number" step="0.1" inputmode="decimal" id="ev-${c.chave}"></div>`)
            .join("")}
        </div>
        <div class="linha-campos">
          ${CAMPOS_MEDIDAS.slice(2, 4)
            .map((c) => `<div class="campo-grupo"><label for="ev-${c.chave}">${c.rotulo}</label><input type="number" step="0.1" inputmode="decimal" id="ev-${c.chave}"></div>`)
            .join("")}
        </div>
        <div class="linha-campos">
          ${CAMPOS_MEDIDAS.slice(4, 6)
            .map((c) => `<div class="campo-grupo"><label for="ev-${c.chave}">${c.rotulo}</label><input type="number" step="0.1" inputmode="decimal" id="ev-${c.chave}"></div>`)
            .join("")}
        </div>
        <div class="linha-campos">
          ${CAMPOS_MEDIDAS.slice(6, 8)
            .map((c) => `<div class="campo-grupo"><label for="ev-${c.chave}">${c.rotulo}</label><input type="number" step="0.1" inputmode="decimal" id="ev-${c.chave}"></div>`)
            .join("")}
        </div>
        <div class="linha-campos">
          ${CAMPOS_MEDIDAS.slice(8, 10)
            .map((c) => `<div class="campo-grupo"><label for="ev-${c.chave}">${c.rotulo}</label><input type="number" step="0.1" inputmode="decimal" id="ev-${c.chave}"></div>`)
            .join("")}
        </div>
        <label for="ev-obs">Observações</label>
        <textarea id="ev-obs" placeholder="Alguma observação sobre essas medidas?"></textarea>
        <div class="divider"></div>
        <div class="secao-titulo">Sono e disposição do dia (opcional)</div>
        <div class="linha-campos">
          <div class="campo-grupo"><label for="ev-sono">Sono (horas)</label><input type="number" step="0.5" inputmode="decimal" id="ev-sono"></div>
          <div class="campo-grupo"><label for="ev-disposicao">Disposição (1-5)</label><input type="number" min="1" max="5" inputmode="numeric" id="ev-disposicao"></div>
        </div>
        <label for="ev-bemestar-obs">Observação sobre sono/disposição</label>
        <textarea id="ev-bemestar-obs" placeholder="Opcional"></textarea>
        <button type="submit" class="btn btn-primario mt-16">Salvar</button>
      </form>
      <p class="texto-suave mt-8">Campos em branco não são registrados (não viram zero).</p>
    </div>

    <div class="secao-titulo">Sono e disposição — histórico</div>
    <div id="historico-bemestar">${renderHistoricoBemEstar()}</div>

    <div class="secao-titulo">Gráficos de evolução</div>
    <div id="graficos-evolucao">${renderTodosGraficos()}</div>

    <div class="secao-titulo">Histórico de medidas</div>
    <div id="historico-evolucao">${renderHistoricoEvolucao()}</div>

    <div class="card">
      <h2>Fotos de evolução</h2>
      <form id="form-fotos-evolucao">
        <label for="foto-data">Data das fotos</label>
        <input type="date" id="foto-data" value="${Util.hojeISO()}" max="${Util.hojeISO()}">
        <div class="foto-upload-area mt-8">
          <div class="foto-slot" data-slot="frontal">+ Frontal</div>
          <div class="foto-slot" data-slot="lateral">+ Lateral</div>
          <div class="foto-slot" data-slot="costas">+ Costas</div>
        </div>
        <input type="file" accept="image/*" capture="environment" class="hidden" id="input-foto-frontal">
        <input type="file" accept="image/*" capture="environment" class="hidden" id="input-foto-lateral">
        <input type="file" accept="image/*" capture="environment" class="hidden" id="input-foto-costas">
        <label for="foto-obs" class="mt-16">Observações</label>
        <textarea id="foto-obs" placeholder="Observações sobre estas fotos"></textarea>
        <button type="submit" class="btn btn-primario mt-16">Salvar fotos</button>
      </form>
    </div>

    <div class="card">
      <h2>Comparar fotos</h2>
      <div id="area-comparacao-fotos">${renderSeletorComparacao()}</div>
    </div>

    <div class="secao-titulo">Registros de fotos</div>
    <div id="lista-fotos-evolucao">${renderListaFotos()}</div>
  `;

  document.getElementById("form-evolucao").addEventListener("submit", salvarEvolucao);
  document.getElementById("form-fotos-evolucao").addEventListener("submit", salvarFotosEvolucao);
  ligarSlotsFoto();
  ligarEventosComparacao();
  ligarEventosHistoricoEvolucao();
  ligarEventosListaFotos();
}

function salvarEvolucao(e) {
  e.preventDefault();
  const data = document.getElementById("ev-data").value;
  if (!data) {
    mostrarToast("Informe a data.", "erro");
    return;
  }
  const registro = { id: Util.uuid(), data };
  let algumValor = false;
  CAMPOS_MEDIDAS.forEach((c) => {
    const v = document.getElementById(`ev-${c.chave}`).value;
    registro[c.chave] = v === "" ? null : parseFloat(v);
    if (v !== "") algumValor = true;
  });
  registro.observacoes = document.getElementById("ev-obs").value;

  // Sono e disposição — gravados no registro diário de bem-estar (à parte).
  const sonoVal = document.getElementById("ev-sono").value;
  const dispVal = document.getElementById("ev-disposicao").value;
  const bemObs = document.getElementById("ev-bemestar-obs").value;
  const temBemEstar = sonoVal !== "" || dispVal !== "" || bemObs !== "";
  if (temBemEstar) {
    DB.addOrUpdateBemEstar({
      data,
      sonoHoras: sonoVal === "" ? null : parseFloat(sonoVal),
      disposicao: dispVal === "" ? null : parseInt(dispVal, 10),
      obs: bemObs
    });
  }

  if (!algumValor && !temBemEstar) {
    mostrarToast("Informe ao menos uma medida ou sono/disposição.", "erro");
    return;
  }

  if (algumValor) {
    DB.addEvolucao(registro);
    if (registro.peso !== null) {
      const perfil = DB.getPerfil();
      perfil.pesoAtualKg = registro.peso;
      DB.setPerfil(perfil);
    }
  }

  mostrarToast("Registro salvo!", "sucesso");
  renderEvolucao();
}

function renderHistoricoBemEstar() {
  const arr = [...DB.getBemEstar()].reverse().slice(0, 10);
  if (!arr.length) return `<p class="texto-suave">Nenhum registro de sono/disposição ainda.</p>`;
  return `<ul class="lista-simples">${arr
    .map((b) => {
      const partes = [];
      if (b.sonoHoras !== null && b.sonoHoras !== undefined && b.sonoHoras !== "") partes.push(`sono ${b.sonoHoras} h`);
      if (b.disposicao !== null && b.disposicao !== undefined && b.disposicao !== "") partes.push(`disposição ${b.disposicao}/5`);
      return `<li><strong>${Util.isoParaBR(b.data)}</strong> — ${partes.join(" · ") || "—"}${b.obs ? `<br><span class="texto-suave">${Util.escapeHtml(b.obs)}</span>` : ""}</li>`;
    })
    .join("")}</ul>`;
}

function renderTodosGraficos() {
  const evolucao = DB.getEvolucao();
  if (!evolucao.length) {
    return `<div class="card"><p class="grafico-vazio">Ainda não há medidas registradas. Assim que você registrar, os gráficos aparecem aqui.</p></div>`;
  }
  return GRAFICOS_PRINCIPAIS.map((g) => {
    const pontos = evolucao.filter((e) => e[g.chave] !== null && e[g.chave] !== undefined).map((e) => ({ data: e.data, valor: e[g.chave] }));
    return `
      <div class="card">
        <div class="grafico-titulo">${g.rotulo}</div>
        <div class="grafico-container">${gerarGraficoSVG(pontos, g.cor, g.unidade)}</div>
      </div>
    `;
  }).join("");
}

function gerarGraficoSVG(pontos, cor, unidade) {
  if (!pontos.length) return `<p class="grafico-vazio">Sem dados suficientes ainda.</p>`;
  if (pontos.length === 1) {
    return `<p class="grafico-vazio">${pontos[0].valor}${unidade} em ${Util.isoParaBR(pontos[0].data)} — registre mais uma medida para ver a evolução.</p>`;
  }
  const w = 320;
  const h = 140;
  const padX = 30;
  const padY = 20;
  const valores = pontos.map((p) => p.valor);
  let min = Math.min(...valores);
  let max = Math.max(...valores);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const escalaX = (i) => padX + (i * (w - padX * 2)) / (pontos.length - 1);
  const escalaY = (v) => h - padY - ((v - min) * (h - padY * 2)) / (max - min);

  const pathPontos = pontos.map((p, i) => `${escalaX(i)},${escalaY(p.valor)}`).join(" ");
  const circulos = pontos
    .map((p, i) => `<circle cx="${escalaX(i)}" cy="${escalaY(p.valor)}" r="3.5" fill="${cor}"></circle>`)
    .join("");

  const primeiro = pontos[0];
  const ultimo = pontos[pontos.length - 1];
  const variacao = (ultimo.valor - primeiro.valor).toFixed(1);
  const sinal = variacao > 0 ? "+" : "";

  return `
    <svg viewBox="0 0 ${w} ${h + 24}" xmlns="http://www.w3.org/2000/svg">
      <polyline points="${pathPontos}" fill="none" stroke="${cor}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"></polyline>
      ${circulos}
      <text x="${padX}" y="${h + 18}" font-size="9" fill="#6c6675">${Util.isoParaBR(primeiro.data)}</text>
      <text x="${w - padX}" y="${h + 18}" font-size="9" fill="#6c6675" text-anchor="end">${Util.isoParaBR(ultimo.data)}</text>
      <text x="${w / 2}" y="${h + 18}" font-size="9" fill="${variacao <= 0 ? "#4f9d69" : "#c15656"}" text-anchor="middle" font-weight="700">${sinal}${variacao}${unidade}</text>
    </svg>
  `;
}

function renderHistoricoEvolucao() {
  const evolucao = [...DB.getEvolucao()].reverse();
  if (!evolucao.length) return `<p class="texto-suave">Nenhuma medida registrada ainda.</p>`;
  return evolucao
    .map(
      (e) => `
    <div class="card">
      <div class="card-titulo-linha">
        <strong>${Util.isoParaBR(e.data)}</strong>
        <button type="button" class="btn-icone btn-pequeno" data-excluir-evolucao="${e.id}" style="width:30px;height:30px;min-height:30px;">✕</button>
      </div>
      <div class="tag-lista">
        ${CAMPOS_MEDIDAS.filter((c) => e[c.chave] !== null && e[c.chave] !== undefined)
          .map((c) => `<span class="tag">${c.rotulo.split(" (")[0]}: ${e[c.chave]}</span>`)
          .join("")}
      </div>
      ${e.observacoes ? `<p class="texto-suave mt-8">${Util.escapeHtml(e.observacoes)}</p>` : ""}
    </div>
  `
    )
    .join("");
}

function ligarEventosHistoricoEvolucao() {
  document.querySelectorAll("[data-excluir-evolucao]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const ok = await confirmarAcao({
        titulo: "Excluir registro",
        mensagem: "Deseja excluir este registro de medidas?",
        textoConfirmar: "Excluir",
        perigo: true
      });
      if (ok) {
        DB.deleteEvolucao(btn.getAttribute("data-excluir-evolucao"));
        renderEvolucao();
      }
    });
  });
}

/* ---------------- Fotos ---------------- */
let fotosSelecionadasTemp = { frontal: null, lateral: null, costas: null };

function ligarSlotsFoto() {
  fotosSelecionadasTemp = { frontal: null, lateral: null, costas: null };
  ["frontal", "lateral", "costas"].forEach((tipo) => {
    const slot = document.querySelector(`.foto-slot[data-slot="${tipo}"]`);
    const input = document.getElementById(`input-foto-${tipo}`);
    slot.addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        fotosSelecionadasTemp[tipo] = reader.result;
        slot.innerHTML = `<img src="${reader.result}" alt="Foto ${tipo}">`;
      };
      reader.readAsDataURL(file);
    });
  });
}

async function salvarFotosEvolucao(e) {
  e.preventDefault();
  const data = document.getElementById("foto-data").value;
  if (!data) {
    mostrarToast("Informe a data das fotos.", "erro");
    return;
  }
  if (!fotosSelecionadasTemp.frontal && !fotosSelecionadasTemp.lateral && !fotosSelecionadasTemp.costas) {
    mostrarToast("Adicione ao menos uma foto.", "erro");
    return;
  }
  const meta = { id: Util.uuid(), data, observacoes: document.getElementById("foto-obs").value };

  for (const tipo of ["frontal", "lateral", "costas"]) {
    if (fotosSelecionadasTemp[tipo]) {
      const fotoId = Util.uuid();
      await PhotoDB.salvar(fotoId, fotosSelecionadasTemp[tipo]);
      meta[tipo + "FotoId"] = fotoId;
    }
  }

  const metas = DB.getFotosMeta();
  metas.push(meta);
  DB.setFotosMeta(metas);

  mostrarToast("Fotos salvas!", "sucesso");
  renderEvolucao();
}

function renderListaFotos() {
  const metas = [...DB.getFotosMeta()].reverse();
  if (!metas.length) return `<p class="texto-suave">Nenhuma foto registrada ainda.</p>`;
  const html = metas
    .map(
      (m) => `
    <div class="card">
      <div class="card-titulo-linha">
        <strong>${Util.isoParaBR(m.data)}</strong>
        <button type="button" class="btn-icone btn-pequeno" data-excluir-foto="${m.id}" style="width:30px;height:30px;min-height:30px;">✕</button>
      </div>
      <div class="foto-upload-area mt-8" data-preview-fotos="${m.id}"></div>
      ${m.observacoes ? `<p class="texto-suave mt-8">${Util.escapeHtml(m.observacoes)}</p>` : ""}
    </div>
  `
    )
    .join("");
  setTimeout(() => carregarPreviewsFotos(metas), 0);
  return html;
}

async function carregarPreviewsFotos(metas) {
  for (const m of metas) {
    const container = document.querySelector(`[data-preview-fotos="${m.id}"]`);
    if (!container) continue;
    let html = "";
    for (const tipo of ["frontal", "lateral", "costas"]) {
      const fotoId = m[tipo + "FotoId"];
      if (fotoId) {
        const dataUrl = await PhotoDB.obter(fotoId);
        if (dataUrl) html += `<div class="foto-slot"><img src="${dataUrl}" alt="${tipo}"></div>`;
      }
    }
    container.innerHTML = html;
  }
}

function ligarEventosListaFotos() {
  document.querySelectorAll("[data-excluir-foto]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const ok = await confirmarAcao({
        titulo: "Excluir fotos",
        mensagem: "Deseja excluir este conjunto de fotos? As imagens não poderão ser recuperadas.",
        textoConfirmar: "Excluir",
        perigo: true
      });
      if (!ok) return;
      const id = btn.getAttribute("data-excluir-foto");
      const metas = DB.getFotosMeta();
      const meta = metas.find((m) => m.id === id);
      if (meta) {
        for (const tipo of ["frontal", "lateral", "costas"]) {
          if (meta[tipo + "FotoId"]) await PhotoDB.remover(meta[tipo + "FotoId"]);
        }
      }
      DB.setFotosMeta(metas.filter((m) => m.id !== id));
      renderEvolucao();
    });
  });
}

/* ---------------- Comparação de fotos ---------------- */
function renderSeletorComparacao() {
  const metas = DB.getFotosMeta();
  if (metas.length < 1) {
    return `<p class="texto-suave">Registre ao menos uma sessão de fotos para poder comparar.</p>`;
  }
  const opcoes = metas.map((m) => `<option value="${m.id}">${Util.isoParaBR(m.data)}</option>`).join("");
  return `
    <div class="linha-campos">
      <div class="campo-grupo">
        <label for="select-foto-antes">Foto inicial</label>
        <select id="select-foto-antes">${opcoes}</select>
      </div>
      <div class="campo-grupo">
        <label for="select-foto-depois">Foto atual</label>
        <select id="select-foto-depois">${opcoes}</select>
      </div>
    </div>
    <div class="campo-grupo">
      <label for="select-foto-angulo">Ângulo</label>
      <select id="select-foto-angulo">
        <option value="frontal">Frontal</option>
        <option value="lateral">Lateral</option>
        <option value="costas">Costas</option>
      </select>
    </div>
    <button type="button" class="btn btn-outline" id="btn-comparar-fotos">Comparar</button>
    <div id="resultado-comparacao-fotos" class="mt-16"></div>
  `;
}

function ligarEventosComparacao() {
  const btn = document.getElementById("btn-comparar-fotos");
  if (!btn) return;
  const selects = document.getElementById("select-foto-antes");
  if (selects && DB.getFotosMeta().length >= 2) {
    document.getElementById("select-foto-depois").selectedIndex =
      document.getElementById("select-foto-depois").options.length - 1;
  }
  btn.addEventListener("click", async () => {
    const idAntes = document.getElementById("select-foto-antes").value;
    const idDepois = document.getElementById("select-foto-depois").value;
    const angulo = document.getElementById("select-foto-angulo").value;
    const metas = DB.getFotosMeta();
    const metaAntes = metas.find((m) => m.id === idAntes);
    const metaDepois = metas.find((m) => m.id === idDepois);
    const resultado = document.getElementById("resultado-comparacao-fotos");

    const fotoIdAntes = metaAntes && metaAntes[angulo + "FotoId"];
    const fotoIdDepois = metaDepois && metaDepois[angulo + "FotoId"];

    if (!fotoIdAntes || !fotoIdDepois) {
      resultado.innerHTML = `<p class="texto-suave">Não há foto do ângulo selecionado em uma das datas escolhidas.</p>`;
      return;
    }

    const [urlAntes, urlDepois] = await Promise.all([PhotoDB.obter(fotoIdAntes), PhotoDB.obter(fotoIdDepois)]);

    resultado.innerHTML = `
      <p class="texto-suave">${Util.isoParaBR(metaAntes.data)} → ${Util.isoParaBR(metaDepois.data)}</p>
      <div class="slider-comparacao" id="slider-comparacao">
        <img src="${urlDepois}" alt="Foto atual">
        <img src="${urlAntes}" alt="Foto inicial" class="img-topo" id="img-slider-topo">
        <div class="slider-linha" id="slider-linha"></div>
      </div>
      <input type="range" class="range-slider" id="range-comparacao" min="0" max="100" value="50">
      <div class="fotos-comparacao mt-16">
        <div><p class="texto-suave texto-centro">Inicial</p><img src="${urlAntes}" alt="Inicial"></div>
        <div><p class="texto-suave texto-centro">Atual</p><img src="${urlDepois}" alt="Atual"></div>
      </div>
    `;

    const range = document.getElementById("range-comparacao");
    const imgTopo = document.getElementById("img-slider-topo");
    const linha = document.getElementById("slider-linha");
    range.addEventListener("input", () => {
      const val = range.value;
      imgTopo.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
      linha.style.left = val + "%";
    });
  });
}
