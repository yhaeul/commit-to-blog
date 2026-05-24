'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import PostGrid from '@/components/posts/PostGrid'
import PostCardSkeleton from '@/components/posts/PostCardSkeleton'
import type { PostItem } from '@/components/posts/PostCard'

export default function PostsPage() {
  const [posts, setPosts] = useState<PostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadPosts() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/posts')
      if (!res.ok) throw new Error('포스트 목록을 불러오지 못했습니다.')
      const data = await res.json()
      setPosts(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '포스트 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleTogglePublish(id: string, newPublished: boolean) {
    // 낙관적 업데이트
    const prev = posts
    setPosts((ps) =>
      ps.map((p) => (p._id === id ? { ...p, published: newPublished } : p))
    )

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: newPublished }),
      })
      if (!res.ok) throw new Error('발행 상태 변경에 실패했습니다.')
    } catch (e) {
      setPosts(prev) // 롤백
      toast.error(e instanceof Error ? e.message : '발행 상태 변경에 실패했습니다.')
      throw e
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">내 블로그 포스트</h1>
        <Link href="/new" className={buttonVariants()}>
          새 글 작성
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <p className="mb-4 text-destructive">{error}</p>
          <Button variant="outline" onClick={loadPosts}>
            다시 시도
          </Button>
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="mb-6 text-lg text-muted-foreground">
            아직 작성된 글이 없습니다
          </p>
          <Link href="/new" className={buttonVariants()}>
            새 글 작성
          </Link>
        </div>
      ) : (
        <PostGrid posts={posts} onTogglePublish={handleTogglePublish} />
      )}
    </main>
  )
}
