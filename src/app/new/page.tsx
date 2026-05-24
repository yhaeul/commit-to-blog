'use client'

import WizardShell from '@/components/wizard/WizardShell'
import StepPatInput from '@/components/wizard/StepPatInput'
import StepRepoSelect from '@/components/wizard/StepRepoSelect'
import StepBranchSelect from '@/components/wizard/StepBranchSelect'
import StepCommitSelect from '@/components/wizard/StepCommitSelect'
import { useWizardState } from '@/hooks/useWizardState'

export default function NewPage() {
  const { state, dispatch } = useWizardState()

  function renderStep() {
    switch (state.step) {
      case 1:
        return <StepPatInput dispatch={dispatch} />
      case 2:
        return <StepRepoSelect pat={state.pat} dispatch={dispatch} />
      case 3:
        return <StepBranchSelect pat={state.pat} repo={state.repo!} dispatch={dispatch} />
      case 4:
        return <StepCommitSelect pat={state.pat} repo={state.repo!} branch={state.branch} dispatch={dispatch} />
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
