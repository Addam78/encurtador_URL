const BASE = import.meta.env.VITE_API_URL ?? ''

export type CacheStats = {
  totalRequisicoes: number
  atendidasPeloRedis: number
  atendidasPeloMysql: number
  taxaDeAcertoCache: string
  cacheTtlSegundos: number
}

export type ShortenResult = {
  shortUrl: string
  originalUrl: string
  /** true quando a API devolveu um encurtador que já existia para essa URL */
  reused: boolean
}

export class ApiError extends Error {}

function unquote(text: string) {
  if (!text.startsWith('"') || !text.endsWith('"')) return text
  try {
    return JSON.parse(text) as string
  } catch {
    return text
  }
}

/**
 * POST /url devolve texto puro, em dois formatos:
 *   "http://localhost:3000/abc123"
 *   "Já existe um encurtador para essa url: http://localhost:3000/abc123"
 * Por isso extraímos a URL do corpo em vez de fazer JSON.parse.
 */
export async function shortenUrl(originalUrl: string, expiresAt?: string): Promise<ShortenResult> {
  let response: Response

  try {
    response = await fetch(`${BASE}/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalUrl,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      }),
    })
  } catch {
    throw new ApiError('A API não respondeu. Confira se o servidor está rodando na porta 3000.')
  }

  // As rotas declaram `type: 'string'` no schema, então o Fastify devolve a
  // string serializada em JSON ("...") — desembrulhamos antes de ler.
  const text = unquote((await response.text()).trim())

  if (!response.ok) {
    // 4xx traz a mensagem de validação da própria API; 5xx costuma ser o
    // servidor fora do ar (o proxy do Vite devolve 500 nesse caso).
    if (response.status >= 500) {
      throw new ApiError('A API não respondeu. Confira se o servidor está rodando na porta 3000.')
    }
    throw new ApiError(text || `A API respondeu ${response.status}.`)
  }

  const match = text.match(/https?:\/\/\S+/)
  if (!match) {
    throw new ApiError(text || 'A API respondeu sem um link.')
  }

  return { shortUrl: match[0], originalUrl, reused: text.startsWith('Já existe') }
}

export async function fetchStats(): Promise<CacheStats> {
  const response = await fetch(`${BASE}/stats`)
  if (!response.ok) throw new ApiError(`GET /stats respondeu ${response.status}.`)
  return response.json()
}
