'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { WizardAction } from '@/hooks/useWizardState'
import type { Repo } from '@/types'

interface StepRepoSelectProps {
  pat: string
  dispatch: React.Dispatch<WizardAction>
}

export default function StepRepoSelect({ pat, dispatch }: StepRepoSelectProps) {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Repo | null>(null)

  async function loadRepos() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/github/repos', {
        headers: { 'x-github-pat': pat },
      })
      if (!res.ok) throw new Error('저장소 목록을 불러오지 못했습니다.')
      const data = await res.json()
      setRepos(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장소 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRepos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = repos.filter((repo) =>
    repo.full_name.toLowerCase().includes(search.toLowerCase())
  )

  function handleNext() {
    if (!selected) return
    dispatch({ type: 'SET_REPO', repo: selected })
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold">저장소 선택</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          블로그로 만들 GitHub 저장소를 선택하세요.
        </p>
      </div>

      <div className="mb-4">
        <Input
          placeholder="저장소 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="mb-6 max-h-80 space-y-2 overflow-y-auto rounded-md border p-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={loadRepos}>
              다시 시도
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            검색 결과가 없습니다.
          </p>
        ) : (
          filtered.map((repo) => (
            <button
              key={repo.id}
              onClick={() => setSelected(repo)}
              className={[
                'w-full rounded-md px-4 py-3 text-left text-sm transition-colors',
                selected?.id === repo.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted',
              ].join(' ')}
            >
              <div className="font-medium">{repo.full_name}</div>
              <div
                className={[
                  'text-xs',
                  selected?.id === repo.id ? 'text-primary-foreground/70' : 'text-muted-foreground',
                ].join(' ')}
              >
                {repo.private ? '🔒 Private' : '🌐 Public'}
              </div>
            </button>
          ))
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => dispatch({ type: 'BACK' })}>
          뒤로
        </Button>
        <Button className="flex-1" disabled={!selected} onClick={handleNext}>
          다음
        </Button>
      </div>
    </div>
  )
}
