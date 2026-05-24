import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Post from '@/models/Post'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  try {
    await connectDB()
    const post = await Post.findById(params.id).lean()
    if (!post) {
      return Response.json({ error: '포스트를 찾을 수 없습니다.' }, { status: 404 })
    }
    // 비로그인 사용자는 미발행 포스트에 접근 불가
    if (!session && !post.published) {
      return Response.json({ error: '포스트를 찾을 수 없습니다.' }, { status: 404 })
    }
    return Response.json(post)
  } catch {
    return Response.json(
      { error: '포스트를 불러오지 못했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  try {
    await connectDB()
    const body = await req.json()
    const post = await Post.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    }).lean()
    if (!post) {
      return Response.json({ error: '포스트를 찾을 수 없습니다.' }, { status: 404 })
    }
    return Response.json(post)
  } catch {
    return Response.json(
      { error: '포스트 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  try {
    await connectDB()
    const post = await Post.findByIdAndDelete(params.id)
    if (!post) {
      return Response.json({ error: '포스트를 찾을 수 없습니다.' }, { status: 404 })
    }
    return Response.json({ success: true })
  } catch {
    return Response.json(
      { error: '포스트 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
