'use client'

import { useReducer } from 'react'
import type { GitHubUser, Repo } from '@/types'

export type WizardState = {
  step: number
  pat: string
  user: GitHubUser | null
  repo: Repo | null
  branch: string
  selectedShas: string[]
  generatedMarkdown: string
  savedPostId: string
}

export type WizardAction =
  | { type: 'SET_PAT'; pat: string; user: GitHubUser }
  | { type: 'SET_REPO'; repo: Repo }
  | { type: 'SET_BRANCH'; branch: string }
  | { type: 'SET_SHAS'; shas: string[] }
  | { type: 'SET_MARKDOWN'; markdown: string }
  | { type: 'SET_SAVED'; postId: string }
  | { type: 'RESET' }

const initialState: WizardState = {
  step: 1,
  pat: '',
  user: null,
  repo: null,
  branch: '',
  selectedShas: [],
  generatedMarkdown: '',
  savedPostId: '',
}

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_PAT':
      return { ...state, pat: action.pat, user: action.user, step: 2 }
    case 'SET_REPO':
      return { ...state, repo: action.repo, step: 3 }
    case 'SET_BRANCH':
      return { ...state, branch: action.branch, step: 4 }
    case 'SET_SHAS':
      return { ...state, selectedShas: action.shas, step: 5 }
    case 'SET_MARKDOWN':
      return { ...state, generatedMarkdown: action.markdown, step: 6 }
    case 'SET_SAVED':
      return { ...state, savedPostId: action.postId, step: 7 }
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
