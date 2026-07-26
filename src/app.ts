import fastify from 'fastify'
import { prisma } from './lib/prisma'
import { generateShortCode } from './shortCode'
const app = fastify()
import "dotenv/config"
const port = 3000


app.get('/',(req,reply)=>{
    return reply.send('Ola mundo')
})

app.post('/url',async(req,reply)=>{
  
  const {originalUrl}  = req.body as {originalUrl:string}

  if(originalUrl === ''){
    return reply.send('A url não pode ser vazia')
  }

  const urlunica = await prisma.url.findFirst({
      where:{originalUrl}
  })

  if(urlunica){
    return reply.send(`Já existe um encurtador para essa url: http://localhost:3000/${urlunica.shortCode}`)
  }

  // no meu banco a url reduzida recebe a função reduzida
 const shortCode = generateShortCode()

  const createdUrl = await prisma.url.create({
    data: {
      shortCode: shortCode,
      originalUrl: originalUrl
    }
  });

  return reply.send(`http://localhost:3000/${shortCode}`)



  
})


app.get('/:shortCode',async(req,reply)=>{
  const {shortCode} = req.params as {shortCode: string}

  let urlcompleta = await prisma.url.findUnique({
    where:{shortCode}
  })

  if(!urlcompleta){
    return  reply.status(404).send('Url não encontrada , primeiro é encesssario gerar ')
  }

  

  return reply.redirect(urlcompleta.originalUrl)
})


app.listen({ port: port }, function (err, address) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`Servidor rodando na porta ${port}`)

})