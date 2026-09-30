# 경제 설계자 4.3.1 — 문장 개정판

이 브랜치(`editorial/ko-431`)는 강의·발문·해설·화면 안내를 다듬은 별도 개정판이다. 기존 학습 자료의 문항 식별자와 수치·정답 데이터, 저장 형식을 유지하며, 보존 원본과 실행 기준본을 덮어쓰지 않는다.

## 개정판 파일과 검증 결과

**[개정 HTML](revised/economy-designer-4.3.1-ko.html)** · [개정 및 검증 보고서](docs/KOREAN_EDITION_RESULT.md) · [최신 브라우저 검사 결과](editorial/reports/regressions.json)

2026-09-30의 [실행 8](https://github.com/SooMin921123/economy-designer-test/actions/runs/36670073074)에서 **36/36 통과**를 확인했다. Desktop Chromium 1440×900과 모바일 Chromium viewport 390×844에서 18개 시나리오를 각각 수행한 결과다. 후속 실행의 결과는 Actions와 해당 실행 artifact에서 확인한다.

전달용 artifact는 검사 성공 후에만 만든다. 단일 HTML, 정적 호스팅용 PWA ZIP, 사용 안내, 검사 결과와 파일 해시를 포함하며 개발용 증빙과 분리한다. 원교재 PDF·HWP와 개인 학습 기록은 포함하지 않는다.

## 개정 범위

| 항목 | 구성 |
|---|---|
| 개념 강의 | 기초·기본·심화 72강, 강의별 소제목·예제·확인 문제 |
| 정규 문제 | 15단원 195문항 |
| 종합 문제 | 6개 묶음, 24단계 |
| 단계별 풀이 | 30개 연습, 총 90단계 |
| 집중 탐구 | 3개 주제의 12강·24활동 |
| 실험과 설명 | 실험 12개, 설명 작성 활동 6개 |

새 문항을 추가한 판이 아니라 기존 콘텐츠의 문장 개정판이다. 계산에서는 주체·단위·시점·가정을 명시하고, 화면에서는 학습 안내와 개발 이력을 구분했다.

## 기준본과의 관계

| 경로 | 역할 |
|---|---|
| `reference/original-economy-designer-4.3.1.html` | 최초 수집 원본. 진단된 구문 오류를 그대로 보존한다. |
| `source/economy-designer-4.3.1.html` | 함수 종료 중괄호 두 개만 추가한 기존 실행 기준본. |
| `editorial/ko/` | 검토한 한국어 콘텐츠 수정 자료. |
| `editorial/interface/` | 화면 문구 수정 자료. |
| `revised/economy-designer-4.3.1-ko.html` | 빌드 후 별도 생성한 개정판. |

`verify-source.mjs`는 원본과 기준본의 차이가 두 중괄호뿐인지 계속 검사한다. 원고용 JSON은 정적 콘텐츠 구조로 구분하며, 교재 파일·개인 백업·복구 사본 차단 규칙도 유지한다. 개정판에서는 문항의 수치·정답·ID·참조 구조를 별도로 대조한다.

## 학습 기록

저장 키는 `econverse431-guarded`이다. 같은 저장 키라도 주소·브라우저·파일 경로가 달라지면 기존 기록에 접근하지 못할 수 있으므로, 이동 전 기존 앱에서 외부 백업을 받아 두어야 한다. 복원 미리보기는 기록을 바꾸지 않는다. 확인 후 적용하면 백업 기록으로 교체하며, 두 기록을 병합하지 않는다.

## 기존 공개 주소

[기존 공개 학습 앱](https://soomin921123.github.io/economy-designer-test/index.html)은 이전 배포판이다. **이 브랜치를 작성하면서 공개 주소를 문장 개정판으로 교체하지 않았다.** [기존 공개 배포 결과](docs/PAGES_RESULT.md)의 18/18은 그 이전 배포판의 검사 결과이며, 이번 개정판의 공개 HTTPS 검사로 보아서는 안 된다.

실제 휴대폰 홈 화면 설치·OS 재부팅, 원교재의 모든 표와 그림 대조, 전문가의 출간 승인과는 구분한다. 자유 서술은 자동 채점하지 않는다.

## 검증과 재현

```bash
npm ci --ignore-scripts
node scripts/verify-source.mjs
npx playwright install --with-deps chromium
npm run test:e2e
node editorial/summarize-tests.mjs
node scripts/build-pages.mjs
```

개인 브라우저 프로필이 아닌 분리된 시험 환경에서 실행한다. 의존성 버전은 `package-lock.json`을 따른다.

`editorial-review.yml`은 원본·구조 대조, 전체 브라우저 검사, 깨끗한 설치용 파일 내보내기를 수행한다. 테스트가 실패하면 전달용 파일을 만들지 않으며, 실패 증빙은 Actions artifact에 남긴다. `pages.yml`은 `main`에 반영된 뒤 별도의 배포 전 검사와 공개 주소 검사를 실행하도록 구성되어 있다.
