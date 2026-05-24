import { NextRequest } from 'next/server'
import { generateBlogDraft } from '@/lib/gemini'

const PAYLOAD_LIMIT = 20000

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { diffs, repoFullName, branch } = body as {
      diffs: string[]
      repoFullName: string
      branch: string
    }

    if (!diffs || !Array.isArray(diffs) || diffs.length === 0) {
      return Response.json({ error: 'diffs가 필요합니다.' }, { status: 400 })
    }
    if (!repoFullName || !branch) {
      return Response.json(
        { error: 'repoFullName, branch가 필요합니다.' },
        { status: 400 }
      )
    }

    // 전체 payload를 20000자로 truncate
    const truncatedDiffs = truncateDiffs(diffs, PAYLOAD_LIMIT)

    const markdown = await generateBlogDraft(truncatedDiffs, repoFullName, branch)
    return Response.json({ markdown })
  } catch (err) {
    console.error('generate error:', err)
    return Response.json(
      { error: '블로그 초안 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}

function truncateDiffs(diffs: string[], limit: number): string[] {
  const result: string[] = []
  let total = 0

  for (const diff of diffs) {
    if (total >= limit) break
    const remaining = limit - total
    result.push(diff.slice(0, remaining))
    total += Math.min(diff.length, remaining)
  }

  return result
}
