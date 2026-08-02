import fastify from 'fastify'
import "dotenv/config"
import fastifyMetrics from 'fastify-metrics'
import { urlRoutes } from './routes/urlRoutes'
import { flushClicks } from './jobs/flushCicks'

const port = 3000
const app = fastify()

setInterval(flushClicks, 30_000) // a cada 30s

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
})