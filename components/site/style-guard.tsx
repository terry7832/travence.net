// 배포 후 남아 있던 옛 탭이 되살아나면 예전 해시 주소의 CSS 가 404 로 사라져
// 페이지가 무스타일(국기 SVG 가 화면을 채우는 등)로 보일 수 있다.
// 스타일시트 로드 실패나 무스타일 상태를 감지하면 딱 한 번 새로고침한다.
const GUARD = `(function(){try{
var K='tv-css-reload';
function healthy(){var n=document.querySelector('.nav');return !!n&&getComputedStyle(n).position==='fixed';}
function reloadOnce(){if(sessionStorage.getItem(K))return;sessionStorage.setItem(K,'1');location.reload();}
window.addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='LINK'&&t.rel==='stylesheet')reloadOnce();},true);
window.addEventListener('load',function(){if(!healthy())reloadOnce();else sessionStorage.removeItem(K);});
window.addEventListener('pageshow',function(e){if(e.persisted&&!healthy())reloadOnce();});
}catch(_){}})();`;

export function StyleGuard() {
  return <script dangerouslySetInnerHTML={{ __html: GUARD }} />;
}
