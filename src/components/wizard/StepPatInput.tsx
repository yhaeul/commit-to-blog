'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePat } from '@/hooks/usePat'
import type { WizardAction } from '@/hooks/useWizardState'
import type { GitHubUser } from '@/types'

interface StepPatInputProps {
  dispatch: React.Dispatch<WizardAction>
}

export default function StepPatInput({ dispatch }: StepPatInputProps) {
  const [pat, setPat] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setPat: savePat } = usePat()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pat.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/github/validate', {
        headers: { 'x-github-pat': pat },
      })

      if (!res.ok) {
        setError('유효하지 않은 PAT입니다.')
        return
      }

      const user: GitHubUser = await res.json()
      savePat(pat)
      dispatch({ type: 'SET_PAT', pat, user })
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold">GitHub PAT 입력</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          GitHub Personal Access Token을 입력하세요.
          <br />
          저장소 읽기 권한(
          <code className="rounded bg-muted px-1 py-0.5 text-xs">repo</code>) 이 필요합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pat">Personal Access Token</Label>
          <Input
            id="pat"
            type="password"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            value={pat}
            onChange={(e) => setPat(e.target.value)}
            disabled={loading}
            autoComplete="off"
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading || !pat.trim()}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              확인 중…
            </span>
          ) : (
            '확인'
          )}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        PAT는 브라우저 세션에만 저장되며 서버나 DB에 기록되지 않습니다.
      </p>
    </div>
  )
}
