import { DietAnswersSchema } from '@foodleap/shared-types';
import { z } from 'zod';

// Schemas por step para validação incremental RHF - não usa pick devido superRefine (ZodEffects)
export const dietStepSchemas: Record<number, z.ZodTypeAny> = {
  1: z.object({ goal: z.enum(['emagrecer','ganhar_massa','manter_saudavel','energia','aprender_cozinhar']) }),
  2: z.object({ activity_level: z.enum(['sedentario','leve','moderado','intenso']) }),
  3: z.object({ restrictions: z.array(z.enum(['nenhuma','vegetariano','vegano','sem_lactose','sem_gluten','low_carb','alergia'])).min(1) }),
  4: z.object({ health_conditions: z.array(z.enum(['nenhuma','diabetes','hipertensao','colesterol_alto','intestino_sensivel','sop'])).optional().default([]) }),
  5: z.object({ skill_level: z.enum(['iniciante','intermediario','avancado']) }),
  6: z.object({ routine_weekday: z.enum(['correria','hibrido','home','irregular']) }),
  7: z.object({ routine_weekend: z.enum(['praticidade','mais_tempo','receber','como_fora']) }),
  8: z.object({ time_available: z.enum(['15min','30min','45min','60min']) }),
  9: z.object({ cook_frequency: z.enum(['todo_dia','2_3x','1x','decidir_semana']) }),
  10: z.object({ budget: z.enum(['economico','medio','confortavel','tanto_faz']).optional() }),
  11: z.object({ favorite_protein: z.array(z.enum(['frango','carne','porco','peixe_branco','salmao_atum','ovo','grao_lentilha','tofu_soja'])).min(1).max(3) }),
  12: z.object({ carbs: z.array(z.enum(['arroz','macarrao','pao_tapioca','batata_mandioca','cuscuz','quinoa_aveia','evito_carb_noite'])).min(1) }),
  13: z.object({ hated_ingredients: z.array(z.enum(['coentro','pimentao','cebola','berinjela','cogumelos','figado','outro'])).optional().default([]) }),
  14: z.object({ flavor: z.enum(['caseirinho','picante','agridoce','mediterraneo','cremoso']).optional() }),
  15: z.object({ hardest_meal: z.enum(['cafe','almoco','jantar','lanches','todas']) }),
};

export function validateStep(step: number, answers: Record<string, unknown>) {
  const schema = dietStepSchemas[step];
  return schema.safeParse(answers);
}

export const optionLabels: Record<string, string> = {
  emagrecer: 'Emagrecer',
  ganhar_massa: 'Ganhar massa',
  manter_saudavel: 'Manter saudável',
  energia: 'Mais energia',
  aprender_cozinhar: 'Aprender a cozinhar',
  sedentario: 'Sedentário',
  leve: 'Leve (1-2x/semana)',
  moderado: 'Moderado (3-4x)',
  intenso: 'Intenso (5x+)',
  nenhuma: 'Nenhuma',
  vegetariano: 'Vegetariano',
  vegano: 'Vegano',
  sem_lactose: 'Sem lactose',
  sem_gluten: 'Sem glúten',
  low_carb: 'Low carb',
  correria: 'Correria total',
  hibrido: 'Híbrido',
  home: 'Home office',
  irregular: 'Horários irregulares',
  praticidade: 'Praticidade',
  mais_tempo: 'Mais tempo',
  receber: 'Gosto de receber',
  como_fora: 'Como fora',
  '15min': 'Até 15 min',
  '30min': 'Até 30 min',
  '45min': 'Até 45 min',
  '60min': '60 min+',
  todo_dia: 'Todo dia',
  '2_3x': '2-3x reaproveitar',
  '1x': '1x marmitas',
  decidir_semana: 'Decidir semanal',
  economico: 'Econômico (<R$150)',
  medio: 'Médio (R$150-300)',
  confortavel: 'Confortável (R$300+)',
  tanto_faz: 'Tanto faz',
  frango: 'Frango',
  carne: 'Carne',
  porco: 'Porco',
  peixe_branco: 'Peixe branco',
  salmao_atum: 'Salmão/Atum',
  ovo: 'Ovo',
  grao_lentilha: 'Grão/Lentilha',
  tofu_soja: 'Tofu/Soja',
};

export { DietAnswersSchema };
