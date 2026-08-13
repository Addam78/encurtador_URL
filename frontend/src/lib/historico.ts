const CHAVE = 'links'
const LIMITE = 8

export type LinkCriado = {
  shortUrl: string
  originalUrl: string
  criadoEm: number
}

export function carregarHistorico(): LinkCriado[] {
  try {
    const bruto = localStorage.getItem(CHAVE)
    return bruto ? (JSON.parse(bruto) as LinkCriado[]) : []
  } catch {
    return []
  }
}

/** Coloca o link no topo, sem repetir, e guarda só os mais recentes. */
export function registrarLink(historico: LinkCriado[], link: LinkCriado): LinkCriado[] {
  const semDuplicata = historico.filter((item) => item.shortUrl !== link.shortUrl)
  const atualizado = [link, ...semDuplicata].slice(0, LIMITE)
  localStorage.setItem(CHAVE, JSON.stringify(atualizado))
  return atualizado
}
