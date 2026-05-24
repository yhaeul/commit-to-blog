import type { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          // 저장소 읽기 권한 요청
          scope: 'read:user repo',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      // ALLOWED_GITHUB_LOGIN이 설정된 경우 해당 계정만 로그인 허용
      const allowed = process.env.ALLOWED_GITHUB_LOGIN
      if (allowed && (profile as { login?: string })?.login !== allowed) {
        return false
      }
      return true
    },
    async jwt({ token, account }) {
      // 최초 로그인 시 account에 GitHub 액세스 토큰이 포함됨
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      // 서버 사이드에서만 사용 — 클라이언트 응답에는 포함되지 않도록 주의
      session.accessToken = token.accessToken as string
      return session
    },
  },
}
