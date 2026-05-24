import { NextRequest } from 'next/server'
import { fetchGitHub } from '@/lib/github'
import type { Repo } from '@/types'

export async function GET(req: NextRequest) {
  const pat = req.headers.get('x-github-pat')
  if (!pat) {
    return Response.json({ error: 'PAT가 필요합니다.' }, { status: 401 })
  }

  try {
    const repos = (await fetchGitHub(
      '/user/repos?per_page=100&sort=updated&affiliation=owner',
      pat
    )) as Repo[]
    return Response.json(repos)
  } catch {
    return Response.json(
      { error: '저장소 목록을 불러오지 못했습니다.' },
      { status: 500 }
    )
  }
}
