'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { WizardAction } from '@/hooks/useWizardState'
import type { Commit, Repo } from '@/types'

interface StepCommitSelectProps {
  pat: string
  repo: Repo
  branch: string
  dispatch: React.Dispatch<WizardAction>
}

export default function StepCommitSelect({ pat, repo, branch, dispatch }: StepCommitSelectProps) {
  const [commits, setCommits] = useState<Commit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedShas, setSelectedShas] = useState<string[]>([])

  const [owner, repoName] = repo.full_name.split('/')

  async function loadCommits() {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ owner, repo: repoName, branch })
      const res = await fetch(`/api/github/commits?${params}`, {
        headers: { 'x-github-pat': pat },
      })
      if (!res.ok) throw new Error('커밋 목록을 불러오지 못했습니다.')
      const data = await res.json()
      setCommits(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '커밋 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCommits()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleSha(sha: string) {
    setSelectedShas((prev) =>
      prev.includes(sha) ? prev.filter((s) => s !== sha) : [...prev, sha]
    )
  }

  function handleNext() {
    if (selectedShas.length === 0) return
    dispatch({ type: 'SET_SHAS', shas: selectedShas })
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold">커밋 선택</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          블로그로 만들 커밋을 선택하세요.{' '}
          <span className="font-medium">{branch}</span> 브랜치의 최근 30개 커밋입니다.
        </p>
      </div>

      {selectedShas.length > 0 && (
        <p className="mb-3 text-center text-sm font-medium text-primary">
          {selectedShas.length}개 선택됨
        </p>
      )}

      {selectedShas.length >= 3 && (
        <p className="mb-3 rounded-md bg-muted px-4 py-2 text-center text-xs text-muted-foreground">
          💡 커밋이 많을수록 일부 변경사항이 생략될 수 있습니다. 3개 이하를 권장합니다.
        </p>
      )}

      <div className="mb-6 max-h-96 space-y-2 overflow-y-auto rounded-md border p-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={loadCommits}>
              다시 시도
            </Button>
          </div>
        ) : commits.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            커밋이 없습니다.
          </p>
        ) : (
          commits.map((commit) => {
            const isChecked = selectedShas.includes(commit.sha)
            const firstLine = commit.commit.message.split('\n')[0]
            const date = new Date(commit.commit.author.date)

            return (
              <label
                key={commit.sha}
                className={[
                  'flex cursor-pointer items-start gap-3 rounded-md px-4 py-3 transition-colors',
                  isChecked ? 'bg-primary/10' : 'hover:bg-muted',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleSha(commit.sha)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{firstLine}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {commit.commit.author.name} ·{' '}
                    {format(date, 'yyyy.MM.dd HH:mm', { locale: ko })}
                  </p>
                </div>
              </label>
            )
          })
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => dispatch({ type: 'BACK' })}>
          뒤로
        </Button>
        <Button className="flex-1" disabled={selectedShas.length === 0} onClick={handleNext}>
          다음 {selectedShas.length > 0 && `(${selectedShas.length}개)`}
        </Button>
      </div>
    </div>
  )
}
