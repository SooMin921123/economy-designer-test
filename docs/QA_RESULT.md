# 경제 설계자 4.3.1 — 실제 브라우저 검증 결과

검증일: 2026-09-29. 이 문서는 실행을 마친 뒤 작성한 보고서이며, 테스트 코드나 학습 HTML을 변경하지 않는다. 이전 `QA_PROTOCOL.md`의 진행 중 상태는 아래 최종 실행 결과와 구분한다.

## 1. 최종 결과와 정확한 대상

**GitHub Actions Run 8: 성공. 26개 통과, 실패 0개, 건너뜀 0개.** 서로 다른 검사 시나리오 13개를 데스크톱과 모바일 viewport에서 각각 실행한 결과다. 26개 서로 다른 학습 기능 전체를 전수 검증했다는 뜻은 아니다.

- 검사한 커밋: `aa8b0331e1a66dc650601a0c66f348efe652a6da`
- Workflow: `.github/workflows/playwright.yml` / Economy Designer 4.3.1 Playwright
- Run ID: `36536864459`, attempt 1
- Job ID: `109302799585`
- 테스트 로그: `26 passed (18.1s)`
- 재시도 설정: `retries: 0`. 실패를 건너뛰거나 자동 재시도로 덮지 않았다.
- 실행 환경: GitHub-hosted Ubuntu, Desktop Chromium 1440×900 및 모바일 Chromium viewport 390×844. 사용자 실기기를 원격 조작한 것이 아니다.
- 실행 종료 상태: `completed / success`, GitHub 기록 갱신 시각 `2026-09-29T07:29:58Z`.

[최종 Actions Run 8](https://github.com/SooMin921123/economy-designer-test/actions/runs/36536864459)

**통과한 대상은 저장소의 실행 수정본 및 그것으로 구성한 PWA이다. Drive의 수정 전 원본이 그대로 실행 검증을 통과한 것은 아니다. Drive 파일은 덮어쓰지 않았다.**

## 2. 원본 보존과 학습 콘텐츠 불변 확인

| 구분 | 경로 | 크기 | Git blob |
|---|---|---:|---|
| 최초 Drive 수집본 보존 | `reference/original-economy-designer-4.3.1.html` | 631908 bytes | `8153fedc78a394a5f912fc58dfe88e2d2885d5c6` |
| 실행 수정본 | `source/economy-designer-4.3.1.html` | 631910 bytes | `b2b2a0f227708ccada51db08950fed42bac7568b` |

최초 수집 커밋은 `8f83588aaace3e36d3d092d5187b996e59cecd61`이다. `scripts/verify-source.mjs`는 보존 사본의 blob을 검사하고, 원본에 진단된 함수 종료 중괄호 `}` 두 개만 추가했을 때 실행 수정본 전체와 일치하는지 확인했다. 최종 CI에서 이 검사가 통과했다. 강의·문항·수치·정답 조건·채점 함수는 별도 변경하지 않았다.

원본의 스크립트 구문 오류 `Unexpected end of input`은 보존 사본에서 재현되었고, 수정본의 구문 검사는 통과했다. 따라서 원본 구문 실패와 수정본 성공을 구분한다.

- 보존 사본 SHA256: `3ee261aa69d02a0d7755ceb6f89a30fa1dc8284a5a4e17d282b32812d4f33ba0`
- 수정본 SHA256: `7e634b816ed143e752569bc9ddc509d2d026e92cad08939952998e2d23072706`

Drive 메타데이터에서 631908바이트와 수정 시각 `2026-09-28T23:49:25.979Z`를 확인했다. 커넥터 응답에는 원격 체크섬이 없어, 위 SHA256은 최초 수집 사본의 체크섬이지 현재 Drive 원격 체크섬과 독립적으로 일치 확인한 값이라고 주장하지 않는다.

빌드 문자열 `4.3.1-recovery.1`과 저장 키 `econverse431-guarded`는 그대로 유지했다. 수정 전후를 구별할 때는 파일 경로와 Git commit/blob을 함께 사용한다.

## 3. 최종 통과 목록

아래 모든 행은 Run 8에서 각각 실제 실행되었다. '모바일'은 모바일 viewport 에뮬레이션이다.

| 검사 시나리오 | Desktop Chromium | 모바일 viewport |
|---|---|---|
| 4.3.1 부팅, 지정 viewport, 홈 화면 가로 넘침 검사 | 통과 | 통과 |
| 설정 변경의 localStorage 저장 및 새로고침 유지 | 통과 | 통과 |
| C03-04 채점 후 관련 강의 왕복 시 입력·확정 기록 보존 | 통과 | 통과 |
| C13-04 숫자 입력 공백의 화면 이동·새로고침 유지 | 통과 | 통과 |
| 복원 미리보기·취소의 메모리/저장값 보존: 함수 경로 | 통과 | 통과 |
| manifest 필드와 service worker 활성화 확인 | 통과 | 통과 |
| 온라인 최초 로딩 후 오프라인 새로고침 | 통과 | 통과 |
| 합성 기존 답안·메모 재로딩 유지 및 별도 context 격리 | 통과 | 통과 |
| 실제 파일 선택 경로의 JSON 미리보기·취소·재로딩 보존 | 통과 | 통과 |
| 알 수 없는 문항 ID가 있는 백업 거부 및 기존 기록 유지 | 통과 | 통과 |
| 확인 후 합성 백업 적용·재로딩 및 교체 전 보관함 복구 | 통과 | 통과 |
| 기존 탭 종료 후 새 탭 오프라인 재진입·비캐시 요청 차단·미방문 context 대조 | 통과 | 통과 |
| 앱 자체 PWA ZIP 생성·합성 개인 메모 제외·실제 PNG·패키지 오프라인 로딩 | 통과 | 통과 |

별도 source-integrity 검사에서도 원본 blob, 허용된 두 글자 수정, 실행 수정본 구문 및 금지 파일 확장자/JSON 커밋 방지 검사가 통과했다. 이 정적 검사는 브라우저 26개에 합산하지 않았다.

### 오프라인 결과의 근거

최종 새 탭 검사는 `navigator.onLine === false`만으로 판단하지 않았다. 이전에 앱을 열지 않은 빈 새 탭으로 진입하고 응답이 service worker에서 제공되었는지 확인했다. service worker의 허용 목록에 없고 캐시된 적 없는 URL의 `fetch` 요청이 실제 네트워크 오류로 실패하는지 함께 확인했다. 오프라인에서 새 숫자 입력을 저장하는 경로도 검사했다. 반대로 service worker가 없는 별도의 미방문 context에서는 오프라인 최초 진입이 실패하는지 대조했다.

이는 기존 탭을 닫은 뒤 새 탭에서 재진입한 검사다. 전체 브라우저 프로세스 종료, OS 재부팅, 홈 화면 아이콘 실행까지 검사한 결과는 아니다.

### PWA 묶음의 구분

`prepare-pwa.mjs`가 만든 기본 검증 환경에는 단색 테스트용 아이콘이 들어 있다. 이를 실제 배포 디자인 검수와 혼동하지 않는다. 별도 안전성 검사는 앱의 'PWA 배포 ZIP 만들기' 버튼을 눌러 생성한 묶음과 실제 PNG 아이콘을 사용했다. ZIP CRC, 학습 스크립트 동일성, 72강·정규195문제·안내형30개, 180/192/512 PNG 크기, 합성 개인 메모 문자열의 제외, 별도 하위 경로에서의 service worker와 오프라인 로딩을 확인했다.

## 4. 실패 원인과 별도 수정 커밋

| 분류 | 진단된 문제 | 수정 |
|---|---|---|
| 원본 코드 | v42/g43 두 `handleAction` 함수의 종료 중괄호가 누락되어 전체 스크립트 구문 분석 실패 | `695e9e093c3bd4721f14dadef22b84b076834870`: `}` 두 개만 추가 |
| 검증용 PWA 배포 구성 | HTML 전체에 들어 있는 문자열을 실제 head의 manifest link로 오인하여 링크를 넣지 않음 | `2e69f2fd03909e011f316582f03e9bb9decc7bbb`: head의 실제 link만 검사 |
| 테스트 코드 | 설정 버튼이 상단과 본문에 있어 locator가 2개를 선택, strict-mode 오류 발생 | `89f084e95dde77a10bf226d38ddaab8a444bc8f0`: 상단 설정 버튼으로 한정 |
| 추가 테스트의 네트워크 설정 | offline 설정 후 별도의 CDP Network 설정을 한 새 탭에서 `navigator.onLine`이 true로 관찰되어 offline 전제조건 검사 실패 | `aa8b0331e1a66dc650601a0c66f348efe652a6da`: 추가 CDP 설정 제거, 새 탭 준비 후 offline 적용, 비캐시 요청 실패 대조 추가 |

마지막 문제는 앱 코드가 아니라 테스트 설정을 수정했다. Chromium 내부의 어느 호출이 상태를 바꿨는지까지 별도 계측한 것은 아니므로 그 내부 원인을 단정하지 않는다. 관찰된 실패와 변경한 테스트 설정, 변경 후 통과를 구분한다. 이 커밋에서는 추가로 생성하는 child context에도 해당 프로젝트의 viewport/mobile/touch 설정을 명시했다.

## 5. 실행 → 실패 수집 → 수정 → 재실행 기록

| Run | ID | 검사 커밋 | 결과 | 판단 |
|---:|---|---|---|---|
| 3 | `36532404650` | `901858336e3f2515b8a2e0df1c717d7fa620ec58` | 0/14 통과 | 모두 공통 부팅 단계 실패. 하위 기능 자체의 독립적 실패로 해석하지 않음 |
| 4 | `36533838384` | `695e9e093c3bd4721f14dadef22b84b076834870` | 6/14 통과 | 설정 locator 및 manifest 연결 문제 |
| 5 | `36534216170` | `2e69f2fd03909e011f316582f03e9bb9decc7bbb` | 10/14 통과 | 설정 locator 관련 4개 실패만 남음 |
| 6 | `36534275977` | `89f084e95dde77a10bf226d38ddaab8a444bc8f0` | 14/14 통과 | 기존 검사 완료 |
| 7 | `36536259140` | `8115f73b729a05b72e729d8266f40e5c3d385bad` | 24/26 통과 | 추가 검사 중 새 탭 offline 전제조건 2개 실패 |
| 8 | `36536864459` | `aa8b0331e1a66dc650601a0c66f348efe652a6da` | **26/26 통과** | 수정 후 전체 재실행 성공 |

초기 설정 중 별도 push로 생성된 Run 1·2도 실패 상태였으며, 위 표는 구체적인 테스트 로그를 확인한 Run 3부터의 분석이다. 테스트 추가로 분모가 14에서 26으로 늘어났으므로 과거와 최종 분모를 구분한다.

## 6. 증빙 파일과 보관

[최종 증빙 ZIP: Run 8](https://github.com/SooMin921123/economy-designer-test/actions/runs/36536864459/artifacts/11018722920)

- Artifact ID: `11018722920`
- 이름: `economy431-evidence-36536864459-1`
- 크기: 3189365 bytes
- SHA256: `17f2efe62c6974340da5fe8fabe9b2b4b1f3aa931a17e25ec98c7daba767f1c6`
- GitHub가 반환한 만료 예정 시각: `2026-10-29T07:29:53Z`. 보관 정책 또는 수동 삭제에 따라 이후 이용이 제한될 수 있다.

성공 실행에도 `evidence/summary.json`, `evidence/SUMMARY.md`, `evidence/results.json`, `evidence/source-integrity.json`, 의존성 버전·실행 시점 lock, Playwright 실행 로그, HTML 보고서, 오프라인 화면 및 앱 생성 PWA 묶음이 남도록 했다. 이것들은 Actions artifact이며 개인 백업 JSON을 Git 소스에 올린 것이 아니다.

[원본 부팅 실패 증빙: Run 3](https://github.com/SooMin921123/economy-designer-test/actions/runs/36532404650/artifacts/11017787090)

[설정 locator 실패 증빙: Run 5](https://github.com/SooMin921123/economy-designer-test/actions/runs/36534216170/artifacts/11016898625)

[추가 offline 검사 실패 증빙: Run 7](https://github.com/SooMin921123/economy-designer-test/actions/runs/36536259140/artifacts/11018360124)

초기 부팅·locator 실패에는 screenshot, trace, error-context 및 Actions 오류 로그가 남았다. **Run 7의 새 탭 실패 2개는 기존 fixture 페이지를 먼저 닫은 탓에 실패 화면 자동 캡처가 남지 않았다.** 해당 오류 로그와 trace는 남았으며, 최종 테스트에는 새 탭을 닫기 전에 실패 화면과 진단 정보를 저장하는 처리를 추가했다. 모든 과거 실패에 screenshot이 있다고 주장하지 않는다.

Run 6은 당시 실패 시에만 artifact를 올리는 설정이어서 성공 artifact가 없고 Actions 로그에 통과 결과가 있다. Run 8은 실패가 없으므로 `retain-on-failure` 설정에 따른 실패 trace가 새로 생성되지 않았다.

## 7. 데이터 격리와 아직 확인하지 않은 범위

검사 서버는 runner의 `127.0.0.1:4173`에만 바인딩했다. 테스트별 임시 브라우저 context와 합성 답안·메모를 사용했다. 사용자 개인 브라우저 프로필, 실제 학습 기록, 개인 백업 JSON을 읽거나 교체하지 않았다. 실제 기록 대신 합성된 '기존 기록'으로 새로고침·취소·교체·복구를 확인한 것이다. 저장 공간의 다른 origin 또는 context와 공유되지 않는 것도 대조했다.

교재 PDF·HWP 및 개인 백업은 저장소에 커밋하지 않았다. GitHub Pages는 이번 작업에서 구성하거나 배포하지 않았다.

| 범위 | 상태 |
|---|---|
| Desktop Chromium 및 모바일 viewport의 위 13개 경로 | 통과 |
| manifest 필드·실제 PNG·SW 활성화·오프라인 재진입 | 지정된 CI 환경에서 통과 |
| 브라우저별 설치 가능 판정 전체·설치 안내 표시 | 미검증 |
| 실제 iPhone/Android 기기 | 미검증 |
| OS 홈 화면 설치·설치 아이콘 실행·OS 재부팅 후 실행 | 미검증 |
| GitHub Pages·실제 HTTPS 배포 주소 | 미배포·미검증 |
| 72강 모든 화면의 시각 교열·전체 경제 내용 및 정답 타당성 | 이번 검사 범위 아님 |
| 모든 quota 초과·저장 접근 거부·다중 탭 경쟁·물리적 저장장치 장애 | 전수 검증하지 않음 |

CI 로그에는 Node.js 20/일부 Action 런타임의 사용 중단 예정 경고와 라이브러리 경고가 있었다. 테스트 성공은 경고가 전혀 없다는 뜻이 아니다. 의존성은 실행 시점 정보를 artifact에 남겼지만 저장소에 정확한 dependency lock을 고정한 구성은 아니다.

**판정: 수정본의 지정된 브라우저 회귀·저장 보호·오프라인 경로 검증 완료. 원본 무오류, 실기기 설치 완료, 실서비스 배포 완료 또는 전체 콘텐츠 교열 완료를 뜻하지 않는다.**
