'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import MarkdownEditor from '@/components/shared/MarkdownEditor'

interface Post {
  _id: string
  title: string
  content: string
  repoFullName: string
  branch: string
  published: boolean
}

function parseTitle(markdown: string): string {
  const firstLine = markdown.split('\n')[0] ?? ''
  return firstLine.startsWith('# ') ? firstLine.slice(2).trim() : ''
}

function removeFirstHeading(markdown: string): string {
  const lines = markdown.split('\n')
  if (lines[0]?.startsWith('# ')) {
    return lines.slice(1).join('\n').trimStart()
  }
  return markdown
}

export default function PostEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch(`/api/posts/${id}`)
        if (!res.ok) throw new Error('포스트를 불러오지 못했습니다.')
        const data: Post = await res.json()
        setPost(data)
        setTitle(parseTitle(data.content))
        setContent(removeFirstHeading(data.content))
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '포스트를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }
    loadPost()
  }, [id])

  async function handleSave() {
    if (!title.trim()) {
      toast.error('제목을 입력해주세요.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: `# ${title.trim()}\n\n${content}`,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? '저장에 실패했습니다.')
      }
      const updated: Post = await res.json()
      setPost(updated)
      toast.success('저장되었습니다.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  async function handleTogglePublish() {
    if (!post) return
    setSaving(true)
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !post.published }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? '발행 상태 변경에 실패했습니다.')
      }
      const updated: Post = await res.json()
      setPost(updated)
      toast.success(updated.published ? '발행되었습니다.' : '초안으로 전환되었습니다.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '발행 상태 변경에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    setSaving(true)
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? '삭제에 실패했습니다.')
      }
      router.push('/posts')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '삭제에 실패했습니다.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="mb-6 h-8 w-24" />
        <Skeleton className="mb-4 h-8 w-1/2" />
        <Skeleton className="mb-4 h-10 w-full" />
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
      <div className="mb-6">
        <Link href={`/posts/${id}`} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          ← 보기로 돌아가기
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">포스트 편집</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {post.repoFullName} · {post.branch}
          </p>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={saving}>
          삭제
        </Button>
      </div>

      <div className="mb-4 space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="블로그 포스트 제목"
          disabled={saving}
        />
      </div>

      <div className="mb-6">
        <MarkdownEditor value={content} onChange={setContent} height={480} />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleTogglePublish} disabled={saving}>
          {post.published ? '초안으로 전환' : '발행하기'}
        </Button>
        <Button
          className="flex-1"
          onClick={handleSave}
          disabled={saving || !title.trim()}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              저장 중…
            </span>
          ) : (
            '저장'
          )}
        </Button>
      </div>
    </main>
  )
}
