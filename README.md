# 경제 설계자 4.3.1 — 브라우저 검증 저장소

**2026-09-29 최종 확인: GitHub Actions Run 8에서 26개 통과, 실패 0개, 건너뜀 0개.**

검사한 커밋은 `aa8b0331e1a66dc650601a0c66f348efe652a6da`이다. 이 README와 결과 보고서는 실행 후 문서화한 것으로, 문서 커밋을 새로 시험한 것으로 표시하지 않는다.

[최종 Actions 실행](https://github.com/SooMin921123/economy-designer-test/actions/runs/36536864459) · [최종 증빙 ZIP](https://github.com/SooMin921123/economy-designer-test/actions/runs/36536864459/artifacts/11018722920) · [상세 결과·실패 원인·수정 커밋](docs/QA_RESULT.md) · [검증 원칙](docs/QA_PROTOCOL.md)

## 원본과 실행 수정본

| 파일 | 용도 |
|---|---|
| [원본 보존 사본](reference/original-economy-designer-4.3.1.html) | 최초 Drive 수집본 그대로 보존. 구문 오류가 남아 있는 비교 기준 |
| [실행 수정본 HTML](source/economy-designer-4.3.1.html) | 누락된 함수 종료 중괄호 두 개만 추가한 검증 대상 |
| [기존 브라우저 검수 도구](reference/browser-check-4.3.1.html) | 사용자가 제공한 단계별 검수 참고 파일 |

**Drive 원본은 변경하지 않았다. 원본이 그대로 통과한 것이 아니라 저장소의 수정본을 검증했다.** 빌드 문자열 `4.3.1-recovery.1`, 저장 키 `econverse431-guarded`는 유지했다. 수정본 식별에는 commit/blob을 함께 사용한다.

`verify-source.mjs`의 전체 문자열 대조로 강의·문항·정답 조건을 바꾸지 않고 `}` 두 개만 추가했음을 확인했다. 최초 보존 사본은 631908바이트, 수정본은 631910바이트다. 원본 해시·수정본 해시와 Drive 메타데이터 확인의 제한은 상세 보고서에 기록했다.

## 실제 검사 범위

13개 시나리오를 Desktop Chromium 1440×900 및 모바일 Chromium viewport 390×844에서 각각 실행했다. 실제 iPhone/Android 기기 검증은 아니다.

부팅/홈 화면 가로 넘침, localStorage 설정 저장·재로딩, 관련 강의 왕복 답안 보존, 빈 슬라이더 복원, 미리보기·취소의 비파괴성을 검사했다. 합성 기존 답안·메모의 재로딩과 context 격리, 실제 파일 선택을 통한 복원·취소, 알 수 없는 ID 백업 거부, 교체 전 보관함 복구도 확인했다.

PWA는 manifest·service worker·온라인 이후 오프라인 새로고침 및 새 탭 재진입을 검사했다. 비캐시 요청 차단과 미방문 context의 최초 로딩 실패를 대조했다. 앱 자체의 PWA ZIP 버튼으로 만든 패키지는 실제 PNG와 학습 스크립트, 합성 개인 메모 제외, 별도 경로의 오프라인 로딩을 추가 확인했다.

**오프라인 동작 성공은 OS 홈 화면 설치 성공이 아니다.** 실제 설치 판정 전체, 실기기 설치, OS 재부팅, GitHub Pages 및 HTTPS 실배포는 미검증/미배포다. 전체 72강의 시각 교열이나 모든 정답의 경제학적 검증을 끝낸 것도 아니다.

## 파일 구성과 기록 보호

- `scripts/verify-source.mjs`: 원본 보존·허용된 수정·구문·금지 파일 커밋 검사.
- `tests/economy-designer.spec.mjs`, `tests/safety.spec.mjs`: 13개 회귀/안전성 시나리오.
- `scripts/prepare-pwa.mjs`: 원본 SW 코드를 사용하는 검증용 PWA 구성. 기본 아이콘은 단색 fixture이며 앱 자체가 만든 실제 PWA 묶음은 별도 테스트한다.
- `scripts/summarize-results.mjs`: 실제 결과 JSON/Markdown 및 Actions 요약 생성.

테스트는 runner의 `127.0.0.1:4173`과 분리된 임시 브라우저 context, 합성 기록만 사용한다. 실제 사용자 학습 기록이나 개인 백업은 접근하지 않았다. 교재 PDF·HWP·개인 백업 JSON은 커밋하지 않는다. 성공과 실패 모두 Actions artifact를 남기며, 최종 증빙의 현재 만료 예정일은 2026-10-29이다.

실패한 과거 실행도 지우지 않고 결과 보고서에 연결했다. Run 7의 새 탭 실패에는 trace·로그는 있으나 해당 실패 화면의 자동 캡처가 없었던 제한을 보고서에 명시했다.

## 로컬에서 같은 검사 실행

이 저장소를 Git으로 받은 별도 작업 폴더에서 실행한다. 실제 운영 주소나 개인 브라우저 프로필을 테스트 대상으로 지정하지 않는다.

```bash
npm install
node scripts/verify-source.mjs
npx playwright install --with-deps chromium
npm run test:e2e
node scripts/summarize-results.mjs
```

실행 시점의 의존성 버전과 lock은 최종 증빙에 보관했다. 현재 package.json은 범위 버전을 사용하므로 나중의 설치가 같은 버전을 선택한다고 보장하지 않는다. CI의 Node.js/Action 관련 사용 중단 경고도 상세 보고서에 구분해 두었다.

다시 실행할 때는 실제 실행 결과를 새로 확인한다. 이 문서의 26/26은 위에 명시한 커밋과 Run 8의 결과다.
