import { AppDataSource } from '../config/data-source.js';

async function seed() {
  await AppDataSource.initialize();
  const ds = AppDataSource;

  // occasions 12
  const occasions = [
    ['romantico','Jantar Romântico','Receitas para impressionar a dois'],
    ['marmita','Marmita da Semana','Práticas e congeláveis'],
    ['kids','Kids','Coloridas e divertidas'],
    ['rapido','Rápido 15min','Em até 15 minutos'],
    ['fitness','Fitness & Light','Alta proteína, baixa kcal'],
    ['familia','Almoço em Família','Receitas que rendem'],
    ['amigos','Receber Amigos','Petiscos e tábuas'],
    ['fim_de_semana','Fim de Semana','Massas e assados'],
    ['economico','Econômico','Sabor gastando pouco'],
    ['lowcarb','Low Carb','Baixo carbo'],
    ['vegano','Vegano & Vegetariano','Sem carne'],
    ['cafe','Café da Manhã','Comece com energia'],
  ];
  for (const [slug, titulo, descricao] of occasions) {
    await ds.query(`INSERT INTO occasions (slug, titulo, descricao) VALUES ($1,$2,$3) ON CONFLICT (slug) DO NOTHING`, [slug, titulo, descricao]);
  }

  // sample recipes (3)
  const samples = [
    { slug: 'frango-cremoso-low-carb', title: 'Frango Cremoso Low Carb', description: 'Prático, saudável, 20min', instructions: '1. Corte frango\n2. Cozinhe\n3. Sirva', prep: 20, protein: 'frango', kcal: 'baixa', diff: 'facil' },
    { slug: 'salmao-grelhado-romantico', title: 'Salmão Grelhado Romântico', description: 'Elegante para jantar a dois, 30min', instructions: 'Grelhe salmão, legumes, vinho', prep: 30, protein: 'salmao_atum', kcal: 'media', diff: 'medio' },
    { slug: 'omelete-rapido-5min', title: 'Omelete Rápido 5min', description: 'Café da manhã proteico', instructions: 'Bata ovos, frite', prep: 5, protein: 'ovo', kcal: 'baixa', diff: 'facil' },
  ];
  for (const s of samples) {
    await ds.query(`INSERT INTO recipes (slug, title, description, instructions, prep_time_min, protein_main, kcal_range, difficulty) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (slug) DO NOTHING`,
      [s.slug, s.title, s.description, s.instructions, s.prep, s.protein, s.kcal, s.diff]);
  }

  console.log('seed done');
  await ds.destroy();
}

seed().catch((e) => { console.error(e); process.exit(1); });
