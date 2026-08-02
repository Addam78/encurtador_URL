import { redis } from '../lib/redis'

const CACHE_TTL_SECONDS = 60

type CachedUrl = { originalUrl: string; expiresAt: string | null }

let cacheHits = 0
let cacheMisses = 0

export const urlCacheRepository = {
    async get(shortCode: string): Promise<CachedUrl | null> {
        const cached = await redis.get(`cache:url:${shortCode}`)
        if (!cached) return null
        return JSON.parse(cached) as CachedUrl
    },

    async set(shortCode: string, data: CachedUrl) {
        await redis.set(`cache:url:${shortCode}`, JSON.stringify(data), 'EX', CACHE_TTL_SECONDS)
    },

    async incrementClicks(shortCode: string) {
        await redis.incr(`clicks:${shortCode}`)
    },

    recordHit() {
        cacheHits++
    },

    recordMiss() {
        cacheMisses++
    },

    getStats() {
        const total = cacheHits + cacheMisses
        return {
            totalRequisicoes: total,
            atendidasPeloRedis: cacheHits,
            atendidasPeloMysql: cacheMisses,
            taxaDeAcertoCache: total === 0 ? '0%' : ((cacheHits / total) * 100).toFixed(1) + '%',
            cacheTtlSegundos: CACHE_TTL_SECONDS,
        }
    },
}
