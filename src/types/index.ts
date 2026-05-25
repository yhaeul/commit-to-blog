export interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
}

// next-auth 타입 확장 — Session에 accessToken 추가
declare module 'next-auth' {
  interface Session {
    accessToken: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
  }
}

export interface Repo {
  id: number
  name: string
  full_name: string
  private: boolean
}

export interface Branch {
  name: string
}

export interface Commit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
}
