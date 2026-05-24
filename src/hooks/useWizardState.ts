'use client'

import { useReducer } from 'react'
import type { Repo } from '@/types'

export type WizardState = {
  step: number
  repo: Repo | null
  branch: string
  selectedShas: string[]
  generatedMarkdown: string
  savedPostId: string
}

export type WizardAction =
  | { type: 'SET_REPO'; repo: Repo }
  | { type: 'SET_BRANCH'; branch: string }
  | { type: 'SET_SHAS'; shas: string[] }
  | { type: 'SET_MARKDOWN'; markdown: string }
  | { type: 'SET_SAVED'; postId: string }
  | { type: 'BACK' }
  | { type: 'RESET' }

const initialState: WizardState = {
  step: 1,
  repo: null,
  branch: '',
  selectedShas: [],
  generatedMarkdown: '',
  savedPostId: '',
}

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_REPO':
      return { ...state, repo: action.repo, step: 2 }
    case 'SET_BRANCH':
      return { ...state, branch: action.branch, step: 3 }
    case 'SET_SHAS':
      return { ...state, selectedShas: action.shas, step: 4 }
    case 'SET_MARKDOWN':
      return { ...state, generatedMarkdown: action.markdown, step: 5 }
    case 'SET_SAVED':
      return { ...state, savedPostId: action.postId, step: 6 }
    case 'BACK':
      return { ...state, step: Math.max(1, state.step - 1) }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export function useWizardState() {
  const [state, dispatch] = useReducer(wizardReducer, initialState)
  return { state, dispatch }
}
