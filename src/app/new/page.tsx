'use client'

import { useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import WizardShell from '@/components/wizard/WizardShell'
import StepRepoSelect from '@/components/wizard/StepRepoSelect'
import StepBranchSelect from '@/components/wizard/StepBranchSelect'
import StepCommitSelect from '@/components/wizard/StepCommitSelect'
import StepGenerating from '@/components/wizard/StepGenerating'
import StepEditor from '@/components/wizard/StepEditor'
import StepSaved from '@/components/wizard/StepSaved'
import { useWizardState } from '@/hooks/useWizardState'

export default function NewPage() {
  const { status } = useSession()
  const { state, dispatch } = useWizardState()

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn('github')
    }
  }, [status])

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  function renderStep() {
    switch (state.step) {
      case 1:
        return <StepRepoSelect dispatch={dispatch} />
      case 2:
        return <StepBranchSelect repo={state.repo!} dispatch={dispatch} />
      case 3:
        return <StepCommitSelect repo={state.repo!} branch={state.branch} dispatch={dispatch} />
      case 4:
        return <StepGenerating repo={state.repo!} branch={state.branch} selectedShas={state.selectedShas} dispatch={dispatch} />
      case 5:
        return <StepEditor repo={state.repo!} branch={state.branch} selectedShas={state.selectedShas} generatedMarkdown={state.generatedMarkdown} dispatch={dispatch} />
      case 6:
        return <StepSaved savedPostId={state.savedPostId} dispatch={dispatch} />
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
