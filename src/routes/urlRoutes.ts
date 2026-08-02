import type { FastifyInstance } from "fastify";
import { urlControllers } from "../controllers/urlControllers";

export async function urlRoutes(app:FastifyInstance) {
    app.get('/stats',urlControllers.stats)
    app.get('/:shortCode',urlControllers.redirect)
    app.post('/url',urlControllers.create)
}