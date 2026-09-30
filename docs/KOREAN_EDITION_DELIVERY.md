# 문장 개정판 최종 전달

2026-09-30의 [Korean edition review 실행 9](https://github.com/SooMin921123/economy-designer-test/actions/runs/36670339331)가 `completed / success`로 종료했다. **36/36 통과**, 건너뜀·실패·불안정 통과는 모두 0개이다. 18개 시나리오를 Desktop Chromium과 모바일 Chromium viewport에서 각각 수행했다.

## 결과물

**[학습용 전달 ZIP 받기](https://github.com/SooMin921123/economy-designer-test/actions/runs/36670339331/artifacts/11077881610)**

GitHub Actions artifact 다운로드에는 GitHub 로그인이 필요할 수 있다. 이 artifact의 보관 만료 예정일은 2026-12-29이다. 저장소의 개정 HTML은 별도로 남는다.

| 파일 | 용도 |
|---|---|
| `economy-designer-4.3.1-ko.html` | 단일 학습 HTML |
| `economy-designer-4.3.1-ko-pwa.zip` | HTTPS 정적 호스팅용 설치 패키지 |
| `README-ko.md` | 개정 범위와 사용·기록 보호 안내 |
| `validation-results.json` | 실제 빌드·구조·브라우저 검사·설치 파일 생성 결과 |
| `SHA256SUMS.txt` | 묶음 안의 파일 해시 |

[저장소의 개정 HTML](../revised/economy-designer-4.3.1-ko.html) · [상세 개정 보고서](KOREAN_EDITION_RESULT.md) · [개발용 검사 증빙](https://github.com/SooMin921123/economy-designer-test/actions/runs/36670339331/artifacts/11078006238)

전달 ZIP은 685134 bytes이며 SHA-256은 `2786ebf7c66541e493c7ce8962b04f7dc0f653ca33149e4655a4b807bcbb07d8`이다. 개정 HTML의 SHA-256은 `e3675e3f4cf654361247aec1240516d14925c9d8a4f7aed62b74b3571a7ef410`으로 앞선 실행 8에서 통과한 HTML과 같다.

최종 시험 입력 커밋은 `3bf58dd6047db0e23eb941a37ec93d753ad0b714`이다. 이 문서는 시험 후 추가한 설명이며 문서 커밋을 별도의 실행 검증으로 계산하지 않는다.

## 반영 상태

개정 내용과 검증 결과는 `editorial/ko-431` 브랜치에 커밋했다. 기존 보존 원본과 실행 기준 HTML, 기존 `main` 공개 학습 주소는 교체하지 않았다. 따라서 이전 공개 주소를 방문해도 이번 문장 개정판이 보이는 상태는 아니다.

새 주소·파일 경로·브라우저로 옮기기 전 기존 앱의 학습 기록을 외부 파일로 백업해야 한다. 실제 휴대폰 홈 화면 설치와 OS 재부팅, 원교재 표·그림 전수 대조는 이번 자동 검증의 범위에 포함하지 않는다.
