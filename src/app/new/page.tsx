'use client'

import WizardShell from '@/components/wizard/WizardShell'
import { useWizardState } from '@/hooks/useWizardState'

export default function NewPage() {
  const { state } = useWizardState()

  function renderStep() {
    switch (state.step) {
      case 1:
        return <div className="text-center text-muted-foreground">Step 1: PAT 입력 (준비 중)</div>
      case 2:
        return <div className="text-center text-muted-foreground">Step 2: 저장소 선택 (준비 중)</div>
      case 3:
        return <div className="text-center text-muted-foreground">Step 3: 브랜치 선택 (준비 중)</div>
      case 4:
        return <div className="text-center text-muted-foreground">Step 4: 커밋 선택 (준비 중)</div>
      case 5:
        return <div className="text-center text-muted-foreground">Step 5: AI 생성 중 (준비 중)</div>
      case 6:
        return <div className="text-center text-muted-foreground">Step 6: 글 편집 (준비 중)</div>
      case 7:
        return <div className="text-center text-muted-foreground">Step 7: 저장 완료 (준비 중)</div>
      default:
        return null
    }
  }

  return (
    <WizardShell step={state.step}>
      {renderStep()}
    </WizardShell>
  )
}
