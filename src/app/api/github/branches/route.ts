import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fetchGitHub } from '@/lib/github'
import type { Branch } from '@/types'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const owner = searchParams.get('owner')
  const repo = searchParams.get('repo')

  if (!owner || !repo) {
    return Response.json(
      { error: 'owner, repo 파라미터가 필요합니다.' },
      { status: 400 }
    )
  }

  try {
    const branches = (await fetchGitHub(
      `/repos/${owner}/${repo}/branches?per_page=100`,
      session.accessToken
    )) as Branch[]
    return Response.json(branches)
  } catch {
    return Response.json(
      { error: '브랜치 목록을 불러오지 못했습니다.' },
      { status: 500 }
    )
  }
}
