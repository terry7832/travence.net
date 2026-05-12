/**
 * Google Form 제출 시 GitHub Action을 즉시 트리거.
 *
 * 동작:
 *   - 항상 daily 보고서 트리거
 *   - KST 기준 월요일이면 weekly 추가 트리거
 *   - KST 기준 매월 1일이면 monthly 추가 트리거
 *   - 1일이 월요일이면 daily + weekly + monthly 3개 모두 트리거
 *
 * 설정 방법:
 *   1. Google Form 편집 화면 → 더보기(⋮) → 스크립트 편집기
 *   2. 이 파일 내용 전체 복사 → 붙여넣기 (기본 코드 다 지우고)
 *   3. GITHUB_TOKEN 자리에 본인 PAT 붙여넣기
 *   4. 저장
 *   5. 좌측 ⏰ "트리거" → "+ 트리거 추가":
 *      - 함수: onFormSubmit
 *      - 이벤트 소스: 양식에서
 *      - 이벤트 유형: 양식 제출 시
 *      - 저장 → Google 권한 승인
 *   6. 폼 제출해서 테스트 → GitHub Actions 탭에서 실행 확인
 */

const GITHUB_TOKEN = 'PASTE_GITHUB_PAT_HERE';  // github_pat_... 또는 ghp_...
const OWNER = 'terry7832';                       // GitHub username
const REPO = 'travence.net';                     // repo name
const WORKFLOW = 'daily_report.yml';
const BRANCH = 'main';

function onFormSubmit(e) {
  const triggered = [];

  // 항상 daily
  if (triggerWorkflow_('daily')) triggered.push('daily');

  // KST 현재 시각 (UTC + 9)
  const now = new Date();
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const kstDay = kstNow.getUTCDay();    // 0=일, 1=월, 2=화, ...
  const kstDate = kstNow.getUTCDate();  // 1~31

  // 월요일이면 weekly 추가
  if (kstDay === 1) {
    if (triggerWorkflow_('weekly')) triggered.push('weekly');
  }
  // 매월 1일이면 monthly 추가
  if (kstDate === 1) {
    if (triggerWorkflow_('monthly')) triggered.push('monthly');
  }

  Logger.log(`KST: ${kstNow.toISOString()} (요일=${kstDay}, 날짜=${kstDate}) → 트리거: ${triggered.join(', ')}`);
}

function triggerWorkflow_(mode) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`;

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    payload: JSON.stringify({
      ref: BRANCH,
      inputs: { mode: mode },
    }),
    muteHttpExceptions: true,
  });

  const code = response.getResponseCode();
  Logger.log(`${mode}: HTTP ${code}`);
  if (code === 204) return true;
  Logger.log(`  body: ${response.getContentText()}`);
  return false;
}

// 수동 테스트용 — Apps Script 편집기에서 직접 실행
function testTrigger() {
  onFormSubmit({});
}
