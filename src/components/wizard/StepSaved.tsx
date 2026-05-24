'use client'

import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import type { WizardAction } from '@/hooks/useWizardState'

interface StepSavedProps {
  savedPostId: string
  dispatch: React.Dispatch<WizardAction>
}

export default function StepSaved({ savedPostId, dispatch }: StepSavedProps) {
  function handleReset() {
    dispatch({ type: 'RESET' })
  }

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mb-8">
        <div className="mb-4 text-6xl">🎉</div>
        <h2 className="text-2xl font-bold">저장 완료!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          블로그 포스트가 성공적으로 저장되었습니다.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Link href={`/posts/${savedPostId}/edit`} className={buttonVariants({ variant: 'default' })}>
          포스트 편집
        </Link>
        <Link href="/posts" className={buttonVariants({ variant: 'outline' })}>
          목록으로
        </Link>
        <Button variant="ghost" onClick={handleReset}>
          새 글 작성
        </Button>
      </div>
    </div>
  )
}
