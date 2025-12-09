# Sistema de Anúncios - PetBook

## Visão Geral

O sistema de anúncios do PetBook funciona de forma similar ao Facebook e Instagram, permitindo que empresas (principalmente do setor pet) promovam seus produtos e serviços para os usuários da plataforma.

---

## Arquitetura do Sistema

### 1. Tabelas do Banco de Dados

#### `advertisers` (Anunciantes)
Armazena informações das empresas/pessoas que querem anunciar.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| user_id | UUID | Referência ao usuário autenticado |
| name | TEXT | Nome do anunciante |
| email | TEXT | Email de contato |
| company | TEXT | Nome da empresa |
| is_verified | BOOLEAN | Se foi verificado pela plataforma |
| balance_cents | INTEGER | Saldo em centavos para anúncios |
| created_at | TIMESTAMP | Data de criação |

#### `ads` (Anúncios)
Armazena os anúncios criados.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| advertiser_id | UUID | Referência ao anunciante |
| title | TEXT | Título do anúncio |
| description | TEXT | Descrição/texto do anúncio |
| image_url | TEXT | URL da imagem do anúncio |
| target_url | TEXT | Link de destino ao clicar |
| budget_cents | INTEGER | Orçamento total em centavos |
| spent_cents | INTEGER | Quanto já foi gasto |
| cost_per_click_cents | INTEGER | Custo por clique (CPC) |
| cost_per_impression_cents | INTEGER | Custo por 1000 impressões (CPM) |
| status | TEXT | active, paused, completed, rejected |
| target_species | TEXT[] | Espécies alvo (cachorro, gato, etc) |
| start_date | DATE | Data de início |
| end_date | DATE | Data de término |
| created_at | TIMESTAMP | Data de criação |

#### `ad_impressions` (Impressões)
Registra cada vez que um anúncio é exibido.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| ad_id | UUID | Referência ao anúncio |
| pet_id | UUID | Pet que viu o anúncio (pode ser null) |
| created_at | TIMESTAMP | Momento da impressão |

#### `ad_clicks` (Cliques)
Registra cada clique em um anúncio.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| ad_id | UUID | Referência ao anúncio |
| pet_id | UUID | Pet que clicou |
| created_at | TIMESTAMP | Momento do clique |

---

## Fluxo de Funcionamento

### Passo 1: Cadastro do Anunciante

```
Usuário → Página "Anunciar" → Formulário de Cadastro → Tabela advertisers
```

1. Usuário logado acessa a página de anúncios
2. Preenche dados da empresa (nome, email, empresa)
3. Sistema cria registro na tabela `advertisers`
4. Anunciante aguarda verificação (opcional) ou já pode criar anúncios

### Passo 2: Criação do Anúncio

```
Anunciante → Dashboard → Criar Anúncio → Upload Imagem → Configurar Orçamento → Tabela ads
```

1. Anunciante acessa seu dashboard
2. Clica em "Criar Novo Anúncio"
3. Preenche:
   - Título (ex: "Ração Premium para Cães")
   - Descrição (ex: "A melhor ração para seu pet!")
   - Upload da imagem (armazenada no Supabase Storage)
   - URL de destino (link do produto/site)
   - Orçamento diário/total
   - Tipo de cobrança: CPC ou CPM
   - Segmentação: espécies alvo
   - Período de veiculação
4. Sistema cria registro na tabela `ads` com status "active"

### Passo 3: Exibição no Feed

```
Feed carrega → Busca anúncios ativos → Seleciona baseado em segmentação → Exibe entre posts
```

1. Quando usuário acessa o Feed
2. Sistema busca anúncios com:
   - status = 'active'
   - budget_cents > spent_cents (ainda tem orçamento)
   - start_date <= hoje <= end_date
   - target_species inclui a espécie do pet do usuário
3. Seleciona anúncio (pode usar randomização ou algoritmo de relevância)
4. Exibe o anúncio a cada X posts (ex: a cada 5 posts)
5. Registra impressão na tabela `ad_impressions`
6. Se for CPM, debita do orçamento a cada 1000 impressões

### Passo 4: Clique no Anúncio

```
Usuário clica → Registra clique → Debita CPC → Redireciona para URL
```

1. Usuário clica no anúncio
2. Sistema registra na tabela `ad_clicks`
3. Se for CPC, debita `cost_per_click_cents` do orçamento
4. Redireciona usuário para `target_url`
5. Atualiza `spent_cents` na tabela `ads`

### Passo 5: Dashboard do Anunciante

```
Anunciante → Dashboard → Métricas em tempo real
```

Exibe:
- Total de impressões
- Total de cliques
- CTR (Click-Through Rate) = cliques / impressões * 100
- Gasto total
- Orçamento restante
- Gráficos de performance por dia

---

## Componentes React Necessários

### Páginas

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/Advertise.tsx` | Landing page para anunciantes |
| `src/pages/AdvertiserDashboard.tsx` | Dashboard do anunciante |
| `src/pages/CreateAd.tsx` | Formulário de criação de anúncio |
| `src/pages/AdStats.tsx` | Estatísticas detalhadas de um anúncio |

### Componentes

| Arquivo | Descrição |
|---------|-----------|
| `src/components/ads/FeedAd.tsx` | Card de anúncio no feed |
| `src/components/ads/AdCard.tsx` | Card de anúncio no dashboard |
| `src/components/ads/AdForm.tsx` | Formulário de criação/edição |
| `src/components/ads/AdMetrics.tsx` | Exibição de métricas |
| `src/components/ads/AdTargeting.tsx` | Seleção de segmentação |

### Hooks

| Arquivo | Descrição |
|---------|-----------|
| `src/hooks/useAds.ts` | Buscar e gerenciar anúncios |
| `src/hooks/useAdImpressions.ts` | Registrar impressões |
| `src/hooks/useAdvertiser.ts` | Dados do anunciante |

---

## Modelo de Receita

### Opção 1: CPC (Custo por Clique)
- Anunciante paga apenas quando alguém clica
- Valor sugerido: R$ 0,50 - R$ 2,00 por clique
- Bom para anunciantes que querem conversões

### Opção 2: CPM (Custo por Mil Impressões)
- Anunciante paga a cada 1000 vezes que o anúncio aparece
- Valor sugerido: R$ 5,00 - R$ 15,00 por 1000 impressões
- Bom para branding/visibilidade

### Exemplo de Cálculo

```
Petshop X quer anunciar ração:
- Orçamento: R$ 500,00 (50000 centavos)
- Modelo: CPC
- CPC: R$ 1,00 (100 centavos)
- Resultado: até 500 cliques

Se CTR médio for 2%:
- Precisa de 25.000 impressões para 500 cliques
- CPM equivalente: R$ 20,00
```

---

## Segmentação Disponível

### Por Espécie do Pet
- Cachorro
- Gato
- Pássaro
- Roedor
- Réptil
- Peixe
- Outros

### Futuras Expansões
- Por raça
- Por idade do pet
- Por localização do tutor
- Por comportamento (posts curtidos, comunidades)

---

## Fluxo de Pagamento (Simplificado)

### Versão Inicial (Manual)
1. Anunciante solicita créditos
2. Admin aprova e adiciona saldo manualmente
3. Anunciante usa saldo para anúncios

### Versão Futura (Automatizada)
1. Integração com Stripe/PagSeguro
2. Anunciante adiciona cartão
3. Compra créditos automaticamente
4. Sistema debita conforme uso

---

## Regras de Negócio

### Aprovação de Anúncios
- Anúncios podem passar por revisão antes de ir ao ar
- Admin pode aprovar/rejeitar anúncios
- Motivos de rejeição: conteúdo inadequado, imagem de baixa qualidade

### Limites
- Orçamento mínimo: R$ 10,00
- CPC mínimo: R$ 0,10
- CPM mínimo: R$ 1,00
- Máximo de anúncios ativos por anunciante: 10

### Pausar/Cancelar
- Anunciante pode pausar anúncio a qualquer momento
- Saldo não utilizado permanece na conta
- Reembolso apenas em casos especiais

---

## Métricas para o Admin

### Dashboard Administrativo
- Total de receita por período
- Anúncios ativos
- Novos anunciantes
- Top anunciantes por gasto
- Anúncios com melhor CTR

---

## Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| Supabase Database | Armazenar dados dos anúncios |
| Supabase Storage | Armazenar imagens dos anúncios |
| Supabase RLS | Segurança e permissões |
| React Query | Cache e sincronização de dados |
| Recharts | Gráficos no dashboard |
| Tailwind CSS | Estilização dos componentes |

---

## Próximos Passos para Implementação

1. **Criar tabelas** - Migração SQL com todas as tabelas
2. **Criar página de cadastro** - Formulário para anunciantes
3. **Criar dashboard** - Área do anunciante
4. **Criar formulário de anúncio** - Upload e configuração
5. **Integrar no Feed** - Exibir anúncios entre posts
6. **Criar sistema de métricas** - Registrar impressões/cliques
7. **Dashboard admin** - Gerenciar anunciantes e anúncios
8. **Testes** - Validar todo o fluxo

---

## Exemplo Visual do Feed

```
┌─────────────────────────────┐
│  Post do @rex_golden        │
│  🐕 Passeio no parque!      │
│  [FOTO]                     │
│  🐾 15  ❤️ 8  🍖 3          │
└─────────────────────────────┘

┌─────────────────────────────┐
│  Post da @mimi_siames       │
│  😺 Soneca da tarde         │
│  [FOTO]                     │
│  🐾 22  😺 12               │
└─────────────────────────────┘

┌─────────────────────────────┐
│  📢 ANÚNCIO                 │
│  ─────────────────────────  │
│  PetShop Premium            │
│  [IMAGEM DO PRODUTO]        │
│  Ração 20kg com 30% OFF!    │
│  [Saiba Mais →]             │
│  ─────────────────────────  │
│  Patrocinado                │
└─────────────────────────────┘

┌─────────────────────────────┐
│  Post do @thor_husky        │
│  🐺 Neve é vida!            │
│  [FOTO]                     │
│  🐾 45  ❤️ 28  🐶 15        │
└─────────────────────────────┘
```

---

## Conclusão

Este sistema permite que o PetBook gere receita de forma sustentável, oferecendo valor tanto para anunciantes (alcançar donos de pets) quanto para usuários (descobrir produtos relevantes para seus animais).

A implementação é modular e pode ser expandida conforme o crescimento da plataforma.
