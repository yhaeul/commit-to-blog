'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { WizardAction } from '@/hooks/useWizardState'
import type { Branch, Repo } from '@/types'

interface StepBranchSelectProps {
  pat: string
  repo: Repo
  dispatch: React.Dispatch<WizardAction>
}

export default function StepBranchSelect({ pat, repo, dispatch }: StepBranchSelectProps) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<string>('')

  const [owner, repoName] = repo.full_name.split('/')

  async function loadBranches() {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ owner, repo: repoName })
      const res = await fetch(`/api/github/branches?${params}`, {
        headers: { 'x-github-pat': pat },
      })
      if (!res.ok) throw new Error('브랜치 목록을 불러오지 못했습니다.')
      const data = await res.json()
      setBranches(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '브랜치 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBranches()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleNext() {
    if (!selected) return
    dispatch({ type: 'SET_BRANCH', branch: selected })
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold">브랜치 선택</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium">{repo.full_name}</span>의 브랜치를 선택하세요.
        </p>
      </div>

      <div className="mb-6 max-h-80 space-y-2 overflow-y-auto rounded-md border p-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-md" />
          ))
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={loadBranches}>
              다시 시도
            </Button>
          </div>
        ) : branches.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            브랜치가 없습니다.
          </p>
        ) : (
          branches.map((branch) => (
            <button
              key={branch.name}
              onClick={() => setSelected(branch.name)}
              className={[
                'w-full rounded-md px-4 py-3 text-left text-sm font-medium transition-colors',
                selected === branch.name
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted',
              ].join(' ')}
            >
              {branch.name}
            </button>
          ))
        )}
      </div>

      <Button className="w-full" disabled={!selected} onClick={handleNext}>
        다음
      </Button>
    </div>
  )
}
