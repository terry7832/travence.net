#!/usr/bin/env python3
"""
📊 팩세이프 BIZRAW + AI 경영 비서 (Enterprise Ver.)
- 기능: 일간/주간/월간 리포트 자동 전환 발송
- 수신자: t7832@naver.com, jung7832@naver.com
"""

import time
import base64
import bcrypt
import requests
import smtplib
import logging
import anthropic
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta, timezone

# =========================================================
# [1. 설정]
# =========================================================
PREFIX = "팩세이프"

# ★ 중요: 실제 키 값은 GitHub Secrets에 등록되어 있어야 합니다.
NAVER_CLIENT_ID = os.environ.get("NAVER_CLIENT_ID_PACSAFE")
NAVER_CLIENT_SECRET = os.environ.get("NAVER_CLIENT_SECRET_PACSAFE")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD")

CLAUDE_MODEL = "claude-3-5-sonnet-20240620"

# 다중 수신자 설정
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

try:
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
except:
    client = None

def format_curr(val):
    if not val: return "0"
    if val >= 100000000: return f"{val/100000000:.1f}억"
    elif val >= 10000: return f"{val/10000:,.0f}만"
    return f"{val:,.0f}"

# =========================================================
# [2] 데이터 수집 및 분석
# =========================================================
def get_token_and_channel():
    if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET:
        logger.error("❌ 네이버 API 키가 설정되지 않았습니다. GitHub Secrets를 확인하세요.")
        return None, None

    ts = str(int((time.time() - 3) * 1000))
    pwd = f"{NAVER_CLIENT_ID}_{ts}"
    hashed = bcrypt.hashpw(pwd.encode("utf-8"), NAVER_CLIENT_SECRET.encode("utf-8"))
    sign = base64.b64encode(hashed).decode("utf-8")
    
    try:
        res = requests.post(f"{BASE_URL}/v1/oauth2/token", data={
            "client_id": NAVER_CLIENT_ID, "timestamp": ts,
            "grant_type": "client_credentials", "client_secret_sign": sign, "type": "SELF"
        }, timeout=10)
        token = res.json().get("access_token")
        
        res = requests.get(f"{BASE_URL}/v1/seller/channels", headers={"Authorization": f"Bearer {token}"}, timeout=10)
        raw = res.json()
        channels = raw if isinstance(raw, list) else raw.get("data", raw.get("contents", []))
        
        for ch in channels:
            if ch.get("channelType") == "STOREFARM" and ch.get("channelNo"):
                return token, ch["channelNo"]
        return token, channels[0].get("channelNo") if channels else None
    except Exception as e:
        logger.error(f"❌ 토큰 발급 실패: {e}")
        return None, None

def collect_data(token, cno, start_date, end_date):
    data = {}
    headers = {"Authorization": f"Bearer {token}"}
    for key, path in PATHS.items():
        try:
            res = requests.get(f"{BASE_URL}{path.format(cno=cno)}", headers=headers, 
                             params={"startDate": start_date, "endDate": end_date}, timeout=15)
            if res.status_code == 200: data[key] = res.json()
        except: pass
    return data

def analyze_data(data):
    stats = {
        "total_revenue": 0, "total_purchases": 0, "total_refund": 0, "total_cost": 0,
        "keywords": [], "hourly_sales": [], "delivery": {}, "products": [],
        "channels": [], "devices": {}
    }
    
    sales_list = data.get('sales_p', {}).get('productUnitReport', []) or []
    stats["products"] = sorted(sales_list, key=lambda x: x.get('payAmount', 0), reverse=True)
    stats["total_revenue"] = sum(p.get('payAmount', 0) for p in sales_list)
    stats["total_purchases"] = sum(p.get('numPurchases', 0) for p in sales_list)
    
    mkt_rows = data.get('mkt_all', {}).get('rows', []) or []
    stats["total_cost"] = sum(ch.get("cost", 0) for ch in mkt_rows)
    
    channel_map = {}
    for ch in mkt_rows:
        name = ch.get('channelName', '기타')
        device = ch.get('deviceCategory', '기타')
        
        if name not in channel_map:
            channel_map[name] = {'name': name, 'cost': 0, 'interactions': 0, 'purchases': 0, 'revenue': 0}
        channel_map[name]['cost'] += ch.get('cost', 0)
        channel_map[name]['interactions'] += ch.get('numInteractions', 0)
        channel_map[name]['purchases'] += ch.get('numPurchases', 0)
        channel_map[name]['revenue'] += ch.get('payAmount', 0)
        
        if device not in stats["devices"]:
            stats["devices"][device] = {"interactions": 0, "purchases": 0, "payAmount": 0}
        stats["devices"][device]["interactions"] += ch.get("numInteractions", 0)
        stats["devices"][device]["purchases"] += ch.get("numPurchases", 0)
        stats["devices"][device]["payAmount"] += ch.get("payAmount", 0)
    
    for ch in channel_map.values():
        ch['cvr'] = (ch['purchases'] / ch['interactions'] * 100) if ch['interactions'] > 0 else 0
    stats["channels"] = sorted(channel_map.values(), key=lambda x: x.get('revenue', 0), reverse=True)
        
    kw_rows = data.get('keyword', {}).get('rows', []) or []
    for kw in kw_rows:
        inter = kw.get('numInteractions', 0)
        kw['cvr'] = (kw.get('numPurchases', 0) / inter * 100) if inter > 0 else 0
    stats["keywords"] = sorted(kw_rows, key=lambda x: x.get('numInteractions', 0), reverse=True)
    
    hourly_raw = data.get('hourly_s', {}).get('rows', []) or []
    stats["total_refund"] = sum(h.get('refundPayAmount', 0) for h in hourly_raw)
    
    hour_map = {}
    for h in hourly_raw:
        h_key = int(h.get('hour', 0))
        if h_key not in hour_map: hour_map[h_key] = {'payAmount': 0, 'purchases': 0}
        hour_map[h_key]['payAmount'] += h.get('payAmount', 0)
        hour_map[h_key]['purchases'] += h.get('numPurchases', 0)
    
    stats["hourly_sales"] = sorted([
        {"hour": f"{h:02d}", "payAmount": d['payAmount'], "purchases": d['purchases']} 
        for h, d in hour_map.items()
    ], key=lambda x: x['payAmount'], reverse=True)
    
    del_rows = data.get('delivery', {}).get('deliveryReport', []) or []
    for d in del_rows:
        dtype = d.get('deliveryType', '기타')
        if dtype not in stats["delivery"]: 
            stats["delivery"][dtype] = {"purchases": 0, "completed": 0}
        stats["delivery"][dtype]["purchases"] += d.get("numPurchases", 0)
        stats["delivery"][dtype]["completed"] += d.get("deliveryCompletedCount", 0)
        
    return stats

# =========================================================
# [3] AI 분석
# =========================================================
def get_ai_analysis(curr, prev, report_type):
    if not client: 
        return {
            "insight": "AI 분석을 사용할 수 없습니다.",
            "cleaned_names": [p.get('productName', '')[:50] for p in curr['products'][:5]],
            "alerts": []
        }
    
    roas = (curr['total_revenue'] / curr['total_cost'] * 100) if curr['total_cost'] > 0 else 0
    prev_roas = (prev['total_revenue'] / prev['total_cost'] * 100) if prev['total_cost'] > 0 else 0
    revenue_change = ((curr['total_revenue'] - prev['total_revenue']) / prev['total_revenue'] * 100) if prev['total_revenue'] > 0 else 0
    
    prompt = f"""
    당신은 '{PREFIX}' 브랜드의 수석 경영 컨설턴트입니다. 
    지금 '{report_type}' 데이터를 분석하고 있습니다.

    [실적 데이터]
    - 매출: {format_curr(curr['total_revenue'])} (직전 기간 대비 {revenue_change:+.1f}%)
    - 광고비: {format_curr(curr['total_cost'])} (ROAS {roas:.0f}% / 직전 {prev_roas:.0f}%)
    - 베스트 상품: {[p.get('productName', '') for p in curr['products'][:5]]}

    [요구사항]
    1. ROAS와 매출 추이를 보고 현재가 확장기인지 효율화기인지 진단하세요.
    2. {report_type} 단위에서의 특이사항(요일별 패턴, 월초/월말 효과 등)을 언급하세요.
    3. 다음 기간을 위한 구체적인 액션 플랜 1가지를 제안하세요.

    [출력 포맷]
    [인사이트]
    - (핵심 내용 1)
    - (핵심 내용 2)
    - (액션 플랜)
    [상품명_정리]
    1. (깔끔한 상품명)
    ...
    [한줄요약]
    (이모지) (한줄 평)
    """
    
    try:
        response = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        text = response.content[0].text
        result = {"insight": "", "cleaned_names": [], "alerts": []}
        
        lines = text.split('\n')
        section = None
        for line in lines:
            line = line.strip()
            if '[인사이트]' in line: section = 'insight'
            elif '[상품명_정리]' in line: section = 'names'
            elif '[한줄요약]' in line: section = 'summary'
            elif line and section == 'insight':
                if line.startswith('-'): result["insight"] += line + "<br>"
            elif line and section == 'names':
                if line and line[0].isdigit():
                    clean = line.split('.', 1)[1].strip() if '.' in line else line
                    result["cleaned_names"].append(clean)
            elif line and section == 'summary':
                if line and not line.startswith('['): result["alerts"].append(line)
        
        if not result["cleaned_names"]:
            result["cleaned_names"] = [p.get('productName', '')[:20] for p in curr['products'][:5]]
        return result
    except Exception as e:
        return {"insight": f"분석 오류: {e}", "cleaned_names": [], "alerts": []}

# =========================================================
# [4] HTML 생성
# =========================================================
def get_delta_html(curr, prev, is_percent=False, inverse=False):
    if prev == 0: return "<span style='color:#94a3b8; font-size:12px;'>-</span>"
    diff = curr - prev
    if is_percent: val = diff; txt = f"{val:+.1f}%p"; is_up = val > 0
    else: val = (diff / prev) * 100; txt = f"{val:+.1f}%"; is_up = val > 0
    
    if inverse: 
        bg_color = "#fef2f2" if is_up else "#f0fdf4"
        text_color = "#ef4444" if is_up else "#10b981"
        icon = "▲" if is_up else "▼"
    else: 
        bg_color = "#f0fdf4" if is_up else "#fef2f2"
        text_color = "#10b981" if is_up else "#ef4444"
        icon = "▲" if is_up else "▼"
    return f"<span style='display:inline-block; background-color:{bg_color}; color:{text_color}; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:bold; margin-left:5px;'>{icon} {txt}</span>"

def get_page1_html(stats, prev_stats, ai_result, start, end, report_type):
    net_rev = stats["total_revenue"] - stats["total_refund"]
    roas = (net_rev / stats["total_cost"] * 100) if stats["total_cost"] > 0 else 0
    prev_net_rev = prev_stats["total_revenue"] - prev_stats["total_refund"]
    prev_roas = (prev_net_rev / prev_stats["total_cost"] * 100) if prev_stats["total_cost"] > 0 else 0
    
    html = f"""
    <html><head><style>@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css'); body{{font-family:'Pretendard',sans-serif;}}</style></head>
    <body style="background-color:#f1f5f9; margin:0; padding:20px;">
    <div style="max-width:700px; margin:0 auto; background-color:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="background-color:#1e293b; padding:30px;">
            <div style="color:#94a3b8; font-size:12px; font-weight:600; letter-spacing:1px; margin-bottom:5px;">{report_type} Executive Summary</div>
            <h1 style="color:white; margin:0; font-size:24px; font-weight:700;">{PREFIX} {report_type} 성적표</h1>
            <div style="color:#cbd5e1; font-size:13px; margin-top:5px;">📅 {start} ~ {end}</div>
        </div>
        <div style="padding:30px;">
            <div style="background-color:#f8fafc; border-left:4px solid #3b82f6; padding:20px; margin-bottom:30px;">
                <div style="margin-bottom:15px;"><strong>🤖 AI 인사이트</strong></div>
                <div style="font-size:14px; line-height:1.8; color:#475569;">{ai_result['insight']}</div>
                {'<div style="margin-top:15px; padding:10px; background:#eff6ff; color:#1e40af; font-weight:bold; border-radius:6px;">' + ai_result['alerts'][0] + '</div>' if ai_result['alerts'] else ''}
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:30px;">
                <div style="border:1px solid #e2e8f0; padding:20px; border-radius:8px;">
                    <div style="font-size:12px; color:#64748b;">총 매출액</div>
                    <div style="font-size:26px; font-weight:800; margin:8px 0;">{format_curr(stats['total_revenue'])}</div>
                    <div>{get_delta_html(stats['total_revenue'], prev_stats['total_revenue'])}</div>
                </div>
                <div style="border:1px solid #e2e8f0; padding:20px; border-radius:8px;">
                    <div style="font-size:12px; color:#64748b;">ROAS</div>
                    <div style="font-size:26px; font-weight:800; margin:8px 0;">{roas:.0f}%</div>
                    <div>{get_delta_html(roas, prev_roas, is_percent=True)}</div>
                </div>
            </div>
            
            <table style="width:100%; font-size:14px; border-collapse:collapse; margin-bottom:30px;">
                <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 0;">광고비</td><td style="text-align:right; font-weight:bold;">{format_curr(stats['total_cost'])}</td><td style="text-align:right;">{get_delta_html(stats['total_cost'], prev_stats['total_cost'], inverse=True)}</td></tr>
                <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 0;">순매출</td><td style="text-align:right; font-weight:bold;">{format_curr(net_rev)}</td><td style="text-align:right;">{get_delta_html(net_rev, prev_net_rev)}</td></tr>
                <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 0;">판매량</td><td style="text-align:right; font-weight:bold;">{stats['total_purchases']}건</td><td style="text-align:right;">{get_delta_html(stats['total_purchases'], prev_stats['total_purchases'])}</td></tr>
            </table>
            
            <h3 style="font-size:16px; border-left:4px solid #ef4444; padding-left:10px;">🏆 베스트셀러 TOP 5</h3>
            <table style="width:100%; font-size:13px; border-collapse:collapse;">
    """
    for i, p in enumerate(stats["products"][:5]):
        pname = ai_result['cleaned_names'][i] if i < len(ai_result['cleaned_names']) else p.get('productName', '')[:50]
        html += f"<tr style='border-bottom:1px solid #f1f5f9;'><td style='padding:10px; color:#ef4444; font-weight:bold;'>{i+1}</td><td style='padding:10px;'>{pname}</td><td style='text-align:right; font-weight:bold;'>{format_curr(p.get('payAmount',0))}</td></tr>"
    html += "</table><div style='text-align:center; margin-top:30px; font-size:11px; color:#94a3b8;'>Generated by BIZRAW AI</div></div></div></body></html>"
    return html

def get_page2_html(stats, start, end):
    html = f"""
    <html><head><style>body{{font-family:-apple-system,sans-serif;}}</style></head>
    <body style="background-color:#f1f5f9; margin:0; padding:20px;">
    <div style="max-width:700px; margin:0 auto; background-color:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="background-color:#334155; padding:25px;"><h1 style="color:white; margin:0; font-size:22px;">📈 상세 분석 리포트</h1></div>
        <div style="padding:30px;">
            <h3 style="margin-bottom:15px;">01 채널별 성과</h3>
            <table style="width:100%; font-size:13px; border-collapse:collapse; margin-bottom:40px;">
                <thead><tr style="border-bottom:2px solid #e2e8f0; color:#64748b;"><th style="text-align:left; padding:10px;">채널</th><th style="text-align:right;">클릭/조회</th><th style="text-align:right;">CVR</th><th style="text-align:right;">매출</th></tr></thead>
                <tbody>
    """
    for ch in stats["channels"][:10]:
        cvr_color = "#10b981" if ch.get('cvr', 0) >= 3 else "#64748b"
        html += f"<tr style='border-bottom:1px solid #f1f5f9;'><td style='padding:10px;'>{ch['name']}</td><td style='text-align:right;'>{ch['interactions']:,}</td><td style='text-align:right; color:{cvr_color}; font-weight:bold;'>{ch['cvr']:.1f}%</td><td style='text-align:right; font-weight:bold;'>{format_curr(ch['revenue'])}</td></tr>"
    
    html += """</tbody></table><h3 style="margin-bottom:15px;">02 검색 키워드 TOP 10</h3><table style="width:100%; font-size:13px; border-collapse:collapse;"><thead><tr style="border-bottom:2px solid #e2e8f0; color:#64748b;"><th style="text-align:left; padding:10px;">키워드</th><th style="text-align:right;">조회수</th><th style="text-align:right;">매출</th></tr></thead><tbody>"""
    
    for kw in stats["keywords"][:10]:
        html += f"<tr style='border-bottom:1px solid #f1f5f9;'><td style='padding:10px;'>{kw['refKeyword']}</td><td style='text-align:right;'>{kw['numInteractions']:,}</td><td style='text-align:right; font-weight:bold;'>{format_curr(kw['payAmount'])}</td></tr>"
        
    html += "</tbody></table></div></div></body></html>"
    return html

# =========================================================
# [5] 메인 실행 (멀티 수신자 + 기간 자동화)
# =========================================================
def send_email_multi(subject, html_pages):
    if not GMAIL_APP_PASSWORD:
        logger.error("❌ 이메일 앱 비밀번호가 없습니다. Secrets 설정을 확인하세요.")
        return False
        
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = SENDER_EMAIL
        msg['To'] = ", ".join(RECIPIENTS)
        combined_html = html_pages[0] + '<br><br><div style="page-break-after:always;"></div>' + html_pages[1]
        msg.attach(MIMEText(combined_html, 'html'))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, GMAIL_APP_PASSWORD)
            server.sendmail(SENDER_EMAIL, RECIPIENTS, msg.as_string())
        return True
    except Exception as e:
        logger.error(f"❌ 발송 실패: {e}")
        return False

def run_report_logic(token, cno, start, end, report_type):
    logger.info(f"🔄 {report_type} 리포트 생성 중... ({start} ~ {end})")
    
    data_curr = collect_data(token, cno, start, end)
    stats_curr = analyze_data(data_curr)
    
    # 비교 기간 계산 (전주/전월 등)
    days = (datetime.strptime(end, "%Y-%m-%d") - datetime.strptime(start, "%Y-%m-%d")).days + 1
    p_end = (datetime.strptime(start, "%Y-%m-%d") - timedelta(days=1)).strftime("%Y-%m-%d")
    p_start = (datetime.strptime(start, "%Y-%m-%d") - timedelta(days=days)).strftime("%Y-%m-%d")
    
    data_prev = collect_data(token, cno, p_start, p_end)
    stats_prev = analyze_data(data_prev)
    
    ai_result = get_ai_analysis(stats_curr, stats_prev, report_type)
    
    page1 = get_page1_html(stats_curr, stats_prev, ai_result, start, end, report_type)
    page2 = get_page2_html(stats_curr, start, end)
    
    subject = f"📊 [{PREFIX}] {report_type} 경영 리포트 ({start} ~ {end})"
    
    if send_email_multi(subject, [page1, page2]):
        logger.info(f"✅ {report_type} 발송 성공!")

def main():
    token, cno = get_token_and_channel()
    if not token or not cno: 
        logger.error("❌ 토큰 발급에 실패하여 종료합니다.")
        return
    
    today = datetime.now(KST).date()
    
    # 1. 일간 (매일 실행) - 어제 데이터
    yesterday = (today - timedelta(days=1)).strftime("%Y-%m-%d")
    run_report_logic(token, cno, yesterday, yesterday, "일간")
    
    # 2. 주간 (매주 월요일 실행) - 지난주 월~일
    if today.weekday() == 0:
        start_week = (today - timedelta(days=7)).strftime("%Y-%m-%d")
        end_week = (today - timedelta(days=1)).strftime("%Y-%m-%d")
        run_report_logic(token, cno, start_week, end_week, "주간")
        
    # 3. 월간 (매월 1일 실행) - 지난달 1일~말일
    if today.day == 1:
        last_day_prev_month = today.replace(day=1) - timedelta(days=1)
        first_day_prev_month = last_day_prev_month.replace(day=1)
        run_report_logic(token, cno, first_day_prev_month.strftime("%Y-%m-%d"), last_day_prev_month.strftime("%Y-%m-%d"), "월간")

if __name__ == "__main__":
    main()
