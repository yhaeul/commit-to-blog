'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Button, buttonVariants } from '@/components/ui/button'

export interface PostItem {
  _id: string
  title: string
  repoFullName: string
  branch: string
  thumbnailUrl?: string
  published: boolean
  createdAt: string
}

interface PostCardProps {
  post: PostItem
  onTogglePublish: (id: string, newPublished: boolean) => Promise<void>
}

function getBranchGradient(branch: string): string {
  let hash = 0
  for (let i = 0; i < branch.length; i++) {
    hash = branch.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h1 = Math.abs(hash) % 360
  const h2 = (h1 + 40) % 360
  return `linear-gradient(135deg, hsl(${h1}, 65%, 60%), hsl(${h2}, 65%, 45%))`
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
    <div className="flex flex-col overflow-hidden rounded-lg border">
      {/* 썸네일 */}
      <div className="relative h-32 w-full shrink-0">
        {post.thumbnailUrl ? (
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: getBranchGradient(post.branch) }}
          />
        )}
      </div>

      {/* 본문 */}
      <div className="flex flex-1 flex-col gap-3 p-4">
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

        <div className="mt-auto flex gap-2 pt-1">
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
    </div>
  )
}
