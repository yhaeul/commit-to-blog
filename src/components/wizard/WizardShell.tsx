'use client'

const STEPS = [
  '저장소 선택',
  '브랜치 선택',
  '커밋 선택',
  'AI 생성',
  '글 편집',
  '저장 완료',
]

interface WizardShellProps {
  step: number
  children: React.ReactNode
}

export default function WizardShell({ step, children }: WizardShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* 단계 인디케이터 */}
        <nav className="mb-10">
          <ol className="flex items-center justify-between">
            {STEPS.map((label, idx) => {
              const num = idx + 1
              const isCompleted = num < step
              const isCurrent = num === step

              return (
                <li key={num} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={[
                        'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                        isCompleted
                          ? 'bg-primary text-primary-foreground'
                          : isCurrent
                            ? 'border-2 border-primary text-primary'
                            : 'border-2 border-muted text-muted-foreground',
                      ].join(' ')}
                    >
                      {isCompleted ? '✓' : num}
                    </div>
                    <span
                      className={[
                        'hidden text-xs sm:block',
                        isCurrent ? 'font-medium text-primary' : 'text-muted-foreground',
                      ].join(' ')}
                    >
                      {label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={[
                        'mx-1 mb-5 h-px flex-1',
                        isCompleted ? 'bg-primary' : 'bg-muted',
                      ].join(' ')}
                    />
                  )}
                </li>
              )
            })}
          </ol>
        </nav>

        {/* 단계 콘텐츠 */}
        <div>{children}</div>
      </div>
    </div>
  )
}
