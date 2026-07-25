import fastify from 'fastify'
import prisma from '../src/ib/prisma'
import { generateShortCode } from './shortCode'
const app = fastify()

const port = 3000


app.get('/',(req,reply)=>{
    return reply.send('Ola mundo')
})

app.post('/url',async(req,reply)=>{
  
  const {originalUrl}  = req.body as {originalUrl:string}

  if(originalUrl === ''){
    return reply.send('A url não pode ser vazia')
  }

  // no meu banco a url reduzida recebe a função reduzida
 const shortCode = generateShortCode()

  const createdUrl = await prisma.url.create({
    data: {
      shortCode: shortCode,
      originalUrl: originalUrl
    }
  });

  return reply.send(createdUrl)


  
})

app.listen({ port: port }, function (err, address) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`Servidor rodando na porta ${port}`)

})