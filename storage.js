/*
 * VV FIT — camada de armazenamento
 * localStorage para registros (JSON) + IndexedDB para fotos (dataURL em blobs).
 * Tudo fica somente no aparelho do usuário.
 */

const DB = {
  PREFIX: "vvfit_",

  keys: {
    perfil: "perfil",
    config: "config",
    treinos: "treinos", // histórico de sessões de treino
    cargas: "cargas", // último/melhor registro por exercício (cache derivado)
    alimentacao: "alimentacao", // registros diários de refeição
    agua: "agua", // lançamentos de água
    evolucao: "evolucao", // medidas corporais
    checkins: "checkins", // check-ins semanais
    fotosMeta: "fotosMeta", // metadados de fotos de evolução (id, data, observações) — binário fica no IndexedDB
    onboarding: "onboarding",
    versaoDados: "versaoDados" // controla migrações do formato de registros salvos
  },

  _read(key, fallback) {
    try {
      const raw = localStorage.getItem(this.PREFIX + key);
      if (raw === null || raw === undefined) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.error("Erro ao ler", key, e);
      return fallback;
    }
  },

  _write(key, value) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error("Erro ao salvar", key, e);
      return false;
    }
  },

  getPerfil() {
    return this._read(this.keys.perfil, {
      nome: "",
      fotoDataUrl: "",
      pesoAtualKg: PROTOCOLO.perfilBase.pesoInicialKg,
      pesoInicialKg: PROTOCOLO.perfilBase.pesoInicialKg,
      metaPesoKg: null,
      alturaCm: PROTOCOLO.perfilBase.alturaCm,
      idade: PROTOCOLO.perfilBase.idade,
      horarioTreino: PROTOCOLO.perfilBase.horarioTreinoHabitual,
      metaAguaMl: PROTOCOLO.agua.metaMlPadrao,
      observacoes: "",
      criadoEm: new Date().toISOString()
    });
  },
  setPerfil(p) {
    return this._write(this.keys.perfil, p);
  },

  getConfig() {
    return this._read(this.keys.config, {
      pesosAdesao: { treino: 40, alimentacao: 40, agua: 10, checkin: 10 },
      somDescanso: true,
      vibrarDescanso: true,
      tema: "claro"
    });
  },
  setConfig(c) {
    return this._write(this.keys.config, c);
  },

  getTreinos() {
    return this._read(this.keys.treinos, []);
  },
  setTreinos(arr) {
    return this._write(this.keys.treinos, arr);
  },
  addTreino(sessao) {
    const arr = this.getTreinos();
    arr.push(sessao);
    this.setTreinos(arr);
    return sessao;
  },
  updateTreino(id, patch) {
    const arr = this.getTreinos();
    const idx = arr.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    arr[idx] = Object.assign({}, arr[idx], patch);
    this.setTreinos(arr);
    return arr[idx];
  },
  deleteTreino(id) {
    const arr = this.getTreinos().filter((t) => t.id !== id);
    this.setTreinos(arr);
  },
  clearTreinos() {
    this.setTreinos([]);
  },

  getAlimentacao() {
    return this._read(this.keys.alimentacao, []);
  },
  setAlimentacao(arr) {
    return this._write(this.keys.alimentacao, arr);
  },
  addOrUpdateRefeicaoRegistro(registro) {
    const arr = this.getAlimentacao();
    const idx = arr.findIndex(
      (r) => r.data === registro.data && r.refeicaoId === registro.refeicaoId
    );
    if (idx === -1) {
      arr.push(registro);
    } else {
      arr[idx] = Object.assign({}, arr[idx], registro);
    }
    this.setAlimentacao(arr);
    return registro;
  },
  clearAlimentacao() {
    this.setAlimentacao([]);
  },

  getAgua() {
    return this._read(this.keys.agua, []);
  },
  setAgua(arr) {
    return this._write(this.keys.agua, arr);
  },
  addAgua(lancamento) {
    const arr = this.getAgua();
    arr.push(lancamento);
    this.setAgua(arr);
    return lancamento;
  },
  removeAgua(id) {
    const arr = this.getAgua().filter((a) => a.id !== id);
    this.setAgua(arr);
  },
  clearAgua() {
    this.setAgua([]);
  },

  getEvolucao() {
    return this._read(this.keys.evolucao, []);
  },
  setEvolucao(arr) {
    return this._write(this.keys.evolucao, arr);
  },
  addEvolucao(registro) {
    const arr = this.getEvolucao();
    arr.push(registro);
    arr.sort((a, b) => a.data.localeCompare(b.data));
    this.setEvolucao(arr);
    return registro;
  },
  deleteEvolucao(id) {
    const arr = this.getEvolucao().filter((e) => e.id !== id);
    this.setEvolucao(arr);
  },
  clearEvolucao() {
    this.setEvolucao([]);
  },

  getCheckins() {
    return this._read(this.keys.checkins, []);
  },
  setCheckins(arr) {
    return this._write(this.keys.checkins, arr);
  },
  addCheckin(c) {
    const arr = this.getCheckins();
    arr.push(c);
    arr.sort((a, b) => a.data.localeCompare(b.data));
    this.setCheckins(arr);
    return c;
  },
  clearCheckins() {
    this.setCheckins([]);
  },

  getFotosMeta() {
    return this._read(this.keys.fotosMeta, []);
  },
  setFotosMeta(arr) {
    return this._write(this.keys.fotosMeta, arr);
  },
  clearFotosMeta() {
    this.setFotosMeta([]);
  },

  getOnboarding() {
    return this._read(this.keys.onboarding, { concluido: false });
  },
  setOnboarding(v) {
    return this._write(this.keys.onboarding, v);
  },

  getVersaoDados() {
    return this._read(this.keys.versaoDados, 1);
  },
  setVersaoDados(v) {
    return this._write(this.keys.versaoDados, v);
  },

  apagarTudo() {
    Object.values(this.keys).forEach((k) => localStorage.removeItem(this.PREFIX + k));
  }
};

/* ---------------- IndexedDB — armazenamento de fotos ---------------- */
const PhotoDB = {
  _dbPromise: null,

  open() {
    if (this._dbPromise) return this._dbPromise;
    this._dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open("vvfit_photos_db", 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("fotos")) {
          db.createObjectStore("fotos", { keyPath: "id" });
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e.target.error);
    });
    return this._dbPromise;
  },

  async salvar(id, dataUrl) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("fotos", "readwrite");
      tx.objectStore("fotos").put({ id, dataUrl });
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e.target.error);
    });
  },

  async obter(id) {
    if (!id) return null;
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("fotos", "readonly");
      const req = tx.objectStore("fotos").get(id);
      req.onsuccess = () => resolve(req.result ? req.result.dataUrl : null);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async remover(id) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("fotos", "readwrite");
      tx.objectStore("fotos").delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e.target.error);
    });
  },

  async listarTudo() {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("fotos", "readonly");
      const req = tx.objectStore("fotos").getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async limparTudo() {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("fotos", "readwrite");
      tx.objectStore("fotos").clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e.target.error);
    });
  }
};
