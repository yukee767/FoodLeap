import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// 15 perguntas - 3 blocos (A: Objetivo/Corpo, B: Rotina/Praticidade, C: Paladar)
// Decisão produto: wizard 1 pergunta/tela, progresso, cards com imagem
export const DIET_QUESTIONS = [
  { id: 1, block: 'A', key: 'goal', question: 'Qual seu principal objetivo agora?', type: 'single_choice', options: ['emagrecer','ganhar_massa','manter_saudavel','energia','aprender_cozinhar'], required: true },
  { id: 2, block: 'A', key: 'activity_level', question: 'Como você descreve sua rotina de atividade física?', type: 'single_choice', options: ['sedentario','leve','moderado','intenso'], required: true },
  { id: 3, block: 'A', key: 'restrictions', question: 'Você tem alguma restrição ou dieta?', type: 'multi_choice', options: ['nenhuma','vegetariano','vegano','sem_lactose','sem_gluten','low_carb','alergia'], required: true },
  { id: 4, block: 'A', key: 'health_conditions', question: 'Alguma condição que devemos considerar?', type: 'multi_choice', options: ['nenhuma','diabetes','hipertensao','colesterol_alto','intestino_sensivel','sop'], required: false },
  { id: 5, block: 'A', key: 'skill_level', question: 'Qual seu nível na cozinha?', type: 'single_choice', options: ['iniciante','intermediario','avancado'], required: true },
  { id: 6, block: 'B', key: 'routine_weekday', question: 'Como é seu DIA DE SEMANA?', type: 'single_choice', options: ['correria','hibrido','home','irregular'], required: true },
  { id: 7, block: 'B', key: 'routine_weekend', question: 'E seu FIM DE SEMANA?', type: 'single_choice', options: ['praticidade','mais_tempo','receber','como_fora'], required: true },
  { id: 8, block: 'B', key: 'time_available', question: 'Quanto tempo você TOPA cozinhar por refeição?', type: 'single_choice', options: ['15min','30min','45min','60min'], required: true },
  { id: 9, block: 'B', key: 'cook_frequency', question: 'Quantos dias você quer cozinhar na semana?', type: 'single_choice', options: ['todo_dia','2_3x','1x','decidir_semana'], required: true },
  { id: 10, block: 'B', key: 'budget', question: 'Seu orçamento semanal para mercado?', type: 'single_choice', options: ['economico','medio','confortavel','tanto_faz'], required: false },
  { id: 11, block: 'C', key: 'favorite_protein', question: 'Quais PROTEÍNAS você mais ama? (máx 3)', type: 'multi_choice', options: ['frango','carne','porco','peixe_branco','salmao_atum','ovo','grao_lentilha','tofu_soja'], required: true },
  { id: 12, block: 'C', key: 'carbs', question: 'E carboidratos / acompanhamentos?', type: 'multi_choice', options: ['arroz','macarrao','pao_tapioca','batata_mandioca','cuscuz','quinoa_aveia','evito_carb_noite'], required: true },
  { id: 13, block: 'C', key: 'hated_ingredients', question: 'Tem algum ingrediente que você ODEIA?', type: 'multi_choice', options: ['coentro','pimentao','cebola','berinjela','cogumelos','figado','outro'], required: false },
  { id: 14, block: 'C', key: 'flavor', question: 'Qual sabor te conquista?', type: 'single_choice', options: ['caseirinho','picante','agridoce','mediterraneo','cremoso'], required: false },
  { id: 15, block: 'C', key: 'hardest_meal', question: 'Qual sua refeição mais difícil do dia?', type: 'single_choice', options: ['cafe','almoco','jantar','lanches','todas'], required: true },
] as const;

// GET /api/diet/questions
router.get('/questions', (_req, res) => {
  res.json({ questions: DIET_QUESTIONS });
});

const ProfileSchema = z.object({
  userId: z.string().uuid(),
  answers: z.record(z.any()),
});

// POST /api/diet/profile - salva e gera plano; invalida Redis cache_used:diet:plan:{userId}
router.post('/profile', async (req, res) => {
  const parsed = ProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  // TODO: salvar em PostgreSQL diet_profiles + diet_answers, publicar evento diet.profile.updated via Redis pub/sub
  // Cache: DEL cache_used:diet:plan:{userId} e daily:{userId}:*
  res.status(201).json({ message: 'perfil salvo', planId: 'uuid_placeholder', next: `/api/diet/plan/${parsed.data.userId}` });
});

// GET /api/diet/plan/:userId - retorna dieta programada (usuário + sistema)
router.get('/plan/:userId', async (req, res) => {
  // TODO: Cache Redis cache_used:diet:plan:{userId} TTL 1h, fallback PostgreSQL + algoritmo scoring
  // Algoritmo MVP: filtros hard (Q3,Q13,Q8,Q5) + scoring ponderado (proteína 30 + tempo 25 + objetivo 20...)
  res.json({ userId: req.params.userId, week_start: new Date().toISOString().slice(0,10), meals: [] });
});

export default router;
