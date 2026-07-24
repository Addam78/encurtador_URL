import fastify from 'fastify'

const app = fastify()

const port = 3000


app.get('/',(req,reply)=>{
    return reply.send('Ola mundo')
})


app.listen({ port: port }, function (err, address) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`Servidor rodando na porta ${port}`)

})