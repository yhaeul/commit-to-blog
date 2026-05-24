'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { WizardAction } from '@/hooks/useWizardState'
import type { Repo } from '@/types'

interface StepGeneratingProps {
  pat: string
  repo: Repo
  branch: string
  selectedShas: string[]
  dispatch: React.Dispatch<WizardAction>
}

type Status = 'diff' | 'generate' | 'done' | 'error'

const STATUS_TEXT: Record<Status, string> = {
  diff: '변경사항 분석 중…',
  generate: '초안 작성 중…',
  done: '완료!',
  error: '',
}

export default function StepGenerating({
  pat,
  repo,
  branch,
  selectedShas,
  dispatch,
}: StepGeneratingProps) {
  const [status, setStatus] = useState<Status>('diff')
  const [error, setError] = useState('')

  const [owner, repoName] = repo.full_name.split('/')

  const run = useCallback(async () => {
    setStatus('diff')
    setError('')

    try {
      // 1단계: diff 수집
      const shaParam = selectedShas.join(',')
      const params = new URLSearchParams({ owner, repo: repoName, shas: shaParam })
      const diffRes = await fetch(`/api/github/diff?${params}`, {
        headers: { 'x-github-pat': pat },
      })
      if (!diffRes.ok) {
        const body = await diffRes.json().catch(() => ({}))
        throw new Error(body.error ?? '변경사항을 불러오지 못했습니다.')
      }
      const { diffs } = await diffRes.json()

      // 2단계: Gemini 초안 생성
      setStatus('generate')
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diffs, repoFullName: repo.full_name, branch }),
      })
      if (!genRes.ok) {
        const body = await genRes.json().catch(() => ({}))
        throw new Error(body.error ?? '블로그 초안 생성에 실패했습니다.')
      }
      const { markdown } = await genRes.json()

      setStatus('done')
      dispatch({ type: 'SET_MARKDOWN', markdown })
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다. 다시 시도해주세요.')
      setStatus('error')
    }
  }, [owner, repoName, selectedShas, pat, repo.full_name, branch, dispatch])

  useEffect(() => {
    run()
  }, [run])

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="mb-4 text-4xl">⚠️</div>
        <h2 className="mb-2 text-xl font-bold">오류가 발생했습니다</h2>
        <p className="mb-6 text-sm text-muted-foreground">{error}</p>
        <Button onClick={run}>다시 시도</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mb-6">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <h2 className="text-xl font-bold">{STATUS_TEXT[status]}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {status === 'diff' && `선택한 커밋 ${selectedShas.length}개의 변경사항을 수집하고 있습니다.`}
          {status === 'generate' && 'Gemini AI가 블로그 초안을 작성하고 있습니다.'}
        </p>
      </div>

      <div className="space-y-2">
        {(['diff', 'generate'] as const).map((s) => {
          const isDone = status === 'done' || (status === 'generate' && s === 'diff')
          const isCurrent = status === s

          return (
            <div
              key={s}
              className={[
                'flex items-center gap-3 rounded-md px-4 py-3 text-sm',
                isDone ? 'text-primary' : isCurrent ? 'font-medium' : 'text-muted-foreground',
              ].join(' ')}
            >
              <span className="text-base">
                {isDone ? '✓' : isCurrent ? '⋯' : '○'}
              </span>
              <span>{STATUS_TEXT[s]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
