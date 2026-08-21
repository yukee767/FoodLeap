// Shared DTOs + Zod schemas - fonte única web <-> api-main <-> search-service
import { z } from 'zod';

export const DietQuestionSchema = z.object({
  id: z.number().min(1).max(15),
  key: z.string(),
  question: z.string(),
  type: z.enum(['single_choice', 'multi_choice', 'text']),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(true),
});

// 15 perguntas - espelha DIET_QUESTIONS keys 1:1
export const DietAnswersSchema = z
  .object({
    goal: z.enum(['emagrecer', 'ganhar_massa', 'manter_saudavel', 'energia', 'aprender_cozinhar'], { required_error: 'Escolha uma opção' }),
    activity_level: z.enum(['sedentario', 'leve', 'moderado', 'intenso']),
    restrictions: z.array(z.enum(['nenhuma', 'vegetariano', 'vegano', 'sem_lactose', 'sem_gluten', 'low_carb', 'alergia'])).min(1, 'Selecione pelo menos 1'),
    health_conditions: z.array(z.enum(['nenhuma', 'diabetes', 'hipertensao', 'colesterol_alto', 'intestino_sensivel', 'sop'])).optional().default([]),
    skill_level: z.enum(['iniciante', 'intermediario', 'avancado']),
    routine_weekday: z.enum(['correria', 'hibrido', 'home', 'irregular']),
    routine_weekend: z.enum(['praticidade', 'mais_tempo', 'receber', 'como_fora']),
    time_available: z.enum(['15min', '30min', '45min', '60min']),
    cook_frequency: z.enum(['todo_dia', '2_3x', '1x', 'decidir_semana']),
    budget: z.enum(['economico', 'medio', 'confortavel', 'tanto_faz']).optional(),
    favorite_protein: z.array(z.enum(['frango', 'carne', 'porco', 'peixe_branco', 'salmao_atum', 'ovo', 'grao_lentilha', 'tofu_soja'])).min(1, 'Escolha pelo menos 1').max(3, 'Máximo 3 proteínas'),
    carbs: z.array(z.enum(['arroz', 'macarrao', 'pao_tapioca', 'batata_mandioca', 'cuscuz', 'quinoa_aveia', 'evito_carb_noite'])).min(1),
    hated_ingredients: z.array(z.enum(['coentro', 'pimentao', 'cebola', 'berinjela', 'cogumelos', 'figado', 'outro'])).optional().default([]),
    flavor: z.enum(['caseirinho', 'picante', 'agridoce', 'mediterraneo', 'cremoso']).optional(),
    hardest_meal: z.enum(['cafe', 'almoco', 'jantar', 'lanches', 'todas']),
  })
  .superRefine((val, ctx) => {
    if (val.restrictions.includes('nenhuma' as never) && val.restrictions.length > 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['restrictions'], message: "'Nenhuma' não pode combinar com outras" });
    }
    if (val.health_conditions?.includes('nenhuma' as never) && (val.health_conditions?.length ?? 0) > 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['health_conditions'], message: "'Nenhuma' não pode combinar" });
    }
  });

export type DietAnswers = z.infer<typeof DietAnswersSchema>;
export type DietAnswerKey = keyof DietAnswers;

export const DietProfilePayloadSchema = z.object({
  userId: z.string().uuid(),
  answers: DietAnswersSchema,
});

export const DIET_QUESTIONS_META = [
  { id: 1, key: 'goal' as const, block: 'A' as const },
  { id: 2, key: 'activity_level' as const, block: 'A' as const },
  { id: 3, key: 'restrictions' as const, block: 'A' as const },
  { id: 4, key: 'health_conditions' as const, block: 'A' as const },
  { id: 5, key: 'skill_level' as const, block: 'A' as const },
  { id: 6, key: 'routine_weekday' as const, block: 'B' as const },
  { id: 7, key: 'routine_weekend' as const, block: 'B' as const },
  { id: 8, key: 'time_available' as const, block: 'B' as const },
  { id: 9, key: 'cook_frequency' as const, block: 'B' as const },
  { id: 10, key: 'budget' as const, block: 'B' as const },
  { id: 11, key: 'favorite_protein' as const, block: 'C' as const },
  { id: 12, key: 'carbs' as const, block: 'C' as const },
  { id: 13, key: 'hated_ingredients' as const, block: 'C' as const },
  { id: 14, key: 'flavor' as const, block: 'C' as const },
  { id: 15, key: 'hardest_meal' as const, block: 'C' as const },
] as const;

export function getBlockForStep(step: number): 'A' | 'B' | 'C' {
  if (step <= 5) return 'A';
  if (step <= 10) return 'B';
  return 'C';
}

export const RecipeSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  prep_time_min: z.number().int().positive(),
  difficulty: z.enum(['facil', 'medio', 'dificil']),
  protein_main: z.string(),
  kcal_range: z.enum(['baixa', 'media', 'alta']),
  tags: z.array(z.string()),
  occasions: z.array(z.string()),
  cover_url: z.string().url().optional(),
});

export type Recipe = z.infer<typeof RecipeSchema>;
