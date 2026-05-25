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
      { error: classifyGeminiError(err) },
      { status: 500 }
    )
  }
}

function classifyGeminiError(err: unknown): string {
  const msg = err instanceof Error ? err.message : ''

  if (msg.includes('429') || /too many requests/i.test(msg)) {
    return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
  }
  if (msg.includes('404') || /is not found/i.test(msg)) {
    return 'AI 모델을 찾을 수 없습니다. 모델명을 확인해주세요.'
  }
  if (msg.includes('403') || /api key/i.test(msg) || /quota/i.test(msg)) {
    return 'API 키가 유효하지 않거나 할당량이 초과되었습니다.'
  }

  return `블로그 초안 생성에 실패했습니다. (상세: ${msg || '알 수 없는 오류'})`
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
