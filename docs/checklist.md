# 구현 체크리스트

## 1. 프로젝트 초기화
- [x] Next.js 14 초기화 (App Router, TypeScript, Tailwind, src/)
- [x] shadcn/ui 설정 및 컴포넌트 추가 (toast → sonner 교체)
- [x] 추가 패키지 설치 (mongoose, @google/generative-ai, @uiw/react-md-editor, date-fns)
- [x] `.env.local` 생성 (MONGODB_URI, GEMINI_API_KEY)
- [x] `.gitignore` 확인 (.env.local 포함 여부)

## 2. 데이터 레이어
- [x] MongoDB 연결 싱글톤 (`src/lib/mongodb.ts`) — 커밋 #12
  - [x] `src/lib/mongodb.ts` 생성
  - [x] `MongooseCache` 인터페이스 정의 — `{ conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }`
  - [x] `declare global { var mongoose: MongooseCache }` 전역 타입 선언
  - [x] `connectDB()` 함수 구현 — `global.mongoose`에 캐싱해 hot reload 시 중복 연결 방지
  - [x] `npm run build` 통과 확인
- [x] Post 모델 정의 (`src/models/Post.ts`) — 커밋 #13
  - [x] `src/models/Post.ts` 생성
  - [x] `IPost` 인터페이스 정의 — `title`, `content`, `repoFullName`, `branch`, `selectedShas`, `thumbnailUrl?`, `published`, `createdAt`, `updatedAt`
  - [x] Mongoose 스키마 정의 — `timestamps: true`, 필드별 타입/required/default 설정
  - [x] 모델 export — 중복 등록 방지 패턴 (`mongoose.models.Post || mongoose.model('Post', PostSchema)`)
  - [x] `npm run build` 통과 확인

## 3. API Routes
- [ ] `GET /api/github/validate` — PAT 검증, 유저 정보 반환
- [ ] `GET /api/github/repos` — 저장소 목록
- [ ] `GET /api/github/branches` — 브랜치 목록
- [ ] `GET /api/github/commits` — 커밋 목록
- [ ] `GET /api/github/diff` — 커밋 diff (truncate 포함)
- [ ] `POST /api/generate` — Gemini 블로그 초안 생성
- [ ] `GET/POST /api/posts` — 포스트 목록 조회 / 생성
- [ ] `GET/PUT/DELETE /api/posts/[id]` — 포스트 조회 / 수정 / 삭제

## 4. 위저드 UI (블로그 생성 흐름)
- [ ] 위저드 레이아웃 및 단계 인디케이터 (`WizardShell`)
- [ ] Step 1: PAT 입력 화면
- [ ] Step 2: 저장소 선택 화면
- [ ] Step 3: 브랜치 선택 화면
- [ ] Step 4: 커밋 선택 화면
- [ ] Step 5: AI 생성 중 화면 (로딩)
- [ ] Step 6: 글 편집 화면 (마크다운 에디터)
- [ ] Step 7: 저장 완료 화면

## 5. 포스트 목록 / 편집
- [ ] 포스트 목록 화면 (카드 그리드)
- [ ] 포스트 카드 컴포넌트 (제목, 저장소/브랜치 태그, 날짜, 발행 상태)
- [ ] 포스트 편집 화면
- [ ] 발행 / 초안 토글

## 6. 마무리
- [ ] NavBar (로고, 새 글 작성 버튼)
- [ ] 에러 처리 (각 위저드 단계별)
- [ ] Toast 알림 (저장 완료, 발행 등) — sonner 사용
- [ ] Empty State (포스트 없을 때)
- [ ] 로딩 스켈레톤

## 7. 배포
- [ ] Vercel 프로젝트 생성 및 GitHub 저장소 연결
- [ ] Vercel 환경변수 설정 (MONGODB_URI, GEMINI_API_KEY)
- [ ] MongoDB Atlas Network Access 설정 (0.0.0.0/0)
- [ ] 배포 후 동작 확인
