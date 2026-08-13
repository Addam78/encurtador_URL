import type { FastifyInstance } from "fastify";
import { urlControllers } from "../controllers/urlControllers";

export async function urlRoutes(app:FastifyInstance) {
    app.get('/stats', {
        schema: {
            tags: ['stats'],
            summary: 'Estatísticas do cache Redis',
            response: {
                200: {
                    type: 'object',
                    properties: {
                        totalRequisicoes: { type: 'number' },
                        atendidasPeloRedis: { type: 'number' },
                        atendidasPeloMysql: { type: 'number' },
                        taxaDeAcertoCache: { type: 'string' },
                        cacheTtlSegundos: { type: 'number' },
                    },
                },
            },
        },
    }, urlControllers.stats)

    app.get('/:shortCode', {
        schema: {
            tags: ['url'],
            summary: 'Redireciona para a URL original a partir do código curto',
            description: 'Este endpoint é o próprio link encurtado (como um bit.ly) — não é feito para ser testado pelo botão "Try it out" do Swagger, pois o navegador bloqueia por CORS o fetch seguir um redirect para um domínio externo. Para testar, copie a "Request URL" e cole diretamente na barra de endereço do navegador, ou use curl/Postman.',
            params: {
                type: 'object',
                properties: {
                    shortCode: { type: 'string' },
                },
                required: ['shortCode'],
            },
            response: {
                302: { type: 'string', description: 'Redirecionamento para a URL original' },
                404: { type: 'string', description: 'URL não encontrada' },
                410: { type: 'string', description: 'Link expirado' },
            },
        },
    }, urlControllers.redirect)

    app.post('/url', {
        schema: {
            tags: ['url'],
            summary: 'Cria uma URL encurtada',
            body: {
                type: 'object',
                properties: {
                    originalUrl: { type: 'string', description: 'URL original a ser encurtada' },
                    expiresAt: { type: 'string', format: 'date-time', description: 'Data de expiração (opcional)' },
                },
                required: ['originalUrl'],
            },
            response: {
                200: { type: 'string', description: 'URL encurtada gerada' },
                400: { type: 'string', description: 'Dados inválidos (URL vazia ou data de expiração no passado)' },
            },
        },
    }, urlControllers.create)
}