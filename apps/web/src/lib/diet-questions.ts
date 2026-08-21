export const DIET_QUESTIONS = [
  { id: 1, block: 'A' as const, key: 'goal', question: 'Qual seu principal objetivo agora?', type: 'single_choice' as const, options: ['emagrecer','ganhar_massa','manter_saudavel','energia','aprender_cozinhar'], required: true },
  { id: 2, block: 'A' as const, key: 'activity_level', question: 'Como você descreve sua rotina de atividade física?', type: 'single_choice' as const, options: ['sedentario','leve','moderado','intenso'], required: true },
  { id: 3, block: 'A' as const, key: 'restrictions', question: 'Você tem alguma restrição ou dieta?', type: 'multi_choice' as const, options: ['nenhuma','vegetariano','vegano','sem_lactose','sem_gluten','low_carb','alergia'], required: true },
  { id: 4, block: 'A' as const, key: 'health_conditions', question: 'Alguma condição que devemos considerar?', type: 'multi_choice' as const, options: ['nenhuma','diabetes','hipertensao','colesterol_alto','intestino_sensivel','sop'], required: false },
  { id: 5, block: 'A' as const, key: 'skill_level', question: 'Qual seu nível na cozinha?', type: 'single_choice' as const, options: ['iniciante','intermediario','avancado'], required: true },
  { id: 6, block: 'B' as const, key: 'routine_weekday', question: 'Como é seu DIA DE SEMANA?', type: 'single_choice' as const, options: ['correria','hibrido','home','irregular'], required: true },
  { id: 7, block: 'B' as const, key: 'routine_weekend', question: 'E seu FIM DE SEMANA?', type: 'single_choice' as const, options: ['praticidade','mais_tempo','receber','como_fora'], required: true },
  { id: 8, block: 'B' as const, key: 'time_available', question: 'Quanto tempo você TOPA cozinhar por refeição?', type: 'single_choice' as const, options: ['15min','30min','45min','60min'], required: true },
  { id: 9, block: 'B' as const, key: 'cook_frequency', question: 'Quantos dias você quer cozinhar na semana?', type: 'single_choice' as const, options: ['todo_dia','2_3x','1x','decidir_semana'], required: true },
  { id: 10, block: 'B' as const, key: 'budget', question: 'Seu orçamento semanal para mercado?', type: 'single_choice' as const, options: ['economico','medio','confortavel','tanto_faz'], required: false },
  { id: 11, block: 'C' as const, key: 'favorite_protein', question: 'Quais PROTEÍNAS você mais ama? (máx 3)', type: 'multi_choice' as const, options: ['frango','carne','porco','peixe_branco','salmao_atum','ovo','grao_lentilha','tofu_soja'], required: true },
  { id: 12, block: 'C' as const, key: 'carbs', question: 'E carboidratos / acompanhamentos?', type: 'multi_choice' as const, options: ['arroz','macarrao','pao_tapioca','batata_mandioca','cuscuz','quinoa_aveia','evito_carb_noite'], required: true },
  { id: 13, block: 'C' as const, key: 'hated_ingredients', question: 'Tem algum ingrediente que você ODEIA?', type: 'multi_choice' as const, options: ['coentro','pimentao','cebola','berinjela','cogumelos','figado','outro'], required: false },
  { id: 14, block: 'C' as const, key: 'flavor', question: 'Qual sabor te conquista?', type: 'single_choice' as const, options: ['caseirinho','picante','agridoce','mediterraneo','cremoso'], required: false },
  { id: 15, block: 'C' as const, key: 'hardest_meal', question: 'Qual sua refeição mais difícil do dia?', type: 'single_choice' as const, options: ['cafe','almoco','jantar','lanches','todas'], required: true },
] as const;

export type DietQuestion = typeof DIET_QUESTIONS[number];
