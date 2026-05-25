import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Post from '@/models/Post'

export async function GET() {
  const session = await getServerSession(authOptions)

  try {
    await connectDB()
    // 비로그인 사용자는 발행된 포스트만 조회
    const filter = session ? {} : { published: true }
    const posts = await Post.find(filter).sort({ createdAt: -1 }).lean()
    return Response.json(posts)
  } catch {
    return Response.json(
      { error: '포스트 목록을 불러오지 못했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  try {
    await connectDB()
    const body = await req.json()
    const { title, content, repoFullName, branch, selectedShas, thumbnailUrl } =
      body

    if (!title || !content || !repoFullName || !branch || !selectedShas) {
      return Response.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const post = await Post.create({
      title,
      content,
      repoFullName,
      branch,
      selectedShas,
      thumbnailUrl,
      published: false,
    })

    return Response.json(post, { status: 201 })
  } catch {
    return Response.json(
      { error: '포스트 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
