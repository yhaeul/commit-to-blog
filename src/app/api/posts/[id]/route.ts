import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Post from '@/models/Post'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const post = await Post.findById(params.id).lean()
    if (!post) {
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
