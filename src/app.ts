import fastify from 'fastify'
import { prisma } from './lib/prisma'
import { generateShortCode } from './shortCode'

import "dotenv/config"
const port = 3000
import {redis} from './lib/redis'

import fastifyMetrics from 'fastify-metrics';
import { flushClicks } from './jobs/flushCicks'

setInterval(flushClicks, 30_000) // a cada 30s
const app = fastify()
const CACHE_TTL_SECONDS = 60

let cacheHits = 0
let cacheMisses = 0


app.register(fastifyMetrics, { endpoint: '/metrics' });


app.get('/',(req,reply)=>{
    return reply.send('Ola mundo')
})

app.get('/stats', (req, reply) => {
  const total = cacheHits + cacheMisses
  return reply.send({
    totalRequisicoes: total,
    atendidasPeloRedis: cacheHits,
    atendidasPeloMysql: cacheMisses,
    taxaDeAcertoCache: total === 0 ? '0%' : ((cacheHits / total) * 100).toFixed(1) + '%',
    cacheTtlSegundos: CACHE_TTL_SECONDS
  })
})



app.get('/:shortCode', async (req, reply) => {
  const { shortCode } = req.params as { shortCode: string }
  const cacheKey = `cache:url:${shortCode}`

  let urlData: { originalUrl: string; expiresAt: string | null } | null = null

  const cached = await redis.get(cacheKey)

  if (cached) {
    urlData = JSON.parse(cached)
    cacheHits++
  } else {
    const urlcompleta = await prisma.url.findUnique({ where: { shortCode } })

    if (!urlcompleta) {
      return reply.status(404).send('Url não encontrada, primeiro é necessário gerar')
    }

    urlData = {
      originalUrl: urlcompleta.originalUrl,
      expiresAt: urlcompleta.expiresAt ? urlcompleta.expiresAt.toISOString() : null,
    }

    await redis.set(cacheKey, JSON.stringify(urlData), 'EX', CACHE_TTL_SECONDS)
    cacheMisses++
  }

  if (urlData.expiresAt && new Date(urlData.expiresAt) < new Date()) {
    return reply.status(410).send('Este link expirou')
  }

  await redis.incr(`clicks:${shortCode}`)

  return reply.redirect(urlData.originalUrl)
})



app.post('/url', async (req, reply) => {

  const { originalUrl, expiresAt } = req.body as { originalUrl: string, expiresAt?:Date } 

  if (originalUrl === '') {
    return reply.send('A url não pode ser vazia')
  }

  const urlunica = await prisma.url.findFirst({
    where: { originalUrl }
  })

  if (urlunica) {
    return reply.send(`Já existe um encurtador para essa url: http://localhost:3000/${urlunica.shortCode}`)
  }

  let shortCode: string;
  let existe;

  do {
    shortCode = generateShortCode();
    existe = await prisma.url.findUnique({ where: { shortCode } });
  } while (existe !== null);

  const createdUrl = await prisma.url.create({
    data: {
      shortCode: shortCode,
      originalUrl: originalUrl,
      expiresAt 
    }
  });

  return reply.send(`http://localhost:3000/${shortCode}`)

})









app.listen({ port: port }, function (err, address) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`Servidor rodando na porta ${port}`)

})