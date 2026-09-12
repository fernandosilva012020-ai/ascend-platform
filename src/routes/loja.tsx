import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Box,
  CheckCircle2,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/loja")({
  head: () => ({
    meta: [
      { title: "Loja — Projeto X" },
      { name: "description", content: "Produtos, ofertas e checkout." },
      { property: "og:title", content: "Loja — Projeto X" },
      { property: "og:description", content: "Produtos, ofertas e checkout." },
    ],
  }),
  component: Page,
});

function Page() {
  const [category, setCategory] = useState("todos");
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return products.filter((product) => {
      const matchesCategory = category === "todos" || product.category === category;
      const matchesSearch = !term || `${product.name} ${product.description}`.toLocaleLowerCase("pt-BR").includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  function addToCart(productName: string) {
    setCartCount((current) => current + 1);
    toast.success(`${productName} adicionado ao carrinho demonstrativo.`);
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="secondary" className="rounded-full px-3 py-1">Marketplace Projeto X</Badge>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">Loja</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Encontre produtos digitais, ferramentas e materiais para acelerar seus resultados.</p>
          </div>
          <Button variant="outline" size="lg" onClick={() => toast.info("O checkout será ativado com o provedor de pagamentos.")}>
            <ShoppingCart className="size-4" />Carrinho
            {cartCount > 0 ? <Badge className="ml-1 rounded-full px-2">{cartCount}</Badge> : null}
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Compra protegida", description: "Pagamento seguro", icon: ShieldCheck },
          { title: "Acesso rápido", description: "Produtos digitais", icon: Sparkles },
          { title: "Suporte especializado", description: "Ajuda quando precisar", icon: CheckCircle2 },
        ].map((benefit) => <Card key={benefit.title}><CardContent className="flex items-center gap-3 p-4"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><benefit.icon className="size-5" /></span><div><p className="text-sm font-semibold">{benefit.title}</p><p className="text-xs text-muted-foreground">{benefit.description}</p></div></CardContent></Card>)}
      </section>

      <section>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div><h2 className="font-display text-2xl font-bold">Produtos em destaque</h2><p className="mt-1 text-sm text-muted-foreground">Catálogo demonstrativo da futura loja.</p></div>
          <div className="relative w-full lg:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar produto..." className="pl-9" /></div>
        </div>

        <Tabs value={category} onValueChange={setCategory} className="mt-4 space-y-5">
          <TabsList className="h-auto w-full justify-start overflow-x-auto p-1 sm:w-fit">
            <TabsTrigger value="todos">Todos</TabsTrigger><TabsTrigger value="digital">Digitais</TabsTrigger><TabsTrigger value="ferramenta">Ferramentas</TabsTrigger><TabsTrigger value="material">Materiais</TabsTrigger>
          </TabsList>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card key={product.name} className="overflow-hidden">
                <div className={`relative grid h-44 place-items-center bg-gradient-to-br ${product.gradient}`}>
                  <span className="grid size-20 place-items-center rounded-3xl bg-white/15 text-white backdrop-blur"><product.icon className="size-10" /></span>
                  {product.badge ? <Badge className="absolute left-4 top-4 bg-white text-slate-900 hover:bg-white">{product.badge}</Badge> : null}
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center gap-1 text-amber-500"><Star className="size-4 fill-current" /><span className="text-xs font-semibold text-foreground">{product.rating}</span><span className="text-xs text-muted-foreground">({product.reviews})</span></div>
                  <h3 className="mt-3 font-display text-lg font-bold">{product.name}</h3>
                  <p className="mt-1 min-h-10 text-xs leading-5 text-muted-foreground">{product.description}</p>
                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div><p className="text-xs text-muted-foreground">A partir de</p><p className="font-display text-2xl font-bold">{product.price}</p></div>
                    <Button onClick={() => addToCart(product.name)}><ShoppingBag className="size-4" />Adicionar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredProducts.length === 0 ? <div className="py-12 text-center text-sm text-muted-foreground">Nenhum produto encontrado.</div> : null}
        </Tabs>
      </section>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="grid gap-5 p-6 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground"><Truck className="size-7" /></span>
          <div><h2 className="font-display text-xl font-bold">Quer vender na Loja Projeto X?</h2><p className="mt-1 text-sm text-muted-foreground">A área de vendedores dependerá das regras comerciais, cadastro de produtos e integração de pagamentos.</p></div>
          <Button variant="outline" className="w-fit bg-background" onClick={() => toast.info("Cadastro de vendedores disponível em uma etapa futura.")}>Saiba mais</Button>
        </CardContent>
      </Card>
    </div>
  );
}

const products = [
  { name: "Kit Marketing Profissional", description: "Templates, roteiros e criativos para campanhas digitais.", price: "R$ 47,00", rating: "4,9", reviews: "128", category: "digital", badge: "Mais vendido", icon: Sparkles, gradient: "from-violet-600 to-indigo-700" },
  { name: "XForge Pro", description: "Recursos avançados para otimizar sua experiência no EA FC.", price: "R$ 29,90", rating: "4,8", reviews: "94", category: "ferramenta", badge: "Destaque", icon: Box, gradient: "from-blue-600 to-cyan-600" },
  { name: "Pack Social Media", description: "Artes editáveis para Instagram, Facebook e WhatsApp.", price: "R$ 37,00", rating: "4,7", reviews: "76", category: "material", badge: null, icon: Package, gradient: "from-pink-600 to-rose-600" },
  { name: "Guia de Vendas Online", description: "Estratégias práticas para abordagem, conversão e acompanhamento.", price: "R$ 24,90", rating: "4,9", reviews: "152", category: "digital", badge: null, icon: ShoppingBag, gradient: "from-amber-500 to-orange-600" },
  { name: "Biblioteca de Prompts", description: "Prompts organizados para marketing, vendas e produtividade.", price: "R$ 19,90", rating: "4,8", reviews: "63", category: "digital", badge: "Novo", icon: Sparkles, gradient: "from-emerald-600 to-teal-600" },
  { name: "Pacote de Apresentações", description: "Modelos profissionais para propostas e treinamentos.", price: "R$ 32,00", rating: "4,6", reviews: "41", category: "material", badge: null, icon: Package, gradient: "from-slate-600 to-slate-800" },
];
