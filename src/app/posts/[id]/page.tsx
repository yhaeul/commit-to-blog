'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import MarkdownViewer from '@/components/shared/MarkdownViewer'

interface Post {
  _id: string
  title: string
  content: string
  repoFullName: string
  branch: string
  published: boolean
  createdAt: string
}

function removeFirstHeading(markdown: string): string {
  const lines = markdown.split('\n')
  if (lines[0]?.startsWith('# ')) {
    return lines.slice(1).join('\n').trimStart()
  }
  return markdown
}

export default function PostViewPage() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch(`/api/posts/${id}`)
        if (!res.ok) throw new Error()
        const data: Post = await res.json()
        setPost(data)
      } catch {
        setPost(null)
      } finally {
        setLoading(false)
      }
    }
    loadPost()
  }, [id])

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="mb-6 h-5 w-20" />
        <Skeleton className="mb-4 h-9 w-2/3" />
        <Skeleton className="mb-8 h-4 w-1/2" />
        <Skeleton className="h-96 w-full" />
      </main>
    )
  }

  if (!post) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/posts" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          ← 목록으로
        </Link>
        <p className="mt-8 text-center text-muted-foreground">포스트를 찾을 수 없습니다.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* 상단 네비 */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/posts" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          ← 목록으로
        </Link>
        <Link href={`/posts/${id}/edit`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          수정하기
        </Link>
      </div>

      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="mb-3 text-3xl font-bold">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>{post.repoFullName}</span>
          <span>·</span>
          <span>{post.branch}</span>
          <span>·</span>
          <span>{format(new Date(post.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}</span>
          <span
            className={[
              'rounded-full px-2.5 py-0.5 text-xs',
              post.published
                ? 'bg-green-100 text-green-700'
                : 'bg-muted text-muted-foreground',
            ].join(' ')}
          >
            {post.published ? '발행됨' : '초안'}
          </span>
        </div>
      </div>

      {/* 본문 */}
      <MarkdownViewer source={removeFirstHeading(post.content)} />
    </main>
  )
}
