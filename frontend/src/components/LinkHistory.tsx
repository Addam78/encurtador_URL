import type { LinkCriado } from '../lib/historico'

type Props = {
  links: LinkCriado[]
}

export function LinkHistory({ links }: Props) {
  return (
    <section className="border border-hairline bg-surface dark:border-hairline-dark dark:bg-surface-dark">
      <h2 className="border-b border-hairline px-4 py-3 font-mono text-xs tracking-widest text-muted uppercase dark:border-hairline-dark dark:text-muted-dark">
        Links criados neste navegador
      </h2>

      {links.length === 0 ? (
        <EstadoVazio />
      ) : (
        <ul className="divide-y divide-hairline dark:divide-hairline-dark">
          {links.map((link) => (
            <Linha key={link.shortUrl} link={link} />
          ))}
        </ul>
      )}
    </section>
  )
}

function Linha({ link }: { link: LinkCriado }) {
  const codigo = link.shortUrl.slice(link.shortUrl.lastIndexOf('/'))

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <a
          href={link.shortUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-sm text-accent hover:underline"
        >
          {codigo}
        </a>
        <p className="truncate text-xs text-muted dark:text-muted-dark" title={link.originalUrl}>
          {link.originalUrl}
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(link.shortUrl)}
        className="shrink-0 border border-hairline px-2 py-1 font-mono text-[11px] text-muted hover:border-accent hover:text-accent dark:border-hairline-dark dark:text-muted-dark"
      >
        copiar
      </button>
    </li>
  )
}

function EstadoVazio() {
  return (
    <div className="px-4 py-5">
      <p className="text-sm text-muted dark:text-muted-dark">
        Ainda não há links aqui. Depois de criar um, abra ele algumas vezes seguidas e veja o painel
        ao lado: o primeiro acesso consulta o MySQL, os seguintes saem do Redis.
      </p>
      <p className="mt-3 text-xs text-muted dark:text-muted-dark">
        Para gerar volume de uma vez, o repositório tem um script de carga:
      </p>
      <code className="mt-2 block overflow-x-auto border border-hairline px-3 py-2 font-mono text-xs text-ink dark:border-hairline-dark dark:text-ink-dark">
        bash stress.sh SEUCODE 200
      </code>
    </div>
  )
}
