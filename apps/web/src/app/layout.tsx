import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'FoodLeap - Receitas e Dieta Inteligente',
  description: 'Receitas diárias personalizadas e dieta integrada sem restrições malucas.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
