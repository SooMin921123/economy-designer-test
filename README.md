# 경제 설계자 4.3.1 — 공개 학습 앱 및 검증 저장소

## 학습 앱 열기

**[경제 설계자 4.3.1 실행](https://soomin921123.github.io/economy-designer-test/index.html)**

[휴대폰 설치·기록 보호 안내](docs/DEVICE_INSTALL.md) · [공개 배포 검증 보고서](docs/PAGES_RESULT.md) · [최종 Pages Actions](https://github.com/SooMin921123/economy-designer-test/actions/runs/36540108982) · [공개 검사 증빙](https://github.com/SooMin921123/economy-designer-test/actions/runs/36540108982/artifacts/11019754666)

**2026-09-29: Pages 공개 HTTPS 배포 완료. 배포 전 26/26, 공개 주소 검사 18/18 통과.**

실제 배포·검사 커밋은 `187228c9abe3f2373f47108243a67c3048f3dd3a`이고, Pages workflow Run 2(`36540108982`)가 `completed / success`로 종료했다. 이 README와 결과 보고서는 실행 후 문서화한 것이며 문서 커밋을 새로 시험했다고 표시하지 않는다.

## 완료 범위와 미확인 범위

공개 검사 18개는 9개 시나리오를 Desktop Chromium 1440×900 및 모바일 Chromium viewport 390×844에서 각각 수행한 결과다. 공개 HTTPS와 배포 스크립트 일치, manifest/아이콘/service worker, Chromium 설치 가능 진단, localStorage 보존, 관련 강의 왕복, 빈 슬라이더, 파일 백업 미리보기·취소, 오프라인 새 탭 및 브라우저 프로세스 재시작을 확인했다. 배포 전 26개와 검사 내용이 겹치므로 44개 서로 다른 기능으로 합산하지 않는다.

**모바일 viewport는 실제 iPhone/Android가 아니며 설치 가능 진단·오프라인 성공은 OS 홈 화면 설치 성공이 아니다.** 실제 휴대폰 설치, 설치 아이콘 실행, OS 재부팅은 사용자 기기에서 별도로 확인한다. 전체 콘텐츠 교열·모든 저장 장애 검증까지 마친 것은 아니다.

현재는 이 테스트 저장소의 공개 정적 PWA이다. 로그인·서버 학습 기록 동기화·결제·앱스토어 등록은 없다. noindex는 검색 제외 요청이지 비공개 설정이 아니다.

## 원본과 실행 수정본

| 파일 | 용도 |
|---|---|
| [원본 보존 사본](reference/original-economy-designer-4.3.1.html) | 최초 Drive 수집본 그대로, 구문 오류가 있는 비교 기준 |
| [실행 수정본](source/economy-designer-4.3.1.html) | 이전에 확인된 함수 종료 중괄호 두 개만 추가한 실행 대상 |
| [기존 브라우저 검수 도구](reference/browser-check-4.3.1.html) | 사용자가 제공한 참고 도구 |

Drive 원본은 변경하지 않았다. `verify-source.mjs`가 보존 원본과 실행본의 차이가 중괄호 두 개뿐인지 전체 대조한다. 원본 631908 bytes / 실행본 631910 bytes. 이번 Pages 단계에서 학습 콘텐츠·수치·정답 조건·앱 저장 코드는 변경하지 않았다. 빌드 `4.3.1-recovery.1`, 저장 키 `econverse431-guarded`는 유지했다.

학습 스크립트는 배포 과정에서도 동일성을 검사한다. PWA에는 앱 자체가 만든 실제 PNG 아이콘을 사용하고 배포별 캐시 버전을 붙였다. 원본과 배포 포장 변경의 구분 및 해시는 공개 배포 보고서에 기록했다. 앱 내 '제작자 미실행' 문구는 원문 보존으로 남은 과거 기록이며 최신 검증 결과와 구분한다.

## 자동 검증·배포

- `.github/workflows/playwright.yml`: 기존 회귀·저장 안전성 검사.
- `.github/workflows/pages.yml`: 원본 불변 검사 → 기존 회귀 검사 → 깨끗한 PWA 내보내기 → Pages 배포 → 실제 공개 HTTPS 검사.
- `scripts/build-pages.mjs`: 합성 시험 기록도 없는 새 context에서 PWA 생성, 허용된 8개 파일만 공개.
- `deployment-tests/live.spec.mjs`: 공개 주소 검증. 사용자 개인 브라우저가 아닌 임시 context/프로필 사용.

공개 사이트에 교재 PDF/HWP, 원본 비교 파일, 개인 백업·학습 기록이나 CI 보고서를 올리지 않는다. 시험의 합성 JSON은 개인 백업이 아니며 Git 소스에 커밋하지 않는다. CI 증빙은 별도 Actions artifact로 보관한다.

## 변경·실패 이력

첫 Pages 실행은 배포 성공 후 공개 검사 16/18이었다. 실패 2개는 trace 중복 시작이라는 테스트 설정 문제였으며 별도 테스트 수정 커밋 후 전체 재실행이 18/18로 통과했다. 실패 결과는 지우지 않고 [공개 배포 결과](docs/PAGES_RESULT.md)에 연결했다.

[이전 로컬 CI 26개 검증 및 원본 오류 수정 이력](docs/QA_RESULT.md) · [검증 원칙](docs/QA_PROTOCOL.md)

이전 보고서의 Pages 미배포 표기는 이전 단계의 상태다. 이후 공개 배포 결과는 PAGES_RESULT.md를 따른다. 실제 기기 결과는 성공·실패·미실행을 구분하여 별도로 추가한다.

## 로컬 회귀 검사

개인 브라우저 프로필이 아닌 별도 작업 폴더에서 실행한다.

```bash
npm install
node scripts/verify-source.mjs
npx playwright install --with-deps chromium
npm run test:e2e
node scripts/summarize-results.mjs
```

정확한 실행 시점 dependency lock과 버전은 artifact에 남긴다. 현재 package.json은 범위 버전이므로 미래 설치가 동일 버전을 선택한다고 보장하지 않는다. 최종 공개 증빙의 현재 만료 예정일은 2026-10-29다.
