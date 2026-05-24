import { NextRequest } from 'next/server'
import { fetchGitHub } from '@/lib/github'
import type { GitHubUser } from '@/types'

export async function GET(req: NextRequest) {
  const pat = req.headers.get('x-github-pat')
  if (!pat) {
    return Response.json({ error: 'PAT가 필요합니다.' }, { status: 401 })
  }

  try {
    const user = (await fetchGitHub('/user', pat)) as GitHubUser
    return Response.json(user)
  } catch {
    return Response.json({ error: '유효하지 않은 PAT입니다.' }, { status: 401 })
  }
}
