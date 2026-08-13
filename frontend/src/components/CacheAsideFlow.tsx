const PASSOS = [
  {
    titulo: 'Procura no Redis',
    texto: 'Toda requisição a um link curto começa perguntando ao cache, não ao banco.',
  },
  {
    titulo: 'Achou: responde e para por aí',
    texto: 'Cache hit. O MySQL nem fica sabendo que a requisição existiu.',
  },
  {
    titulo: 'Não achou: busca, grava, responde',
    texto:
      'Cache miss. Consulta o MySQL, escreve o resultado no Redis com TTL de 60s e só então redireciona — por isso o nome cache-aside: quem popula o cache é a aplicação, não o banco.',
  },
]

export function CacheAsideFlow() {
  return (
    <section className="border border-hairline bg-surface dark:border-hairline-dark dark:bg-surface-dark">
      <h2 className="border-b border-hairline px-4 py-3 font-mono text-xs tracking-widest text-muted uppercase dark:border-hairline-dark dark:text-muted-dark">
        O caminho de uma requisição
      </h2>

      {/* Numerado porque a ordem é o conteúdo: cada passo só acontece se o anterior não resolveu. */}
      <ol className="divide-y divide-hairline dark:divide-hairline-dark">
        {PASSOS.map((passo, indice) => (
          <li key={passo.titulo} className="flex gap-4 px-4 py-4">
            <span className="font-mono text-sm text-accent tabular-nums">{indice + 1}</span>
            <div>
              <h3 className="text-sm font-medium text-ink dark:text-ink-dark">{passo.titulo}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted dark:text-muted-dark">
                {passo.texto}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="border-t border-hairline px-4 py-3 text-xs leading-relaxed text-muted dark:border-hairline-dark dark:text-muted-dark">
        Contagem de cliques não entra no objeto cacheado — seria uma segunda fonte de verdade. Cada
        acesso faz um <code className="font-mono text-ink dark:text-ink-dark">INCR</code> à parte, e
        um worker sincroniza com o MySQL a cada 30s.
      </p>
    </section>
  )
}
