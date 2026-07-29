# Encurtador de URL

> 🚧 Projeto em construção — estudo com foco em **arquitetura e system design**, não só em fazer "mais um encurtador de URL" funcionar.

O objetivo aqui não é a feature em si (encurtar uma URL), e sim usar esse problema conhecido como pretexto pra estudar padrões de arquitetura voltados a **escalabilidade**, simulando cenários de alto volume de acesso.

## Stack

- **Fastify** — servidor HTTP
- **MySQL** (via Prisma + driver adapter) — armazenamento persistente
- **Redis** — cache
- **Docker Compose** — MySQL, Redis, Prometheus e Grafana
- **Prometheus/Grafana** — observabilidade (métricas expostas em `/metrics`)

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

## Rodando o projeto

```bash
docker-compose up -d mysql redis
yarn install
yarn dev
```

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

## Roadmap (em andamento)

- [ ] Trocar a geração de código curto (atualmente `nanoid`)
- [ ] Separar o projeto em camadas (rotas / serviços / repositório), hoje tudo está concentrado em `app.ts`
- [ ] Testes automatizados
- [ ] Dashboard no Grafana para as métricas de cache hit/miss
