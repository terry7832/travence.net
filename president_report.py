import time, base64, bcrypt, requests, smtplib, logging, anthropic, os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta, timezone

# [설정]
PREFIX = "프레지던트"
NAVER_CLIENT_ID = os.environ.get("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.environ.get("NAVER_CLIENT_SECRET")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD")
CLAUDE_MODEL = "claude-3-5-sonnet-latest" # 404 에러 해결

RECIPIENTS = ["t7832@naver.com", "jung7832@naver.com"]
SENDER_EMAIL = "terryjung@travence.net"
KST = timezone(timedelta(hours=9))
BASE_URL = "https://api.commerce.naver.com/external"

PATHS = {
    "sales_p": "/v1/bizdata-stats/channels/{cno}/sales/product/detail",
    "mkt_all": "/v1/bizdata-stats/channels/{cno}/marketing/all/detail",
    "keyword": "/v1/bizdata-stats/channels/{cno}/marketing/search/keyword",
    "delivery": "/v1/bizdata-stats/channels/{cno}/sales/delivery/detail",
    "hourly_s": "/v1/bizdata-stats/channels/{cno}/sales/hourly/detail",
}

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

try: client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
except: client = None

def format_curr(val):
    if not val: return "0"
    if val >= 100000000: return f"{val/100000000:.1f}억"
    elif val >= 10000: return f"{val/10000:,.0f}만"
    return f"{val:,.0f}"

def get_token_and_channel():
    if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET: return None, None
    ts = str(int((time.time() - 3) * 1000))
    pwd = f"{NAVER_CLIENT_ID}_{ts}"
    hashed = bcrypt.hashpw(pwd.encode("utf-8"), NAVER_CLIENT_SECRET.encode("utf-8"))
    sign = base64.b64encode(hashed).decode("utf-8")
    try:
        res = requests.post(f"{BASE_URL}/v1/oauth2/token", data={"client_id": NAVER_CLIENT_ID, "timestamp": ts, "grant_type": "client_credentials", "client_secret_sign": sign, "type": "SELF"}, timeout=10)
        token = res.json().get("access_token")
        res = requests.get(f"{BASE_URL}/v1/seller/channels", headers={"Authorization": f"Bearer {token}"}, timeout=10)
        raw = res.json()
        channels = raw if isinstance(raw, list) else raw.get("data", raw.get("contents", []))
        for ch in channels:
            if ch.get("channelType") == "STOREFARM" and ch.get("channelNo"): return token, ch["channelNo"]
        return token, channels[0].get("channelNo") if channels else None
    except: return None, None

def collect_data(token, cno, start, end):
    data = {}
    headers = {"Authorization": f"Bearer {token}"}
    for key, path in PATHS.items():
        try:
            res = requests.get(f"{BASE_URL}{path.format(cno=cno)}", headers=headers, params={"startDate": start, "endDate": end}, timeout=15)
            if res.status_code == 200: data[key] = res.json()
        except: pass
    return data

def analyze_data(data):
    stats = {"total_revenue": 0, "total_purchases": 0, "total_refund": 0, "total_cost": 0, "keywords": [], "hourly_sales": [], "delivery": {}, "products": [], "channels": [], "devices": {}}
    sales_list = data.get('sales_p', {}).get('productUnitReport', []) or []
    stats["products"] = sorted(sales_list, key=lambda x: x.get('payAmount', 0), reverse=True)
    stats["total_revenue"] = sum(p.get('payAmount', 0) for p in sales_list)
    stats["total_purchases"] = sum(p.get('numPurchases', 0) for p in sales_list)
    mkt_rows = data.get('mkt_all', {}).get('rows', []) or []
    stats["total_cost"] = sum(ch.get("cost", 0) for ch in mkt_rows)
    channel_map = {}
    for ch in mkt_rows:
        name = ch.get('channelName', '기타')
        if name not in channel_map: channel_map[name] = {'name': name, 'cost': 0, 'interactions': 0, 'purchases': 0, 'revenue': 0}
        channel_map[name]['cost'] += ch.get('cost', 0)
        channel_map[name]['purchases'] += ch.get('numPurchases', 0)
        channel_map[name]['revenue'] += ch.get('payAmount', 0)
    stats["channels"] = sorted(channel_map.values(), key=lambda x: x.get('revenue', 0), reverse=True)
    stats["keywords"] = sorted(data.get('keyword', {}).get('rows', []) or [], key=lambda x: x.get('payAmount', 0), reverse=True)
    return stats

def get_ai_analysis(curr, prev, r_type):
    if not client: return {"insight": "AI 분석 불가", "cleaned_names": [], "alerts": []}
    prompt = f"당신은 {PREFIX} 수석 컨설턴트입니다. {r_type} 매출 실적 분석. 현재매출: {format_curr(curr['total_revenue'])}. 인사이트 3줄, 상품명정리 5개, 한줄평(이모지) 형식으로 작성하세요."
    try:
        response = client.messages.create(model=CLAUDE_MODEL, max_tokens=1000, messages=[{"role": "user", "content": prompt}])
        text = response.content[0].text
        # 파싱 로직 간소화
        res = {"insight": text, "cleaned_names": [p.get('productName', '')[:20] for p in curr['products'][:5]], "alerts": [f"{r_type} 리포트 완료"]}
        return res
    except: return {"insight": "AI 분석 에러", "cleaned_names": [], "alerts": []}

def get_page1_html(stats, prev_stats, ai_res, start, end, r_type):
    net_rev = stats["total_revenue"] - stats["total_refund"]
    roas = (net_rev / stats["total_cost"] * 100) if stats["total_cost"] > 0 else 0
    html = f"""<html><body style="padding:20px; font-family:sans-serif; background:#f4f4f4;"><div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:10px;">
    <h2 style="color:#333;">📊 {PREFIX} {r_type} 성적표</h2><p>{start} ~ {end}</p>
    <div style="background:#eef; padding:15px; border-radius:5px;"><strong>🤖 AI 분석</strong><br>{ai_res['insight']}</div>
    <table style="width:100%; margin-top:20px;"><tr><td>매출</td><td><b>{format_curr(stats['total_revenue'])}</b></td></tr><tr><td>ROAS</td><td><b>{roas:.0f}%</b></td></tr></table>
    </div></body></html>"""
    return html

def send_email_multi(subject, html):
    if not GMAIL_APP_PASSWORD: return False
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = SENDER_EMAIL
        msg['To'] = ", ".join(RECIPIENTS)
        msg.attach(MIMEText(html, 'html'))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, GMAIL_APP_PASSWORD)
            server.sendmail(SENDER_EMAIL, RECIPIENTS, msg.as_string())
        return True
    except: return False

def run_report_logic(token, cno, start, end, r_type):
    curr = analyze_data(collect_data(token, cno, start, end))
    prev = analyze_data(collect_data(token, cno, start, end)) # 비교용 (간소화)
    ai_res = get_ai_analysis(curr, prev, r_type)
    html = get_page1_html(curr, prev, ai_res, start, end, r_type)
    send_email_multi(f"📊 [{PREFIX}] {r_type} 리포트 ({start})", html)

def main():
    token, cno = get_token_and_channel()
    if not token or not cno: return
    today = datetime.now(KST).date()
    yest = (today - timedelta(days=1)).strftime("%Y-%m-%d")
    run_report_logic(token, cno, yest, yest, "일간")

if __name__ == "__main__": main()
