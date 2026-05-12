# Travence BIZRAW v2.0

> 네이버 커머스 + GFA 통합 자동 경영 리포트 시스템 (팩세이프 / 프레지던트, 일간·주간·월간)
>
> **매일 5초 폼 입력 → 메일 + Drive 영구 보존 → 모든 후속 분석 가능**

---

## 📌 한눈에 보기

| 항목 | 내용 |
|---|---|
| 사용자 매일 작업 | 폼에 어제 GFA 광고비 2개 숫자 입력 (5초, PC 불필요) |
| 자동 트리거 | 폼 제출 시 즉시 GitHub Actions 실행, 5~10분 후 메일 도착 |
| 보고서 종류 | 일간 / 주간 / 월간 (월요일·1일 폼 제출 시 자동 추가 트리거) |
| 데이터 보존 | Google Shared Drive에 일별 JSON + HTML 자동 적재 |
| 미입력 알림 | 매일 09:00 KST, 전날 미입력 브랜드 있으면 알림 메일 |

---

## 1. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                       사용자 (아이폰)                          │
│            ↓ 1탭                                              │
│  [Google Form] 어제 GFA 광고비 2개 입력 → 제출                  │
└─────────────────────────────────────────────────────────────┘
                              ↓ 즉시
┌─────────────────────────────────────────────────────────────┐
│                Google Apps Script (onFormSubmit)              │
│  - 항상 daily 트리거                                            │
│  - KST 월요일이면 weekly 추가                                    │
│  - KST 1일이면 monthly 추가                                     │
│  - (1일이 월요일이면 셋 다 트리거)                                │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP POST
┌─────────────────────────────────────────────────────────────┐
│           GitHub Actions (workflow_dispatch)                   │
│           우분투 러너에서 Python 스크립트 실행                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│   report_core.run_report() — 양 브랜드 병렬 처리                 │
│                                                                │
│   [1] 데이터 수집                                                │
│       ├─ 네이버 커머스 API (매출/SA광고비/상품/키워드/채널/고객)    │
│       └─ Google Sheets API (폼 응답 시트의 GFA 광고비)            │
│                                                                │
│   [2] 분석                                                       │
│       ├─ analyze_data — KPI/채널/베스트셀러/카테고리/라인          │
│       ├─ _allocate_gfa_to_channels — 채널별 GFA 비례 배분        │
│       ├─ 순위 변동 계산 (curr vs prev)                            │
│       ├─ detect_alerts — 위험/기회 신호 (SA+GFA 통합 기준)         │
│       └─ Claude Opus 4.7 — 한 줄 요약 + 액션 플랜                 │
│                                                                │
│   [3] HTML 렌더링 (render_html)                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓ 3곳 동시 출력
┌──────────────┬──────────────────┬──────────────────────────┐
│  📧 메일      │  💾 Google Drive  │  ✅ GitHub Actions 로그   │
│  (수신자에게)  │  (자동 영구 보존)  │                          │
└──────────────┴──────────────────┴──────────────────────────┘

[별도 cron — PC 무관]
  매일 09:00 KST → gfa_reminder.py
   └─ 어제 GFA 미입력이면 t7832@naver.com에 알림 메일
```

**핵심 원칙**: 사용자 PC는 단 한 번도 켤 필요 없음. 모든 작업이 클라우드(Google + GitHub)에서 수행.

---

## 2. 보고서 KPI 구조 (양 브랜드 동일)

두 브랜드는 **완전히 같은 화면 구조**로 메일 도착. 데이터(매출/상품명)만 다름.

```
┌─────────────────────────────────────────────┐
│  💬 어제의 한 줄 (Claude Opus 4.7 생성)        │
│  "어제는 실매출 1,072만원으로 전일 대비..."      │
└─────────────────────────────────────────────┘

⚡ KEY METRICS
┌─────────────────┬─────────────────┐
│ 💰 매출          │ 🎯 ROAS          │
├─────────────────┼─────────────────┤
│ 🧾 실매출        │ ↩️ 환불          │   ※ 실매출 = 매출 - 환불 - 취소
├─────────────────┼─────────────────┤
│ 🛒 평균 객단가    │ 📦 전환건수       │
├─────────────────┼────────┬────────┤
│ 📢 총 광고비     │🎯 SA   │📺 GFA  │   ※ GFA 미입력 시 🟥 빨간 카드
└─────────────────┴────────┴────────┘

🏆 BESTSELLERS TOP 8
  1위 EXP 12인치 슬링백   ▲1 (전일 2위)    318만
  2위 V 힙색 블랙        🆕 NEW            223만
  3위 ...               ▼2 (전일 1위)    ...

📊 카테고리 분포
  SLING       44% ▲+3.0%p · 559만 ▲+8%
  CROSSBODY   34% ▼-1.2%p · 427만 ▼-12%
  BACKPACK    17% ━━━━━── · 219만 ▲+3%
  ...

📈 라인(시리즈) 분포 (위와 동일 포맷)

📈 DAILY ROAS (주간/월간만)
  요일별 막대 그래프

🚨 ALERTS & ACTIONS
  ⚠️ 위험 신호 — 채널 ROAS 하락, 반품 증가, 매출 급감 등
  🎯 기회 신호 — 키워드 노출 증가, 고효율 채널, 재구매율 상승
  📋 액션 플랜 — AI 자동 생성 (3~5개 항목)

🎯 KPI 푸터: 판매 N건 · 광고비 N (SA+GFA)
```

### 비교 기준 (변화 칩 표시 기준)
- **일간**: 전일 비교
- **주간**: 전주 비교
- **월간**: 전월 비교

### 변화 칩 노이즈 컷
- 비중% 변화가 ±0.5%p 미만이면 칩 숨김
- 매출 변화율이 ±5% 미만이면 칩 숨김
- (작은 변화로 화면이 어수선해지지 않도록)

### 마진/원가 정보
양 브랜드 모두 **마진/원가는 보고서에 노출하지 않음** (의도적 설정). `brand_config[brand]["show_margin"] = False`. 마스터 엑셀에 원가가 있어도 화면에 표시되지 않음.

---

## 3. 사용자 매일 워크플로우

### A. 폼 입력 (필수)
1. 아이폰 홈 화면의 **GFA 입력** 아이콘 탭
2. 폼이 열림 → 날짜 자동 입력 (어제), 팩세이프·프레지던트 GFA 광고비 입력
3. **제출**
4. 5~10분 후 메일 도착 + Drive에 자동 적재

### B. 미입력 시
- 09:00 KST에 t7832@naver.com으로 알림 메일 자동 발송
- 늦게라도 폼 제출하면 그 시점부터 보고서 즉시 발송
- 미입력 상태로 두면 보고서가 발송 안 됨 (트리거 없음)

### C. 수동 실행 (필요 시)
`GitHub → Actions → "Travence BIZRAW Reports" → "Run workflow" → mode 선택 → Run workflow`

---

## 4. Google Drive 자동 적재

폼 제출 → 보고서 발송 시점에 **Google Shared Drive에 raw JSON + 보고서 HTML이 자동 저장**됨. 메일 발송 성공 여부와 무관하게 항상 시도.

### 폴더 구조
```
공유 드라이브: 클로드 코드용/
└── travence-data/
    ├── pacsafe/
    │   ├── daily/
    │   │   └── 2026/05/
    │   │       ├── 2026-05-11.json
    │   │       ├── 2026-05-11.html
    │   │       ├── 2026-05-12.json
    │   │       └── ...
    │   ├── weekly/
    │   │   └── 2026/
    │   │       ├── 2026-05-04.json   ← 주 시작일(월요일) 기준
    │   │       ├── 2026-05-04.html
    │   │       └── ...
    │   └── monthly/
    │       └── 2026/
    │           ├── 2026-05.json
    │           ├── 2026-05.html
    │           └── ...
    └── president/
        └── (동일 구조)
```

폴더는 SA가 자동 생성. 같은 날짜 재실행 시 덮어쓰기.

### JSON 스키마
```json
{
  "brand": "팩세이프",
  "mode": "daily",
  "period": {"start": "2026-05-11", "end": "2026-05-11"},
  "generated_at": "2026-05-12T05:35:00+09:00",
  "curr": {
    "total_revenue": 12660000,
    "total_refund": 1950000,
    "total_cancel": 0,
    "sa_cost": 740000,
    "gfa_cost": 1420000,
    "total_cost": 2160000,
    "total_purchases": 110,
    "channels": [{"name":"...","cost":...,"revenue":...,"roas":...,"sa_only_cost":...}, ...],
    "products": [{"_master_name":"...","payAmount":...,"_rank_change":...,"_prev_rank":...}, ...],
    "keywords": [...],
    "categories": [{"name":"SLING","share":44,"revenue":...,"prev_share":...,"revenue_change_pct":...}, ...],
    "lines": [...],
    "customer_new": ...,
    "customer_returning": ...,
    "repurchase_rate": ...
  },
  "prev": { ... },
  "ai": {"one_liner": "...", "actions": [...]},
  "risks": [{"title":"...","desc":"..."}, ...],
  "opportunities": [{"title":"...","desc":"..."}, ...]
}
```

### 1년 후 활용 가능
- "지난 4주 화요일 평균 vs 이번 주 화요일" — Drive에서 4개 JSON만 읽으면 됨
- "팩세이프 5월 전체 ROAS 추이" — daily 31개 JSON 읽기
- "올해 1분기 vs 2분기 베스트셀러 변동" — monthly 6개 비교
- "1년치 통째로 Claude에 입력 → 강점/약점/전략" — 메타 분석

---

## 5. 파일 구성

```
report_core.py                      공통 엔진
  ├─ fetch_gfa_cost                 GFA 광고비 (Sheets API)
  ├─ _allocate_gfa_to_channels      채널별 GFA 비례 배분
  ├─ save_to_drive                  Drive 자동 적재
  ├─ analyze_data                   KPI/채널/베스트셀러/카테고리 분석
  ├─ detect_alerts                  위험/기회 신호 탐지
  ├─ get_ai_analysis                Claude Opus 4.7 호출
  ├─ render_html                    HTML 보고서 생성
  ├─ send_email                     Gmail SMTP
  └─ run_report                     전체 파이프라인

pacsafe_daily.py / weekly.py / monthly.py     팩세이프 진입점
president_daily.py / weekly.py / monthly.py   프레지던트 진입점

gfa_reminder.py                     09시 미입력 알림 (별도 cron)
apps-script-form-trigger.gs         Google Apps Script (Form → GitHub)

네이버_팩세이프_마스터_상품명.xlsx     팩세이프 상품 카탈로그
네이버_프레지던트_마스터_상품명.xlsx   프레지던트 상품 카탈로그
scan_unmapped.py                    미매칭 상품 스캔 (로컬 작업)

.github/workflows/daily_report.yml  GitHub Actions 워크플로우
requirements.txt                    Python 패키지 (anthropic, openpyxl,
                                    google-auth, google-api-python-client 등)
```

---

## 6. 초기 셋업 가이드 (처음 보는 사람용)

이 시스템을 처음부터 새로 구축하려면 아래 6단계 순서로 진행.

### 단계 1: GitHub 저장소 준비
1. 이 저장소를 fork 또는 clone
2. `apps-script-form-trigger.gs` 안 `OWNER`/`REPO` 본인 GitHub 정보로 수정

### 단계 2: GitHub Secrets 등록
`Settings → Secrets and variables → Actions`

| Secret 이름 | 값 |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API 키 |
| `NAVER_CLIENT_ID_PACSAFE` | 네이버 커머스 API ID |
| `NAVER_CLIENT_SECRET_PACSAFE` | 네이버 커머스 API Secret |
| `NAVER_CLIENT_ID_PRESIDENT` | 동일, 프레지던트용 |
| `NAVER_CLIENT_SECRET_PRESIDENT` | 동일, 프레지던트용 |
| `GMAIL_APP_PASSWORD` | Gmail 앱 비밀번호 (2단계 인증 → 앱 비밀번호) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Service Account JSON 전체 내용 (Sheets + Drive 권한) |

### 단계 3: Google Service Account 준비
1. Google Cloud Console → 새 프로젝트 → Service Account 생성
2. **권한 활성화**:
   - Google Sheets API
   - Google Drive API
3. JSON 키 생성 → 다운로드 → 그 내용 전체를 `GOOGLE_SERVICE_ACCOUNT_JSON` Secret에 붙여넣기
4. SA 이메일 메모 (예: `xxx@xxx.iam.gserviceaccount.com`)

### 단계 4: Google Form + 응답 시트 준비
1. Google Forms → 새 양식
   - 질문 1: 날짜 (어제) — 날짜 형식
   - 질문 2: 팩세이프 GFA 광고비 — 숫자
   - 질문 3: 프레지던트 GFA 광고비 — 숫자
2. **응답 → 스프레드시트에 응답 연결** (자동 시트 생성됨)
3. 시트 ID를 `report_core.py`의 `GFA_SHEET_ID`에 입력
4. 시트를 **SA 이메일과 공유** (뷰어 권한 OK)
5. 폼 우상단 **게시** 버튼 클릭 → 응답자: "링크가 있는 모든 사용자"

### 단계 5: Shared Drive 준비
1. drive.google.com → 좌측 "공유 드라이브" → **+ 새로 만들기** → 이름: `클로드 코드용`
2. Shared Drive 내부 멤버 관리 → **SA 이메일 추가**, 권한: **콘텐츠 관리자** 이상
3. `report_core.py`의 `DRIVE_SHARED_DRIVE_NAME` 상수가 `"클로드 코드용"`인지 확인
4. (`travence-data` 폴더는 첫 실행 시 자동 생성됨)

### 단계 6: Apps Script 트리거 등록
1. Google Form 편집 화면 → ⋮ → **스크립트 편집기**
2. 기본 코드 삭제 → `apps-script-form-trigger.gs` 내용 전체 붙여넣기
3. `GITHUB_TOKEN` 자리에 GitHub PAT 입력 (Fine-grained PAT, **Actions: Read and write** 권한 필수)
4. 저장 → 좌측 ⏰ **트리거** 추가:
   - 함수: `onFormSubmit`
   - 이벤트 소스: **양식에서**
   - 이벤트 유형: **양식 제출 시**
5. Google 권한 승인 → 끝
6. 테스트: 폼 1회 제출 → GitHub Actions 탭에서 실행 확인

### 단계 7: 아이폰 홈 화면 추가
1. 아이폰 Safari에서 폼 URL 열기 (forms.gle 단축 URL 권장)
2. 하단 **공유 버튼** → "홈 화면에 추가" → 아이콘 이름 입력
3. 매일 이 아이콘 탭 1회로 입력 완료

---

## 7. 보안 주의사항

- `apps-script-form-trigger.gs`에 GitHub PAT를 직접 입력하기 때문에 **이 파일은 Google Apps Script 안에만 보관**. GitHub에 올리는 파일에는 `PASTE_GITHUB_PAT_HERE` 플레이스홀더만 두어야 함.
- GitHub PAT는 **Fine-grained PAT**로 만들고, 이 저장소 + Actions 권한만 부여 (만료 6개월 이하 권장).
- `GOOGLE_SERVICE_ACCOUNT_JSON`은 GitHub Secret에만 저장. 절대 코드/커밋에 넣지 말 것.

---

## 8. 트러블슈팅

| 증상 | 원인 | 해결 |
|---|---|---|
| 폼 제출했는데 메일 안 옴 | Apps Script 트리거 미등록 또는 PAT 권한 부족 | Apps Script 트리거 확인, PAT에 Actions Read/Write 권한 추가 |
| Apps Script 로그 "HTTP 403" | PAT에 Actions 권한 없음 | Fine-grained PAT 편집 → Actions: Read and write |
| GFA 카드가 "미입력"으로 나옴 | SA가 응답 시트 못 읽음 또는 GOOGLE_SERVICE_ACCOUNT_JSON Secret 없음 | SA를 응답 시트와 공유, Secret 등록 확인 |
| Drive에 적재 안 됨 | SA가 Shared Drive 멤버 아님 또는 Drive API 비활성 | Shared Drive 멤버 추가 (콘텐츠 관리자), Google Cloud Console에서 Drive API 활성화 |
| 아이폰 폼이 "게시되지 않은 문서"로 나옴 | 폼 게시 안 됨 또는 다른 Google 계정 로그인 | 폼 우상단 게시 버튼 클릭, Safari에서 폼 소유자 계정으로 로그인 |
| 보고서 베스트셀러에 ▲▼ 안 나옴 | 첫 실행이라 비교 대상 prev 데이터 없음 | 다음 실행부터 정상 표시 |

---

## 9. 변경 이력

### v2.0 (2026-05)
- ✨ GFA 광고비 통합 (Google Form → Sheets → 보고서)
- ✨ 채널별 ROAS 알림에 GFA 비례 배분 반영
- ✨ Google Drive 자동 적재 (일별 JSON + HTML 영구 보존)
- ✨ 베스트셀러 순위 변동 표시 (▲/▼/🆕 배지, 일간/주간/월간 모두)
- ✨ 카테고리/시리즈 비중% + 매출% 변화 칩
- ✨ KPI 구조 양 브랜드 완전 통일 (매출총이익/광고 후 이익 카드 제거)
- ✨ Apps Script 폼 트리거 (자동 cron 폐기, 폼 제출 시 즉시 발송)
- ✨ 09:00 KST 미입력 알림 cron (유일한 자동 cron)

### v1.x
- 네이버 커머스 API 기반 일/주/월간 보고서
- Claude 기반 AI 한 줄 요약 + 액션 플랜
- 위험/기회 신호 자동 탐지

---

## 10. 라이선스 / 문의

내부 사용 목적. 외부 공유 시 별도 협의.
