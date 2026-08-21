import { DietAnswersSchema } from '@foodleap/shared-types';
import { z } from 'zod';

// Schemas por step para validação incremental RHF
export const dietStepSchemas: Record<number, z.ZodTypeAny> = {
  1: DietAnswersSchema.pick({ goal: true }),
  2: DietAnswersSchema.pick({ activity_level: true }),
  3: DietAnswersSchema.pick({ restrictions: true }),
  4: DietAnswersSchema.pick({ health_conditions: true }),
  5: DietAnswersSchema.pick({ skill_level: true }),
  6: DietAnswersSchema.pick({ routine_weekday: true }),
  7: DietAnswersSchema.pick({ routine_weekend: true }),
  8: DietAnswersSchema.pick({ time_available: true }),
  9: DietAnswersSchema.pick({ cook_frequency: true }),
  10: DietAnswersSchema.pick({ budget: true }),
  11: DietAnswersSchema.pick({ favorite_protein: true }),
  12: DietAnswersSchema.pick({ carbs: true }),
  13: DietAnswersSchema.pick({ hated_ingredients: true }),
  14: DietAnswersSchema.pick({ flavor: true }),
  15: DietAnswersSchema.pick({ hardest_meal: true }),
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
