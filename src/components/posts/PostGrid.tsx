import PostCard, { type PostItem } from './PostCard'

interface PostGridProps {
  posts: PostItem[]
  onTogglePublish: (id: string, newPublished: boolean) => Promise<void>
}

export default function PostGrid({ posts, onTogglePublish }: PostGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} onTogglePublish={onTogglePublish} />
      ))}
    </div>
  )
}
