# Encurtador de URL

> 🚧 Projeto em construção — estudo com foco em **arquitetura e system design**, não só em fazer "mais um encurtador de URL" funcionar.

O objetivo aqui não é a feature em si (encurtar uma URL), e sim usar esse problema conhecido como pretexto pra estudar padrões de arquitetura voltados a **escalabilidade**, simulando cenários de alto volume de acesso.

O padrão em estudo é o **cache-aside**. Encurtador de URL é um caso quase perfeito pra ele: a escrita é rara (alguém cria o link uma vez) e a leitura é intensa e repetida (todo mundo que clica bate no mesmo `shortCode`). É exatamente a assimetria que justifica colocar um cache na frente do banco — e é ela que o projeto tenta medir, não apenas implementar.

## Stack

- **Fastify** — servidor HTTP
- **MySQL** (via Prisma + driver adapter) — armazenamento persistente
- **Redis** — cache
- **Docker Compose** — MySQL, Redis, Prometheus e Grafana
- **Prometheus/Grafana** — observabilidade (métricas expostas em `/metrics`)
- **React + Vite + Tailwind** — painel que torna o comportamento do cache visível (`frontend/`)

## Padrão em foco: Cache-Aside

A rota `GET /:shortCode` (redirecionamento) implementa o padrão **cache-aside**:

1. A aplicação verifica se o `shortCode` está no Redis.
2. **Cache hit**: responde direto, sem acessar o MySQL.
3. **Cache miss**: busca no MySQL, salva o resultado no Redis com TTL de 60s, e responde.

O contador de clicks não entra no objeto cacheado (evita duas fontes de verdade pro mesmo dado). Em vez disso, cada acesso incrementa um contador separado no Redis (`INCR`), e um worker (`src/jobs/flushCicks.ts`) roda a cada 30s sincronizando esses contadores com o MySQL de forma atômica (`GETDEL`).

### Benchmark

Um teste de carga simulando 200 requisições sequenciais ao mesmo link (`stress.sh`) mostrou:

```json
{
  "totalRequisicoes": 200,
  "atendidasPeloRedis": 199,
  "atendidasPeloMysql": 1,
  "taxaDeAcertoCache": "99.5%",
  "cacheTtlSegundos": 60
}
```

Ou seja: de 200 requisições, o MySQL foi consultado apenas 1 vez — o restante foi absorvido inteiramente pelo Redis.

### Trade-offs assumidos

O que o cache-aside custa, e que decisão foi tomada em cada ponto:

- **Dado velho durante o TTL.** Se a URL for alterada no banco, quem estiver em cache continua vendo a versão antiga por até 60s. Aceitável aqui, porque URL encurtada praticamente não muda depois de criada.
- **A expiração do link é checada em cima do dado cacheado**, não do banco — o `expiresAt` viaja junto no objeto do Redis (`urlServices.getOriginalUrl`). Sem isso, todo redirect precisaria consultar o MySQL só pra saber se o link ainda vale, o que anularia o cache.
- **Cache miss é mais caro que não ter cache**: paga a consulta ao Redis, a consulta ao MySQL e ainda a escrita no Redis. Só compensa porque o miss é raro no padrão de acesso deste sistema.
- **Os contadores de `/stats` vivem na memória do processo** (`urlCacheRepository`). Zeram no restart e não somam entre instâncias — servem pra observar o padrão em desenvolvimento, não como métrica de produção. Pra isso existe o `/metrics` do Prometheus.

## Rodando o projeto

Sobe a infra e a API:

```bash
docker-compose up -d mysql redis
yarn install
yarn dev
```

Sobe o painel (em outro terminal):

```bash
cd frontend
yarn install
yarn dev
```

## Painel (`frontend/`)

SPA em React + Vite + Tailwind, servida em `http://localhost:5173`. Existe por um motivo só: **tornar o cache-aside observável**. Ela mostra ao vivo, lendo `/stats` a cada 3s, quantos redirects o Redis absorveu e quantos precisaram do MySQL — o mesmo número que o `stress.sh` imprime, só que enquanto você usa o sistema.

Em desenvolvimento o Vite faz proxy de `/url` e `/stats` para a porta 3000, então CORS não entra em jogo. Pra publicar em outra origem, defina:

- `VITE_API_URL` no front — origem da API
- `FRONTEND_ORIGIN` na API — origem liberada no `@fastify/cors`

## Documentação (Swagger)

Com o servidor rodando, a documentação interativa da API fica em:

```
http://localhost:3000/docs
```

> **Nota sobre a rota `GET /:shortCode`:** ela é o próprio link encurtado (funciona como um bit.ly), então não dá pra testar pelo botão "Try it out" do Swagger — o navegador bloqueia por CORS o `fetch` seguir um redirect para um domínio externo. Para testar esse endpoint, copie a "Request URL" e cole direto na barra de endereço do navegador, ou use `curl -i`.

Criar uma URL:
```bash
curl -X POST http://localhost:3000/url -H "Content-Type: application/json" -d "{\"originalUrl\":\"https://exemplo.com\"}"
```

Acessar o link curto:
```bash
curl -i http://localhost:3000/SEUCODE
```

Ver estatísticas de cache:
```bash
curl http://localhost:3000/stats
```

Rodar o teste de carga:
```bash
bash stress.sh SEUCODE 200
```

## Arquitetura em camadas

O código em `src/` está separado em:

- `routes/` — liga cada rota HTTP ao controller correspondente
- `controllers/` — recebem `req`/`reply`, chamam o service e traduzem o resultado em resposta HTTP
- `services/` — regra de negócio (geração de shortCode único, checagem de expiração, orquestração entre cache e banco)
- `repositories/` — acesso a dados (`urlRepository` para MySQL/Prisma, `urlCacheRepository` para Redis)
- `errors/` — erros customizados (`NotFoundError`, `ExpiredError`) com `statusCode` próprio, lidos genericamente pelos controllers
- `jobs/` — o worker que descarrega os contadores de clique do Redis no MySQL

A separação existe pro cache não vazar pra fora do seu lugar: quem decide consultar Redis antes do MySQL é o **service**, e as duas fontes ficam atrás de repositórios com a mesma cara (`urlRepository` e `urlCacheRepository`). O controller não sabe que existe cache; trocar Redis por outra coisa não sai de `repositories/`.

## Roadmap (em andamento)

- [x] Frontend (SPA em React + Vite) para observar o cache em uso
- [ ] Trocar a geração de código curto (atualmente `nanoid`)
- [ ] Testes automatizados
- [ ] Dashboard no Grafana para as métricas de cache hit/miss
- [ ] Invalidar o cache na escrita, em vez de só esperar o TTL vencer
- [ ] Serviço de email (enviar o link encurtado por email)
