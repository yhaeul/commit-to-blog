import mongoose, { Schema, Document } from 'mongoose'

export interface IPost extends Document {
  title: string
  content: string
  repoFullName: string
  branch: string
  selectedShas: string[]
  thumbnailUrl?: string
  published: boolean
  createdAt: Date
  updatedAt: Date
}

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    repoFullName: { type: String, required: true },
    branch: { type: String, required: true },
    selectedShas: { type: [String], required: true },
    thumbnailUrl: { type: String },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const Post = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema)

export default Post
