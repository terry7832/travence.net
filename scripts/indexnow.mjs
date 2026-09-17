// IndexNow 재수집 요청 — 네이버·Bing 등 참여 엔진에 URL 변경을 즉시 알린다.
// 사용: node scripts/indexnow.mjs [추가 URL...]   (기본: 홈, /en)
// 키 파일: public/ee447ac111da42fd2f0b1bdea2b4f847.txt (사이트 루트에서 접근 가능해야 함)
const HOST = "www.travence.co.kr";
const KEY = "ee447ac111da42fd2f0b1bdea2b4f847";
const urls = [`https://${HOST}`, `https://${HOST}/en`, ...process.argv.slice(2)];

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log("IndexNow", res.status, res.statusText, "→", urls.join(", "));
if (!res.ok) { console.log(await res.text()); process.exit(1); }
