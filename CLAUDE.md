# commit-to-blog

GitHub 커밋/코드 변경 이력을 AI가 분석해 자동으로 개발 블로그 초안을 생성하는 서비스.

> 상세 문서: [아키텍처](docs/architecture.md) · [배포](docs/deployment.md) · [테스트](docs/testing.md) · [체크리스트](docs/checklist.md) · [인터랙션](docs/interactions.md)


## 작업 전 필독

작업을 시작하기 전에 반드시 관련 문서를 먼저 읽는다.

구현 내용이 문서의 설계와 다를 경우, 코드를 작성하기 전에 반드시 해당 문서를 먼저 수정하는 절차가 필요하다. 설계 변경 없이 임의로 구현 방향을 바꾸지 않는다.

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript, `src/` 디렉터리)
- **Database**: MongoDB Atlas Free Tier — Mongoose ODM
- **LLM**: Google Gemini (`gemini-3.1-flash-lite`, `@google/generative-ai`)
- **Auth**: GitHub OAuth (`next-auth` v4, GitHub Provider) — 액세스 토큰은 서버 세션에만 보관, 클라이언트 노출 금지
- **Styling**: Tailwind CSS + shadcn/ui
- **Markdown Editor**: `@uiw/react-md-editor` (SSR 불가 — 반드시 `dynamic` + `ssr: false` 사용)
- **Deployment**: Vercel (GitHub 연동 후 `main` push 시 자동 배포)

## Development Commands

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
```

## Key Patterns

### OAuth 토큰 보안 플로우
```
GitHub OAuth 로그인
    → next-auth 세션 (서버 사이드, HttpOnly 쿠키)
    → Next.js API Route에서 getServerSession()으로 토큰 읽기
    → GitHub API
```
액세스 토큰은 DB에 저장하거나 클라이언트 응답 바디에 포함해선 안 된다.
API Route에서 항상 `getServerSession(authOptions)`로 토큰을 읽고, 세션이 없으면 401을 반환한다.

### MongoDB 연결 싱글톤
Next.js hot reload 시 연결이 중복되지 않도록 `global` 객체에 캐싱한다.
```typescript
// src/lib/mongodb.ts
declare global { var mongoose: { conn: ...; promise: ... } }
```

### MarkdownEditor SSR 처리
`@uiw/react-md-editor`는 `window`/`navigator`에 의존한다.
```typescript
// src/components/shared/MarkdownEditor.tsx
'use client'
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })
```

### `'use client'` 사용 기준
기본값은 Server Component. 아래 중 하나라도 해당되면 `'use client'`를 붙인다.
- React hook 사용 (`useState`, `useEffect`, `useReducer` 등)
- 브라우저 API 사용 (`window`, `sessionStorage` 등)
- 이벤트 핸들러 (`onClick`, `onChange` 등)

`'use client'`는 트리에서 최대한 아래쪽 컴포넌트에만 붙인다. 페이지 전체를 클라이언트로 만들지 않는다.

### API 응답 형식
```typescript
// 성공 — 데이터 직접 반환
Response.json(data)

// 에러 — { error: string } + HTTP status
Response.json({ error: "메시지" }, { status: 400 })  // 400 | 401 | 404 | 500
```

### Gemini 토큰 관리
커밋당 diff를 6000자, 전체 payload를 20000자로 truncate해 무료 티어를 초과하지 않는다.
응답의 첫 `# ` 줄을 파싱해 포스트 제목으로 자동 채운다.

## 섹션 완료 후 검증

체크리스트의 섹션 하나를 완료할 때마다 `npm run build`를 실행한다.
빌드가 실패하면 커밋 전에 수정한다.
(tsc + lint는 커밋 시 husky가 자동으로 검사한다.)

## 매 커밋 전 검증 (pre-commit hook)

husky를 사용해 커밋 시 자동 실행한다. 실패 시 커밋이 막힌다.

```bash
npx tsc --noEmit   # TypeScript 타입 체크
npm run lint       # ESLint (next lint)
```

## 커밋 컨벤션

모든 커밋은 아래 형식을 따른다.

```
<type>: #<커밋-순번> <제목>

- 확인내용: <구현하면서 직접 확인한 내용, 추가 결정 사항>
- 이해 안 됐던 부분: <헷갈렸거나 새로 이해한 개념, 없으면 "없음">
```

번호는 타입과 무관하게 프로젝트 전체에서 단일 시퀀스로 증가한다.

| 타입 | 용도 |
|---|---|
| `feat` | 새 기능 구현 |
| `fix` | 버그 수정 |
| `style` | 로직 변경 없는 스타일 수정 |
| `refactor` | 동작 변경 없는 코드 정리 |
| `chore` | 환경설정, 패키지 변경 |
| `docs` | 문서 수정 |

## Claude Skill 제안

동일한 작업이 3회 이상 반복되는 패턴이 확인되면 skill 생성을 제안한다.
예: 커밋 메시지 작성, 체크리스트 업데이트, 특정 boilerplate 생성 등.
