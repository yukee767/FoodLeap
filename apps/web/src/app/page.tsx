import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Heart, Utensils, Sparkles, Flame, Timer, Leaf, Star, Smartphone, Apple, Play, ChefHat } from 'lucide-react';

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero App-First */}
      <section className="relative bg-[#FFFBF5] dark:bg-zinc-950 border-b">
        {/* blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-orange-400/30 via-amber-400/20 to-red-400/20 blur-[80px] -z-10" />
        <div className="pointer-events-none absolute top-32 -left-32 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-200/20 blur-[70px] -z-10" />

        <div className="container py-12 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[55%_45%] items-center">
            {/* copy */}
            <div>
              <Badge variant="secondary" className="mb-4 gap-1.5 bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Novo • Mais de 12.000 rotinas criadas
              </Badge>

              <h1 className="text-5xl font-extrabold tracking-tighter leading-[0.95] md:text-6xl">
                Comer bem{' '}
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 bg-clip-text text-transparent">
                  cabe na sua rotina
                </span>
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground max-w-[36ch] text-balance">
                Receitas diárias e um plano feito para o seu gosto e tempo. Prático de seguir, gostoso de manter.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/dieta">
                  <Button size="lg" className="h-12 px-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 w-full sm:w-auto">
                    <Smartphone className="h-4 w-4" />
                    Baixar o app grátis
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#como-funciona">
                  <Button variant="outline" size="lg" className="h-12 px-8 rounded-full w-full sm:w-auto border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700">
                    Ver como funciona
                  </Button>
                </Link>
              </div>

              <div className="mt-6 flex items-center gap-3 text-sm">
                <div className="flex -space-x-2">
                  <img src="https://i.pravatar.cc/40?img=1" alt="" className="h-7 w-7 rounded-full border-2 border-white" />
                  <img src="https://i.pravatar.cc/40?img=2" alt="" className="h-7 w-7 rounded-full border-2 border-white" />
                  <img src="https://i.pravatar.cc/40?img=3" alt="" className="h-7 w-7 rounded-full border-2 border-white" />
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">4,8/5</span>
                  <span className="text-muted-foreground">• 2.431 avaliações</span>
                </div>
              </div>

              <div className="mt-4 hidden items-center gap-3 xl:flex">
                <a href="#" className="flex items-center gap-2 rounded-xl border bg-black px-4 py-2 text-white hover:bg-zinc-900">
                  <Apple className="h-5 w-5" />
                  <span className="text-xs leading-none">Baixar na<br /><span className="text-sm font-semibold">App Store</span></span>
                </a>
                <a href="#" className="flex items-center gap-2 rounded-xl border bg-black px-4 py-2 text-white hover:bg-zinc-900">
                  <Play className="h-5 w-5 fill-white" />
                  <span className="text-xs leading-none">Disponível no<br /><span className="text-sm font-semibold">Google Play</span></span>
                </a>
                <div className="ml-2 hidden h-16 w-16 items-center justify-center rounded-xl border bg-white p-1 xl:flex">
                  <div className="h-full w-full rounded-lg bg-zinc-900 flex items-center justify-center text-[8px] text-white">QR</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Grátis para começar • Sem cartão necessário</p>
            </div>

            {/* phone */}
            <div className="relative mx-auto w-full max-w-[340px] lg:ml-auto">
              <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-orange-200/40 to-amber-200/40 blur-2xl" />
              {/* floating cards */}
              <div className="absolute -left-6 top-10 hidden rounded-2xl border bg-white p-3 shadow-xl -rotate-2 md:flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600"><Timer className="h-5 w-5" /></span>
                <div className="text-xs"><p className="font-semibold">Hoje: Moqueca leve</p><p className="text-muted-foreground">28 min • 320 kcal</p></div>
              </div>
              <div className="absolute -right-4 bottom-16 hidden rounded-2xl border bg-white p-3 shadow-xl rotate-2 md:flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><Leaf className="h-5 w-5" /></span>
                <div className="text-xs"><p className="font-semibold">Plano da semana pronto</p><p className="text-muted-foreground">3 receitas • 2 marmitas</p></div>
              </div>

              {/* phone frame */}
              <div className="relative mx-auto h-[640px] w-[320px] rounded-[3rem] border-[10px] border-zinc-900 bg-zinc-900 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-24 rounded-b-2xl bg-zinc-900 z-20" />
                <div className="h-full w-full bg-white overflow-hidden flex flex-col">
                  <div className="relative h-[56px] shrink-0 bg-gradient-to-r from-orange-500 to-amber-500 flex items-end justify-center pb-3 pt-6 text-white font-bold text-[14px] tracking-wide z-0">
                    <span className="relative drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">FoodLeap</span>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-white/5 to-transparent backdrop-blur-[0.5px]" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/30" />
                  </div>
                  <div className="p-4 space-y-3 overflow-hidden">
                    <div className="rounded-2xl bg-orange-50 p-3 border border-orange-100">
                      <p className="text-xs font-semibold text-orange-700 flex items-center gap-1"><Sparkles className="h-3 w-3" /> Receita do Dia</p>
                      <p className="text-sm font-bold mt-1">Frango Cremoso Low Carb</p>
                      <p className="text-xs text-muted-foreground">20 min • Fácil • 320 kcal</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 p-3 border border-emerald-100">
                      <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1"><Heart className="h-3 w-3" /> Jantar Romântico</p>
                      <p className="text-sm font-bold mt-1">Salmão Grelhado</p>
                      <p className="text-xs text-muted-foreground">30 min • Para 2</p>
                    </div>
                    <div className="rounded-2xl bg-zinc-50 p-3 border">
                      <p className="text-xs font-semibold flex items-center gap-1"><Clock className="h-3 w-3" /> Sua Dieta</p>
                      <div className="mt-2 h-2 rounded-full bg-zinc-200 overflow-hidden"><div className="h-full w-[68%] bg-emerald-500" /></div>
                      <p className="text-xs mt-1 text-muted-foreground">8 de 15 perguntas • 2 min restantes</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      {['Frango','Peixe','Veg'].map((p,i)=>(
                        <div key={i} className="rounded-xl border bg-white p-2 text-center text-xs font-medium">{p}</div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-auto border-t bg-white p-3 flex justify-around">
                    <span className="h-6 w-6 rounded-full bg-orange-500" />
                    <span className="h-6 w-6 rounded-full bg-zinc-200" />
                    <span className="h-6 w-6 rounded-full bg-zinc-200" />
                    <span className="h-6 w-6 rounded-full bg-zinc-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 cards humanos */}
      <section className="container mt-16 md:mt-24">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="rounded-[1.5rem] border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 hover:shadow-xl hover:-translate-y-1 transition-all">
            <CardHeader>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white shadow"><Utensils className="h-5 w-5" /></span>
              <CardTitle className="mt-3">Todo dia, uma ideia que combina com você</CardTitle>
              <CardDescription>Receitas que respeitam seu tempo e seu paladar.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 border"><Clock className="h-3.5 w-3.5" /> 15 min</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 border"><Flame className="h-3.5 w-3.5" /> ~320 kcal</span>
            </CardContent>
          </Card>

          <Card className="rounded-[1.5rem] border-rose-100 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20 hover:shadow-xl hover:-translate-y-1 transition-all">
            <CardHeader>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500 text-white shadow"><Heart className="h-5 w-5" /></span>
              <CardTitle className="mt-3">Para cada momento, um prato certo</CardTitle>
              <CardDescription>Do almoço corrido ao jantar a dois.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 border"><ChefHat className="h-3.5 w-3.5" /> 12 ocasiões</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 border"><Timer className="h-3.5 w-3.5" /> 30 min</span>
            </CardContent>
          </Card>

          <Card className="rounded-[1.5rem] border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 hover:shadow-xl hover:-translate-y-1 transition-all">
            <CardHeader>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow"><Leaf className="h-5 w-5" /></span>
              <CardTitle className="mt-3">Sua rotina vira plano sem esforço</CardTitle>
              <CardDescription>Em 2 minutos você tem a semana organizada.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 border"><Sparkles className="h-3.5 w-3.5" /> 15 perguntas</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 border"><Clock className="h-3.5 w-3.5" /> 2 min</span>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* como funciona - dedicado */}
      <section id="como-funciona" className="relative bg-[#FFFBF5] dark:bg-zinc-950 border-y border-orange-100/50 py-20 md:py-28 overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -left-20 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-orange-400/20 via-amber-400/15 to-red-400/15 blur-[70px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-emerald-400/10 to-teal-200/10 blur-[80px]" />
        <div className="container relative">
          <div className="mx-auto max-w-[60ch] text-center">
            <Badge className="gap-1.5 bg-orange-100 text-orange-700 border-orange-200"><Sparkles className="h-3 w-3" /> Como funciona • De zero ao prato em 2 minutos</Badge>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              Seu gosto <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 bg-clip-text text-transparent">vira rotina</span>. Sem neura.
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Conte o que você ama, receba um plano que cabe no seu tempo e cozinhe com confiança. O app aprende com você a cada prato.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">12.000+ planos criados • 4,8/5 (2.431 avaliações) • 2 min para começar</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { n: '01', icon: Heart, title: 'Conte o que você gosta', desc: '15 perguntas visuais, não formulário chato. Proteínas, restrições, tempo e rotina.', grad: 'from-orange-500 to-amber-500', pill: 'Quiz de 2 minutos' },
              { n: '02', icon: Leaf, title: 'Receba seu plano vivo', desc: 'Receita do dia + semana organizada + lista de compras por corredor.', grad: 'from-emerald-500 to-teal-500', pill: 'Semana pronta' },
              { n: '03', icon: Utensils, title: 'Cozinhe sem neura', desc: 'Passo a passo com foto, timer integrado e substituições em 1 toque.', grad: 'from-rose-500 to-pink-500', pill: 'Modo mãos livres' },
              { n: '04', icon: Star, title: 'Avalie e evolua', desc: 'Ame / ok / não curti e o app aprende seu paladar. Favoritos viram repetição.', grad: 'from-amber-500 to-orange-500', pill: 'Aprendizado' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.n} className="rounded-[1.75rem] border bg-white p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${s.grad} text-white shadow`}><Icon className="h-5 w-5" /></span>
                    <span className="text-[42px] font-black leading-none tracking-tighter bg-gradient-to-br from-orange-500 to-amber-500 bg-clip-text text-transparent">{s.n}</span>
                  </div>
                  <div>
                    <h3 className="font-bold">{s.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                    <span className="mt-3 inline-flex rounded-full bg-zinc-50 border px-2.5 py-1 text-xs">{s.pill}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex justify-center">
            <Link href="/dieta">
              <Button size="lg" className="rounded-full bg-zinc-900 px-8 h-12">Criar meu plano agora <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA app */}
      <section className="container mt-16 mb-8">
        <div className="rounded-[2rem] bg-zinc-900 text-white p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold">Leve o FoodLeap no bolso</h3>
            <p className="text-zinc-400">Instale o app e receba sua receita todo dia às 8h.</p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black">App Store</a>
              <a href="#" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black">Google Play</a>
              <span className="hidden md:inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-xs">Disponível como PWA • Instale em 1 toque</span>
            </div>
          </div>
          <div className="hidden h-24 w-24 rounded-xl bg-white md:flex items-center justify-center text-zinc-900 text-xs">QR</div>
        </div>
      </section>
    </div>
  );
}
