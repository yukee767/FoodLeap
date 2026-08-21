import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container grid gap-8 py-10 md:grid-cols-3">
        <div>
          <h4 className="font-semibold">FoodLeap</h4>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Comer bem e prático, sem neura. Receitas diárias que se adaptam ao seu gosto.
          </p>
        </div>
        <div>
          <h5 className="text-sm font-medium">Explorar</h5>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/receitas" className="hover:text-foreground">
                Receitas
              </Link>
            </li>
            <li>
              <Link href="/ocasioes" className="hover:text-foreground">
                Ocasiões
              </Link>
            </li>
            <li>
              <Link href="/dieta" className="hover:text-foreground">
                Dieta personalizada
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h5 className="text-sm font-medium">Produto</h5>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/dieta" className="hover:text-foreground">
                Planos
              </Link>
            </li>
            <li>
              <Link href="/" className="hover:text-foreground">
                Sobre
              </Link>
            </li>
            <li>
              <span className="text-xs">© 2026 FoodLeap. MIT.</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
