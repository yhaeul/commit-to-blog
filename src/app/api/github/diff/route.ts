import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fetchGitHub } from '@/lib/github'

const DIFF_LIMIT_PER_COMMIT = 6000

interface GitHubCommitDetail {
  sha: string
  commit: {
    message: string
  }
  files?: {
    filename: string
    patch?: string
  }[]
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const owner = searchParams.get('owner')
  const repo = searchParams.get('repo')
  const shas = searchParams.get('shas')

  if (!owner || !repo || !shas) {
    return Response.json(
      { error: 'owner, repo, shas 파라미터가 필요합니다.' },
      { status: 400 }
    )
  }

  const shaList = shas.split(',').map((s) => s.trim()).filter(Boolean)

  try {
    const diffs = await Promise.all(
      shaList.map(async (sha) => {
        const detail = (await fetchGitHub(
          `/repos/${owner}/${repo}/commits/${sha}`,
          session.accessToken
        )) as GitHubCommitDetail

        const message = detail.commit.message
        const patch = (detail.files ?? [])
          .map((f) => `--- ${f.filename}\n${f.patch ?? ''}`)
          .join('\n')

        const combined = `## ${sha.slice(0, 7)}: ${message}\n${patch}`
        return combined.slice(0, DIFF_LIMIT_PER_COMMIT)
      })
    )

    return Response.json({ diffs })
  } catch {
    return Response.json(
      { error: 'diff를 불러오지 못했습니다.' },
      { status: 500 }
    )
  }
}
