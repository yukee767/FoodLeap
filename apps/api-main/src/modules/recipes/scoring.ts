export interface RecipeForScoring {
  id: string;
  slug: string;
  title: string;
  prep_time_min: number;
  difficulty: 'facil' | 'medio' | 'dificil';
  protein_main: string;
  kcal_range: 'baixa' | 'media' | 'alta';
  tags: string[];
  occasions: string[];
  ingredients: string[];
  cost: 'baixo' | 'medio' | 'alto';
  flavor: string;
}

export interface DietAnswersForScoring {
  goal?: string;
  restrictions?: string[];
  health_conditions?: string[];
  skill_level?: string;
  time_available?: string;
  favorite_protein?: string[];
  hated_ingredients?: string[];
  flavor?: string;
  budget?: string;
}

// Filtros hard - retorna false se deve eliminar
export function passesHardFilters(recipe: RecipeForScoring, answers: DietAnswersForScoring): boolean {
  // Q3 restrições
  if (answers.restrictions?.includes('vegano') && !recipe.tags.includes('vegano') && ['frango','carne','porco','peixe_branco','salmao_atum','ovo'].includes(recipe.protein_main)) return false;
  if (answers.restrictions?.includes('vegetariano') && ['carne','porco','peixe_branco','salmao_atum'].includes(recipe.protein_main)) return false;
  if (answers.restrictions?.includes('sem_lactose') && recipe.tags.includes('lactose')) return false;

  // Q13 aversão
  if (answers.hated_ingredients?.some((h) => h !== 'outro' && recipe.ingredients.includes(h))) return false;

  // Q8 tempo
  const timeMap: Record<string, number> = { '15min': 15, '30min': 30, '45min': 45, '60min': 60 };
  const maxTime = timeMap[answers.time_available ?? '60min'] ?? 60;
  if (recipe.prep_time_min > maxTime + 10) return false;

  // Q5 habilidade
  if (answers.skill_level === 'iniciante' && recipe.difficulty === 'dificil') return false;
  if (answers.skill_level === 'iniciante' && recipe.ingredients.length > 5) return false;

  return true;
}

export function scoreRecipe(recipe: RecipeForScoring, answers: DietAnswersForScoring, occasion?: string): number {
  if (!passesHardFilters(recipe, answers)) return -1;

  let score = 0;

  // proteína 30
  if (answers.favorite_protein?.includes(recipe.protein_main)) score += 30;
  else if (answers.favorite_protein?.length) score += 5; // leve bonus se não está mas não é odiada

  // tempo 25
  const timeMap: Record<string, number> = { '15min': 15, '30min': 30, '45min': 45, '60min': 60 };
  const maxTime = timeMap[answers.time_available ?? '60min'] ?? 60;
  if (recipe.prep_time_min <= maxTime) score += 25;
  else if (recipe.prep_time_min <= maxTime + 5) score += 10;

  // objetivo 20
  if (answers.goal === 'emagrecer' && recipe.kcal_range === 'baixa') score += 20;
  else if (answers.goal === 'ganhar_massa' && recipe.protein_main !== 'vegano' && recipe.tags.includes('proteina_alta')) score += 20;
  else if (answers.goal === 'manter_saudavel' && recipe.tags.includes('saudavel')) score += 20;
  else score += 10;

  // sabor 10
  if (answers.flavor && recipe.flavor === answers.flavor) score += 10;

  // custo 10
  if (answers.budget === 'economico' && recipe.cost === 'baixo') score += 10;
  else if (answers.budget === 'confortavel' || !answers.budget) score += 5;

  // ocasião 5
  if (occasion && recipe.occasions.includes(occasion)) score += 5;

  // penalidade repetição (mock)
  // -10 se ingrediente já repetido semana (será aplicado no gerador de plano)

  return score;
}

// Mock recipes para dev sem DB
export const MOCK_RECIPES: RecipeForScoring[] = [
  { id: '11111111-1111-4111-8111-111111111111', slug: 'frango-cremoso-low-carb', title: 'Frango Cremoso Low Carb', prep_time_min: 20, difficulty: 'facil', protein_main: 'frango', kcal_range: 'baixa', tags: ['low_carb','saudavel','proteina_alta'], occasions: ['rapido','marmita','fitness'], ingredients: ['frango','creme','brocolis'], cost: 'medio', flavor: 'cremoso' },
  { id: '22222222-2222-4222-8222-222222222222', slug: 'salmao-grelhado-romantico', title: 'Salmão Grelhado Romântico', prep_time_min: 30, difficulty: 'medio', protein_main: 'salmao_atum', kcal_range: 'media', tags: ['saudavel'], occasions: ['romantico','fim_de_semana'], ingredients: ['salmao','aspargos','limao'], cost: 'alto', flavor: 'mediterraneo' },
  { id: '33333333-3333-4333-8333-333333333333', slug: 'omelete-rapido-5min', title: 'Omelete Rápido 5min', prep_time_min: 5, difficulty: 'facil', protein_main: 'ovo', kcal_range: 'baixa', tags: ['low_carb','saudavel'], occasions: ['rapido','cafe'], ingredients: ['ovo','queijo'], cost: 'baixo', flavor: 'caseirinho' },
  { id: '44444444-4444-4444-8444-444444444444', slug: 'feijoada-familia', title: 'Feijoada Família', prep_time_min: 60, difficulty: 'dificil', protein_main: 'carne', kcal_range: 'alta', tags: ['caseirinho'], occasions: ['familia','fim_de_semana'], ingredients: ['feijao','carne','linguica'], cost: 'medio', flavor: 'caseirinho' },
  { id: '55555555-5555-4555-8555-555555555555', slug: 'salada-vegana-colorida', title: 'Salada Vegana Colorida', prep_time_min: 15, difficulty: 'facil', protein_main: 'grao_lentilha', kcal_range: 'baixa', tags: ['vegano','vegetariano','saudavel'], occasions: ['rapido','vegano','fitness'], ingredients: ['grao','tomate','pepino'], cost: 'baixo', flavor: 'mediterraneo' },
];

export function rankRecipes(recipes: RecipeForScoring[], answers: DietAnswersForScoring, occasion?: string) {
  return recipes
    .map((r) => ({ recipe: r, score: scoreRecipe(r, answers, occasion) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score)
    // diversifica proteína (não repetir 2 seguidas)
    .reduce((acc: typeof ranked, cur) => {
      const last = acc[acc.length - 1];
      if (last && last.recipe.protein_main === cur.recipe.protein_main) {
        // tenta inserir depois, penaliza
        cur.score -= 5;
      }
      acc.push(cur);
      return acc.sort((a, b) => b.score - a.score);
    }, [] as { recipe: RecipeForScoring; score: number }[]);
}

const ranked: { recipe: RecipeForScoring; score: number }[] = [];
