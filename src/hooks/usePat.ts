'use client'

const PAT_KEY = 'github_pat'

export function usePat() {
  function getPat(): string {
    if (typeof window === 'undefined') return ''
    return sessionStorage.getItem(PAT_KEY) ?? ''
  }

  function setPat(pat: string): void {
    if (typeof window === 'undefined') return
    if (pat) {
      sessionStorage.setItem(PAT_KEY, pat)
    } else {
      sessionStorage.removeItem(PAT_KEY)
    }
  }

  function clearPat(): void {
    if (typeof window === 'undefined') return
    sessionStorage.removeItem(PAT_KEY)
  }

  return { getPat, setPat, clearPat }
}
