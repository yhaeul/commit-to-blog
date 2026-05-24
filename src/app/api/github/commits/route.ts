import { NextRequest } from 'next/server'
import { fetchGitHub } from '@/lib/github'
import type { Commit } from '@/types'

export async function GET(req: NextRequest) {
  const pat = req.headers.get('x-github-pat')
  if (!pat) {
    return Response.json({ error: 'PAT가 필요합니다.' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const owner = searchParams.get('owner')
  const repo = searchParams.get('repo')
  const branch = searchParams.get('branch')

  if (!owner || !repo || !branch) {
    return Response.json(
      { error: 'owner, repo, branch 파라미터가 필요합니다.' },
      { status: 400 }
    )
  }

  try {
    const commits = (await fetchGitHub(
      `/repos/${owner}/${repo}/commits?sha=${branch}&per_page=30`,
      pat
    )) as Commit[]
    return Response.json(commits)
  } catch {
    return Response.json(
      { error: '커밋 목록을 불러오지 못했습니다.' },
      { status: 500 }
    )
  }
}
