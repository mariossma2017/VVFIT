/*
 * VV FIT — dados oficiais do protocolo
 * Fonte: "Treino VV.docx"
 * Este arquivo é somente leitura em tempo de execução: contém o protocolo fixo
 * (perfil base, plano alimentar, treinos). Os registros pessoais da usuária
 * (cargas, refeições marcadas, água, evolução, check-ins) ficam separados,
 * salvos em localStorage/IndexedDB via app.js.
 */

const PROTOCOLO = {
  versao: "1.0",

  perfilBase: {
    idade: 36,
    alturaCm: 156,
    pesoInicialKg: 74,
    objetivo: "Redução de gordura com preservação de massa muscular",
    frequenciaTreino: "5 dias por semana",
    diasTreino: ["segunda", "terca", "quarta", "sexta", "sabado"],
    diasDescanso: ["quinta", "domingo"],
    horarioTreinoHabitual: "20:00",
    horarioSonoHabitual: "23:30"
  },

  gastoEnergetico: {
    formula: "Mifflin-St Jeor",
    tmbKcal: 1374,
    fatorAtividade: 1.55,
    getKcal: 2130,
    deficitPercentual: 17,
    metaCaloricaKcal: 1780,
    observacao:
      "Esse número é uma estimativa baseada em fórmula populacional, não uma medição real do gasto. Serve como ponto de partida e será ajustado conforme a evolução real nas próximas semanas — se o peso não se mexer em 2-3 semanas com boa adesão, recalcula-se."
  },

  macros: {
    proteina: { quantidadeG: 148, gPorKg: 2.0, kcal: 592, logica: "Alta ingestão para preservar massa muscular em déficit" },
    gordura: { quantidadeG: 65, gPorKg: 0.9, kcal: 585, logica: "Mínimo necessário para hormônios e saciedade" },
    carboidrato: { quantidadeG: 150, kcal: 600, logica: "Restante, priorizado no pré/pós-treino" },
    totalKcal: 1777
  },

  agua: {
    metaLitrosMin: 2.2,
    metaLitrosMax: 2.5,
    metaMlPadrao: 2350,
    observacao: "Distribuída ao longo do dia — maior parte antes das 21h para não atrapalhar o sono com idas ao banheiro."
  },

  refeicoes: [
    {
      id: "cafe_manha",
      ordem: 1,
      nome: "Café da manhã",
      horario: "08:30",
      kcalAprox: 440,
      finalidade:
        "Proteína logo cedo ativa a síntese proteica muscular e melhora saciedade até o pré-treino.",
      opcoes: [
        {
          id: "opcao1",
          nome: "Opção 1",
          itens: [
            { alimento: "3 ovos inteiros mexidos", quantidade: "150g", proteinaG: 19, carboidratoG: 1, gorduraG: 15 },
            { alimento: "2 fatias de pão integral", quantidade: "50g", proteinaG: 6, carboidratoG: 24, gorduraG: 2 },
            { alimento: "1 banana média", quantidade: "100g", proteinaG: 1, carboidratoG: 23, gorduraG: 0 }
          ],
          totalAprox: { proteinaG: 26, carboidratoG: 48, gorduraG: 17, kcal: 445 },
          observacao: ""
        },
        {
          id: "opcao2",
          nome: "Opção 2",
          itens: [
            { alimento: "Iogurte natural integral", quantidade: "200g", proteinaG: 7, carboidratoG: 8, gorduraG: 6 },
            { alimento: "Aveia em flocos", quantidade: "40g", proteinaG: 5, carboidratoG: 24, gorduraG: 3 },
            { alimento: "Pasta de amendoim", quantidade: "1 colher de sopa (15g)", proteinaG: 4, carboidratoG: 3, gorduraG: 8 }
          ],
          totalAprox: { proteinaG: 16, carboidratoG: 35, gorduraG: 17, kcal: 340 },
          observacao: "Ajustar com 1 fruta extra se precisar bater a meta."
        }
      ],
      substituicoes: [
        "Ovos ↔ 100g frango desfiado (23g P) ↔ 150g cottage (18g P)",
        "Pão integral ↔ 60g goma de tapioca (2 tapiocas pequenas)",
        "Aveia ↔ granola sem açúcar (mesma quantidade em gramas)"
      ]
    },
    {
      id: "almoco",
      ordem: 2,
      nome: "Almoço",
      horario: "13:00",
      kcalAprox: 550,
      finalidade:
        "Maior refeição do dia, mantendo arroz e feijão (carboidrato complexo + proteína magra) para sustentar energia até o pré-treino.",
      opcoes: [
        {
          id: "opcao1",
          nome: "Opção 1",
          itens: [
            { alimento: "Frango grelhado (peso cru)", quantidade: "150g", proteinaG: 33, carboidratoG: 0, gorduraG: 5 },
            { alimento: "Arroz branco (100g cozido)", quantidade: "4 colheres de sopa", proteinaG: 2, carboidratoG: 28, gorduraG: 0 },
            { alimento: "Feijão", quantidade: "1 concha média (80g)", proteinaG: 5, carboidratoG: 14, gorduraG: 0 },
            { alimento: "Salada crua à vontade + 1 fio de azeite (5ml)", quantidade: "", proteinaG: 0, carboidratoG: 0, gorduraG: 5 },
            { alimento: "Legumes refogados", quantidade: "100g", proteinaG: 0, carboidratoG: 0, gorduraG: 0 }
          ],
          totalAprox: { proteinaG: 40, carboidratoG: 44, gorduraG: 10, kcal: 445 },
          observacao: ""
        },
        {
          id: "opcao2",
          nome: "Opção 2",
          itens: [
            { alimento: "Patinho em cubos (peso cru)", quantidade: "150g", proteinaG: 32, carboidratoG: 0, gorduraG: 6 },
            { alimento: "Batata-doce cozida", quantidade: "100g", proteinaG: 1, carboidratoG: 20, gorduraG: 0 },
            { alimento: "Legumes refogados (abobrinha, cenoura, brócolis)", quantidade: "100g", proteinaG: 0, carboidratoG: 0, gorduraG: 0 },
            { alimento: "Salada crua à vontade + 1 fio de azeite (5ml)", quantidade: "", proteinaG: 0, carboidratoG: 0, gorduraG: 0 }
          ],
          totalAprox: { proteinaG: 33, carboidratoG: 22, gorduraG: 11, kcal: 320 },
          observacao: "Adicionar mais 50g de batata-doce se precisar fechar a meta."
        }
      ],
      substituicoes: [
        "Frango ↔ 150g peixe (tilápia/merluza) ↔ 150g carne vermelha magra (patinho/coxão mole)",
        "Arroz ↔ 100g batata-doce ↔ 80g mandioca cozida",
        "Feijão ↔ 60g lentilha cozida ↔ 60g grão de bico"
      ]
    },
    {
      id: "cafe_tarde",
      ordem: 3,
      nome: "Café da tarde (pré-treino)",
      horario: "16:30",
      kcalAprox: 330,
      finalidade:
        "Carboidrato de rápida absorção + proteína moderada, para chegar com energia no treino às 20h sem pesar no estômago.",
      opcoes: [
        {
          id: "opcao1",
          nome: "Opção 1",
          itens: [
            { alimento: "Banana média", quantidade: "100g", proteinaG: 0, carboidratoG: 23, gorduraG: 0 },
            { alimento: "Whey protein (1 scoop)", quantidade: "30g", proteinaG: 24, carboidratoG: 2, gorduraG: 2 }
          ],
          totalAprox: { proteinaG: 25, carboidratoG: 25, gorduraG: 2, kcal: 220 },
          observacao: "Adicionar 1 fatia de pão se precisar de mais carboidrato."
        },
        {
          id: "opcao2",
          nome: "Opção 2",
          itens: [
            { alimento: "Pão integral", quantidade: "2 fatias (50g)", proteinaG: 6, carboidratoG: 24, gorduraG: 0 },
            { alimento: "Peito de peru", quantidade: "2 fatias (30g)", proteinaG: 6, carboidratoG: 0, gorduraG: 1 },
            { alimento: "Maçã", quantidade: "1 fruta (100g)", proteinaG: 0, carboidratoG: 14, gorduraG: 0 }
          ],
          totalAprox: { proteinaG: 12, carboidratoG: 38, gorduraG: 1, kcal: 220 },
          observacao: ""
        }
      ],
      substituicoes: [
        "Whey ↔ 2 ovos cozidos ↔ 100g iogurte proteico",
        "Pão ↔ 3 biscoitos de arroz ↔ 40g tapioca"
      ]
    },
    {
      id: "jantar",
      ordem: 4,
      nome: "Jantar (pós-treino)",
      horario: "22:00",
      kcalAprox: 460,
      finalidade:
        "Proteína generosa para recuperação muscular pós-treino; carboidrato mais controlado nessa refeição porque é tarde (22h) e o sono é às 23h30 — carbo em excesso à noite pode prejudicar ainda mais um sono que já é de baixa qualidade.",
      opcoes: [
        {
          id: "opcao1",
          nome: "Opção 1",
          itens: [
            { alimento: "Peixe assado (tilápia)", quantidade: "150g", proteinaG: 31, carboidratoG: 0, gorduraG: 2 },
            { alimento: "Purê de mandioquinha", quantidade: "100g", proteinaG: 0, carboidratoG: 20, gorduraG: 0 },
            { alimento: "Legumes no vapor", quantidade: "100g", proteinaG: 0, carboidratoG: 0, gorduraG: 0 }
          ],
          totalAprox: { proteinaG: 31, carboidratoG: 22, gorduraG: 2, kcal: 225 },
          observacao: "Ajustar porção de purê ou adicionar azeite conforme a meta do dia."
        },
        {
          id: "opcao2",
          nome: "Opção 2",
          itens: [
            { alimento: "Frango grelhado", quantidade: "150g", proteinaG: 33, carboidratoG: 0, gorduraG: 5 },
            { alimento: "Omelete de 2 ovos com legumes", quantidade: "", proteinaG: 12, carboidratoG: 0, gorduraG: 10 },
            { alimento: "Salada verde à vontade", quantidade: "", proteinaG: 0, carboidratoG: 0, gorduraG: 0 }
          ],
          totalAprox: { proteinaG: 45, carboidratoG: 3, gorduraG: 15, kcal: 330 },
          observacao: ""
        }
      ],
      substituicoes: [
        "Peixe ↔ frango ↔ 150g carne magra",
        "Purê ↔ 80g arroz ↔ 80g mandioca"
      ]
    }
  ],

  /*
   * Observação sobre o documento-fonte: a seção de quarta-feira (dia de
   * treino de glúteo, citado nas observações de segunda a sábado como
   * "mesma técnica de quarta") não está detalhada no arquivo original —
   * apenas referenciada. Por instrução do protocolo, nenhum exercício foi
   * inventado: os campos ficam vazios e preparados para edição futura.
   */
  treinos: {
    segunda: {
      diaSemana: "segunda",
      label: "Segunda-feira",
      tipo: "treino",
      nome: "Quadríceps + Panturrilha + Cardio",
      grupos: ["Quadríceps", "Panturrilha"],
      objetivoDia: "",
      observacaoDia: "",
      aquecimento: {
        equipamento: "Bike ergométrica ou esteira",
        tempo: "5-7 min",
        intensidade: "leve a moderada (RPE 4/10), só para elevar temperatura corporal e ativar articulações do joelho/quadril"
      },
      exercicios: [
        {
          ordem: 1,
          nome: "Agachamento livre com barra",
          equipamento: "Barra + anilhas, rack",
          series: 4,
          repeticoes: "8-10",
          descanso: "90s",
          cadencia: "3-1-1-0 (3s descendo, 1s pausa embaixo, 1s subindo)",
          intensidade: "",
          grupoMuscular: "Quadríceps, glúteo",
          execucao: "Pés na largura dos ombros, quadril inicia o movimento para trás, joelho acompanha a linha do pé, tronco ereto.",
          errosComuns: "Joelho colapsando para dentro; perder a lombar (arredondar as costas).",
          objetivo: "Exercício multiarticular principal, maior recrutamento de quadríceps e glúteo, base para força de membros inferiores."
        },
        {
          ordem: 2,
          nome: "Leg press 45°",
          equipamento: "Máquina leg press",
          series: 3,
          repeticoes: "12-15",
          descanso: "75s",
          cadencia: "2-0-1-0",
          intensidade: "",
          grupoMuscular: "Quadríceps",
          execucao: "Pés na plataforma na largura dos quadris, não travar joelho na extensão total.",
          errosComuns: "Descer demais e tirar o quadril do encosto (sobrecarrega lombar).",
          objetivo: "Volume adicional de quadríceps com menor exigência de estabilização, boa opção após exercício mais pesado."
        },
        {
          ordem: 3,
          nome: "Cadeira extensora",
          equipamento: "Máquina extensora",
          series: 3,
          repeticoes: "15",
          descanso: "60s",
          cadencia: "2-1-2-0 (segurar 1s no topo)",
          intensidade: "",
          grupoMuscular: "Quadríceps",
          execucao: "Contração total no topo, controle na descida.",
          errosComuns: "",
          objetivo: "Isolamento de quadríceps, ótimo para finalizar o grupo muscular com pump."
        },
        {
          ordem: 4,
          nome: "Cadeira flexora (posterior, ativação leve)",
          equipamento: "Máquina flexora",
          series: 3,
          repeticoes: "12",
          descanso: "60s",
          cadencia: "",
          intensidade: "",
          grupoMuscular: "Posterior de coxa",
          execucao: "",
          errosComuns: "",
          objetivo: "Manter equilíbrio entre quadríceps e posteriores, prevenindo desbalanço muscular."
        },
        {
          ordem: 5,
          nome: "Panturrilha em pé",
          equipamento: "Máquina ou smith",
          series: 4,
          repeticoes: "15-20",
          descanso: "45s",
          cadencia: "1-1-2-0 (pausa no alongamento)",
          intensidade: "",
          grupoMuscular: "Panturrilha",
          execucao: "",
          errosComuns: "Fazer o movimento muito rápido, sem amplitude completa.",
          objetivo: "Hipertrofia de panturrilha, grupo que exige alto volume por ser resistente à fadiga."
        }
      ],
      cardio: {
        equipamento: "Esteira (caminhada inclinada) ou bike",
        tempo: "15-20 min",
        intensidade: "moderada (RPE 5-6/10, consegue conversar com esforço)",
        objetivo: "Aumentar gasto calórico total sem comprometer recuperação muscular"
      },
      progressao:
        "Quando conseguir realizar todas as séries no limite superior de repetições com boa técnica por 2 treinos seguidos, aumente a carga em 2,5-5kg no exercício principal (agachamento)."
    },

    terca: {
      diaSemana: "terca",
      label: "Terça-feira",
      tipo: "treino",
      nome: "Costas, Peito, Ombros, Bíceps, Tríceps, Abdômen",
      grupos: ["Costas", "Peito", "Ombros", "Bíceps", "Tríceps", "Abdômen"],
      objetivoDia: "",
      observacaoDia:
        "Esse é um dia mais longo, com upper body completo. Ênfase extra em dorsais e puxadas, já que há uma leve projeção de ombros/cabeça para frente — fortalecer as costas ajuda diretamente na postura.",
      aquecimento: {
        equipamento: "Bike ergométrica ou remo ergômetro",
        tempo: "5-7 min",
        intensidade: "leve (RPE 4/10), seguido de 2-3 min de mobilidade de ombro (rotações, elevações com bastão ou elástico)"
      },
      exercicios: [
        {
          ordem: 1,
          nome: "Puxada frontal na polia (pegada aberta)",
          equipamento: "Polia alta com barra reta",
          series: 4,
          repeticoes: "10-12",
          descanso: "90s",
          cadencia: "2-1-2-0 (2s puxando, 1s contração, 2s soltando)",
          intensidade: "moderada-alta (RPE 7-8/10 nas últimas séries)",
          grupoMuscular: "Latíssimo do dorso, redondo maior, bíceps auxiliar",
          execucao: "Puxar a barra em direção à parte superior do peito, cotovelos apontando para baixo e levemente para trás, evitar jogar o corpo para trás.",
          errosComuns: "Puxar atrás da nuca (risco para ombro); usar impulso do tronco em vez de força das costas.",
          objetivo: "Exercício prioritário do dia — ativa fortemente o dorsal, essencial para melhora postural e \"efeito V\" nas costas."
        },
        {
          ordem: 2,
          nome: "Remada curvada com barra",
          equipamento: "Barra + anilhas",
          series: 4,
          repeticoes: "8-10",
          descanso: "90s",
          cadencia: "2-1-2-0",
          intensidade: "moderada-alta",
          grupoMuscular: "Dorsal, trapézio médio, romboides, bíceps auxiliar",
          execucao: "Tronco inclinado ~45°, lombar neutra (não arredondar), puxar a barra em direção ao umbigo.",
          errosComuns: "Arredondar a lombar (grande risco de lesão); usar as pernas para \"chicotear\" o peso.",
          objetivo: "Fortalece a musculatura que sustenta a postura ereta — prioridade para o caso."
        },
        {
          ordem: 3,
          nome: "Supino reto com halteres",
          equipamento: "Banco + halteres",
          series: 3,
          repeticoes: "10-12",
          descanso: "75s",
          cadencia: "2-0-2-0",
          intensidade: "moderada",
          grupoMuscular: "Peitoral maior, tríceps, deltoide anterior",
          execucao: "Halteres descem até a altura do peito com cotovelo em ~45° do corpo (não 90°), controle na descida.",
          errosComuns: "Descer rápido demais e \"quicar\" o peso; arquear demais a lombar.",
          objetivo: "Desenvolvimento de peitoral com maior amplitude e menor sobrecarga no ombro que a barra."
        },
        {
          ordem: 4,
          nome: "Desenvolvimento de ombros com halteres (sentado)",
          equipamento: "Banco com encosto + halteres",
          series: 3,
          repeticoes: "10-12",
          descanso: "75s",
          cadencia: "2-0-2-0",
          intensidade: "moderada",
          grupoMuscular: "Deltoide anterior e lateral, trapézio",
          execucao: "Halteres iniciam na altura das orelhas, subir sem travar cotovelo no topo.",
          errosComuns: "Arquear a lombar para empurrar o peso; amplitude incompleta.",
          objetivo: "Fortalece ombros de forma segura, importante para postura e simetria superior."
        },
        {
          ordem: 5,
          nome: "Elevação lateral",
          equipamento: "Halteres",
          series: 3,
          repeticoes: "15",
          descanso: "60s",
          cadencia: "2-1-2-0",
          intensidade: "moderada (foco em controle, não em carga)",
          grupoMuscular: "Deltoide lateral (isolado)",
          execucao: "Leve flexão de cotovelo, subir até a linha dos ombros, sem usar impulso do tronco.",
          errosComuns: "Usar peso excessivo e \"balançar\" o corpo; subir acima da linha dos ombros.",
          objetivo: "Isolamento para dar largura visual aos ombros."
        },
        {
          ordem: 6,
          nome: "Rosca direta com barra",
          equipamento: "Barra reta ou W + anilhas",
          series: 3,
          repeticoes: "10-12",
          descanso: "60s",
          cadencia: "2-0-2-0",
          intensidade: "moderada",
          grupoMuscular: "Bíceps braquial",
          execucao: "Cotovelos fixos ao lado do corpo, subir sem balançar o tronco.",
          errosComuns: "Usar impulso do quadril; amplitude incompleta.",
          objetivo: "Isolamento de bíceps, finalização do estímulo de puxada."
        },
        {
          ordem: 7,
          nome: "Tríceps na polia (pegada pronada)",
          equipamento: "Polia alta com barra reta ou corda",
          series: 3,
          repeticoes: "12-15",
          descanso: "60s",
          cadencia: "2-0-2-0",
          intensidade: "moderada",
          grupoMuscular: "Tríceps (as três cabeças)",
          execucao: "Cotovelos fixos junto ao corpo, extensão completa do braço, sem \"abrir\" o cotovelo.",
          errosComuns: "Usar o tronco para empurrar a barra; cotovelo se afastando do corpo.",
          objetivo: "Isolamento de tríceps, finalização do estímulo de empurrar."
        },
        {
          ordem: 8,
          nome: "Abdômen (prancha + elevação de pernas)",
          equipamento: "Colchonete",
          series: 3,
          repeticoes: "prancha 30-45s / elevação de pernas 15 reps",
          descanso: "45s",
          cadencia: "",
          intensidade: "moderada",
          grupoMuscular: "Core (reto abdominal, transverso, oblíquos)",
          execucao: "Prancha com quadril alinhado (nem subir nem afundar); elevação de pernas com lombar apoiada no chão.",
          errosComuns: "Prender a respiração na prancha; usar impulso na elevação de pernas.",
          objetivo: "Fortalecimento de core, que ajuda tanto na estabilidade dos exercícios compostos quanto na postura."
        }
      ],
      cardio: null,
      progressao: ""
    },

    quarta: {
      diaSemana: "quarta",
      label: "Quarta-feira",
      tipo: "treino",
      nome: "Glúteos (detalhes não especificados no documento)",
      grupos: ["Glúteos"],
      objetivoDia: "",
      observacaoDia:
        "O documento original cita a quarta-feira como o primeiro dos dois dias de glúteo da semana (junto com sexta-feira) e faz referência à \"mesma técnica de quarta\" ao descrever o hip thrust de sexta-feira, mas não detalha a ficha completa deste dia. Campo preparado para edição futura — nenhum exercício foi inventado.",
      aquecimento: { equipamento: "", tempo: "", intensidade: "" },
      exercicios: [],
      cardio: { equipamento: "", tempo: "", intensidade: "", objetivo: "" },
      progressao: "",
      incompleto: true
    },

    quinta: {
      diaSemana: "quinta",
      label: "Quinta-feira",
      tipo: "descanso",
      nome: "Descanso"
    },

    sexta: {
      diaSemana: "sexta",
      label: "Sexta-feira",
      tipo: "treino",
      nome: "Glúteos (ênfase), Quadríceps, Posteriores, Abdômen",
      grupos: ["Glúteos", "Quadríceps", "Posteriores", "Abdômen"],
      objetivoDia: "",
      observacaoDia:
        "Segundo dia de glúteo na semana — junto com quarta, garante o volume necessário para desenvolver essa região, que é o ponto de maior potencial. A ordem dos exercícios muda: começa por glúteo (prioridade máxima, mais energia disponível no início do treino) e depois complementa quadríceps e posterior.",
      aquecimento: {
        equipamento: "Bike ergométrica ou step",
        tempo: "5-7 min",
        intensidade: "leve (RPE 4/10), seguido de ativação de glúteo com elástico — 2 séries de 15 caminhadas laterais + 10 elevações de quadril no chão sem carga"
      },
      exercicios: [
        {
          ordem: 1,
          nome: "Elevação pélvica com barra (hip thrust) — variação unilateral progressiva",
          equipamento: "Banco + barra + anilhas",
          series: 4,
          repeticoes: "8-10",
          descanso: "90-120s",
          cadencia: "2-1-2-0",
          intensidade: "alta (RPE 8/10 — pode usar carga mais pesada que na quarta, já que é o primeiro exercício com energia total)",
          grupoMuscular: "Glúteo máximo",
          execucao: "Mesma técnica de quarta — costas na altura da escápula no banco, subir com extensão completa de quadril, contração forte no topo.",
          errosComuns: "Hiperextensão lombar; perder o apoio correto da barra no quadril (usar almofada sempre).",
          objetivo: "Repetir o exercício de maior evidência para glúteo, agora com prioridade de carga por ser o primeiro do treino — essencial para progressão consistente."
        },
        {
          ordem: 2,
          nome: "Agachamento búlgaro (afundo com apoio traseiro)",
          equipamento: "Banco + halteres",
          series: 3,
          repeticoes: "10-12 por perna",
          descanso: "90s",
          cadencia: "2-1-2-0",
          intensidade: "moderada-alta",
          grupoMuscular: "Glúteo, quadríceps (unilateral — ajuda a corrigir eventuais assimetrias entre os lados)",
          execucao: "Pé de trás apoiado no banco, tronco levemente inclinado à frente (mais inclinação = mais glúteo), descer até quase tocar o joelho de trás no chão.",
          errosComuns: "Dar passo curto demais (perde amplitude); joelho da frente ultrapassando muito a ponta do pé de forma instável.",
          objetivo: "Excelente para glúteo com componente unilateral, trabalha estabilidade e força ao mesmo tempo."
        },
        {
          ordem: 3,
          nome: "Leg press 45° (pés altos e afastados)",
          equipamento: "Máquina leg press",
          series: 3,
          repeticoes: "12-15",
          descanso: "75s",
          cadencia: "2-0-1-0",
          intensidade: "moderada",
          grupoMuscular: "Glúteo e posterior (a posição dos pés mais alta na plataforma desloca ênfase do quadríceps para glúteo/posterior)",
          execucao: "Pés na parte superior da plataforma, afastados na largura do quadril, não travar joelho na extensão.",
          errosComuns: "Descer demais tirando o quadril do encosto.",
          objetivo: "Variação de leg press com foco em glúteo/posterior, complementando o hip thrust e o búlgaro sem sobrecarregar ainda mais a lombar."
        },
        {
          ordem: 4,
          nome: "Stiff unilateral com halter",
          equipamento: "Halteres",
          series: 3,
          repeticoes: "10-12 por perna",
          descanso: "75s",
          cadencia: "3-1-1-0",
          intensidade: "moderada",
          grupoMuscular: "Posterior de coxa e glúteo (com forte componente de equilíbrio e estabilidade)",
          execucao: "Apoio em uma perna, tronco e perna de trás formam uma linha reta ao inclinar, halter desce próximo à perna de apoio.",
          errosComuns: "Perder o equilíbrio e compensar com rotação de quadril; arredondar a lombar.",
          objetivo: "Variação unilateral do stiff, trabalha estabilidade além de força — importante para prevenir desequilíbrios musculares entre os lados."
        },
        {
          ordem: 5,
          nome: "Cadeira extensora",
          equipamento: "Máquina extensora",
          series: 3,
          repeticoes: "15",
          descanso: "60s",
          cadencia: "2-1-2-0",
          intensidade: "moderada",
          grupoMuscular: "Quadríceps (isolamento)",
          execucao: "Contração total no topo, controle na descida.",
          errosComuns: "",
          objetivo: "Volume complementar de quadríceps, já que o foco principal do dia foi glúteo/posterior."
        },
        {
          ordem: 6,
          nome: "Abdômen (elevação de quadril + prancha lateral)",
          equipamento: "Colchonete",
          series: 3,
          repeticoes: "elevação de quadril 15-20 reps / prancha lateral 20-30s por lado",
          descanso: "45s",
          cadencia: "",
          intensidade: "moderada",
          grupoMuscular: "Core, reto abdominal inferior, oblíquos",
          execucao: "Na elevação de quadril, subir o quadril do chão contraindo abdômen inferior, sem impulso; na prancha lateral, quadril alinhado sem cair.",
          errosComuns: "Usar impulso das pernas na elevação de quadril.",
          objetivo: "Fortalecimento de core com ênfase diferente da terça (foco em porção inferior do abdômen e oblíquos)."
        }
      ],
      cardio: null,
      progressao: ""
    },

    sabado: {
      diaSemana: "sabado",
      label: "Sábado",
      tipo: "treino",
      nome: "Costas, Ombros, Braços, Abdômen + Cardio",
      grupos: ["Costas", "Ombros", "Braços", "Abdômen"],
      objetivoDia: "",
      observacaoDia:
        "Fechando a semana reforçando upper body — esse segundo dia de costas/ombros na semana é importante para consolidar o trabalho postural iniciado na terça, além de dar volume extra para braços.",
      aquecimento: {
        equipamento: "Bike ergométrica ou remo ergômetro",
        tempo: "5-7 min",
        intensidade: "leve (RPE 4/10), seguido de mobilidade de ombro com elástico (rotação externa/interna, 2x15 cada lado)"
      },
      exercicios: [
        {
          ordem: 1,
          nome: "Remada baixa na polia (pegada neutra)",
          equipamento: "Polia baixa + triângulo",
          series: 4,
          repeticoes: "10-12",
          descanso: "90s",
          cadencia: "2-1-2-0",
          intensidade: "moderada-alta (RPE 7-8/10)",
          grupoMuscular: "Dorsal, trapézio médio, romboides",
          execucao: "Tronco ereto (leve inclinação para trás é normal), puxar o triângulo em direção ao abdômen, cotovelos passando próximos ao corpo.",
          errosComuns: "Usar impulso do tronco (efeito \"gangorra\"); arredondar as costas no início do movimento.",
          objetivo: "Exercício prioritário do dia — reforça o trabalho de dorsal iniciado na terça, essencial para a postura."
        },
        {
          ordem: 2,
          nome: "Puxada na polia com pegada supinada",
          equipamento: "Polia alta + barra reta",
          series: 3,
          repeticoes: "10-12",
          descanso: "90s",
          cadencia: "2-1-2-0",
          intensidade: "moderada-alta",
          grupoMuscular: "Dorsal (ênfase na porção inferior) + bíceps auxiliar",
          execucao: "Puxar em direção ao peito, cotovelos descendo próximos ao corpo, evitar balançar o tronco.",
          errosComuns: "Usar pegada muito fechada sem necessidade; puxar com o corpo em vez das costas.",
          objetivo: "Variação de puxada com pegada supinada, que recruta mais bíceps junto e trabalha o dorsal em ângulo levemente diferente da terça."
        },
        {
          ordem: 3,
          nome: "Desenvolvimento militar com barra (em pé ou sentado)",
          equipamento: "Barra + rack (ou smith)",
          series: 3,
          repeticoes: "8-10",
          descanso: "90s",
          cadencia: "2-0-2-0",
          intensidade: "moderada-alta",
          grupoMuscular: "Deltoide anterior, trapézio, core (estabilização se feito em pé)",
          execucao: "Barra parte da altura dos ombros, sobe em linha reta sem hiperestender a lombar.",
          errosComuns: "Arquear excessivamente as costas para \"ajudar\" a subir o peso.",
          objetivo: "Exercício composto de ombro, complementa o desenvolvimento com halteres feito na terça com padrão de movimento diferente."
        },
        {
          ordem: 4,
          nome: "Elevação posterior (crucifixo invertido)",
          equipamento: "Halteres ou peck deck invertido",
          series: 3,
          repeticoes: "15",
          descanso: "60s",
          cadencia: "2-1-2-0",
          intensidade: "moderada",
          grupoMuscular: "Deltoide posterior, trapézio médio",
          execucao: "Tronco inclinado à frente (ou sentado no peck deck), abrir os braços em arco, contraindo entre as escápulas no topo.",
          errosComuns: "Usar peso excessivo e perder amplitude; balançar o tronco para gerar impulso.",
          objetivo: "Exercício-chave para a postura — deltoide posterior é frequentemente fraco em quem tem ombros projetados para frente; fortalecer aqui ajuda diretamente a \"puxar\" os ombros para trás."
        },
        {
          ordem: 5,
          nome: "Rosca alternada com halteres",
          equipamento: "Halteres",
          series: 3,
          repeticoes: "10-12 por braço",
          descanso: "60s",
          cadencia: "2-0-2-0",
          intensidade: "moderada",
          grupoMuscular: "Bíceps braquial",
          execucao: "Cotovelo fixo ao lado do corpo, girar o punho durante a subida (supinação), controle total na descida.",
          errosComuns: "Balançar o tronco para completar a repetição.",
          objetivo: "Variação de bíceps diferente da barra usada na terça, maior amplitude por trabalhar cada braço isoladamente."
        },
        {
          ordem: 6,
          nome: "Tríceps testa com barra W",
          equipamento: "Banco + barra W",
          series: 3,
          repeticoes: "10-12",
          descanso: "60s",
          cadencia: "2-0-2-0",
          intensidade: "moderada",
          grupoMuscular: "Tríceps (cabeça longa, principalmente)",
          execucao: "Deitado, cotovelos fixos apontando para o teto, descer a barra em direção à testa com controle.",
          errosComuns: "Abrir os cotovelos durante o movimento; descer rápido demais (risco para cotovelo).",
          objetivo: "Complementa o tríceps na polia feito na terça, com maior ênfase na cabeça longa do músculo."
        },
        {
          ordem: 7,
          nome: "Abdômen (bicicleta + prancha)",
          equipamento: "Colchonete",
          series: 3,
          repeticoes: "bicicleta 20 reps (10 por lado) / prancha 30-45s",
          descanso: "45s",
          cadencia: "",
          intensidade: "moderada",
          grupoMuscular: "Reto abdominal, oblíquos",
          execucao: "Na bicicleta, cotovelo toca o joelho oposto com rotação de tronco controlada, sem puxar o pescoço.",
          errosComuns: "Puxar a cabeça com as mãos durante a bicicleta.",
          objetivo: "Fechamento da semana de abdômen, trabalhando rotação de tronco (diferente da terça e sexta)."
        }
      ],
      cardio: {
        equipamento: "Esteira, elíptico ou bike",
        tempo: "15-20 min",
        intensidade: "moderada (RPE 5-6/10)",
        objetivo: "Gasto calórico adicional, fechando a semana com 3 sessões de cardio (segunda, quarta, sábado)"
      },
      progressao: ""
    },

    domingo: {
      diaSemana: "domingo",
      label: "Domingo",
      tipo: "descanso",
      nome: "Descanso"
    }
  },

  resumoSemanal: {
    volumeGluteo: "2x/semana (quarta e sexta) — adequado para hipertrofia",
    volumeCostasPostura: "2x/semana (terça e sábado) — trabalha diretamente a projeção de ombros observada nas fotos",
    cardio: "3x/semana (segunda, quarta, sábado) — moderado, sem exagero",
    deficitCalorico: "~17%, com proteína alta para preservar massa magra"
  },

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
