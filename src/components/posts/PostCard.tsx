'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Button, buttonVariants } from '@/components/ui/button'

export interface PostItem {
  _id: string
  title: string
  repoFullName: string
  branch: string
  published: boolean
  createdAt: string
}

interface PostCardProps {
  post: PostItem
  onTogglePublish: (id: string, newPublished: boolean) => Promise<void>
}

export default function PostCard({ post, onTogglePublish }: PostCardProps) {
  const [publishing, setPublishing] = useState(false)

  async function handleToggle() {
    setPublishing(true)
    try {
      await onTogglePublish(post._id, !post.published)
    } catch {
      // 에러 처리는 onTogglePublish(부모)에서 담당
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-5">
      <h3 className="line-clamp-2 text-base font-semibold">{post.title}</h3>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
          {post.repoFullName}
        </span>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
          {post.branch}
        </span>
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

      <p className="text-xs text-muted-foreground">
        {format(new Date(post.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
      </p>

      <div className="mt-auto flex gap-2 pt-2">
        <Link
          href={`/posts/${post._id}`}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          수정하기
        </Link>
        <Button
          size="sm"
          variant={post.published ? 'secondary' : 'default'}
          onClick={handleToggle}
          disabled={publishing}
        >
          {publishing ? '처리 중…' : post.published ? '초안으로' : '발행하기'}
        </Button>
      </div>
    </div>
  )
}
