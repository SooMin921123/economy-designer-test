# 경제 설계자 4.3.1 — GitHub Pages 공개 배포 및 HTTPS 검증 결과

검증일: 2026-09-29. 실제 Actions 종료와 로그를 확인한 뒤 작성한 문서다. 이 문서의 커밋은 아래 검사 대상 커밋과 구분한다. 이전 QA_RESULT.md의 'Pages 미배포'는 이전 단계의 기록이며, 현재 배포 결과는 이 문서를 따른다.

## 1. 공개 학습 주소와 최종 실행

**[경제 설계자 4.3.1 실행](https://soomin921123.github.io/economy-designer-test/index.html)**

- 저장소: `SooMin921123/economy-designer-test`만 배포했다.
- 실제 배포·검사 커밋: `187228c9abe3f2373f47108243a67c3048f3dd3a`.
- Workflow: `.github/workflows/pages.yml`, `Deploy Economy 4.3.1 Pages and verify HTTPS`.
- Pages workflow Run 2: `36540108982`, attempt 1.
- 최종 GitHub 상태: `completed / success`, 갱신 시각 `2026-09-29T08:03:56Z`.
- Build job `109313224451`: 기존 회귀 검사 **26/26 통과** (`26 passed (16.8s)`).
- Deploy job `109313569024`: 실제 Pages 배포 성공. 공개 주소는 배포 결과에서 확인했다.
- Verify-live job `109313809421`: 실제 공개 HTTPS 주소 검사 **18/18 통과** (`18 passed (17.2s)`), runnerErrors 0.
- 재시도는 0이다. 실패를 건너뛰어 성공으로 만든 결과가 아니다.

[최종 Pages Actions 실행](https://github.com/SooMin921123/economy-designer-test/actions/runs/36540108982)

공개 검사 18개는 서로 다른 9개 시나리오를 Desktop Chromium 1440×900 / 모바일 Chromium viewport 390×844에서 각각 수행한 결과다. 배포 전 26개와 겹치는 검사가 있으므로 '44개 서로 다른 기능 전수 검증'이라고 합산하지 않는다.

실행 환경은 GitHub-hosted Ubuntu 24.04.5, Node 24.21.0, Playwright가 설치한 Chromium/Headless Shell 153.0.8010.12다. 모바일은 화면 크기·터치 에뮬레이션이며 실제 휴대폰이 아니다.

## 2. 공개 주소에서 실제 통과한 시나리오

| 시나리오 | Desktop Chromium | 모바일 viewport |
|---|---|---|
| HTTPS 로딩·배포 커밋·학습 스크립트 전체 일치·홈 화면 폭 | 통과 | 통과 |
| manifest·180/192/512 PNG·해당 경로의 service worker 활성화 | 통과 | 통과 |
| Chromium 설치 가능 진단의 오류 목록 비어 있음 | 통과 | 통과 |
| 설정·합성 C03-04 확정 답안의 저장 및 재로딩 보존 | 통과 | 통과 |
| 채점 후 관련 강의 왕복의 입력·확정 이력 보존 | 통과 | 통과 |
| C13-04 빈 숫자 입력의 화면 이동·새로고침 유지 | 통과 | 통과 |
| 실제 파일 선택을 통한 합성 백업 미리보기·취소의 비파괴성 | 통과 | 통과 |
| 오프라인 새로고침·새 탭 재진입·비캐시 네트워크 차단 대조 | 통과 | 통과 |
| 임시 프로필로 Chromium 전체 프로세스 종료 후 오프라인 재시작·기록 유지 | 통과 | 통과 |

설치 가능 진단은 Chrome DevTools Protocol의 `Page.getInstallabilityErrors` 결과가 비어 있는지 확인한 것이다. 이것은 설치 메뉴의 실기기 표시, 설치 버튼 클릭, OS 설치 성공을 의미하지 않는다.

오프라인 검사는 응답의 `fromServiceWorker()`를 확인하고, 캐시된 적 없는 URL의 fetch가 네트워크 오류로 실패하는지 대조했다. 서비스 워커가 없는 별도 새 context에서는 오프라인 최초 접속이 실패했다. 오프라인에서 합성 초안을 저장하는 경로도 확인했다.

프로세스 재시작 검사는 CI에서 새로 만든 임시 브라우저 프로필에만 수행했다. 종료 후 같은 임시 프로필로 새 Chromium 프로세스를 띄워 service worker 응답과 확정 답안을 확인했다. 실제 iPhone/Android, OS 재부팅, 홈 화면 설치 앱의 재실행과 다르다.

## 3. 원본과 배포 묶음의 구분

Drive 원본을 변경하지 않았으며 이번 배포 단계에서도 `source/economy-designer-4.3.1.html`을 수정하지 않았다. 이전에 진단된 함수 종료 중괄호 2개 수정만 있는 실행본을 사용했다. 학습 콘텐츠·수치·정답 조건·저장 키는 그대로다.

- 보존 원본: `reference/original-economy-designer-4.3.1.html`, 631908 bytes, blob `8153fedc78a394a5f912fc58dfe88e2d2885d5c6`.
- 실행본: `source/economy-designer-4.3.1.html`, 631910 bytes, blob `b2b2a0f227708ccada51db08950fed42bac7568b`.
- 실행본 SHA256: `7e634b816ed143e752569bc9ddc509d2d026e92cad08939952998e2d23072706`.
- 배포 학습 스크립트 SHA256(LF 정규화): `3628b6d2d195dd9dea11500f54215ab04a77902b794ca5e6db48fd02489e6616`.
- 빌드: `4.3.1-recovery.1`; 저장 키: `econverse431-guarded`.

`build-pages.mjs`는 테스트 기록이 없는 새 브라우저에서 앱 자체의 PWA ZIP 버튼을 사용했다. 원래 PNG 아이콘을 사용하며, ZIP에서 배포 허용 파일만 추출했다. 원본 코드의 HTML 내보내기 결과와 실행본 학습 스크립트가 일치하는지 검사했다.

배포 포장에만 적용한 변경은 head의 noindex·배포 커밋 메타데이터, robots.txt와 배포 해시 문서, service worker의 콘텐츠별 캐시 버전이다. 고정된 캐시 이름 때문에 새 HTML이 예전 캐시에 남지 않도록 캐시 버전에 생성 HTML 해시를 반영했다. 기존 범위별 캐시 prefix와 학습 스크립트는 변경하지 않았다. 기존 설치본에서 업데이트를 수락하는 전 과정은 이번 검증 범위 밖이다.

이번 공개 파일은 다음 8개뿐이다: `index.html`, `manifest.webmanifest`, `sw.js`, `icon-180.png`, `icon-192.png`, `icon-512.png`, `robots.txt`, `deployment.json`.

`deployment.json`은 커밋·빌드·파일 해시의 배포 메타데이터이며 개인 학습 백업이 아니다. 원본 비교 파일, 교재 PDF·HWP, 개인 기록·백업, CI 보고서는 Pages에 배포하지 않았다. CI 증빙은 별도의 Actions artifact이다.

noindex와 robots.txt는 검색 제외 요청이며 접근 제한이 아니다. 이 Pages는 로그인 없이 열리는 공개 테스트 배포다. 계정 로그인·서버 동기화·결제·앱스토어용 APK/IPA는 구축하지 않았다.

## 4. 첫 배포 실패와 수정 후 재실행

| Pages Run | 커밋 | 공개 검사 | 배포 상태 |
|---|---|---|---|
| 1 / `36539660931` | `7e045fe05ba3fb83af3698f6af11aa206f40ddd4` | 16 통과 / 2 실패 | 배포 자체 성공, 후속 검사 실패 |
| 2 / `36540108982` | `187228c9abe3f2373f47108243a67c3048f3dd3a` | **18 통과 / 0 실패** | **배포·후속 검사 모두 성공** |

실패 2건은 두 viewport의 프로세스 재시작 테스트에서 발생한 `tracing.start: Tracing has been already started`이다. 원인은 runner의 `trace: 'on'`이 이미 추적을 시작한 context에 테스트 코드가 추적 시작을 다시 호출한 것이다. 이 오류가 발생한 최초 실행에서는 이후 오프라인 재시작 검증을 통과로 계산하지 않았다.

분류: **테스트 코드 문제**. 수정 커밋 `187228c9abe3f2373f47108243a67c3048f3dd3a`는 `deployment-tests/live.spec.mjs`에서 중복된 수동 tracing 시작·종료만 제거하고 runner가 trace를 저장하도록 했다. 앱 코드와 검사 조건은 유지했다. 이후 배포 전 26개와 공개 18개를 전부 다시 실행했다.

## 5. 증빙

- [최종 공개 검사 증빙](https://github.com/SooMin921123/economy-designer-test/actions/runs/36540108982/artifacts/11019754666): `pages-live-evidence-36540108982`, ID `11019754666`, 30239608 bytes, 만료 예정 `2026-10-29T08:03:49Z`.
- 공개 증빙 SHA256: `6a0f5e8b3a797d3a55edd4ea3c2f182f18e62aa97e1281c0b70f2727ef2efba6`.
- [최종 빌드·회귀 검사 증빙](https://github.com/SooMin921123/economy-designer-test/actions/runs/36540108982/artifacts/11020290978): ID `11020290978`, 3631317 bytes, 만료 예정 `2026-10-29T08:02:09Z`.
- 빌드 증빙 SHA256: `e3649625ad2ac15642b1e6fa95203f9a32f9b97a47690aa5f7f3a8c7184e9731`.
- [첫 실행 실패 증빙](https://github.com/SooMin921123/economy-designer-test/actions/runs/36539660931/artifacts/11019868295): ID `11019868295`, 29632989 bytes. 실패 로그와 trace를 보존했다.

최종 공개 증빙에는 `live-summary.json`, `live-results.json`, `LIVE_SUMMARY.md`, `live.log`, HTML 보고서, trace와 캡처, 공개 배포 커밋과 설치 가능 진단·오프라인 응답 증거가 있다. 프로세스 재시작 성공 화면은 `public-process-restart-offline.png`, 새 탭 오프라인 화면은 `public-offline-new-tab.png`로 남았다. 실제 사용자 기록은 사용하지 않았다. artifact는 보관 기간 또는 수동 삭제에 따라 이후 이용이 제한될 수 있다.

이 채팅의 로컬 container/Python 도구와 web 도구의 Pages 직접 열기는 작동하지 않아, 로컬 실행이나 로컬 이미지 검수 완료로 보고하지 않는다. 공개 주소 접근과 브라우저 검증은 GitHub Actions의 실제 HTTPS 요청·Chromium 로그를 근거로 한다.

## 6. 남은 실제 기기 확인과 운영 제한

실제 기기 결과는 [DEVICE_INSTALL.md](DEVICE_INSTALL.md)의 절차에 따라 별도로 확인한다. 현재 실제 iPhone/Android 설치·홈 화면 아이콘 실행·비행기 모드 아이콘 재실행·OS 재부팅 결과는 모두 미확인이다. Safari/WebKit 실기기 호환성, 모든 강의의 시각 교열·경제 내용 정확성, 모든 저장 용량 부족·다중 탭 충돌·장애도 이 결과에 포함하지 않는다.

이전 파일·다른 주소·다른 브라우저의 기록이 새 사이트나 설치 앱에 자동으로 옮겨진다고 가정하지 않는다. 먼저 원래 환경에서 JSON 백업을 개인적으로 보관하고 필요할 때 새 환경에서 미리보기를 거쳐 복원한다. 기존 기록 삭제나 브라우저 데이터 초기화는 요구하지 않는다.

앱 내부의 제작자 '미실행' 문구는 학습 HTML을 그대로 보존하면서 남은 제작 당시의 기록이다. 최신 실행 결과는 이 보고서와 지정된 Actions 로그를 기준으로 구분한다.

실행 시점의 의존성은 artifact에 보존했지만 package.json의 범위 버전은 완전 고정된 설치를 보장하지 않는다. 로그의 일부 Action Node20→24 전환·punycode 경고는 테스트 실패와 구분한다. 이번 배포 성공을 무경고·무장애 운영 보장으로 해석하지 않는다.
