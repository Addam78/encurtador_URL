import { useState } from 'react'
import type { ShortenResult } from '../lib/api'

type Props = {
  result: ShortenResult
}

export function ResultCard({ result }: Props) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(result.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border border-accent/40 bg-accent/5 p-4 dark:bg-accent/10">
      <p className="font-mono text-xs tracking-widest text-muted uppercase dark:text-muted-dark">
        {result.reused ? 'Link já existente' : 'Link criado'}
      </p>

      <a
        href={result.shortUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-2 block break-all font-mono text-lg text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
      >
        {result.shortUrl}
      </a>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={copy}
          className="border border-hairline bg-surface px-3 py-1.5 font-mono text-xs text-ink hover:border-accent dark:border-hairline-dark dark:bg-surface-dark dark:text-ink-dark"
        >
          {copied ? 'Copiado' : 'Copiar'}
        </button>
        <a
          href={result.shortUrl}
          target="_blank"
          rel="noreferrer"
          className="border border-hairline bg-surface px-3 py-1.5 font-mono text-xs text-ink hover:border-accent dark:border-hairline-dark dark:bg-surface-dark dark:text-ink-dark"
        >
          Abrir
        </a>
      </div>

      {result.reused && (
        <p className="mt-3 text-xs text-muted dark:text-muted-dark">
          A API reaproveita o mesmo código curto quando a URL original já foi encurtada.
        </p>
      )}
    </div>
  )
}
