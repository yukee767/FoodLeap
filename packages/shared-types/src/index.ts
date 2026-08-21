// Shared DTOs + Zod schemas - fonte única web <-> api-main <-> search-service
import { z } from 'zod';

// 15 perguntas - 3 blocos (Objetivo, Rotina, Paladar)
export const DietQuestionSchema = z.object({
  id: z.number().min(1).max(15),
  key: z.string(),
  question: z.string(),
  type: z.enum(['single_choice', 'multi_choice', 'text']),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(true),
});

export const DietAnswersSchema = z.object({
  favorite_protein: z.array(z.enum(['frango','carne','porco','peixe_branco','salmao_atum','ovo','grao_lentilha','tofu_soja'])).min(1).max(3),
  restrictions: z.array(z.enum(['nenhuma','vegetariano','vegano','sem_lactose','sem_gluten','low_carb','alergia'])).min(1),
  goal: z.enum(['emagrecer','ganhar_massa','manter_saudavel','energia','aprender_cozinhar']),
  activity_level: z.enum(['sedentario','leve','moderado','intenso']),
  health_conditions: z.array(z.string()).optional(),
  skill_level: z.enum(['iniciante','intermediario','avancado']),
  routine_weekday: z.enum(['correria','hibrido','home','irregular']),
  routine_weekend: z.enum(['praticidade','mais_tempo','receber','como_fora']),
  time_available: z.enum(['15min','30min','45min','60min']),
  cook_frequency: z.enum(['todo_dia','2_3x','1x','decidir_semana']),
  budget: z.enum(['economico','medio','confortavel','tanto_faz']).optional(),
  proteins_loved: z.array(z.string()).min(1).max(3),
  carbs: z.array(z.string()).min(1),
  hated_ingredients: z.array(z.string()).optional(),
  flavor: z.enum(['caseirinho','picante','agridoce','mediterraneo','cremoso']).optional(),
  hardest_meal: z.enum(['cafe','almoco','jantar','lanches','todas']),
});

export type DietAnswers = z.infer<typeof DietAnswersSchema>;

export const RecipeSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  prep_time_min: z.number().int().positive(),
  difficulty: z.enum(['facil','medio','dificil']),
  protein_main: z.string(),
  kcal_range: z.enum(['baixa','media','alta']),
  tags: z.array(z.string()),
  occasions: z.array(z.string()),
});

export type Recipe = z.infer<typeof RecipeSchema>;
