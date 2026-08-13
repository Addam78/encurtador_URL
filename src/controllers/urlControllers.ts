import { urlServices } from "../services/urlServices";
import { urlCacheRepository } from "../repositories/urlCacheRepository";
import type { FastifyRequest, FastifyReply } from "fastify";

export const urlControllers = {
  async stats(req: FastifyRequest, reply: FastifyReply) {
    return reply.send(urlCacheRepository.getStats());
  },

  async redirect(req: FastifyRequest, reply: FastifyReply) {
    const { shortCode } = req.params as { shortCode: string };

    try {
      const url = await urlServices.getOriginalUrl(shortCode);
      return reply.redirect(url.originalUrl);
    }
     catch (err) {
      if (err instanceof Error) {
        const statusCode =
          "statusCode" in err
            ? (err as { statusCode: number }).statusCode
            : 500;
        return reply.status(statusCode).send(err.message);
      }
      return reply.status(500).send("Erro interno");
    }
  },

  async create(req:FastifyRequest, reply:FastifyReply){
    const {originalUrl,expiresAt} = req.body as {originalUrl:string; expiresAt?: Date}

     if(!originalUrl){
    return reply.status(400).send('A url não pide ser vazia')
  }

  if(expiresAt && new Date(expiresAt) < new Date()){
    return reply.status(400).send('A data de expiração não pode ser anterior à data atual')
  }

  const existente = await
  urlServices.findExistingShortCode(originalUrl)
  if(existente){
    return reply.send(`Já existe um encurtador para essa url: http://localhost:3000/${existente.shortCode}`)
  }

  const novaUrl = await urlServices.createShortUrl(originalUrl,expiresAt)
  return reply.send(`http://localhost:3000/${novaUrl.shortCode}`)
},

     
};
