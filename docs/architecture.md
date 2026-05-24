# 아키텍처

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx                        # Root layout — NavBar, Sonner Toaster 포함
│   ├── page.tsx                          # / → /posts 리다이렉트
│   ├── globals.css
│   ├── new/
│   │   └── page.tsx                      # 블로그 생성 위저드 (7단계)
│   ├── posts/
│   │   ├── page.tsx                      # 저장된 포스트 카드 그리드
│   │   └── [id]/
│   │       └── page.tsx                  # 포스트 편집/발행
│   └── api/
│       ├── github/
│       │   ├── validate/
│       │   │   └── route.ts              # GET — PAT 검증, 유저 정보 반환
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
│   │   ├── StepPatInput.tsx              # Step 1 — PAT 입력 및 검증
│   │   ├── StepRepoSelect.tsx            # Step 2 — 저장소 목록 및 선택
│   │   ├── StepBranchSelect.tsx          # Step 3 — 브랜치 목록 및 선택
│   │   ├── StepCommitSelect.tsx          # Step 4 — 커밋 다중 선택
│   │   ├── StepGenerating.tsx            # Step 5 — AI 생성 중 로딩 화면
│   │   ├── StepEditor.tsx                # Step 6 — 마크다운 편집기
│   │   └── StepSaved.tsx                 # Step 7 — 저장 완료 화면
│   ├── posts/
│   │   ├── PostGrid.tsx                  # 포스트 카드 그리드 레이아웃
│   │   ├── PostCard.tsx                  # 포스트 카드 (썸네일, 제목, 태그, 날짜)
│   │   └── PostCardSkeleton.tsx          # 로딩 중 스켈레톤 카드
│   └── shared/
│       ├── MarkdownEditor.tsx            # @uiw/react-md-editor dynamic import 래퍼
│       └── NavBar.tsx                    # 상단 네비게이션 (로고, 새 글 작성 버튼)
├── lib/
│   ├── mongodb.ts                        # MongoDB 커넥션 싱글톤 (global 캐싱)
│   ├── github.ts                         # GitHub REST API fetch 헬퍼
│   ├── gemini.ts                         # Gemini 클라이언트 + 프롬프트 템플릿
│   └── utils.ts                          # cn() helper (Tailwind 클래스 병합)
├── models/
│   └── Post.ts                           # Mongoose Post 스키마 및 모델
├── hooks/
│   ├── useWizardState.ts                 # useReducer — 위저드 전역 상태 관리
│   └── usePat.ts                         # sessionStorage PAT read/write
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

- `contentPreview`는 DB에 저장하지 않고 `content` 앞부분을 잘라 카드에 표시한다.
- `thumbnailUrl`이 없으면 `branch` 값 기반 CSS 그라디언트로 대체한다.

---

## 데이터 보관

| 데이터 | 보관 위치 | 생명주기 |
|---|---|---|
| 블로그 포스트 | MongoDB Atlas | 영구 저장 |
| GitHub PAT | sessionStorage | 탭 닫으면 자동 삭제 |
| 위저드 진행 상태 | React 메모리 (useReducer) | 페이지 이탈 시 소멸 |
| Gemini / GitHub API 키 | 서버 환경변수 (`.env.local`) | 서버에만 존재, 브라우저 노출 금지 |

- PAT는 DB에 저장하지 않는다. 서버로 전달할 때는 `x-github-pat` 헤더만 사용.
- 위저드 상태는 저장하지 않는다. 새로고침 시 Step 1부터 다시 시작.

---

## API Routes

| Route | Method | 설명 |
|---|---|---|
| `/api/github/validate` | GET | PAT 검증, 유저 정보 반환 |
| `/api/github/repos` | GET | 저장소 목록 |
| `/api/github/branches` | GET | ?owner=&repo= |
| `/api/github/commits` | GET | ?owner=&repo=&branch= |
| `/api/github/diff` | GET | ?owner=&repo=&shas=sha1,sha2 |
| `/api/generate` | POST | Gemini로 블로그 초안 생성 |
| `/api/posts` | GET / POST | 목록 조회 / 포스트 생성 |
| `/api/posts/[id]` | GET / PUT / DELETE | 개별 포스트 조작 |

모든 GitHub API 라우트는 요청 헤더 `x-github-pat`에서 PAT를 읽는다.

---

## 상태 흐름

### WizardState 구조

```typescript
type WizardState = {
  step: number           // 현재 단계 (1–7)
  pat: string            // GitHub PAT (sessionStorage에도 미러링)
  user: GitHubUser | null
  repo: Repo | null      // { id, name, full_name, private }
  branch: string
  selectedShas: string[] // 선택된 커밋 SHA 목록
  generatedMarkdown: string
  savedPostId: string
}
```

### 위저드 흐름

```
/new/page.tsx (useReducer)
    │
    ├── WizardShell          ← step 값으로 현재 단계 표시
    │
    ├── StepPatInput         → PAT 입력 → /api/github/validate 호출
    │                          성공 시 dispatch SET_PAT → step 1→2
    │
    ├── StepRepoSelect       → /api/github/repos 호출 (pat 헤더)
    │                          선택 시 dispatch SET_REPO → step 2→3
    │
    ├── StepBranchSelect     → /api/github/branches 호출
    │                          선택 시 dispatch SET_BRANCH → step 3→4
    │
    ├── StepCommitSelect     → /api/github/commits 호출
    │                          체크박스로 다중 선택 → dispatch SET_SHAS → step 4→5
    │
    ├── StepGenerating       → /api/github/diff + /api/generate 호출
    │                          완료 시 dispatch SET_MARKDOWN → step 5→6
    │
    ├── StepEditor           → 마크다운 편집 → /api/posts POST 호출
    │                          저장 시 dispatch SET_SAVED → step 6→7
    │
    └── StepSaved            → savedPostId로 /posts/[id] 링크 제공
```

### 그 외 화면 (단순 useState)

| 화면 | 상태 | 설명 |
|---|---|---|
| `/posts` | `posts`, `loading`, `error` | 마운트 시 `/api/posts` fetch |
| `/posts/[id]` | `post`, `saving` | 마운트 시 `/api/posts/[id]` fetch, StepEditor 재사용 |
