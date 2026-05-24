# 아키텍처

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx                        # Root layout — NavBar, Sonner Toaster 포함
│   ├── page.tsx                          # / → /posts 리다이렉트
│   ├── globals.css
│   ├── new/
│   │   └── page.tsx                      # 블로그 생성 위저드 (6단계, 로그인 필요)
│   ├── posts/
│   │   ├── page.tsx                      # 저장된 포스트 카드 그리드
│   │   └── [id]/
│   │       ├── page.tsx                  # 포스트 읽기 (마크다운 렌더링)
│   │       └── edit/
│   │           └── page.tsx             # 포스트 편집/발행/삭제
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts              # NextAuth.js 핸들러 (GET/POST)
│       ├── github/
│       │   ├── repos/
│       │   │   └── route.ts              # GET — 저장소 목록
│       │   ├── branches/
│       │   │   └── route.ts              # GET — 브랜치 목록
│       │   ├── commits/
│       │   │   └── route.ts              # GET — 커밋 목록 (최근 30개)
│       │   └── diff/
│       │       └── route.ts              # GET — 커밋 diff (6000자/커밋 truncate)
│       ├── generate/
│       │   └── route.ts                  # POST — Gemini 블로그 초안 생성
│       └── posts/
│           ├── route.ts                  # GET 목록 조회 / POST 포스트 생성
│           └── [id]/
│               └── route.ts             # GET / PUT / DELETE 개별 포스트 조작
├── components/
│   ├── ui/                               # shadcn 자동 생성 — 직접 수정 금지
│   ├── wizard/
│   │   ├── WizardShell.tsx               # 단계 인디케이터 + 레이아웃 wrapper
│   │   ├── StepRepoSelect.tsx            # Step 1 — 저장소 목록 및 선택
│   │   ├── StepBranchSelect.tsx          # Step 2 — 브랜치 목록 및 선택
│   │   ├── StepCommitSelect.tsx          # Step 3 — 커밋 다중 선택
│   │   ├── StepGenerating.tsx            # Step 4 — AI 생성 중 로딩 화면
│   │   ├── StepEditor.tsx                # Step 5 — 마크다운 편집기
│   │   └── StepSaved.tsx                 # Step 6 — 저장 완료 화면
│   ├── posts/
│   │   ├── PostGrid.tsx                  # 포스트 카드 그리드 레이아웃
│   │   ├── PostCard.tsx                  # 포스트 카드 (썸네일, 제목, 태그, 날짜)
│   │   └── PostCardSkeleton.tsx          # 로딩 중 스켈레톤 카드
│   └── shared/
│       ├── MarkdownEditor.tsx            # @uiw/react-md-editor dynamic import 래퍼 (편집기)
│       ├── MarkdownViewer.tsx            # @uiw/react-md-editor Markdown preview 래퍼 (읽기 전용)
│       └── NavBar.tsx                    # 상단 네비게이션 (로고, 로그인 상태, 새 글 작성 버튼)
├── lib/
│   ├── mongodb.ts                        # MongoDB 커넥션 싱글톤 (global 캐싱)
│   ├── auth.ts                           # NextAuth authOptions (GitHub Provider 설정)
│   ├── github.ts                         # GitHub REST API fetch 헬퍼
│   ├── gemini.ts                         # Gemini 클라이언트 + 프롬프트 템플릿
│   └── utils.ts                          # cn() helper (Tailwind 클래스 병합)
├── models/
│   └── Post.ts                           # Mongoose Post 스키마 및 모델
├── hooks/
│   └── useWizardState.ts                 # useReducer — 위저드 전역 상태 관리
└── types/
    └── index.ts                          # 공유 TypeScript 인터페이스 (Repo, Commit 등)
```

---

## Data Model

```typescript
// src/models/Post.ts
{
  title: string           // required
  content: string         // 전체 마크다운
  repoFullName: string    // "owner/repo"
  branch: string
  selectedShas: string[]  // 생성에 사용된 커밋 SHA 목록
  thumbnailUrl?: string   // 선택 사항 — 없으면 branch 기반 CSS 그라디언트로 대체
  published: boolean      // default: false
  createdAt: Date         // timestamps: true
  updatedAt: Date
}
```

- `thumbnailUrl`이 없으면 `branch` 값 기반 CSS 그라디언트로 대체한다.
- 카드에 본문 미리보기는 표시하지 않는다. 읽기 화면(`/posts/[id]`)에서 전체 내용을 렌더링한다.

---

## 데이터 보관

| 데이터 | 보관 위치 | 생명주기 |
|---|---|---|
| 블로그 포스트 | MongoDB Atlas | 영구 저장 |
| GitHub 액세스 토큰 | NextAuth 서버 세션 (HttpOnly 쿠키) | 로그아웃 또는 만료 시 삭제 |
| 위저드 진행 상태 | React 메모리 (useReducer) | 페이지 이탈 시 소멸 |
| Gemini / GitHub API 키 | 서버 환경변수 (`.env.local`) | 서버에만 존재, 브라우저 노출 금지 |
| GitHub OAuth 앱 자격증명 | 서버 환경변수 (`.env.local`) | 서버에만 존재 |

- 액세스 토큰은 DB에 저장하지 않는다. API Route에서 `getServerSession()`으로만 읽는다.
- 위저드 상태는 저장하지 않는다. 새로고침 시 Step 1부터 다시 시작.
- 미인증 상태에서 `/new` 접근 시 로그인 페이지로 리다이렉트한다.

---

## API Routes

| Route | Method | 설명 |
|---|---|---|
| `/api/auth/[...nextauth]` | GET / POST | NextAuth.js 핸들러 (로그인·로그아웃·콜백) |
| `/api/github/repos` | GET | 저장소 목록 |
| `/api/github/branches` | GET | ?owner=&repo= |
| `/api/github/commits` | GET | ?owner=&repo=&branch= |
| `/api/github/diff` | GET | ?owner=&repo=&shas=sha1,sha2 |
| `/api/generate` | POST | Gemini로 블로그 초안 생성 |
| `/api/posts` | GET / POST | 목록 조회 / 포스트 생성 |
| `/api/posts/[id]` | GET / PUT / DELETE | 개별 포스트 조작 |

모든 GitHub API 라우트는 `getServerSession(authOptions)`로 세션을 확인하고, 세션이 없으면 401을 반환한다.
액세스 토큰은 `session.accessToken`에서 읽는다 (클라이언트에 노출되지 않음).

---

## 상태 흐름

### WizardState 구조

```typescript
type WizardState = {
  step: number           // 현재 단계 (1–6)
  repo: Repo | null      // { id, name, full_name, private }
  branch: string
  selectedShas: string[] // 선택된 커밋 SHA 목록
  generatedMarkdown: string
  savedPostId: string
}
```

- `pat` / `user` 필드 없음 — 인증 정보는 NextAuth 세션에서 서버 사이드로만 접근
- 위저드 진입 전 `useSession()`으로 로그인 여부를 확인하고, 미인증 시 로그인 페이지로 리다이렉트

### 위저드 흐름

```
/new/page.tsx (useReducer)
    │ (미로그인 → /api/auth/signin 리다이렉트)
    │
    ├── WizardShell          ← step 값으로 현재 단계 표시
    │
    ├── StepRepoSelect       → /api/github/repos 호출 (서버에서 세션 토큰 사용)
    │                          선택 시 dispatch SET_REPO → step 1→2
    │
    ├── StepBranchSelect     → /api/github/branches 호출
    │                          선택 시 dispatch SET_BRANCH → step 2→3
    │
    ├── StepCommitSelect     → /api/github/commits 호출
    │                          체크박스로 다중 선택 → dispatch SET_SHAS → step 3→4
    │
    ├── StepGenerating       → /api/github/diff + /api/generate 호출
    │                          완료 시 dispatch SET_MARKDOWN → step 4→5
    │
    ├── StepEditor           → 마크다운 편집 → /api/posts POST 호출
    │                          저장 시 dispatch SET_SAVED → step 5→6
    │
    └── StepSaved            → savedPostId로 /posts/[id]/edit 링크 제공
```

### WizardAction 목록

```typescript
type WizardAction =
  | { type: 'SET_REPO'; repo: Repo }
  | { type: 'SET_BRANCH'; branch: string }
  | { type: 'SET_SHAS'; shas: string[] }
  | { type: 'SET_MARKDOWN'; markdown: string }
  | { type: 'SET_SAVED'; postId: string }
  | { type: 'BACK' }   // step - 1 (최소 1)
  | { type: 'RESET' }  // initialState로 초기화
```

### 그 외 화면 (단순 useState)

| 화면 | 상태 | 설명 |
|---|---|---|
| `/posts` | `posts`, `loading`, `error` | 마운트 시 `/api/posts` fetch |
| `/posts/[id]` | `post`, `loading` | 마운트 시 `/api/posts/[id]` fetch, 읽기 전용 렌더링 |
| `/posts/[id]/edit` | `post`, `title`, `content`, `saving` | 마운트 시 `/api/posts/[id]` fetch, 편집/발행/삭제 |
| NavBar | `useSession()` | 로그인 상태에 따라 로그인/로그아웃 버튼 전환 |
