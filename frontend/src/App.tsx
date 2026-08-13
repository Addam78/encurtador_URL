import { useState } from 'react'
import { ShortenForm } from './components/ShortenForm'
import { ResultCard } from './components/ResultCard'
import { CachePanel } from './components/CachePanel'
import { ThemeToggle } from './components/ThemeToggle'
import { LinkHistory } from './components/LinkHistory'
import { carregarHistorico, registrarLink } from './lib/historico'
import type { ShortenResult } from './lib/api'

const API_ORIGIN = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export function App() {
  const [result, setResult] = useState<ShortenResult | null>(null)
  const [links, setLinks] = useState(carregarHistorico)

  function aoCriar(novo: ShortenResult) {
    setResult(novo)
    setLinks((atual) =>
      registrarLink(atual, {
        shortUrl: novo.shortUrl,
        originalUrl: novo.originalUrl,
        criadoEm: Date.now(),
      }),
    )
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b border-hairline dark:border-hairline-dark">
        <div className="mx-auto flex max-w-5xl flex-wrap items-baseline justify-between gap-3 px-6 py-5">
          <h1 className="font-mono text-sm font-semibold tracking-tight text-ink dark:text-ink-dark">
            encurtador<span className="text-accent">/</span>url
          </h1>
          <nav className="flex items-center gap-4 font-mono text-xs text-muted dark:text-muted-dark">
            <a href={`${API_ORIGIN}/docs`} target="_blank" rel="noreferrer" className="hover:text-accent">
              Swagger
            </a>
            <a href={`${API_ORIGIN}/metrics`} target="_blank" rel="noreferrer" className="hover:text-accent">
              Métricas
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="max-w-xl">
          <h2 className="text-3xl leading-tight font-semibold tracking-tight text-ink dark:text-ink-dark">
            Encurte um link e acompanhe o cache respondendo por ele.
          </h2>
          <p className="mt-3 text-muted dark:text-muted-dark">
            Fastify na frente, MySQL como fonte de verdade e Redis à frente das leituras. O painel ao
            lado mostra quanto do tráfego de redirect o Redis está absorvendo.
          </p>
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <section className="space-y-6">
            <ShortenForm onResult={aoCriar} />
            {result && <ResultCard result={result} />}
            <LinkHistory links={links} />
          </section>

          <CachePanel />
        </div>
      </main>
    </div>
  )
}
