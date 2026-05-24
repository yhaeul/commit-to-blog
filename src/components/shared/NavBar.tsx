import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/posts" className="text-lg font-bold tracking-tight">
          commit-to-blog
        </Link>
        <Link href="/new" className={buttonVariants({ size: 'sm' })}>
          새 글 작성
        </Link>
      </div>
    </header>
  )
}
