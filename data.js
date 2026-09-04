/*
 * VV FIT — dados oficiais do protocolo
 *
 * PROTOCOLO        → plano vigente (Fase 1). Fonte: "Plano Verônica fase 1.pdf"
 *                    (PROTOCOLO 2026 — Key Araújo).
 * PROTOCOLO_LEGADO → plano anterior (fonte: "Treino VV.docx"), mantido apenas
 *                    para calcular corretamente o "previsto" de datas anteriores
 *                    ao início da Fase 1 (ver core.js → Planos).
 *
 * Este arquivo é somente leitura em tempo de execução. Os registros pessoais da
 * usuária (treinos, refeições, água, AEJ/escada, medidas, sono/disposição,
 * check-ins, fotos) ficam separados, em localStorage/IndexedDB (ver storage.js).
 *
 * IMPORTANTE — fidelidade ao documento:
 *  - Nenhuma caloria, macronutriente, horário ou meta foi inventado. O PDF da
 *    Fase 1 não traz esses números, então eles não existem aqui (ficam null e a
 *    interface os oculta).
 *  - Alternativas com "ou" são preservadas como um único item ("A ou B"), nunca
 *    desmembradas em alimentos cumulativos.
 *  - A suplementação é transcrita como INFORMATIVO do plano recebido. O app não
 *    cria prescrições, não ajusta doses e não recomenda nada automaticamente.
 */

const PROTOCOLO = {
  versao: "3.0",

  fase: {
    id: "fase1",
    nome: "Fase 1",
    fonte: "Plano Verônica fase 1.pdf (PROTOCOLO 2026 — Key Araújo)",
    // A data de início é configurável pela usuária em Perfil → Fase do plano.
    // O valor efetivo fica em config.faseInicio (storage.js). Este campo é só
    // um rótulo de referência.
    observacao:
      "Plano registrado como Fase 1. A data de início é configurável e o histórico anterior é preservado."
  },

  perfilBase: {
    // Dados que a usuária pode ajustar em Perfil. Não vieram do PDF da Fase 1;
    // são herdados do cadastro anterior e continuam editáveis.
    idade: 36,
    alturaCm: 156,
    pesoInicialKg: 74,
    objetivo: "Redução de gordura com desenvolvimento de glúteo e posterior",
    frequenciaTreino: "6 dias por semana (segunda a sábado)",
    diasTreino: ["segunda", "terca", "quarta", "quinta", "sexta", "sabado"],
    diasDescanso: ["domingo"],
    horarioTreinoHabitual: "20:00",
    horarioSonoHabitual: "23:30"
  },

  // A Fase 1 não define gasto energético nem metas calóricas. Mantido como null
  // para deixar explícito que o número não existe no documento.
  gastoEnergetico: null,
  macros: null,

  agua: {
    // Do PDF: "INGESTÃO HÍDRICA: 3 litros de água + 500 ml de chá (cavalinha)".
    metaLitrosMin: 3,
    metaLitrosMax: 3,
    metaMlPadrao: 3000,
    chaMl: 500,
    chaTipo: "cavalinha",
    observacao:
      "Meta do plano: 3 litros de água por dia + 500 ml de chá de cavalinha (contabilizado à parte). Não utilizar açúcar nos alimentos nem óleo. Não ultrapassar 6 g de sal por dia."
  },

  /* ---------------- Plano alimentar — Fase 1 (5 refeições) ---------------- */
  // Cada refeição tem UMA composição (o PDF não traz 2 opções por refeição).
  // Itens com "ou" ficam em uma única linha, preservando a alternativa.
  refeicoes: [
    {
      id: "ref1",
      ordem: 1,
      nome: "1ª Refeição",
      horario: "",
      kcalAprox: null,
      finalidade: "",
      opcoes: [
        {
          id: "opcao1",
          nome: "Composição",
          itens: [
            { alimento: "2 fatias de pão integral", quantidade: "" },
            { alimento: "1 ovo inteiro", quantidade: "" },
            { alimento: "Requeijão cremoso light", quantidade: "10 g" },
            { alimento: "Mamão", quantidade: "100 g" },
            { alimento: "Café preto (adoçante e leite desnatado opcionais)", quantidade: "" }
          ],
          totalAprox: null,
          observacao: ""
        }
      ],
      substituicoes: []
    },
    {
      id: "ref2",
      ordem: 2,
      nome: "2ª Refeição",
      horario: "",
      kcalAprox: null,
      finalidade: "",
      opcoes: [
        {
          id: "opcao1",
          nome: "Composição",
          itens: [
            { alimento: "Arroz cozido", quantidade: "70 g" },
            { alimento: "Peito de frango ou carne magra", quantidade: "100 g frango ou 80 g carne magra" },
            { alimento: "Mix de legumes (cenoura, chuchu, abobrinha)", quantidade: "100 g" },
            { alimento: "Salada verde à vontade (free)", quantidade: "" }
          ],
          totalAprox: null,
          observacao: ""
        }
      ],
      substituicoes: []
    },
    {
      id: "ref3",
      ordem: 3,
      nome: "3ª Refeição — lanche da tarde",
      horario: "",
      kcalAprox: null,
      finalidade: "",
      opcoes: [
        {
          id: "opcao1",
          nome: "Composição",
          itens: [
            { alimento: "Mix de frutas (mamão, morango, maçã, pera)", quantidade: "150 g" },
            { alimento: "Iogurte desnatado", quantidade: "1 unidade (160 ml)" },
            { alimento: "Whey protein", quantidade: "30 g" }
          ],
          totalAprox: null,
          observacao: ""
        }
      ],
      substituicoes: []
    },
    {
      id: "ref4",
      ordem: 4,
      nome: "4ª Refeição — pré-treino",
      horario: "",
      kcalAprox: null,
      finalidade: "",
      opcoes: [
        {
          id: "opcao1",
          nome: "Composição",
          itens: [
            { alimento: "Pão integral", quantidade: "1 fatia" },
            { alimento: "Doce de leite", quantidade: "20 g" }
          ],
          totalAprox: null,
          observacao: ""
        }
      ],
      substituicoes: []
    },
    {
      id: "ref5",
      ordem: 5,
      nome: "5ª Refeição",
      horario: "",
      kcalAprox: null,
      finalidade: "",
      opcoes: [
        {
          id: "opcao1",
          nome: "Composição",
          itens: [
            { alimento: "Batata inglesa ou arroz cozido ou abóbora", quantidade: "70 g batata ou 70 g arroz ou 100 g abóbora" },
            { alimento: "Peito de frango ou carne magra", quantidade: "100 g frango ou 80 g carne magra" },
            { alimento: "Mix de legumes (cenoura, beterraba, abobrinha)", quantidade: "100 g" },
            { alimento: "Salada verde à vontade (free)", quantidade: "" }
          ],
          totalAprox: null,
          observacao: ""
        }
      ],
      substituicoes: []
    }
  ],

  /* ---------------- Suplementação — INFORMATIVO do plano recebido ---------------- */
  // Transcrição literal do PDF. Espaço de consulta apenas. O app não prescreve,
  // não ajusta doses e não faz recomendações automáticas.
  suplementacao: {
    aviso:
      "Informação transcrita do plano recebido (Plano Verônica fase 1.pdf). Espaço apenas para consulta. O aplicativo não cria prescrições, não ajusta doses e não faz recomendações automáticas. Qualquer dúvida deve ser tratada com o profissional responsável.",
    blocos: [
      {
        titulo: "Pré AEJ",
        itens: [
          "10 mg ioimbina",
          "500 ml de água",
          "1ª refeição",
          "1 cápsula de multivitamínico + 1 g de vitamina C",
          "500 mg Morosil"
        ]
      },
      {
        titulo: "Antes de dormir",
        itens: ["3 cápsulas de ômega 3"]
      },
      {
        titulo: "Pré-treino (opções)",
        itens: ["210 mg de cafeína OU pré-treino opcional (15 min antes do treino)"]
      },
      {
        titulo: "Intra-treino",
        itens: ["1 litro de água", "1 g de sal", "5 g de creatina"]
      }
    ]
  },

  /* ---------------- Orientações gerais (do PDF) ---------------- */
  orientacoes: {
    hidratacao:
      "3 litros de água por dia + 500 ml de chá de cavalinha. Não utilizar açúcar nos alimentos nem óleo. Não ultrapassar 6 g de sal por dia.",
    descansoEntreSeries:
      "50 segundos entre séries normais; 60 segundos quando for bi-série.",
    treino:
      "Progredir a carga e executar os exercícios com amplitude. Alongar quando puder e fazer mobilidade.",
    refeicaoLivre:
      "1 refeição livre na semana, a cada 2 semanas (após avaliação).",
    feedback:
      "O feedback deve ser enviado a cada 2 semanas, em jejum, no sábado ou domingo."
  },

  /* ---------------- AEJ (aeróbico em jejum) ---------------- */
  aej: {
    minutos: 30,
    dias: ["segunda", "terca", "quarta", "quinta", "sexta", "sabado"],
    observacao: "AEJ 30 min todos os dias, exceto no domingo."
  },

  /* ---------------- Treinos — Fase 1 ---------------- */
  // O PDF traz nome do exercício e esquema de séries/repetições. Não traz
  // equipamento, cadência, execução, erros comuns nem objetivo — esses campos
  // ficam vazios (não foram inventados).
  treinos: {
    segunda: {
      diaSemana: "segunda",
      label: "Segunda-feira",
      tipo: "treino",
      nome: "Glúteo + Posterior completo",
      grupos: ["Glúteo", "Posterior"],
      objetivoDia: "",
      observacaoDia:
        "Descanso entre séries: 50 s (série normal) / 60 s (bi-série). Progredir carga com amplitude; alongar e fazer mobilidade quando puder.",
      aquecimento: { equipamento: "Mobilidade", tempo: "5 min", intensidade: "" },
      exercicios: [
        { ordem: 1, nome: "Cadeira abdutora", esquema: "1x25 + 3x20", series: null, repeticoes: "1x25 + 3x20", descanso: "50s", biserie: false, equipamento: "", cadencia: "", intensidade: "", grupoMuscular: "Glúteo médio", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 2, nome: "Abdução no cross", esquema: "", series: 3, repeticoes: "15", descanso: "50s", biserie: false, equipamento: "Polia (cross)", cadencia: "", intensidade: "", grupoMuscular: "Glúteo médio", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 3, nome: "Elevação pélvica", esquema: "", series: 4, repeticoes: "20", descanso: "50s", biserie: false, equipamento: "", cadencia: "", intensidade: "", grupoMuscular: "Glúteo máximo", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 4, nome: "Agachamento sumô com halter", esquema: "", series: 3, repeticoes: "15", descanso: "50s", biserie: false, equipamento: "Halter", cadencia: "", intensidade: "", grupoMuscular: "Glúteo, adutores", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 5, nome: "Mesa flexora + stiff com halter (bi-série)", esquema: "", series: 3, repeticoes: "10 + 10", descanso: "60s", biserie: true, equipamento: "Mesa flexora + halter", cadencia: "", intensidade: "", grupoMuscular: "Posterior de coxa", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 6, nome: "Cross com perna cruzada", esquema: "", series: 3, repeticoes: "15", descanso: "50s", biserie: false, equipamento: "Polia (cross)", cadencia: "", intensidade: "", grupoMuscular: "Glúteo", execucao: "", errosComuns: "", objetivo: "" }
      ],
      cardio: null,
      progressao:
        "Progredir a carga quando conseguir completar todas as séries com boa amplitude. Descanso: 50 s (normal) / 60 s (bi-série)."
    },

    terca: {
      diaSemana: "terca",
      label: "Terça-feira",
      tipo: "treino",
      nome: "Upper",
      grupos: ["Costas", "Ombros", "Superiores"],
      objetivoDia: "",
      observacaoDia:
        "Descanso entre séries: 50 s (série normal) / 60 s (bi-série). Progredir carga com amplitude; alongar e fazer mobilidade quando puder.",
      aquecimento: { equipamento: "Mobilidade", tempo: "5 min", intensidade: "" },
      exercicios: [
        { ordem: 1, nome: "Puxador aberto + puxador fechado (bi-série)", esquema: "", series: 3, repeticoes: "10 + 10", descanso: "60s", biserie: true, equipamento: "Polia alta", cadencia: "", intensidade: "", grupoMuscular: "Dorsal", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 2, nome: "Remada unilateral na máquina", esquema: "", series: 3, repeticoes: "12", descanso: "50s", biserie: false, equipamento: "Máquina", cadencia: "", intensidade: "", grupoMuscular: "Dorsal", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 3, nome: "Elevação lateral + elevação frontal com halter (bi-série)", esquema: "", series: 4, repeticoes: "10 + 10", descanso: "60s", biserie: true, equipamento: "Halteres", cadencia: "", intensidade: "", grupoMuscular: "Ombros", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 4, nome: "Elevação frontal com anilha", esquema: "", series: 3, repeticoes: "15", descanso: "50s", biserie: false, equipamento: "Anilha", cadencia: "", intensidade: "", grupoMuscular: "Deltoide anterior", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 5, nome: "Desenvolvimento Arnold", esquema: "", series: 3, repeticoes: "15", descanso: "50s", biserie: false, equipamento: "Halteres", cadencia: "", intensidade: "", grupoMuscular: "Ombros", execucao: "", errosComuns: "", objetivo: "" }
      ],
      cardio: { equipamento: "Escada", tempo: "15 min", intensidade: "", objetivo: "" },
      progressao:
        "Progredir a carga com boa amplitude. Descanso: 50 s (normal) / 60 s (bi-série)."
    },

    quarta: {
      diaSemana: "quarta",
      label: "Quarta-feira",
      tipo: "treino",
      nome: "Quadríceps completo",
      grupos: ["Quadríceps"],
      objetivoDia: "",
      observacaoDia:
        "Descanso entre séries: 50 s (série normal) / 60 s (bi-série). Progredir carga com amplitude; alongar e fazer mobilidade quando puder.",
      aquecimento: { equipamento: "Mobilidade", tempo: "5 min", intensidade: "" },
      exercicios: [
        { ordem: 1, nome: "Cadeira extensora unilateral", esquema: "", series: 3, repeticoes: "15", descanso: "50s", biserie: false, equipamento: "Máquina extensora", cadencia: "", intensidade: "", grupoMuscular: "Quadríceps", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 2, nome: "Agachamento no smith", esquema: "", series: 4, repeticoes: "15", descanso: "50s", biserie: false, equipamento: "Smith", cadencia: "", intensidade: "", grupoMuscular: "Quadríceps, glúteo", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 3, nome: "Leg press 45° — pés juntos + pés afastados (bi-série)", esquema: "", series: 4, repeticoes: "10 + 10", descanso: "60s", biserie: true, equipamento: "Leg press 45°", cadencia: "", intensidade: "", grupoMuscular: "Quadríceps", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 4, nome: "Cadeira adutora", esquema: "", series: 3, repeticoes: "15", descanso: "50s", biserie: false, equipamento: "Máquina adutora", cadencia: "", intensidade: "", grupoMuscular: "Adutores", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 5, nome: "Cadeira extensora", esquema: "1x20 + 4x15", series: null, repeticoes: "1x20 + 4x15", descanso: "50s", biserie: false, equipamento: "Máquina extensora", cadencia: "", intensidade: "", grupoMuscular: "Quadríceps", execucao: "", errosComuns: "", objetivo: "" }
      ],
      cardio: null,
      progressao:
        "Progredir a carga com boa amplitude. Descanso: 50 s (normal) / 60 s (bi-série)."
    },

    quinta: {
      diaSemana: "quinta",
      label: "Quinta-feira",
      tipo: "treino",
      nome: "Upper",
      grupos: ["Bíceps", "Tríceps", "Ombros"],
      objetivoDia: "",
      observacaoDia:
        "Descanso entre séries: 50 s (série normal) / 60 s (bi-série). Progredir carga com amplitude; alongar e fazer mobilidade quando puder.",
      aquecimento: { equipamento: "Mobilidade", tempo: "5 min", intensidade: "" },
      exercicios: [
        { ordem: 1, nome: "Rosca alternada com halter", esquema: "", series: 3, repeticoes: "15", descanso: "50s", biserie: false, equipamento: "Halteres", cadencia: "", intensidade: "", grupoMuscular: "Bíceps", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 2, nome: "Rosca direta com barra", esquema: "", series: 3, repeticoes: "15", descanso: "50s", biserie: false, equipamento: "Barra", cadencia: "", intensidade: "", grupoMuscular: "Bíceps", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 3, nome: "Tríceps francês", esquema: "", series: 3, repeticoes: "15", descanso: "50s", biserie: false, equipamento: "Halter / barra", cadencia: "", intensidade: "", grupoMuscular: "Tríceps", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 4, nome: "Tríceps corda", esquema: "", series: 3, repeticoes: "20", descanso: "50s", biserie: false, equipamento: "Polia + corda", cadencia: "", intensidade: "", grupoMuscular: "Tríceps", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 5, nome: "Elevação lateral com halter", esquema: "", series: 3, repeticoes: "12", descanso: "50s", biserie: false, equipamento: "Halteres", cadencia: "", intensidade: "", grupoMuscular: "Deltoide lateral", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 6, nome: "Desenvolvimento com halter", esquema: "", series: 3, repeticoes: "12", descanso: "50s", biserie: false, equipamento: "Halteres", cadencia: "", intensidade: "", grupoMuscular: "Ombros", execucao: "", errosComuns: "", objetivo: "" }
      ],
      cardio: { equipamento: "Escada", tempo: "15 min", intensidade: "", objetivo: "" },
      progressao:
        "Progredir a carga com boa amplitude. Descanso: 50 s (normal) / 60 s (bi-série)."
    },

    sexta: {
      diaSemana: "sexta",
      label: "Sexta-feira",
      tipo: "treino",
      nome: "Glúteo + Posterior completo",
      grupos: ["Glúteo", "Posterior"],
      objetivoDia: "",
      observacaoDia:
        "Mesmo treino de segunda. Descanso entre séries: 50 s (série normal) / 60 s (bi-série). Progredir carga com amplitude; alongar e fazer mobilidade quando puder.",
      aquecimento: { equipamento: "Mobilidade", tempo: "5 min", intensidade: "" },
      exercicios: [
        { ordem: 1, nome: "Cadeira abdutora", esquema: "1x25 + 3x20", series: null, repeticoes: "1x25 + 3x20", descanso: "50s", biserie: false, equipamento: "", cadencia: "", intensidade: "", grupoMuscular: "Glúteo médio", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 2, nome: "Abdução no cross", esquema: "", series: 3, repeticoes: "15", descanso: "50s", biserie: false, equipamento: "Polia (cross)", cadencia: "", intensidade: "", grupoMuscular: "Glúteo médio", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 3, nome: "Elevação pélvica", esquema: "", series: 4, repeticoes: "20", descanso: "50s", biserie: false, equipamento: "", cadencia: "", intensidade: "", grupoMuscular: "Glúteo máximo", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 4, nome: "Agachamento sumô com halter", esquema: "", series: 3, repeticoes: "15", descanso: "50s", biserie: false, equipamento: "Halter", cadencia: "", intensidade: "", grupoMuscular: "Glúteo, adutores", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 5, nome: "Mesa flexora + stiff com halter (bi-série)", esquema: "", series: 3, repeticoes: "10 + 10", descanso: "60s", biserie: true, equipamento: "Mesa flexora + halter", cadencia: "", intensidade: "", grupoMuscular: "Posterior de coxa", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 6, nome: "Cross com perna cruzada", esquema: "", series: 3, repeticoes: "15", descanso: "50s", biserie: false, equipamento: "Polia (cross)", cadencia: "", intensidade: "", grupoMuscular: "Glúteo", execucao: "", errosComuns: "", objetivo: "" }
      ],
      cardio: null,
      progressao:
        "Progredir a carga com boa amplitude. Descanso: 50 s (normal) / 60 s (bi-série)."
    },

    sabado: {
      diaSemana: "sabado",
      label: "Sábado",
      tipo: "treino",
      nome: "Abdômen",
      grupos: ["Abdômen"],
      objetivoDia: "",
      observacaoDia:
        "Descanso entre séries: 50 s. Progredir com amplitude; alongar e fazer mobilidade quando puder.",
      aquecimento: null,
      exercicios: [
        { ordem: 1, nome: "Abdominal infra", esquema: "", series: 4, repeticoes: "12", descanso: "50s", biserie: false, equipamento: "", cadencia: "", intensidade: "", grupoMuscular: "Abdômen inferior", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 2, nome: "Abdominal infra unilateral", esquema: "", series: 4, repeticoes: "15", descanso: "50s", biserie: false, equipamento: "", cadencia: "", intensidade: "", grupoMuscular: "Abdômen inferior, oblíquos", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 3, nome: "Abdominal solo", esquema: "", series: 4, repeticoes: "12", descanso: "50s", biserie: false, equipamento: "Colchonete", cadencia: "", intensidade: "", grupoMuscular: "Reto abdominal", execucao: "", errosComuns: "", objetivo: "" },
        { ordem: 4, nome: "Prancha isométrica", esquema: "3x 1 min", series: 3, repeticoes: "1 min", descanso: "50s", biserie: false, equipamento: "Colchonete", cadencia: "", intensidade: "", grupoMuscular: "Core", execucao: "", errosComuns: "", objetivo: "" }
      ],
      cardio: { equipamento: "Escada", tempo: "20 min", intensidade: "", objetivo: "" },
      progressao: "Progredir com amplitude e controle. Descanso: 50 s."
    },

    domingo: {
      diaSemana: "domingo",
      label: "Domingo",
      tipo: "descanso",
      nome: "Descanso"
    }
  },

  resumoSemanal: {
    volumeGluteo: "2x/semana (segunda e sexta)",
    volumeUpper: "2x/semana (terça e quinta)",
    quadriceps: "1x/semana (quarta)",
    abdomen: "1x/semana (sábado)",
    cardioEscada: "Terça 15 min, quinta 15 min, sábado 20 min",
    aej: "30 min de segunda a sábado"
  },

  ordemDiasSemana: ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"]
};

/* ================================================================
 * PROTOCOLO_LEGADO — plano anterior ("Treino VV.docx")
 * Usado somente para calcular o "previsto" de datas anteriores ao
 * início da Fase 1. Mantido compacto (sem a prosa de execução).
 * ================================================================ */
const PROTOCOLO_LEGADO = {
  versao: "1.0",
  fase: { id: "legado", nome: "Plano anterior", fonte: "Treino VV.docx" },
  agua: { metaMlPadrao: 2350 },
  gastoEnergetico: { metaCaloricaKcal: 1780 },
  macros: { proteina: { quantidadeG: 148 }, carboidrato: { quantidadeG: 150 }, gordura: { quantidadeG: 65 } },
  refeicoes: [
    { id: "cafe_manha", ordem: 1, nome: "Café da manhã" },
    { id: "almoco", ordem: 2, nome: "Almoço" },
    { id: "cafe_tarde", ordem: 3, nome: "Café da tarde (pré-treino)" },
    { id: "jantar", ordem: 4, nome: "Jantar (pós-treino)" }
  ],
  treinos: {
    segunda: { diaSemana: "segunda", label: "Segunda-feira", tipo: "treino", nome: "Quadríceps + Panturrilha + Cardio", grupos: ["Quadríceps", "Panturrilha"], exercicios: [
      { ordem: 1, nome: "Agachamento livre com barra", series: 4, repeticoes: "8-10", descanso: "90s" },
      { ordem: 2, nome: "Leg press 45°", series: 3, repeticoes: "12-15", descanso: "75s" },
      { ordem: 3, nome: "Cadeira extensora", series: 3, repeticoes: "15", descanso: "60s" },
      { ordem: 4, nome: "Cadeira flexora (posterior, ativação leve)", series: 3, repeticoes: "12", descanso: "60s" },
      { ordem: 5, nome: "Panturrilha em pé", series: 4, repeticoes: "15-20", descanso: "45s" }
    ], cardio: { equipamento: "Esteira ou bike", tempo: "15-20 min", intensidade: "", objetivo: "" }, progressao: "" },
    terca: { diaSemana: "terca", label: "Terça-feira", tipo: "treino", nome: "Costas, Peito, Ombros, Bíceps, Tríceps, Abdômen", grupos: ["Costas", "Peito", "Ombros", "Bíceps", "Tríceps", "Abdômen"], exercicios: [
      { ordem: 1, nome: "Puxada frontal na polia (pegada aberta)", series: 4, repeticoes: "10-12", descanso: "90s" },
      { ordem: 2, nome: "Remada curvada com barra", series: 4, repeticoes: "8-10", descanso: "90s" },
      { ordem: 3, nome: "Supino reto com halteres", series: 3, repeticoes: "10-12", descanso: "75s" },
      { ordem: 4, nome: "Desenvolvimento de ombros com halteres (sentado)", series: 3, repeticoes: "10-12", descanso: "75s" },
      { ordem: 5, nome: "Elevação lateral", series: 3, repeticoes: "15", descanso: "60s" },
      { ordem: 6, nome: "Rosca direta com barra", series: 3, repeticoes: "10-12", descanso: "60s" },
      { ordem: 7, nome: "Tríceps na polia (pegada pronada)", series: 3, repeticoes: "12-15", descanso: "60s" },
      { ordem: 8, nome: "Abdômen (prancha + elevação de pernas)", series: 3, repeticoes: "prancha 30-45s / elevação de pernas 15 reps", descanso: "45s" }
    ], cardio: null, progressao: "" },
    quarta: { diaSemana: "quarta", label: "Quarta-feira", tipo: "treino", nome: "Posteriores, Glúteos, Panturrilha + Cardio", grupos: ["Posteriores", "Glúteos", "Panturrilha"], exercicios: [
      { ordem: 1, nome: "Stiff com barra", series: 4, repeticoes: "8-10", descanso: "90s" },
      { ordem: 2, nome: "Elevação pélvica com barra (hip thrust)", series: 4, repeticoes: "10-12", descanso: "90s" },
      { ordem: 3, nome: "Cadeira flexora (posterior)", series: 3, repeticoes: "12-15", descanso: "75s" },
      { ordem: 4, nome: "Agachamento sumô com halter ou kettlebell", series: 3, repeticoes: "12-15", descanso: "75s" },
      { ordem: 5, nome: "Cadeira abdutora", series: 3, repeticoes: "15-20", descanso: "60s" },
      { ordem: 6, nome: "Panturrilha sentada", series: 4, repeticoes: "15-20", descanso: "45s" }
    ], cardio: { equipamento: "Esteira ou elíptico", tempo: "15-20 min", intensidade: "", objetivo: "" }, progressao: "" },
    quinta: { diaSemana: "quinta", label: "Quinta-feira", tipo: "descanso", nome: "Descanso" },
    sexta: { diaSemana: "sexta", label: "Sexta-feira", tipo: "treino", nome: "Glúteos (ênfase), Quadríceps, Posteriores, Abdômen", grupos: ["Glúteos", "Quadríceps", "Posteriores", "Abdômen"], exercicios: [
      { ordem: 1, nome: "Elevação pélvica com barra (hip thrust) — variação unilateral progressiva", series: 4, repeticoes: "8-10", descanso: "90-120s" },
      { ordem: 2, nome: "Agachamento búlgaro (afundo com apoio traseiro)", series: 3, repeticoes: "10-12 por perna", descanso: "90s" },
      { ordem: 3, nome: "Leg press 45° (pés altos e afastados)", series: 3, repeticoes: "12-15", descanso: "75s" },
      { ordem: 4, nome: "Stiff unilateral com halter", series: 3, repeticoes: "10-12 por perna", descanso: "75s" },
      { ordem: 5, nome: "Cadeira extensora", series: 3, repeticoes: "15", descanso: "60s" },
      { ordem: 6, nome: "Abdômen (elevação de quadril + prancha lateral)", series: 3, repeticoes: "elevação de quadril 15-20 reps / prancha lateral 20-30s por lado", descanso: "45s" }
    ], cardio: null, progressao: "" },
    sabado: { diaSemana: "sabado", label: "Sábado", tipo: "treino", nome: "Costas, Ombros, Braços, Abdômen + Cardio", grupos: ["Costas", "Ombros", "Braços", "Abdômen"], exercicios: [
      { ordem: 1, nome: "Remada baixa na polia (pegada neutra)", series: 4, repeticoes: "10-12", descanso: "90s" },
      { ordem: 2, nome: "Puxada na polia com pegada supinada", series: 3, repeticoes: "10-12", descanso: "90s" },
      { ordem: 3, nome: "Desenvolvimento militar com barra (em pé ou sentado)", series: 3, repeticoes: "8-10", descanso: "90s" },
      { ordem: 4, nome: "Elevação posterior (crucifixo invertido)", series: 3, repeticoes: "15", descanso: "60s" },
      { ordem: 5, nome: "Rosca alternada com halteres", series: 3, repeticoes: "10-12 por braço", descanso: "60s" },
      { ordem: 6, nome: "Tríceps testa com barra W", series: 3, repeticoes: "10-12", descanso: "60s" },
      { ordem: 7, nome: "Abdômen (bicicleta + prancha)", series: 3, repeticoes: "bicicleta 20 reps / prancha 30-45s", descanso: "45s" }
    ], cardio: { equipamento: "Esteira, elíptico ou bike", tempo: "15-20 min", intensidade: "", objetivo: "" }, progressao: "" },
    domingo: { diaSemana: "domingo", label: "Domingo", tipo: "descanso", nome: "Descanso" }
  },
  aej: null,
  ordemDiasSemana: ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"]
};

const DIAS_LABEL = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
  domingo: "Domingo"
};

const DIAS_CURTO = {
  segunda: "Seg",
  terca: "Ter",
  quarta: "Qua",
  quinta: "Qui",
  sexta: "Sex",
  sabado: "Sáb",
  domingo: "Dom"
};
