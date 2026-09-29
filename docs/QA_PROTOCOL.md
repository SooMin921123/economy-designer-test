# 경제 설계자 4.3.1 검증 원칙과 변경 기록

## 원본과 수정본

Drive 원본: `경제설계자_4_3_1_72강_학습연결_복원보호.html` (file ID `1QkH5ve4UWz5slH5wmh9Nr2MXnnsceA8p`). Drive 파일은 변경하지 않는다.

- 최초 수집 커밋: `8f83588aaace3e36d3d092d5187b996e59cecd61`.
- 최초 수집 Git blob: `8153fedc78a394a5f912fc58dfe88e2d2885d5c6`.
- 보존 사본: `reference/original-economy-designer-4.3.1.html`.
- 실행 수정본: `source/economy-designer-4.3.1.html`.
- 빌드 식별자는 원본의 `4.3.1-recovery.1`, 저장 키는 `econverse431-guarded`를 유지한다. 수정본의 정확한 식별에는 Git commit/blob을 함께 사용한다.

`verify-source.mjs`는 보존 사본의 Git blob을 확인하고, 실행 수정본이 원본에 함수 종료 중괄호 두 개만 추가한 것인지 전체 문자열을 대조한다. 강의, 문제, 예제, 정답 조건, 채점 함수의 별도 수정은 허용하지 않는다. 원본의 구문 오류 재현과 수정본 구문 검사는 구분한다.

Drive 메타데이터 조회에서는 크기 631908바이트와 수정 시각 2026-09-28T23:49:25.979Z를 확인했다. 커넥터 응답에 원격 체크섬은 없었으므로 보고서의 SHA256은 최초 수집 사본의 해시이며 현재 Drive 원격 체크섬과 독립적으로 일치 확인한 값이라고 주장하지 않는다.

## 발견한 문제의 분류

| 분류 | 원인 | 수정 커밋 |
|---|---|---|
| 원본 코드 | v42 및 g43 `handleAction` 함수의 종료 중괄호가 각각 하나 누락되어 전체 스크립트가 구문 분석되지 않음 | `695e9e093c3bd4721f14dadef22b84b076834870` |
| 테스트 코드 | 설정 버튼이 상단과 본문에 각각 있어 단일 locator가 strict-mode 오류를 냄. 상단 버튼으로 한정 | `89f084e95dde77a10bf226d38ddaab8a444bc8f0` |
| PWA 검증용 배포 구성 | HTML 전체 문자열에 등장하는 `rel="manifest"`를 실제 head의 link 요소로 오인. head만 검사하도록 변경 | `2e69f2fd03909e011f316582f03e9bb9decc7bbb` |

위 PWA 배포 구성 오류는 검증 환경을 만들면서 발생한 문제다. 앱 자체의 PWA exporter 문제라고 분류하지 않는다. 검증용 `prepare-pwa.mjs`의 아이콘은 단색 fixture다. 별도 safety 테스트는 앱 내부의 PWA ZIP 버튼으로 생성한 실제 PNG 아이콘과 패키지를 따로 확인한다.

## 기존 실행 기록

- Run 3 `36532404650`: 14개 모두 부팅 단계 실패. 하위 기능 14개가 각각 고장이라는 의미가 아니라 공통 구문 오류로 검사 지점에 도달하지 못한 결과.
- Run 4 `36533838384`: 6개 통과, 8개 실패. 설정 locator 및 manifest 연결 문제.
- Run 6 `36534275977`: 기존 14개 통과. 테스트 목록은 `tests/economy-designer.spec.mjs`.

추가 안전성 검사는 `tests/safety.spec.mjs`에 정의한다. 실행 전에는 통과라고 기록하지 않으며 최종 결과는 Actions의 해당 commit, run ID, evidence artifact로 확인한다.

## 데이터 격리

브라우저는 Actions runner의 임시 Chromium context만 사용한다. 서버는 `127.0.0.1:4173`에만 바인딩하며 사용자 실사용 도메인, 로그인 프로필, Drive 개인 백업은 읽지 않는다. 기존 기록 보존 검사는 합성 기록으로 실제 localStorage에 저장한 뒤 새로고침·복원·취소·교체 전 보관함을 검사한다. 파일 선택 테스트의 JSON은 메모리에서 생성하며 저장소에 커밋하지 않는다.

테스트 중의 메모와 답안이 trace에 포함될 수 있으나 모두 명시적인 QA fixture이다. 사용자 교재 PDF, 개인 기록, 백업 JSON은 커밋하지 않는다. 생성한 evidence는 Git 코드가 아닌 실행 artifact로 30일간 보관한다.

## 보고 범위

Desktop Chromium과 390×844 모바일 Chromium viewport를 구분한다. 모바일 에뮬레이션은 실제 iPhone/Android 검사가 아니다. manifest·PNG 자산·service worker·offline reload·offline 새 탭 재진입은 실제 OS 홈 화면 설치와 다르다. 현재 작업은 GitHub Pages를 배포하지 않는다.

합성 백업의 교체 및 복구가 통과하더라도 저장 장치 장애, quota 초과, 모든 다중 탭 경쟁 상황, 실제 개인 기록 전체의 무손실을 전부 검증한 것으로 확대하지 않는다. 통과한 대표 경로를 전체 학습 콘텐츠의 경제학적 정확성이나 72강 모든 화면의 시각 교열로 확대하지 않는다.

성공/실패 목록과 커밋을 JSON 및 Markdown으로 남기고, 실패 시 screenshot·trace·오류 로그를 함께 남긴다. `continue-on-error`나 자동 재시도로 실패를 숨기지 않는다.
