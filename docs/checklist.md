# 구현 체크리스트

## 1. 프로젝트 초기화
- [x] Next.js 14 초기화 (App Router, TypeScript, Tailwind, src/)
- [x] shadcn/ui 설정 및 컴포넌트 추가 (toast → sonner 교체)
- [x] 추가 패키지 설치 (mongoose, @google/generative-ai, @uiw/react-md-editor, date-fns)
- [x] `.env.local` 생성 (MONGODB_URI, GEMINI_API_KEY)
- [x] `.gitignore` 확인 (.env.local 포함 여부)

## 2. 데이터 레이어
- [x] MongoDB 연결 싱글톤 (`src/lib/mongodb.ts`)
  - [x] `src/lib/mongodb.ts` 생성
  - [x] `MongooseCache` 인터페이스 정의 — `{ conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }`
  - [x] `declare global { var mongoose: MongooseCache }` 전역 타입 선언
  - [x] `connectDB()` 함수 구현 — `global.mongoose`에 캐싱해 hot reload 시 중복 연결 방지
- [x] Post 모델 정의 (`src/models/Post.ts`)
  - [x] `src/models/Post.ts` 생성
  - [x] `IPost` 인터페이스 정의 — `title`, `content`, `repoFullName`, `branch`, `selectedShas`, `thumbnailUrl?`, `published`, `createdAt`, `updatedAt`
  - [x] Mongoose 스키마 정의 — `timestamps: true`, 필드별 타입/required/default 설정
  - [x] 모델 export — 중복 등록 방지 패턴 (`mongoose.models.Post || mongoose.model('Post', PostSchema)`)

## 3. API Routes
- [x] `GET /api/github/validate` — PAT 검증, 유저 정보 반환
  - [x] `src/types/index.ts` 생성 — `GitHubUser`, `Repo`, `Branch`, `Commit` 인터페이스 정의
  - [x] `src/lib/github.ts` 생성 — `x-github-pat` 헤더를 받아 GitHub REST API를 호출하는 `fetchGitHub()` 헬퍼
  - [x] `src/app/api/github/validate/route.ts` — `GET /api/user` 호출, 유저 정보 반환
  - [x] `src/app/api/github/repos/route.ts` — `GET /api/user/repos` 호출, 저장소 목록 반환
  - [x] `src/app/api/github/branches/route.ts` — `?owner=&repo=` 파라미터, `GET /api/repos/{owner}/{repo}/branches` 호출
- [x] `GET /api/github/repos` — 저장소 목록
- [x] `GET /api/github/branches` — 브랜치 목록
- [x] `GET /api/github/commits` — 커밋 목록
  - [x] `src/app/api/github/commits/route.ts` — `?owner=&repo=&branch=`, 최근 30개 커밋 반환
  - [x] `src/app/api/github/diff/route.ts` — `?owner=&repo=&shas=sha1,sha2`, SHA 목록으로 diff 수집, 커밋당 6000자 truncate
- [x] `GET /api/github/diff` — 커밋 diff (truncate 포함)
- [x] `POST /api/generate` — Gemini 블로그 초안 생성
  - [x] `src/lib/gemini.ts` 생성 — `GoogleGenerativeAI` 클라이언트 초기화 + 블로그 초안 생성 프롬프트 템플릿
  - [x] `src/app/api/generate/route.ts` — `POST`, diff payload 전체 20000자 truncate 후 Gemini 호출, 마크다운 반환
- [x] `GET/POST /api/posts` — 포스트 목록 조회 / 생성
  - [x] `src/app/api/posts/route.ts` — `GET` 전체 목록(`-createdAt` 정렬) / `POST` 포스트 생성
  - [x] `src/app/api/posts/[id]/route.ts` — `GET` 단건 조회 / `PUT` 수정 / `DELETE` 삭제
  - [x] 에러 응답 형식 통일 — `{ error: string }` + 적절한 HTTP status
- [x] `GET/PUT/DELETE /api/posts/[id]` — 포스트 조회 / 수정 / 삭제

## 4. 위저드 UI (블로그 생성 흐름)
- [x] 위저드 레이아웃 및 단계 인디케이터 (`WizardShell`)
  - [x] `src/hooks/usePat.ts` 생성 — sessionStorage에서 PAT read/write하는 커스텀 훅 (`'use client'`)
  - [x] `src/hooks/useWizardState.ts` 생성 — `WizardState` 타입 및 `WizardAction` 유니온 타입 정의, `wizardReducer`, `useWizardState` 훅 export (actions: SET_PAT, SET_REPO, SET_BRANCH, SET_SHAS, SET_MARKDOWN, SET_SAVED, RESET)
  - [x] `src/components/wizard/WizardShell.tsx` 생성 — `step` prop을 받아 단계 인디케이터(1~7) + children 렌더링, `'use client'`
  - [x] `src/app/new/page.tsx` 생성 — `useWizardState` + `WizardShell` 연결, 각 step별 placeholder 텍스트 렌더링, `'use client'`
- [x] Step 1: PAT 입력 화면
  - [x] `src/components/wizard/StepPatInput.tsx` 생성 — `'use client'`, password 타입 입력창, 확인 버튼
  - [x] 확인 버튼 클릭 시 `/api/github/validate` 호출, 로딩 중 버튼 비활성화 + 스피너 표시
  - [x] 성공 시 `dispatch({ type: 'SET_PAT', pat, user })` 호출 → Step 2 이동
  - [x] 실패 시 "유효하지 않은 PAT입니다" 에러 메시지 인라인 표시
  - [x] `src/app/new/page.tsx` 수정 — `case 1:` placeholder를 `<StepPatInput dispatch={dispatch} />` 로 교체
- [x] Step 2: 저장소 선택 화면
  - [x] `src/components/wizard/StepRepoSelect.tsx` 생성 — `'use client'`, 진입 시 `/api/github/repos` 자동 로드 (`x-github-pat` 헤더)
  - [x] 로딩 중 스켈레톤 표시, 로드 실패 시 에러 메시지 + 재시도 버튼
  - [x] 검색 입력으로 저장소 이름 실시간 필터링
  - [x] 저장소 클릭 시 하이라이트, 다음 버튼 활성화 → 클릭 시 `dispatch({ type: 'SET_REPO', repo })` 호출
  - [x] `src/app/new/page.tsx` 수정 — `case 2:` placeholder를 `<StepRepoSelect pat={state.pat} dispatch={dispatch} />` 로 교체
- [x] Step 3: 브랜치 선택 화면
  - [x] `src/components/wizard/StepBranchSelect.tsx` 생성 — `'use client'`, 진입 시 `/api/github/branches?owner=&repo=` 자동 로드 (`x-github-pat` 헤더)
  - [x] 로딩 중 스켈레톤 표시, 로드 실패 시 에러 메시지 + 재시도 버튼
  - [x] 브랜치 클릭 시 하이라이트, 다음 버튼 활성화 → 클릭 시 `dispatch({ type: 'SET_BRANCH', branch })` 호출
  - [x] `src/app/new/page.tsx` 수정 — `case 3:` placeholder를 `<StepBranchSelect pat={state.pat} repo={state.repo!} dispatch={dispatch} />` 로 교체
- [x] Step 4: 커밋 선택 화면
  - [x] `src/components/wizard/StepCommitSelect.tsx` 생성 — `'use client'`, 진입 시 `/api/github/commits?owner=&repo=&branch=` 자동 로드 (`x-github-pat` 헤더)
  - [x] 로딩 중 스켈레톤 표시, 로드 실패 시 에러 메시지 + 재시도 버튼
  - [x] 체크박스로 다중 선택, 선택 개수 표시 ("N개 선택됨"), 최소 1개 선택 시 다음 버튼 활성화
  - [x] 다음 버튼 클릭 시 `dispatch({ type: 'SET_SHAS', shas: selectedShas })` 호출
  - [x] `src/app/new/page.tsx` 수정 — `case 4:` placeholder를 `<StepCommitSelect pat={state.pat} repo={state.repo!} branch={state.branch} dispatch={dispatch} />` 로 교체
- [x] Step 5: AI 생성 중 화면 (로딩)
  - [x] `src/components/wizard/StepGenerating.tsx` 생성 — `'use client'`, 진입 시 자동 실행
  - [x] 1단계: `x-github-pat` 헤더로 `/api/github/diff?owner=&repo=&shas=` 호출, 상태 텍스트 "변경사항 분석 중…" 표시
  - [x] 2단계: diff 응답으로 `/api/generate` POST 호출, 상태 텍스트 "초안 작성 중…" 표시
  - [x] 성공 시 `dispatch({ type: 'SET_MARKDOWN', markdown })` 호출 → Step 6 이동
  - [x] 실패 시 에러 메시지 + 재시도 버튼 (Step 4로 돌아가지 않고 동일 단계에서 재시도)
  - [x] `src/app/new/page.tsx` 수정 — `case 5:` placeholder를 `<StepGenerating pat={state.pat} repo={state.repo!} branch={state.branch} selectedShas={state.selectedShas} dispatch={dispatch} />` 로 교체
- [x] Step 6: 글 편집 화면 (마크다운 에디터)
  - [x] `src/components/shared/MarkdownEditor.tsx` 생성 — `'use client'`, `dynamic(() => import('@uiw/react-md-editor'), { ssr: false })` 래퍼
  - [x] `src/components/wizard/StepEditor.tsx` 생성 — `'use client'`, AI 응답 첫 `# ` 줄을 파싱해 제목 자동 채움 (수정 가능), `MarkdownEditor`로 본문 편집
  - [x] 저장 버튼 클릭 시 `/api/posts` POST 호출, 로딩 중 버튼 비활성화, 성공 시 `dispatch({ type: 'SET_SAVED', postId })` → Step 7, 실패 시 에러 토스트 (sonner)
  - [x] 뒤로 가기 버튼 클릭 시 `window.confirm`으로 "작성 중인 내용이 사라집니다" 경고 후 `dispatch({ type: 'RESET' })`
  - [x] `src/app/new/page.tsx` 수정 — `case 6:` placeholder를 `<StepEditor pat={state.pat} repo={state.repo!} branch={state.branch} selectedShas={state.selectedShas} generatedMarkdown={state.generatedMarkdown} dispatch={dispatch} />` 로 교체
- [x] Step 7: 저장 완료 화면
  - [x] `src/components/wizard/StepSaved.tsx` 생성 — `'use client'`, 저장 완료 안내 메시지
  - [x] "포스트 편집" 버튼 → `/posts/[savedPostId]`로 이동 (`next/link`)
  - [x] "목록으로" 버튼 → `/posts`로 이동
  - [x] "새 글 작성" 버튼 → `dispatch({ type: 'RESET' })` 후 Step 1 초기화
  - [x] `src/app/new/page.tsx` 수정 — `case 7:` placeholder를 `<StepSaved savedPostId={state.savedPostId} dispatch={dispatch} />` 로 교체

## 5. 포스트 목록 / 편집
- [x] 포스트 목록 화면 (카드 그리드)
  - [x] `src/components/posts/PostCardSkeleton.tsx` 생성 — `Skeleton` 컴포넌트로 카드 형태 로딩 플레이스홀더
  - [x] `src/components/posts/PostCard.tsx` 생성 — `title`, `repoFullName`·`branch` 태그, `createdAt`(date-fns), `published` 배지 표시
  - [x] PostCard에 "수정하기" 버튼 → `/posts/[id]` Link, "발행하기"/"초안으로" 토글 버튼 → `PUT /api/posts/[id]` 호출, 낙관적 업데이트, 실패 시 롤백 + `toast.error`
  - [x] `src/components/posts/PostGrid.tsx` 생성 — `posts` 배열 + `onTogglePublish` 콜백 props, PostCard 목록 렌더링
  - [x] `src/app/posts/page.tsx` 생성 — `'use client'`, 마운트 시 `GET /api/posts` 호출, 로딩 중 `PostCardSkeleton` ×3, Empty State ("아직 작성된 글이 없습니다" + 새 글 작성 버튼), PostGrid 렌더링
- [x] 포스트 카드 컴포넌트 (제목, 저장소/브랜치 태그, 날짜, 발행 상태)
- [x] 포스트 편집 화면
  - [x] `src/app/posts/[id]/page.tsx` 생성 — `'use client'`, 마운트 시 `GET /api/posts/[id]` 호출, 로딩 중 스켈레톤 표시
  - [x] 제목 `Input` + `MarkdownEditor`로 content 편집 — `parseTitle` / `removeFirstHeading` 동일 방식으로 분리
  - [x] "저장" 버튼 → `PUT /api/posts/[id]` 호출, 성공 시 `toast.success('저장되었습니다.')`
  - [x] "발행하기"/"초안으로 전환" 토글 버튼 → `PUT /api/posts/[id] { published }` 호출, `saving` 중 비활성화
  - [x] "삭제" 버튼 → `window.confirm` 후 `DELETE /api/posts/[id]` → `router.push('/posts')`
  - [x] "← 목록으로" 링크 → `/posts` (헤더 상단, 로딩/에러 상태 포함)
- [x] 발행 / 초안 토글

## 6. 마무리
- [x] NavBar (로고, 새 글 작성 버튼)
  - [x] `src/components/shared/NavBar.tsx` 생성 — 로고 ("commit-to-blog" → `/posts` Link), "새 글 작성" 버튼 (→ `/new` Link)
  - [x] `src/app/layout.tsx` 수정 — `<NavBar />` 추가 (`{/* NavBar 주석 */}` 교체)
  - [x] `src/app/page.tsx` 수정 — Next.js 기본 페이지 제거, `redirect('/posts')` 처리
- [x] 에러 처리 (각 위저드 단계별)
  - [x] 이전 섹션 구현에서 완료 — Step 2~5 에러 상태 + 재시도 버튼, posts 페이지 에러 + 재시도 확인
- [x] Toast 알림 (저장 완료, 발행 등) — sonner 사용
  - [x] 이전 커밋에서 `<Toaster />` layout.tsx 추가 완료, `toast.success` / `toast.error` 사용 전체 확인
- [x] Empty State (포스트 없을 때)
  - [x] 이전 섹션 구현에서 완료 — posts/page.tsx "아직 작성된 글이 없습니다" + 새 글 작성 버튼 확인
- [x] 로딩 스켈레톤
  - [x] 이전 섹션 구현에서 완료 — PostCardSkeleton, posts/[id] 스켈레톤, wizard 단계별 Skeleton 확인

## 7. 배포
- [ ] Vercel 프로젝트 생성 및 GitHub 저장소 연결
- [ ] Vercel 환경변수 설정 (MONGODB_URI, GEMINI_API_KEY)
- [ ] MongoDB Atlas Network Access 설정 (0.0.0.0/0)
- [ ] 배포 후 동작 확인
