'use client'

import dynamic from 'next/dynamic'

const MDPreview = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default.Markdown),
  { ssr: false }
)

interface MarkdownViewerProps {
  source: string
}

export default function MarkdownViewer({ source }: MarkdownViewerProps) {
  return (
    <div data-color-mode="light" className="prose max-w-none">
      <MDPreview source={source} />
    </div>
  )
}
