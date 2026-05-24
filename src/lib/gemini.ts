import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateBlogDraft(
  diffs: string[],
  repoFullName: string,
  branch: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const diffContent = diffs.join('\n\n---\n\n')

  const prompt = `당신은 시니어 개발자이자 테크 블로그 작성 전문가입니다.
아래 제공된 GitHub 저장소 "${repoFullName}" (브랜치: ${branch})의 코드 변경 내역(Diff)을 분석하여 기술 블로그 포스트 초안을 작성해주세요.

## 작성 요구사항:
1. **포맷**: 마크다운 형식으로 작성하고, 첫 번째 줄은 반드시 "# [글 제목]" 형식으로 시작하세요.
2. **필터링**: 단순 설정 파일(lock 파일 등)이나 의미 없는 줄바꿈, import 변경은 무시하고, 핵심 로직이나 아키텍처 변경 사항에 집중하세요.
3. **내용 구성**:
   - 어떤 기능/버그를 해결한 코드인지 요약
   - 주요 코드 변경 사항 설명 (마크다운 코드 블록으로 핵심 스니펫 제공)
4. **할루시네이션 방지 (중요)**: Diff만으로 알 수 없는 '구현 배경', '기술적 결정의 이유', '배운 점'은 절대 임의로 지어내지 마세요. 대신 사용자가 직접 채워 넣을 수 있도록 \`[여기에 기술적 결정 이유를 작성해주세요]\` 형태의 플레이스홀더를 남겨두세요.

코드 변경 내용:
<diff>
${diffContent}
</diff>`

  const result = await model.generateContent(prompt)
  return result.response.text()
}
