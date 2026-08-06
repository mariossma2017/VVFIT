/* VV FIT — app.js: router, navegação, inicialização */

const TELAS = ["inicio", "treino", "alimentacao", "evolucao", "perfil"];
const RENDERERS = {
  inicio: renderInicio,
  treino: renderTreino,
  alimentacao: renderAlimentacao,
  evolucao: renderEvolucao,
  perfil: renderPerfil
};
const TITULOS_TELA = {
  inicio: "VV FIT",
  treino: "Treino",
  alimentacao: "Alimentação",
  evolucao: "Evolução",
  perfil: "Perfil"
};

let telaAtual = "inicio";

function navegarPara(tela) {
  if (!TELAS.includes(tela)) tela = "inicio";

  telaAtual = tela;
  window.location.hash = tela;

  document.querySelectorAll(".tela").forEach((el) => {
    el.classList.toggle("ativa", el.id === "tela-" + tela);
  });
  document.querySelectorAll(".nav-item").forEach((el) => {
    el.classList.toggle("ativo", el.getAttribute("data-tela") === tela);
  });

  atualizarTituloTopo();
  RENDERERS[tela]();
  const main = document.querySelector("main");
  if (main) main.scrollTop = 0;
  window.scrollTo(0, 0);
}

function atualizarTituloTopo() {
  const perfil = DB.getPerfil();
  const tituloEl = document.getElementById("topbar-titulo");
  const subtituloEl = document.getElementById("topbar-subtitulo");
  if (!tituloEl) return;
  if (telaAtual === "inicio") {
    tituloEl.textContent = "VV FIT";
    subtituloEl.textContent = perfil.nome ? `Olá, ${perfil.nome}` : "Seu protocolo, do seu jeito";
  } else {
    tituloEl.textContent = TITULOS_TELA[telaAtual];
    subtituloEl.textContent = "";
  }
}

function montarShell() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <header class="topbar">
      <h1 id="topbar-titulo">VV FIT</h1>
      <div class="subtitulo" id="topbar-subtitulo"></div>
    </header>
    <main>
      <div class="tela" id="tela-inicio"></div>
      <div class="tela" id="tela-treino"></div>
      <div class="tela" id="tela-alimentacao"></div>
      <div class="tela" id="tela-evolucao"></div>
      <div class="tela" id="tela-perfil"></div>
    </main>
    <nav class="bottom-nav">
      <button type="button" class="nav-item" data-tela="inicio"><span class="icone">🏠</span><span class="rotulo">Início</span></button>
      <button type="button" class="nav-item" data-tela="treino"><span class="icone">🏋️</span><span class="rotulo">Treino</span></button>
      <button type="button" class="nav-item" data-tela="alimentacao"><span class="icone">🍽️</span><span class="rotulo">Alimentação</span></button>
      <button type="button" class="nav-item" data-tela="evolucao"><span class="icone">📈</span><span class="rotulo">Evolução</span></button>
      <button type="button" class="nav-item" data-tela="perfil"><span class="icone">👤</span><span class="rotulo">Perfil</span></button>
    </nav>
  `;

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => navegarPara(btn.getAttribute("data-tela")));
  });
}

function inicializarApp() {
  Migracao.executar();
  montarShell();

  const hash = window.location.hash.replace("#", "");
  const inicial = TELAS.includes(hash) ? hash : "inicio";
  navegarPara(inicial);

  window.addEventListener("hashchange", () => {
    const h = window.location.hash.replace("#", "");
    if (TELAS.includes(h) && h !== telaAtual) navegarPara(h);
  });

  window.addEventListener("popstate", () => {
    const h = window.location.hash.replace("#", "");
    if (TELAS.includes(h)) navegarPara(h);
  });

  if (!DB.getPerfil().nome) {
    setTimeout(mostrarBoasVindas, 400);
  }
}

function mostrarBoasVindas() {
  abrirModal(`
    <h3>Bem-vinda ao VV FIT</h3>
    <p>Este aplicativo reúne o seu protocolo completo de treino e alimentação em um só lugar, com tudo salvo neste aparelho.</p>
    <label for="boas-vindas-nome">Como podemos te chamar?</label>
    <input type="text" id="boas-vindas-nome" placeholder="Seu nome">
    <div class="modal-actions">
      <button type="button" class="btn btn-primario" id="btn-salvar-boas-vindas">Começar</button>
    </div>
  `, { semFecharFora: true });

  document.getElementById("btn-salvar-boas-vindas").addEventListener("click", () => {
    const nome = document.getElementById("boas-vindas-nome").value.trim();
    const perfil = DB.getPerfil();
    perfil.nome = nome;
    DB.setPerfil(perfil);
    const onboarding = DB.getOnboarding();
    onboarding.concluido = true;
    DB.setOnboarding(onboarding);
    document.querySelector(".modal-overlay").remove();
    atualizarTituloTopo();
    if (telaAtual === "inicio") renderInicio();
  });
}

document.addEventListener("DOMContentLoaded", inicializarApp);

/* ---------------- Service Worker ---------------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then((reg) => {
        reg.addEventListener("updatefound", () => {
          const novoWorker = reg.installing;
          if (!novoWorker) return;
          novoWorker.addEventListener("statechange", () => {
            if (novoWorker.state === "installed" && navigator.serviceWorker.controller) {
              mostrarToast("Nova versão disponível. Feche e abra o app para atualizar.", "sucesso");
            }
          });
        });
      })
      .catch((err) => console.error("Erro ao registrar service worker:", err));
  });
}
