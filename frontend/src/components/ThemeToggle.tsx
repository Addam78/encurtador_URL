import { useEffect, useState } from 'react'

type Tema = 'light' | 'dark'

function temaAtual(): Tema {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function ThemeToggle() {
  const [tema, setTema] = useState<Tema>(temaAtual)

  useEffect(() => {
    document.documentElement.dataset.theme = tema
    localStorage.setItem('tema', tema)
  }, [tema])

  const proximo: Tema = tema === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={() => setTema(proximo)}
      aria-label={`Usar tema ${proximo === 'dark' ? 'escuro' : 'claro'}`}
      className="border border-hairline px-2 py-1 font-mono text-xs text-muted hover:border-accent hover:text-accent dark:border-hairline-dark dark:text-muted-dark"
    >
      {tema === 'dark' ? 'claro' : 'escuro'}
    </button>
  )
}
