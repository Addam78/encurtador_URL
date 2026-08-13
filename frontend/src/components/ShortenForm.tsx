import { useState, type FormEvent } from 'react'
import { ApiError, shortenUrl, type ShortenResult } from '../lib/api'

type Props = {
  onResult: (result: ShortenResult) => void
}

/** "YYYY-MM-DDTHH:mm" no fuso local, formato que o input datetime-local espera. */
function agoraLocal() {
  const agora = new Date()
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset())
  return agora.toISOString().slice(0, 16)
}

export function ShortenForm({ onResult }: Props) {
  const [originalUrl, setOriginalUrl] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  // Calculado no submit também, porque a página pode ficar aberta por horas.
  const [minimo] = useState(agoraLocal)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (expiresAt && new Date(expiresAt) <= new Date()) {
      setError('Escolha uma data de expiração no futuro.')
      return
    }

    setSending(true)

    try {
      onResult(await shortenUrl(originalUrl.trim(), expiresAt || undefined))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível encurtar o link.')
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="originalUrl" className="block font-mono text-xs tracking-widest text-muted uppercase dark:text-muted-dark">
          URL original
        </label>
        <input
          id="originalUrl"
          type="url"
          required
          value={originalUrl}
          onChange={(event) => setOriginalUrl(event.target.value)}
          placeholder="https://exemplo.com/uma/rota/bem/longa"
          className="w-full rounded-none border border-hairline bg-surface px-3 py-2.5 font-mono text-sm text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none dark:border-hairline-dark dark:bg-surface-dark dark:text-ink-dark dark:placeholder:text-muted-dark/60"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="expiresAt" className="block font-mono text-xs tracking-widest text-muted uppercase dark:text-muted-dark">
          Expira em <span className="normal-case tracking-normal">(opcional)</span>
        </label>
        <input
          id="expiresAt"
          type="datetime-local"
          min={minimo}
          value={expiresAt}
          onChange={(event) => setExpiresAt(event.target.value)}
          className="w-full rounded-none border border-hairline bg-surface px-3 py-2.5 font-mono text-sm text-ink focus:border-accent focus:outline-none dark:border-hairline-dark dark:bg-surface-dark dark:text-ink-dark"
        />
        <p className="text-xs text-muted dark:text-muted-dark">
          Só aceita datas futuras.
        </p>
      </div>

      <button
        type="submit"
        disabled={sending}
        className="w-full bg-accent px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {sending ? 'Encurtando…' : 'Encurtar link'}
      </button>

      {error && (
        <p role="alert" className="border-l-2 border-red-600 bg-red-50 px-3 py-2 font-mono text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}
    </form>
  )
}
