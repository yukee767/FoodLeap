export const OCCASIONS = [
  { slug: 'romantico', titulo: 'Jantar Romântico', descricao: 'Receitas para impressionar a dois, luz baixa e vinho.', icon: 'Heart' as const },
  { slug: 'marmita', titulo: 'Marmita da Semana', descricao: 'Práticas, congeláveis e saudáveis para a correria.', icon: 'Package' as const },
  { slug: 'kids', titulo: 'Kids', descricao: 'Coloridas, divertidas e que as crianças amam.', icon: 'Baby' as const },
  { slug: 'rapido', titulo: 'Rápido 15min', descricao: 'Em até 15 minutos, sem neura.', icon: 'Timer' as const },
  { slug: 'fitness', titulo: 'Fitness & Light', descricao: 'Alta proteína, baixa kcal, objetivo em foco.', icon: 'Dumbbell' as const },
  { slug: 'familia', titulo: 'Almoço em Família', descricao: 'Receitas que rendem e reúnem todo mundo.', icon: 'Users' as const },
  { slug: 'amigos', titulo: 'Receber Amigos', descricao: 'Petiscos, drinks e tábuas para compartilhar.', icon: 'PartyPopper' as const },
  { slug: 'fim_de_semana', titulo: 'Fim de Semana', descricao: 'Com mais tempo: massas, assados e sobremesas.', icon: 'CalendarDays' as const },
  { slug: 'economico', titulo: 'Econômico', descricao: 'Sabor máximo gastando pouco.', icon: 'PiggyBank' as const },
  { slug: 'lowcarb', titulo: 'Low Carb', descricao: 'Baixo carbo, saciedade alta.', icon: 'Leaf' as const },
  { slug: 'vegano', titulo: 'Vegano & Vegetariano', descricao: 'Sem carne, com muito sabor.', icon: 'Sprout' as const },
  { slug: 'cafe', titulo: 'Café da Manhã', descricao: 'Comece o dia com energia.', icon: 'Coffee' as const },
] as const;

export type OccasionSlug = typeof OCCASIONS[number]['slug'];
export const OCCASION_SLUGS = OCCASIONS.map((o) => o.slug) as OccasionSlug[];

export function getOccasion(slug: string) {
  return OCCASIONS.find((o) => o.slug === slug);
}
