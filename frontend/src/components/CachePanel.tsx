import { useEffect, useState } from 'react'
import { fetchStats, type CacheStats } from '../lib/api'

const CELLS = 32
const POLL_MS = 3000

export function CachePanel() {
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await fetchStats()
        if (!active) return
        setStats(data)
        setOffline(false)
      } catch {
        if (active) setOffline(true)
      }
    }

    load()
    const timer = setInterval(load, POLL_MS)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [])

  const total = stats?.totalRequisicoes ?? 0
  const hits = stats?.atendidasPeloRedis ?? 0
  const filled = total === 0 ? 0 : Math.round((hits / total) * CELLS)

  return (
    <section className="border border-hairline bg-surface p-5 dark:border-hairline-dark dark:bg-surface-dark">
      <header className="flex items-baseline justify-between">
        <h2 className="font-mono text-xs tracking-widest text-muted uppercase dark:text-muted-dark">
          Redirects sem tocar no banco
        </h2>
        <span className="font-mono text-xs text-muted dark:text-muted-dark">
          {offline ? 'sem resposta' : `atualiza a cada ${POLL_MS / 1000}s`}
        </span>
      </header>

      {/* Medidor: cada bloco é 1/32 das requisições de redirect. Verde = Redis, vazio = MySQL. */}
      <div
        role="img"
        aria-label={`${hits} de ${total} redirects foram respondidos pelo Redis`}
        className="mt-5 flex gap-[3px]"
      >
        {Array.from({ length: CELLS }, (_, index) => (
          <span
            key={index}
            className={`h-10 flex-1 transition-colors duration-500 ${
              index < filled ? 'bg-cache' : 'bg-hairline dark:bg-hairline-dark'
            }`}
          />
        ))}
      </div>

      <p className="mt-4 font-mono text-lg text-ink tabular-nums dark:text-ink-dark">
        <span className="text-cache">{hits}</span> de {total} redirects
      </p>
      <p className="mt-1 text-sm text-muted dark:text-muted-dark">
        foram respondidos pelo Redis — isso é{' '}
        <span className="font-mono text-ink dark:text-ink-dark">
          {stats?.taxaDeAcertoCache ?? '—'}
        </span>{' '}
        do total. O resto precisou consultar o MySQL.
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-px border border-hairline bg-hairline dark:border-hairline-dark dark:bg-hairline-dark">
        <Metric label="Redirects recebidos" value={total} />
        <Metric label="Vida do cache" value={stats ? `${stats.cacheTtlSegundos}s` : '—'} />
        <Metric label="Achou no Redis" value={hits} accent />
        <Metric label="Foi ao MySQL" value={stats?.atendidasPeloMysql ?? 0} />
      </dl>

      <p className="mt-4 text-xs leading-relaxed text-muted dark:text-muted-dark">
        Só conta quem abre um link curto — criar link não entra aqui. O primeiro acesso a um código
        vai ao MySQL e grava no Redis; os próximos {stats?.cacheTtlSegundos ?? 60}s saem do cache.
        Os contadores vivem na memória do processo e zeram quando o servidor reinicia.
      </p>
    </section>
  )
}

function Metric({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="bg-surface p-3 dark:bg-surface-dark">
      <dt className="font-mono text-[11px] tracking-wider text-muted uppercase dark:text-muted-dark">
        {label}
      </dt>
      <dd
        className={`mt-1 font-mono text-xl tabular-nums ${
          accent ? 'text-cache' : 'text-ink dark:text-ink-dark'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}
