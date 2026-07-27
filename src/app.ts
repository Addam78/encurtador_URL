import fastify from 'fastify'
import { prisma } from './lib/prisma'
import { generateShortCode } from './shortCode'
const app = fastify()
import "dotenv/config"
const port = 3000


app.get('/',(req,reply)=>{
    return reply.send('Ola mundo')
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


app.get('/:shortCode',async(req,reply)=>{
  const {shortCode} = req.params as {shortCode: string}

  let urlcompleta = await prisma.url.findUnique({
    where:{shortCode}
  })

  if(!urlcompleta){
    return  reply.status(404).send('Url não encontrada , primeiro é necesssario gerar ')
  }

  await prisma.url.update({
    where:{shortCode},
    data:{
      clicks:{increment:1}
    }
  })

  if(urlcompleta.expiresAt && urlcompleta.expiresAt < new Date()){
    return reply.status(410).send('Este link expirou')
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