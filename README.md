# Travence BIZRAW v2.0

네이버 커머스 자동 경영 리포트 시스템 (일간/주간/월간)

## 📂 구조
```
report_core.py                          # 공통 엔진 (수집/분석/AI/HTML/메일)
pacsafe_daily.py / weekly.py / monthly.py    # 팩세이프
president_daily.py / weekly.py / monthly.py  # 프레지던트
scan_unmapped.py                        # 미매칭 상품 스캔 도구

네이버_팩세이프_마스터_상품명.xlsx           # 팩세이프 마스터 카탈로그
네이버_프레지던트_마스터_상품명.xlsx         # 프레지던트 마스터 카탈로그

.github/workflows/daily_report.yml      # 자동화 워크플로우
requirements.txt
```

## 🚀 자동 발송 시점 (KST 기준)
모든 일/주/월 보고서는 **폼 제출 시 Apps Script가 자동 트리거**. 자동 cron 없음.

- **일간**: 폼 제출 시 즉시 → 5~10분 후 메일 도착
- **주간**: 폼 제출일이 KST **월요일**이면 daily + weekly 동시 트리거
- **월간**: 폼 제출일이 KST **1일**이면 daily + monthly 동시 트리거 (1일이 월요일이면 셋 다)
- **GFA 알림**: 매일 09:00 — 전날 GFA 미입력 시 t7832@naver.com에 입력 알림 메일 (유일한 자동 cron)
- **수동 실행**: GitHub Actions → "Run workflow" → mode 선택

## 🔑 GitHub Secrets (필수 등록)
Settings → Secrets and variables → Actions
- `ANTHROPIC_API_KEY`
- `NAVER_CLIENT_ID_PACSAFE`
- `NAVER_CLIENT_SECRET_PACSAFE`
- `NAVER_CLIENT_ID_PRESIDENT`
- `NAVER_CLIENT_SECRET_PRESIDENT`
- `GMAIL_APP_PASSWORD`
- `GOOGLE_SERVICE_ACCOUNT_JSON` — GFA 광고비 Sheet 읽기용 (Service Account JSON 전체 내용)

## 📝 GFA 광고비 수동 입력 (매일 1번)
GFA는 공개 API 없어서 폼으로 입력:

1. **입력 폼**: https://docs.google.com/forms/d/1v3fgJTQPW6WKDnPiSR8VTTEhF4K7YRsDh2ZTKh_7DC4/viewform
   - 폰 홈 화면에 추가 권장 (1탭으로 열림)
2. **언제든 입력**: 어제 GFA 광고비 (팩세이프·프레지던트 각각) — 폼 제출 시 **즉시 보고서 메일 자동 발송** (Apps Script trigger)
3. **자동 cron**:
   - **06:05 KST**: 정기 보고서 (입력 안 됐어도 SA만 반영해서 발송 — 미입력 표시)
   - **09:00 KST**: 전날 미입력 브랜드 있으면 t7832@naver.com에 알림 메일
4. **보고서 표시**:
   - 입력 완료: 💜 보라 카드, GFA 광고비 + 비중 %
   - 미입력: 🟥 빨간 카드, "미입력" + "폼 입력 필요"

응답 시트: `1wyyiNvMEhmCPwJJg6pOai-JFu2vmxMqPYHD9uBJuZ8w` (SA 공유됨)

## ⚡ Apps Script — 폼 제출 시 즉시 메일 발송
Google Form 제출 → GitHub Action 즉시 트리거 → 보고서 메일 5~10분 내 도착.

설정:
1. Form 편집 화면 → 더보기 (⋮) → **스크립트 편집기**
2. `apps-script-form-trigger.gs` 파일 내용 복붙
3. `PASTE_GITHUB_PAT_HERE` 자리에 본인 GitHub PAT 입력
4. 저장 → 좌측 ⏰ **트리거** 추가:
   - 함수: `onFormSubmit`
   - 이벤트 소스: **양식에서**
   - 이벤트 유형: **양식 제출 시**
5. Google 권한 승인 → 끝

자세한 절차는 [apps-script-form-trigger.gs](./apps-script-form-trigger.gs) 파일 상단 주석 참조.

## 🛠 수동 실행
GitHub Actions → "Travence BIZRAW Reports" → "Run workflow" → 모드 선택

## 📌 브랜드별 차이
- **팩세이프**: 마진율/매출총이익/광고 후 이익 표시
- **프레지던트**: 마진 정보 숨김 (원가 미등록 상품 다수). 광고비/평균 객단가 표시

## 🔍 미매칭 상품 스캔 (로컬 작업용)
```
python scan_unmapped.py pacsafe              # 최근 30일
python scan_unmapped.py president --days 60
```
미매칭 상품을 마스터 엑셀에 자동 추가. Type/Line/원가는 수동 입력.
