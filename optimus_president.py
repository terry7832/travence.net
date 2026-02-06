import time, base64, bcrypt, requests, gspread, os, json, logging
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime, timedelta, timezone

# ==========================================
# [설정] 프레지던트 Optimus
# ==========================================
PREFIX = "프레지던트"
# ★ Secrets에서 프레지던트 전용 키 가져오기
NAVER_CLIENT_ID = os.environ.get("OP_ID_PRESIDENT")
NAVER_CLIENT_SECRET = os.environ.get("OP_PW_PRESIDENT")
SPREADSHEET_ID = os.environ.get("SHEET_ID_PRESIDENT")

REVIEW_SHEET_NAME = "프레지던트네이버리뷰" # 시트 이름 확인 필요
REVIEW_ORDER_ID_COL = 22
REVIEW_TYPE_COL = 2
REVIEW_PHOTO_COL = 4
TARGET_COL_INDEX = 26
TARGET_HEADER_NAME = "리뷰유형"

TAB_NAME_COST = f"{PREFIX}_상품원가"
TAB_NAME_DISPATCH = f"{PREFIX}_배송준비"
TAB_NAME_STATS = "통계시트_정산기반"
TAB_NAME_NDELIVERY_MASTER = f"{PREFIX}_N배송마스터"

KST = timezone(timedelta(hours=9))
DAYS_RANGE_ARCHIVE = 90

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s', handlers=[logging.StreamHandler()])
logger = logging.getLogger(__name__)

# ... (아래부터는 위 팩세이프 코드의 '1. 인증' ~ 'main'까지 복사해서 붙여넣으시면 됩니다. 로직은 100% 동일합니다) ...
# (편의를 위해 아래에 전체 코드를 다시 적어드립니다.)

def get_naver_token():
    try:
        if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET: return None
        ts = str(int((time.time() - 3) * 1000))
        pwd = f"{NAVER_CLIENT_ID}_{ts}"
        hashed = bcrypt.hashpw(pwd.encode("utf-8"), NAVER_CLIENT_SECRET.encode("utf-8"))
        sign = base64.b64encode(hashed).decode("utf-8")
        res = requests.post("https://api.commerce.naver.com/external/v1/oauth2/token", data={"client_id": NAVER_CLIENT_ID, "timestamp": ts, "grant_type": "client_credentials", "client_secret_sign": sign, "type": "SELF"})
        return res.json().get("access_token") if res.status_code == 200 else None
    except: return None

def get_or_create_worksheet(tab_name):
    try:
        scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
        gcp_key = os.environ.get("GCP_SA_KEY")
        if not gcp_key: return None
        creds = ServiceAccountCredentials.from_json_keyfile_dict(json.loads(gcp_key), scope)
        gc = gspread.authorize(creds)
        sh = gc.open_by_key(SPREADSHEET_ID)
        try: return sh.worksheet(tab_name)
        except: return sh.add_worksheet(title=tab_name, rows="200", cols="20")
    except: return None

def clean_id(val): return str(val).strip().replace("'","").replace('"','').replace("\n","")
def fmt(n): return f"{int(n):,}" if n else "0"
def get_safe_product_id(p): return str(p.get("productId") or p.get("productClassId") or p.get("productOrderId") or "")

def translate_status(code):
    m = {"PAYMENT_WAITING":"입금대기", "PAYED":"결제완료", "PRODUCT_PREPARATION":"배송준비", "DISPATCHED":"발송처리", "DELIVERY":"배송중", "DELIVERED":"배송완료", "PURCHASE_DECIDED":"구매확정", "CANCEL":"취소", "CANCELED":"취소완료", "RETURN":"반품", "RETURNED":"반품완료", "EXCHANGE":"교환", "EXCHANGED":"교환완료", "RETURN_REQUEST":"반품요청", "COLLECTING":"수거중", "COLLECT_DONE":"수거완료", "EXCHANGE_REQUEST":"교환요청"}
    return m.get(str(code).upper(), str(code))

def fetch_orders(token):
    headers = {"Authorization": f"Bearer {token}"}
    ids = set()
    final = []
    for i in range(DAYS_RANGE_ARCHIVE, -1, -1):
        try:
            dt = (datetime.now(KST) - timedelta(days=i)).astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
            r = requests.get("https://api.commerce.naver.com/external/v1/pay-order/seller/product-orders/last-changed-statuses", headers=headers, params={"lastChangedFrom": dt})
            if r.status_code == 200:
                for x in r.json().get("data",{}).get("lastChangeStatuses",[]):
                    if x.get("productOrderId"): ids.add(x["productOrderId"])
            time.sleep(0.05)
        except: pass
    
    id_list = list(ids)
    for i in range(0, len(id_list), 50):
        try:
            r = requests.post("https://api.commerce.naver.com/external/v1/pay-order/seller/product-orders/query", headers=headers, json={"productOrderIds": id_list[i:i+50]})
            if r.status_code == 200:
                d = r.json().get("data", [])
                final.extend(d if isinstance(d, list) else d.get("contents", []))
        except: pass
    return final

def process_logic(token):
    orders = fetch_orders(token)
    logger.info(f"📥 수집된 주문: {len(orders)}건")
    
    review_db = {}
    ws_rev = get_or_create_worksheet(REVIEW_SHEET_NAME)
    if ws_rev:
        try:
            rows = ws_rev.get_all_values()
            for r in rows[1:]:
                if len(r) > max(REVIEW_ORDER_ID_COL, REVIEW_PHOTO_COL):
                    oid = clean_id(r[REVIEW_ORDER_ID_COL])
                    if oid:
                        rtype = "포토" if r[REVIEW_PHOTO_COL] not in ["-","없음",""] else "텍스트"
                        lbl = f"{'한달' if '한달' in r[REVIEW_TYPE_COL] else '일반'}{rtype}"
                        review_db.setdefault(oid, set()).add(lbl)
        except: pass

    ws_disp = get_or_create_worksheet(TAB_NAME_DISPATCH)
    if ws_disp:
        disp_rows = [["상품주문번호","택배사","송장번호","상태","상품명","수취인"]]
        for item in orders:
            p = item.get("productOrder", {})
            if p.get("productOrderStatus")=="PAYED" and p.get("placeOrderStatus") in ["NOT_YET","OK"]:
                disp_rows.append([f"'{p.get('productOrderId')}", "", "", "결제완료", p.get("productName"), p.get("shippingAddress",{}).get("name")])
        ws_disp.clear()
        ws_disp.update(range_name="A1", values=disp_rows, value_input_option="USER_ENTERED")

    by_month = {}
    for item in orders:
        ym = item.get("order", {}).get("paymentDate", "")[:7]
        if ym: by_month.setdefault(ym, []).append(item)
    
    HEADERS = ["주문번호", "상품주문번호", "상품번호", "옵션ID", "상태", "클레임", "결제일", "상품명", "옵션", "수량", "금액", "수취인", "택배사", "송장", "리뷰"]
    
    for m, items in by_month.items():
        ws = get_or_create_worksheet(f"{PREFIX}_{m}")
        if not ws: continue
        
        try: existing = {clean_id(r[1]): i for i, r in enumerate(ws.get_all_values()) if len(r)>1}
        except: existing = {}
        
        new_rows = []
        if not existing: new_rows.append(HEADERS)
        
        for item in items:
            p = item.get("productOrder", {})
            pid = str(p.get("productOrderId"))
            if not pid or pid in existing: continue
            
            r_txt = " + ".join(review_db.get(pid, []))
            row = [
                item.get("order",{}).get("orderId"), pid, p.get("productId"), f"'{p.get('optionCode')}",
                translate_status(p.get("productOrderStatus")), translate_status(p.get("claimType")),
                item.get("order",{}).get("paymentDate","")[:10], p.get("productName"), p.get("productOption"),
                p.get("quantity"), p.get("totalPaymentAmount"), p.get("shippingAddress",{}).get("name"),
                item.get("delivery",{}).get("deliveryCompany"), item.get("delivery",{}).get("trackingNumber"),
                r_txt
            ]
            new_rows.append([str(x) if x else "" for x in row])
            
        if new_rows:
            ws.append_rows(new_rows, value_input_option="USER_ENTERED")
            logger.info(f"💾 {m}월 신규 데이터: {len(new_rows)}건")

if __name__ == "__main__":
    logger.info(f"🤖 Optimus Start: {PREFIX}")
    token = get_naver_token()
    if token: process_logic(token)
    else: logger.error("❌ 토큰 발급 실패")
