'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button, buttonVariants } from '@/components/ui/button'

export default function NavBar() {
  const { data: session, status } = useSession()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/posts" className="text-lg font-bold tracking-tight">
          commit-to-blog
        </Link>

        <div className="flex items-center gap-3">
          {status === 'authenticated' && session ? (
            <>
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? ''}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              )}
              <span className="hidden text-sm text-muted-foreground sm:block">
                {session.user?.name}
              </span>
              <Link href="/new" className={buttonVariants({ size: 'sm' })}>
                새 글 작성
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/posts' })}
              >
                로그아웃
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => signIn('github')}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? '로딩 중…' : 'GitHub로 로그인'}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
