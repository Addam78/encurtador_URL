import fastify from 'fastify'
import "dotenv/config"
import fastifyMetrics from 'fastify-metrics'
import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { urlRoutes } from './routes/urlRoutes'
import { flushClicks } from './jobs/flushCicks'

const port = 3000
const app = fastify()

setInterval(flushClicks, 30_000) // a cada 30s

// Em dev o front usa o proxy do Vite; CORS existe para quando o front for
// publicado em outra origem. Defina FRONTEND_ORIGIN no deploy.
app.register(fastifyCors, {
  origin: process.env.FRONTEND_ORIGIN ?? true,
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Encurtador de URL',
      description: 'API para encurtamento de URLs com cache Redis e persistência MySQL',
      version: '1.0.0',
    },
  },
})
app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

app.register(fastifyMetrics, { endpoint: '/metrics' })
app.register(urlRoutes)

app.get('/', (req, reply) => {
  return reply.send('Ola mundo')
})

app.listen({ port }, function (err, address) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`Servidor rodando na porta ${port}`)
  console.log(`Documentação Swagger em http://localhost:${port}/docs`)
})