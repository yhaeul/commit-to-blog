'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">yhaeul 블로그 포스트</h1>
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
        <PostGrid posts={posts} />
      )}
    </main>
  )
}
