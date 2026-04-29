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
- **일간**: 매일 오전 8시 → 어제 vs 그저께
- **주간**: 매주 월요일 오전 8시 → 지난주 (월~일) vs 전전주
- **월간**: 매월 1일 오전 9시 → 지난달 vs 전전달

## 🔑 GitHub Secrets (필수 등록)
Settings → Secrets and variables → Actions
- `ANTHROPIC_API_KEY`
- `NAVER_CLIENT_ID_PACSAFE`
- `NAVER_CLIENT_SECRET_PACSAFE`
- `NAVER_CLIENT_ID_PRESIDENT`
- `NAVER_CLIENT_SECRET_PRESIDENT`
- `GMAIL_APP_PASSWORD`

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
