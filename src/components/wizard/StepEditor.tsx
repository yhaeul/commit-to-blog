'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MarkdownEditor from '@/components/shared/MarkdownEditor'
import type { WizardAction } from '@/hooks/useWizardState'
import type { Repo } from '@/types'

interface StepEditorProps {
  repo: Repo
  branch: string
  selectedShas: string[]
  generatedMarkdown: string
  dispatch: React.Dispatch<WizardAction>
}

function parseTitle(markdown: string): string {
  const firstLine = markdown.split('\n')[0] ?? ''
  return firstLine.startsWith('# ') ? firstLine.slice(2).trim() : ''
}

function removeFirstHeading(markdown: string): string {
  const lines = markdown.split('\n')
  if (lines[0]?.startsWith('# ')) {
    return lines.slice(1).join('\n').trimStart()
  }
  return markdown
}

export default function StepEditor({
  repo,
  branch,
  selectedShas,
  generatedMarkdown,
  dispatch,
}: StepEditorProps) {
  const [title, setTitle] = useState(() => parseTitle(generatedMarkdown))
  const [content, setContent] = useState(() => removeFirstHeading(generatedMarkdown))
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!title.trim()) {
      toast.error('제목을 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: `# ${title.trim()}\n\n${content}`,
          repoFullName: repo.full_name,
          branch,
          selectedShas,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? '저장에 실패했습니다.')
      }

      const post = await res.json()
      dispatch({ type: 'SET_SAVED', postId: post._id })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  function handleBack() {
    if (window.confirm('작성 중인 내용이 사라집니다. 처음으로 돌아가시겠습니까?')) {
      dispatch({ type: 'RESET' })
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">글 편집</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          AI가 작성한 초안을 자유롭게 수정하세요.
        </p>
      </div>

      <div className="mb-4 space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="블로그 포스트 제목"
          disabled={saving}
        />
      </div>

      <div className="mb-6">
        <MarkdownEditor value={content} onChange={setContent} height={480} />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleBack} disabled={saving}>
          처음으로
        </Button>
        <Button className="flex-1" onClick={handleSave} disabled={saving || !title.trim()}>
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              저장 중…
            </span>
          ) : (
            '저장'
          )}
        </Button>
      </div>
    </div>
  )
}
