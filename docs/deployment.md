# 배포

## 환경 변수 (`.env.local`)

```
MONGODB_URI=mongodb+srv://<user>:<pw>@cluster0.xxxxx.mongodb.net/commit-to-blog
GEMINI_API_KEY=AIza...

# GitHub OAuth (github.com/settings/developers 에서 OAuth App 생성)
GITHUB_CLIENT_ID=Ov23li...
GITHUB_CLIENT_SECRET=...

# NextAuth (임의의 긴 랜덤 문자열 — openssl rand -base64 32)
NEXTAUTH_SECRET=...
# 로컬 개발 시
NEXTAUTH_URL=http://localhost:3000
# Vercel 배포 시 자동 설정되므로 생략 가능

# 단일 사용자 제한 — 이 GitHub 로그인만 접근 허용 (설정하지 않으면 누구나 로그인 가능)
NEXT_PUBLIC_ALLOWED_GITHUB_LOGIN=your-github-username
```

`.env.local`은 절대 커밋하지 않는다.

## GitHub OAuth App 설정

1. [github.com/settings/developers](https://github.com/settings/developers) → "New OAuth App"
2. **Homepage URL**: `https://<your-vercel-domain>.vercel.app`
3. **Authorization callback URL**: `https://<your-vercel-domain>.vercel.app/api/auth/callback/github`
4. 생성 후 `Client ID`와 `Client Secret`을 환경 변수에 입력

> 로컬 개발용 OAuth App을 별도로 만들고 callback URL을 `http://localhost:3000/api/auth/callback/github`로 설정하면 편리하다.

## Vercel 배포

1. vercel.com에서 GitHub 저장소 연결
2. 환경 변수 입력:
   - `MONGODB_URI`
   - `GEMINI_API_KEY`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXT_PUBLIC_ALLOWED_GITHUB_LOGIN`
   - (`NEXTAUTH_URL`은 Vercel에서 자동 설정 — 생략 가능)
3. Deploy — 이후 `main` push 시 자동 재배포

## MongoDB Atlas 설정

- Network Access에서 `0.0.0.0/0` 허용 (Vercel IP가 유동적이므로)
- 배포 시 환경 변수 `MONGODB_URI`를 Vercel 프로젝트 설정에 추가
