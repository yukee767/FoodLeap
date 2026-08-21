export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">FoodLeap 🍳</h1>
      <p className="mt-2 text-zinc-600">
        Receitas diárias que se adaptam ao seu gosto. Práticas, saudáveis e sem neura.
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-4">
          <h2 className="font-semibold">Receita do Dia</h2>
          <p className="text-sm text-zinc-500">Personalizada via /api/recipes/daily (cache_used - Ignite)</p>
        </div>
        <div className="rounded-xl border p-4">
          <h2 className="font-semibold">Jantar Romântico</h2>
          <p className="text-sm text-zinc-500">Filtro por ocasião</p>
        </div>
        <div className="rounded-xl border p-4">
          <h2 className="font-semibold">Sua Dieta</h2>
          <p className="text-sm text-zinc-500">15 perguntas → plano usuário + sistema</p>
        </div>
      </section>

      <section className="mt-8">
        <a href="/dieta" className="rounded-lg bg-black px-4 py-2 text-white">Começar dieta personalizada</a>
      </section>
    </main>
  );
}
