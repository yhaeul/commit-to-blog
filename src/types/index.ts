export interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
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
