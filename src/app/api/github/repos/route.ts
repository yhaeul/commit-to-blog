import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fetchGitHub } from '@/lib/github'
import type { Repo } from '@/types'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  try {
    const repos = (await fetchGitHub(
      '/user/repos?per_page=100&sort=updated&affiliation=owner',
      session.accessToken
    )) as Repo[]
    return Response.json(repos)
  } catch {
    return Response.json(
      { error: '저장소 목록을 불러오지 못했습니다.' },
      { status: 500 }
    )
  }
}
