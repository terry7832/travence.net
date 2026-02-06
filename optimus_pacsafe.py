import os
import json
import time
import base64
import bcrypt
import requests
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime, timedelta, timezone
import logging

# ==========================================
# [설정] Optimus Daily + Review Analysis + Statistics + N배송현황
# ==========================================
NAVER_CLIENT_ID = os.environ.get("OP_ID_PACSAFE")
NAVER_CLIENT_SECRET = os.environ.get("OP_PW_PACSAFE")
SPREADSHEET_ID = os.environ.get("SHEET_ID_PACSAFE")

PREFIX = "팩세이프"
# GCP_SA_KEY 환경변수에서 JSON 로드
KST = timezone(timedelta(hours=9))

DAYS_RANGE_ARCHIVE = 90

# 🆕 리뷰 분석 설정
REVIEW_SHEET_NAME = "팩세이프네이버리뷰"
REVIEW_ORDER_ID_COL = 22  # W열
REVIEW_TYPE_COL = 2       # C열
REVIEW_PHOTO_COL = 4      # E열
TARGET_COL_INDEX = 26     # AA열: 리뷰유형 결과
TARGET_HEADER_NAME = "리뷰유형"

TAB_NAME_COST = f"{PREFIX}_상품원가"
TAB_NAME_DISPATCH = f"{PREFIX}_배송준비"
TAB_NAME_STATS = "통계시트_정산기반"
TAB_NAME_NDELIVERY_MASTER = f"{PREFIX}_N배송마스터"

# 로깅
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler('optimus_daily.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

print(f"🗓️ 데이터 수집 기간: 최근 {DAYS_RANGE_ARCHIVE}일 스캔 (데일리 모드)")
print(f"🔍 리뷰정밀분석 모드: 활성화")
print(f"📊 통계자동생성 모드: 활성화")
print(f"📦 N배송현황 모드: 활성화")

# ==========================================
# 1. 인증 및 구글 시트 연결
# ==========================================
def get_naver_token():
    logger.info("🔑 [인증] 네이버 토큰 발급 중...")
    try:
        timestamp = str(int((time.time() - 3) * 1000))
        pwd = f"{NAVER_CLIENT_ID}_{timestamp}"
        hashed = bcrypt.hashpw(pwd.encode("utf-8"), NAVER_CLIENT_SECRET.encode("utf-8"))
        client_secret_sign = base64.b64encode(hashed).decode("utf-8")
        url = "https://api.commerce.naver.com/external/v1/oauth2/token"
        data = {
            "client_id": NAVER_CLIENT_ID,
            "timestamp": timestamp,
            "grant_type": "client_credentials",
            "client_secret_sign": client_secret_sign,
            "type": "SELF",
        }
        res = requests.post(url, data=data)
        if res.status_code != 200:
            logger.error("❌ 토큰 발급 실패")
            return None
        logger.info("   ✅ 토큰 발급 성공")
        return res.json().get("access_token")
    except Exception as e:
        logger.error(f"❌ 토큰 발급 오류: {e}")
        return None


def get_or_create_worksheet(tab_name):
    try:
        scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
        creds = ServiceAccountCredentials.from_json_keyfile_dict(json.loads(os.environ.get("GCP_SA_KEY")), scope)
        gc = gspread.authorize(creds)
        sh = gc.open_by_key(SPREADSHEET_ID)
        try:
            return sh.worksheet(tab_name)
        except:
            logger.info(f"   🆕 신규 시트 생성: {tab_name}")
            return sh.add_worksheet(title=tab_name, rows="200", cols="20")
    except Exception as e:
        logger.error(f"❌ 시트 연결 오류: {e}")
        return None


def get_safe_product_id(p):
    pid = p.get("productId") or p.get("productClassId") or p.get("productOrderId")
    return str(pid) if pid else ""


# ==========================================
# 2. 데이터 번역 및 유틸리티
# ==========================================
def translate_status(status_code):
    if not status_code:
        return ""
    code = str(status_code).upper().strip()
    mapping = {
        "PAYMENT_WAITING": "입금대기",
        "PAYED": "결제완료",
        "PAYMENT_COMPLETED": "결제완료",
        "PRODUCT_PREPARATION": "배송준비",
        "DISPATCHED": "발송처리",
        "DELIVERY": "배송중",
        "DELIVERING": "배송중",
        "DELIVERED": "배송완료",
        "DELIVERY_COMPLETED": "배송완료",
        "PURCHASE_DECIDED": "구매확정",
        "CANCEL": "취소",
        "CANCELED": "취소완료",
        "CANCEL_DONE": "취소완료",
        "ADMIN_CANCEL": "관리자직권취소",
        "ADMIN_CANCELED": "관리자직권취소",
        "RETURN": "반품",
        "RETURNED": "반품완료",
        "EXCHANGE": "교환",
        "EXCHANGED": "교환완료",
        "RETURN_REQUEST": "반품요청",
        "COLLECTING": "수거중",
        "COLLECT_DONE": "수거완료",
        "RETURN_DONE": "반품완료",
        "RETURN_REJECT": "반품거부",
        "EXCHANGE_REQUEST": "교환요청",
        "EXCHANGE_DONE": "교환완료",
        "EXCHANGE_REDELIVERING": "교환재배송",
        "HYUNDAI": "롯데택배",
    }
    return mapping.get(code, code)


def translate_courier(code):
    if not code:
        return ""
    c_code = str(code).upper().replace(" ", "").strip()
    mapping = {
        "CJGLS": "CJ대한통운",
        "KOREX": "CJ대한통운",
        "HANJIN": "한진택배",
        "POST": "우체국택배",
        "LOGEN": "로젠택배",
        "LOTTE": "롯데택배",
        "HYUNDAI": "롯데택배",
        "KDEXP": "경동택배",
        "DAESIN": "대신택배",
    }
    return mapping.get(c_code, code)


def translate_inflow_path(inflow_path, inflow_path_add=""):
    if not inflow_path:
        return ""
    
    path = str(inflow_path).strip()
    path_upper = path.upper()
    
    if path_upper in ["NULL", "UNDEFINED", "NONE", ""]:
        return ""
    
    path_add = str(inflow_path_add).strip() if inflow_path_add else ""
    if path_add.upper() in ["NULL", "UNDEFINED", "NONE", "-"]:
        path_add = ""
    
    exact_mapping = {
        "SHOPPING_SEARCH_AD": "쇼핑검색광고",
        "SEARCH_AD": "쇼핑검색광고",
        "BRAND_SEARCH": "브랜드검색광고",
        "DISPLAY_AD": "디스플레이광고",
        "GFA": "성과형디스플레이",
        "ADVBOOST": "ADVoost",
        "ADVOOST": "ADVoost",
        "NAVER_SHOPPING": "네이버쇼핑",
        "PRICE_COMPARISON": "가격비교",
        "CATALOG": "카탈로그",
        "NAVER_SEARCH": "네이버검색",
        "NAVER_SERVICE": "네이버서비스",
        "SMARTSTORE": "스마트스토어",
        "STORE_HOME": "스토어홈",
        "STORE_SEARCH": "스토어검색",
        "NPLUS_STORE": "N+스토어앱",
        "DIRECT": "직접유입",
        "EXTERNAL": "외부유입",
        "SNS": "SNS",
        "KAKAO": "카카오",
        "INSTAGRAM": "인스타그램",
    }
    
    if path_upper in exact_mapping:
        result = exact_mapping[path_upper]
        if path_add:
            return f"{result}({path_add})"
        return result
    
    for key in sorted(exact_mapping.keys(), key=len, reverse=True):
        if key in path_upper:
            result = exact_mapping[key]
            if path_add:
                return f"{result}({path_add})"
            return result
    
    if path_add:
        return f"{path}({path_add})"
    return path


def get_tracking_url(courier, tracking_no):
    if not courier or not tracking_no:
        return ""
    clean_no = str(tracking_no).replace("-", "").strip()
    if "CJ" in courier:
        return f"https://trace.cjlogistics.com/next/tracking.html?wblNo={clean_no}"
    elif "한진" in courier:
        return f"https://www.hanjin.com/kor/CMS/DeliveryMgr/WaybillResult.do?mCode=MN038&wblnum={clean_no}&schLang=KR&wblnumText="
    elif "우체국" in courier:
        return f"https://service.epost.go.kr/trace.RetrieveDomRgiTraceList.comm?sid1={clean_no}"
    elif "로젠" in courier:
        return f"https://www.ilogen.com/web/personal/trace/{clean_no}"
    elif "롯데" in courier:
        return f"https://www.lotteglogis.com/home/reservation/tracking/linkView?InvNo={clean_no}"
    return f"https://search.naver.com/search.naver?query={courier}+{clean_no}"


def fmt(n):
    try:
        return f"{int(n):,}" if n else "0"
    except:
        return "0"


# ==========================================
# 3. 리뷰 정밀 분석 함수
# ==========================================
def clean_order_id(order_id):
    if not order_id:
        return ""
    cleaned = (
        str(order_id)
        .strip()
        .replace("'", "")
        .replace('"', "")
        .replace("\n", "")
    )
    return cleaned


def analyze_review_type(review_type, photo_attached):
    r_type = str(review_type).strip()
    r_photo = str(photo_attached).strip()
    has_photo = bool(r_photo and r_photo != "-" and r_photo != "없음")

    if "한달" in r_type:
        return "한달포토" if has_photo else "한달텍스트"
    else:
        return "일반포토" if has_photo else "일반텍스트"


def load_review_database_advanced():
    logger.info("📒 [리뷰DB] 정밀분석 모드: 리뷰 시트 조회 중...")
    ws = get_or_create_worksheet(REVIEW_SHEET_NAME)
    if not ws:
        logger.warning("   ⚠️  리뷰 시트를 찾을 수 없습니다.")
        return {}

    try:
        rows = ws.get_all_values()
        review_db = {}
        skipped = 0
        MAX_COL = max(REVIEW_ORDER_ID_COL, REVIEW_TYPE_COL, REVIEW_PHOTO_COL)

        for i, row in enumerate(rows[1:], start=2):
            if len(row) <= MAX_COL:
                skipped += 1
                continue

            order_id = clean_order_id(row[REVIEW_ORDER_ID_COL])

            if not order_id:
                skipped += 1
                continue

            review_type = row[REVIEW_TYPE_COL]
            photo_attached = row[REVIEW_PHOTO_COL]
            label = analyze_review_type(review_type, photo_attached)

            if order_id in review_db:
                review_db[order_id].add(label)
            else:
                review_db[order_id] = {label}

        logger.info(f"   ✅ {len(review_db)}건 로드 완료 (스킵: {skipped}건)")
        return review_db

    except Exception as e:
        logger.error(f"   ❌ 리뷰DB 로드 실패: {e}")
        return {}


# ==========================================
# 4. 네이버 API 데이터 조회
# ==========================================
def fetch_target_orders_for_dispatch(token):
    logger.info("🔥 [배송준비] 신규 데이터 스캔 중...")
    headers = {"Authorization": f"Bearer {token}"}
    now = datetime.now(KST)
    from_dt = now - timedelta(days=1)
    last_changed_from = from_dt.isoformat(timespec="milliseconds")
    try:
        res = requests.get(
            "https://api.commerce.naver.com/external/v1/pay-order/seller/product-orders/last-changed-statuses",
            headers=headers,
            params={"lastChangedFrom": last_changed_from, "limitCount": 300},
        )
        data = res.json().get("data", {})
        chunk_ids = list(
            set(
                ch.get("productOrderId")
                for ch in data.get("lastChangeStatuses", [])
                if ch.get("productOrderId")
            )
        )
        final_orders = []
        if chunk_ids:
            get_details(token, chunk_ids, final_orders)
        return final_orders
    except Exception as e:
        logger.error(f"❌ 배송준비 데이터 조회 실패: {e}")
        return []


def fetch_recent_changes_for_archive(token):
    logger.info(f"📉 [장부정리] 최근 {DAYS_RANGE_ARCHIVE}일 데이터 스캔 중...")
    now_kst = datetime.now(KST)
    final_orders = []
    seen_ids = set()

    for i in range(DAYS_RANGE_ARCHIVE, -1, -1):
        try:
            target_date = now_kst - timedelta(days=i)
            start_utc = target_date.astimezone(timezone.utc)
            last_changed_from = start_utc.strftime("%Y-%m-%dT%H:%M:%S.000Z")

            if i % 3 == 0:
                logger.info(f"   ... {target_date.strftime('%Y-%m-%d')} 데이터 조회 중")

            res = requests.get(
                "https://api.commerce.naver.com/external/v1/pay-order/seller/product-orders/last-changed-statuses",
                headers={"Authorization": f"Bearer {token}"},
                params={"lastChangedFrom": last_changed_from},
            )
            if res.status_code == 200:
                chunk_ids = []
                for item in res.json().get("data", {}).get("lastChangeStatuses", []):
                    pid = item.get("productOrderId")
                    if pid and pid not in seen_ids:
                        chunk_ids.append(pid)
                        seen_ids.add(pid)
                if chunk_ids:
                    get_details(token, chunk_ids, final_orders)

            time.sleep(0.05)

        except Exception as e:
            logger.warning(f"⚠️  날짜 조회 오류: {e}")
            continue

    logger.info(f"   ✅ 총 {len(final_orders)}건의 주문 데이터 수집 완료")
    return final_orders


def get_details(token, chunk_ids, final_list):
    headers = {"Authorization": f"Bearer {token}"}
    for i in range(0, len(chunk_ids), 50):
        try:
            res = requests.post(
                "https://api.commerce.naver.com/external/v1/pay-order/seller/product-orders/query",
                headers=headers,
                json={"productOrderIds": chunk_ids[i : i + 50]},
            )
            if res.status_code == 200:
                data = res.json().get("data", [])
                if isinstance(data, list):
                    final_list.extend(data)
                elif isinstance(data, dict):
                    final_list.extend(data.get("contents", []))
            time.sleep(0.05)
        except Exception as e:
            logger.warning(f"⚠️  상세 데이터 조회 오류: {e}")


# ==========================================
# 5. 배송준비 시트 업데이트
# ==========================================
def auto_fill_dispatch_sheet(token, orders):
    logger.info("🚚 [배송준비] 목록 재검증 및 동기화 중...")
    ws = get_or_create_worksheet(TAB_NAME_DISPATCH)
    if not ws:
        return

    try:
        all_rows = ws.get_all_values()
    except:
        all_rows = []

    HEADERS_DISPATCH = ["상품주문번호", "택배사", "송장번호", "처리결과", "상품명", "수취인"]

    if not all_rows:
        all_rows = [HEADERS_DISPATCH]
        ws.update(range_name="A1", values=[HEADERS_DISPATCH])
    elif all_rows[0] != HEADERS_DISPATCH:
        all_rows[0] = HEADERS_DISPATCH
        ws.update(range_name="A1", values=[HEADERS_DISPATCH])

    headers = all_rows[0]

    existing_map = {}
    for row in all_rows[1:]:
        if row and row[0]:
            pid = str(row[0]).strip().lstrip("'")
            existing_map[pid] = row

    removed_count, added_count = 0, 0

    existing_ids = list(existing_map.keys())
    if existing_ids:
        current_status_list = []
        get_details(token, existing_ids, current_status_list)

        for item in current_status_list:
            pid = str(item.get("productOrder", {}).get("productOrderId", "")).strip()
            status = item.get("productOrder", {}).get("productOrderStatus")
            place_status = item.get("productOrder", {}).get("placeOrderStatus")

            if not (status == "PAYED" and place_status in ("NOT_YET", "OK")):
                if pid in existing_map:
                    del existing_map[pid]
                    removed_count += 1

    for order in orders:
        p = order.get("productOrder", {})
        pid = str(p.get("productOrderId", "")).strip()
        status = p.get("productOrderStatus")
        place_status = p.get("placeOrderStatus")

        if status == "PAYED" and place_status in ("NOT_YET", "OK"):
            if pid not in existing_map:
                addr = p.get("shippingAddress", {}) or {}
                safe_pid = f"'{pid}"
                existing_map[pid] = [
                    safe_pid,
                    "",
                    "",
                    "",
                    p.get("productName", ""),
                    addr.get("name", ""),
                ]
                added_count += 1
        else:
            if pid in existing_map:
                del existing_map[pid]
                removed_count += 1

    final_rows = [headers] + list(existing_map.values())
    ws.clear()
    ws.update(range_name="A1", values=final_rows, value_input_option="USER_ENTERED")
    logger.info(
        f"    ✨ [결과] 🆕 {added_count}건 추가 | 🗑️ {removed_count}건 삭제 | 📦 대기: {len(final_rows)-1}건"
    )


# ==========================================
# 6. 원가 로드 및 신규상품 등록
# ==========================================
def sync_and_load_costs(orders_list):
    logger.info("💰 [원가] 로딩 및 신규 상품 확인...")
    ws = get_or_create_worksheet(TAB_NAME_COST)
    if not ws:
        return {}
    existing_values = ws.get_all_values()
    existing_keys = set()
    cost_map = {}

    HEADERS_COST = ["상품번호(필수)", "상품명", "옵션명(중요)", "원가(단가)"]
    if not existing_values:
        ws.update(range_name="A1", values=[HEADERS_COST])
        existing_values = [HEADERS_COST]
    elif existing_values[0] != HEADERS_COST:
        ws.update(range_name="A1", values=[HEADERS_COST])
        existing_values[0] = HEADERS_COST

    for row in existing_values[1:]:
        if len(row) >= 4 and row[0]:
            pid = str(row[0]).strip()
            opt = str(row[2]).strip()
            key_tuple = (pid, opt)
            existing_keys.add(key_tuple)

            cost_str = row[3].strip().replace(",", "")
            if cost_str.isdigit():
                cost_val = int(cost_str)
                cost_map[f"{pid}_{opt}"] = cost_val
                cost_map[f"{pid}_{opt.replace(' ', '')}"] = cost_val

    new_rows = []
    for order in orders_list:
        p = order.get("productOrder", {})
        pid = get_safe_product_id(p)
        pname = p.get("productName", "")
        poption = (p.get("productOption", "") or "").strip() or "-"

        if pid and pid != "None":
            key_tuple = (pid, poption)
            if key_tuple not in existing_keys:
                new_rows.append([pid, pname, poption, ""])
                existing_keys.add(key_tuple)

    if new_rows:
        ws.append_rows(new_rows, value_input_option="USER_ENTERED")
    return cost_map


# ==========================================
# 7. 장부 업데이트 (수정 버전)
# ==========================================
def update_archives(orders, cost_map, review_db):
    orders_by_month = {}
    for order_data in orders:
        o = order_data.get("order", {})
        payment_date = o.get("paymentDate", "")
        if payment_date:
            month_key = payment_date[:7]
            if month_key not in orders_by_month:
                orders_by_month[month_key] = []
            orders_by_month[month_key].append(order_data)

    HEADERS_ORDER = [
        "주문번호", "상품주문번호", "상품번호", "옵션ID", "주문상태",
        "클레임유형", "클레임상태", "결제일시", "상품명", "옵션정보",
        "수량", "정가", "상품할인금액", "총결제금액", "배송비",
        "주문자명", "주문자연락처", "수취인명", "수취인연락처", "주소",
        "배송메세지", "택배사", "송장번호", "발송기한", "배송조회",
        "수집일시", "리뷰유형",
    ]
    
    HEADERS_SETTLE = [
        "주문번호", "상품번호", "옵션ID", "상품명", "옵션정보",
        "결제일시", "구매확정일", "결제수단", "수량", "실거래단가",
        "총결제금액", "수수료", "매입원가(총)", "마진", "마진율(%)",
        "유입경로",
    ]

    for month, monthly_orders in orders_by_month.items():
        logger.info(f"👉 [장부업데이트] {month}월 데이터 처리 중...")
        ws_order = get_or_create_worksheet(f"{PREFIX}_{month}")
        if ws_order:
            perform_upsert(ws_order, monthly_orders, HEADERS_ORDER, "order", cost_map, review_db)
        ws_settle = get_or_create_worksheet(f"{PREFIX}정산_{month}")
        if ws_settle:
            perform_upsert(ws_settle, monthly_orders, HEADERS_SETTLE, "settle", cost_map, review_db)


def perform_upsert(ws, new_orders_data, headers, mode, cost_map, review_db):
    try:
        all_values = ws.get_all_values()
    except:
        all_values = []

    now_str = datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S")
    is_modified = False

    if not all_values:
        all_values = [headers]
        is_modified = True
    elif all_values[0] != headers:
        all_values[0] = headers
        is_modified = True

    id_map = {}
    for idx, row in enumerate(all_values):
        if idx != 0 and row:
            if mode == "order":
                if len(row) > 1:
                    key = str(row[1]).strip()
                    id_map[key] = idx
            else:
                if len(row) > 2:
                    order_id = str(row[0]).strip().lstrip("'")
                    prod_id = str(row[1]).strip()
                    option_id = str(row[2]).strip().lstrip("'")
                    key = f"{order_id}_{prod_id}_{option_id}"
                    id_map[key] = idx

    new_cnt, mod_cnt = 0, 0
    EXCLUDE_KEYWORDS = ["취소", "반품", "거부", "CANCEL", "RETURN", "REJECT"]
    
    # 🆕 삭제할 인덱스 수집
    indices_to_delete = []

    for order_data in new_orders_data:
        p = order_data.get("productOrder", {})
        o = order_data.get("order", {})
        d = order_data.get("delivery", {})
        addr = p.get("shippingAddress", {})
        pid = str(p.get("productOrderId", "")).strip()
        prod_id = get_safe_product_id(p)
        if not pid:
            continue

        status_kr = translate_status(p.get("productOrderStatus"))
        claim_type_kr = translate_status(p.get("claimType"))
        claim_status_kr = translate_status(p.get("claimStatus"))
        
        if status_kr == "구매확정" and claim_type_kr == "반품":
            claim_type_kr = "반품철회"
        if status_kr == "구매확정" and claim_type_kr == "교환":
            claim_type_kr = "교환철회"
        if status_kr in ["결제완료", "배송중", "배송완료"] and claim_type_kr == "취소":
            claim_type_kr = "취소철회"
        
        full_status = f"{p.get('productOrderStatus')} {p.get('claimType')}".upper()

        if mode == "settle":
            order_id = o.get("orderId", "")
            option_id = p.get("optionCode", "")
            delete_key = f"{order_id}_{prod_id}_{option_id}"
            
            # 🆕 삭제 대상인 경우 인덱스만 수집
            if any(bad in full_status for bad in EXCLUDE_KEYWORDS):
                if delete_key in id_map:
                    indices_to_delete.append(id_map[delete_key])
                continue

        raw_option = (p.get("productOption", "") or "").strip() or "-"

        unit_cost = cost_map.get(f"{prod_id}_{raw_option}", 0)
        if unit_cost == 0:
            unit_cost = cost_map.get(f"{prod_id}_{raw_option.replace(' ', '')}", 0)
        if unit_cost == 0:
            unit_cost = cost_map.get(f"{prod_id}_-", 0)

        pay_date = (
            o.get("paymentDate", "").split(".")[0].replace("T", " ")
            if o.get("paymentDate")
            else ""
        )
        row_data = []

        if mode == "order":
            courier = translate_courier(d.get("deliveryCompany", ""))
            t_no = d.get("trackingNumber", "")
            t_url = get_tracking_url(courier, t_no)

            o_name = o.get("ordererName", "")
            o_phone = (
                o.get("ordererTel1")
                or o.get("ordererTel2")
                or o.get("ordererTel")
                or ""
            )

            order_pid_str = str(pid).strip().replace("'", "")
            review_type_val = ""
            if order_pid_str in review_db:
                labels = sorted(list(review_db[order_pid_str]))
                review_type_val = " + ".join(labels)

            option_id = p.get("optionCode", "")

            row_data = [
                o.get("orderId"), pid, prod_id, f"'{option_id}",
                status_kr, claim_type_kr, claim_status_kr, pay_date,
                p.get("productName"), raw_option, p.get("quantity"),
                fmt(p.get("unitPrice", 0)),
                fmt(p.get("productDiscountAmount", 0)),
                fmt(p.get("totalPaymentAmount", 0)),
                fmt(p.get("deliveryFeeAmount", 0)),
                o_name, o_phone, addr.get("name"), addr.get("tel1"),
                f"{addr.get('baseAddress', '')} {addr.get('detailedAddress', '')}".strip(),
                p.get("shippingMemo"), courier, t_no,
                p.get("shippingDueDate", "")[:10], t_url, now_str,
                review_type_val,
            ]
        else:
            qty = p.get("quantity", 1)
            pay = p.get("totalPaymentAmount", 0)
            settle = p.get("expectedSettlementAmount", 0)
            
            fee = abs(pay - settle)
            total_cost = unit_cost * qty
            margin = settle - total_cost
            rate = f"{round((margin / pay) * 100, 1)}%" if pay > 0 else "0%"
            
            decision_date = (
                p.get("decisionDate", "").split(".")[0].replace("T", " ")
                if p.get("decisionDate")
                else "미확정"
            )
            
            unit_real_price = int(pay / qty) if qty > 0 else 0
            option_id = p.get("optionCode", "")
            
            inflow_path = (
                p.get("inflowPath")
                or o.get("inflowPath")
                or order_data.get("inflowPath")
                or ""
            )
            inflow_path_add = (
                p.get("inflowPathAdd")
                or o.get("inflowPathAdd")
                or order_data.get("inflowPathAdd")
                or ""
            )
            inflow_display = translate_inflow_path(inflow_path, inflow_path_add)
            
            row_data = [
                o.get("orderId"), prod_id, f"'{option_id}",
                p.get("productName"), raw_option, pay_date,
                decision_date, o.get("paymentMeans"), qty,
                fmt(unit_real_price), fmt(pay), fmt(fee),
                fmt(total_cost), fmt(margin), rate,
                inflow_display,
            ]

        row_data = [str(x) for x in row_data]
        
        if mode == "order":
            key = pid
        else:
            order_id = o.get("orderId", "")
            option_id = p.get("optionCode", "")
            key = f"{order_id}_{prod_id}_{option_id}"
        
        if key in id_map:
            all_values[id_map[key]] = row_data
            mod_cnt += 1
        else:
            all_values.append(row_data)
            id_map[key] = len(all_values) - 1
            new_cnt += 1
        is_modified = True

    # 🆕 역순으로 삭제 (인덱스 틀어짐 방지)
    if indices_to_delete:
        for idx in sorted(set(indices_to_delete), reverse=True):
            if idx < len(all_values):
                del all_values[idx]
        is_modified = True
        logger.info(f"    🗑️ [{mode}] {len(set(indices_to_delete))}건 삭제")

    if is_modified:
        header = all_values[0]
        data_rows = all_values[1:]
        
        try:
            if mode == "order":
                data_rows.sort(key=lambda x: x[7] if len(x) > 7 else "", reverse=True)
            else:
                data_rows.sort(key=lambda x: x[5] if len(x) > 5 else "", reverse=True)
        except:
            pass
        
        ws.clear()
        ws.update(
            range_name="A1",
            values=[header] + data_rows,
            value_input_option="USER_ENTERED",
        )
        
        if mode == "settle":
            logger.info(f"    💾 [정산] 신규: {new_cnt} | 수정: {mod_cnt}")
        else:
            logger.info(f"    💾 [주문] 신규: {new_cnt} | 수정: {mod_cnt}")


# ==========================================
# 8. 리뷰 정밀분석 동기화
# ==========================================
def sync_review_to_all_sheets(review_db):
    logger.info("🔄 [리뷰동기화] 모든 월별 시트의 리뷰유형 컬럼 동기화 중...")

    now = datetime.now(KST)
    current_year = now.year

    target_months = [f"{current_year}-{m:02d}" for m in range(1, 13)]
    updated_sheets = 0

    for month in target_months:
        sheet_name = f"{PREFIX}_{month}"
        try:
            ws = get_or_create_worksheet(sheet_name)
            if not ws:
                continue

            all_values = ws.get_all_values()
            if not all_values or len(all_values) < 2:
                continue

            header = all_values[0]
            while len(header) <= TARGET_COL_INDEX:
                header.append("")
            header[TARGET_COL_INDEX] = TARGET_HEADER_NAME

            update_cnt = 0
            for idx, row in enumerate(all_values[1:], start=1):
                while len(row) <= TARGET_COL_INDEX:
                    row.append("")

                if len(row) > 0:
                    order_id = clean_order_id(row[0])
                else:
                    order_id = ""

                final_label = ""
                if order_id and order_id in review_db:
                    labels = sorted(list(review_db[order_id]))
                    final_label = " + ".join(labels)

                if row[TARGET_COL_INDEX] != final_label:
                    row[TARGET_COL_INDEX] = final_label
                    update_cnt += 1

                all_values[idx] = row

            if update_cnt > 0:
                ws.clear()
                ws.update(
                    range_name="A1",
                    values=all_values,
                    value_input_option="USER_ENTERED",
                )
                logger.info(f"    ✅ [{sheet_name}] {update_cnt}건 업데이트")
                updated_sheets += 1
                time.sleep(1)

        except Exception as e:
            logger.warning(f"    ⚠️  [{sheet_name}] 실패: {e}")
            continue

    logger.info(f"   🎉 총 {updated_sheets}개 시트 동기화 완료")


# ==========================================
# 9. 통계 시트 자동 생성
# ==========================================
def generate_statistics_sheet():
    logger.info("\n📊 [통계시트] 생성 중...")

    ws = get_or_create_worksheet(TAB_NAME_STATS)
    if not ws:
        logger.error("   ❌ 통계 시트 생성 실패")
        return

    existing_data = {}
    try:
        saved_values = ws.get("A2:J100", value_render_option="UNFORMATTED_VALUE")
        for idx, row in enumerate(saved_values):
            row_num = idx + 2
            if len(row) > 6:
                existing_data[row_num] = {
                    "G": row[6] if len(row) > 6 else "",
                    "H": row[7] if len(row) > 7 else "",
                }
        logger.info(f"   💾 기존 광고비/혜택비 데이터 보존: {len(existing_data)}행")
    except Exception:
        logger.info("   ℹ️  기존 데이터 없음")

    headers = [
        "월", "1.총 매출액", "2.총 마진액", "3.평균 마진율", "4.가중 평균 마진율",
        "5.총 주문 수", "6.네이버 광고비", "7.혜택 정산비", "8.실질 총 마진액",
        "9.실질 가중 마진율", "10.신용카드%", "11.간편결제%", "12.계좌이체%",
        "13.무통장%", "14.포인트/머니%",
    ]

    rows = [headers]

    now = datetime.now(KST)
    current_year = now.year

    for m in range(1, 13):
        month_key = f"{current_year}-{m:02d}"
        sheet_ref = f"'{PREFIX}정산_{month_key}'!"
        row_num = m + 1

        saved_g = existing_data.get(row_num, {}).get("G", "")
        saved_h = existing_data.get(row_num, {}).get("H", "")

        row = [
            f"{m}월",
            f"=IFERROR(SUM({sheet_ref}K:K),0)",
            f"=IFERROR(SUM({sheet_ref}N:N),0)",
            f"=IFERROR(AVERAGE({sheet_ref}O:O),0)",
            f"=IFERROR(IF(B{row_num}=0,0,C{row_num}/B{row_num}),0)",
            f"=IFERROR(COUNTA({sheet_ref}A2:A),0)",
            saved_g,
            saved_h,
            f"=IFERROR(IF(OR(ISBLANK(G{row_num}),ISBLANK(H{row_num})),C{row_num},C{row_num}-VALUE(G{row_num})-VALUE(H{row_num})),C{row_num})",
            f"=IFERROR(IF(B{row_num}=0,0,I{row_num}/B{row_num}),0)",
            f"=IFERROR(COUNTIFS({sheet_ref}H:H,\"*신용카드*\")/COUNTA({sheet_ref}H2:H),0)",
            f"=IFERROR(COUNTIFS({sheet_ref}H:H,\"*간편*\")/COUNTA({sheet_ref}H2:H),0)",
            f"=IFERROR(COUNTIFS({sheet_ref}H:H,\"*계좌*\")/COUNTA({sheet_ref}H2:H),0)",
            f"=IFERROR(COUNTIFS({sheet_ref}H:H,\"*무통장*\")/COUNTA({sheet_ref}H2:H),0)",
            f"=IFERROR((COUNTIFS({sheet_ref}H:H,\"*포인트*\")+COUNTIFS({sheet_ref}H:H,\"*머니*\"))/COUNTA({sheet_ref}H2:H),0)",
        ]
        rows.append(row)

    rows.append([""] * len(headers))
    total_row_index = len(rows) + 1

    saved_g_total = existing_data.get(total_row_index, {}).get("G", "")
    saved_h_total = existing_data.get(total_row_index, {}).get("H", "")

    total_row = [
        f"🔥 {current_year} 누적 합계",
        "=SUM(B2:B13)", "=SUM(C2:C13)", "=AVERAGE(D2:D13)",
        f"=IFERROR(IF(B{total_row_index}=0,0,C{total_row_index}/B{total_row_index}),0)",
        "=SUM(F2:F13)",
        "=SUM(G2:G13)" if not saved_g_total else saved_g_total,
        "=SUM(H2:H13)" if not saved_h_total else saved_h_total,
        "=SUM(I2:I13)",
        f"=IFERROR(IF(B{total_row_index}=0,0,I{total_row_index}/B{total_row_index}),0)",
    ]
    rows.append(total_row)

    try:
        ws.clear()
        ws.update(range_name="A1", values=rows, value_input_option="USER_ENTERED")

        fmt_currency = {"numberFormat": {"type": "NUMBER", "pattern": "#,##0"}}
        fmt_percent = {"numberFormat": {"type": "PERCENT", "pattern": "0.00%"}}

        ws.format("B2:C", fmt_currency)
        ws.format("D2:E", fmt_percent)
        ws.format("F2:F", fmt_currency)
        ws.format("G2:I", fmt_currency)
        ws.format("J2:J", fmt_percent)
        ws.format("K2:O", fmt_percent)

        ws.format("A1:O1", {
            "backgroundColor": {"red": 0.2, "green": 0.5, "blue": 0.8},
            "textFormat": {"bold": True, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
        })

        ws.format(f"A{total_row_index}:O{total_row_index}", {
            "backgroundColor": {"red": 1, "green": 0.9, "blue": 0.7},
            "textFormat": {"bold": True},
        })

        ws.format("G2:H13", {
            "backgroundColor": {"red": 1, "green": 1, "blue": 0.8},
        })

        logger.info("   ✅ 통계 시트 생성 완료!")
    except Exception as e:
        logger.error(f"   ❌ 통계 시트 생성 실패: {e}")


# ==========================================
# 10. N배송 마스터 시트 로드
# ==========================================
def load_ndelivery_master():
    logger.info("📋 [N배송마스터] 시트 로드 중...")
    
    ws = get_or_create_worksheet(TAB_NAME_NDELIVERY_MASTER)
    if not ws:
        logger.error("   ❌ N배송마스터 시트를 찾을 수 없습니다.")
        return {}
    
    try:
        all_values = ws.get_all_values()
        if len(all_values) <= 1:
            logger.warning("   ⚠️ N배송마스터 시트에 데이터가 없습니다.")
            return {}
        
        ndelivery_products = {}
        for row in all_values[1:]:
            if len(row) >= 1 and row[0]:
                option_id = str(row[0]).strip().replace("'", "")
                option_id2 = str(row[1]).strip().replace("'", "") if len(row) > 1 else ""
                name = str(row[2]).strip() if len(row) > 2 else ""
                
                if option_id:
                    ndelivery_products[option_id] = (name, option_id2)
        
        logger.info(f"   ✅ {len(ndelivery_products)}개 N배송 상품 로드 완료")
        return ndelivery_products
        
    except Exception as e:
        logger.error(f"   ❌ N배송마스터 로드 실패: {e}")
        return {}


# ==========================================
# 11. N배송 현황 대시보드 생성
# ==========================================
def generate_ndelivery_status_for_month(year, month, ndelivery_products):
    if not ndelivery_products:
        return
    
    month_str = f"{year}-{month:02d}"
    sheet_name = f"{PREFIX}_{month_str}"
    status_sheet_name = f"{PREFIX}_N배송현황_{month:02d}월"
    
    logger.info(f"\n📦 [N배송현황] {month}월 대시보드 생성 중...")
    
    ws_order = get_or_create_worksheet(sheet_name)
    if not ws_order:
        logger.warning(f"   ⚠️ {sheet_name} 시트를 찾을 수 없습니다.")
        return
    
    try:
        all_orders = ws_order.get_all_values()
        if len(all_orders) <= 1:
            logger.warning(f"   ⚠️ {sheet_name} 시트에 데이터가 없습니다.")
            return
    except Exception as e:
        logger.error(f"   ❌ 주문 시트 로드 실패: {e}")
        return
    
    COL_OPTION_ID = 3
    COL_ORDER_STATUS = 4
    COL_CLAIM_TYPE = 5
    COL_CLAIM_STATUS = 6
    COL_QTY = 10
    
    option_id_map = {}
    for opt_id, (name, opt_id2) in ndelivery_products.items():
        option_id_map[opt_id] = opt_id
        if opt_id2:
            option_id_map[opt_id2] = opt_id
    
    product_stats = {}
    for opt_id in ndelivery_products.keys():
        product_stats[opt_id] = {
            '구매확정': 0, '교환완료': 0, '반품완료': 0,
            '반품요청': 0, '반품수거중': 0, '반품수거완료': 0,
            '결제완료': 0, '배송중': 0, '배송완료': 0, '취소완료': 0,
        }
    
    for row in all_orders[1:]:
        if len(row) <= COL_QTY:
            continue
        
        option_id = str(row[COL_OPTION_ID]).strip().replace("'", "")
        order_status = str(row[COL_ORDER_STATUS]).strip()
        claim_type = str(row[COL_CLAIM_TYPE]).strip()
        claim_status = str(row[COL_CLAIM_STATUS]).strip()
        
        try:
            qty = int(row[COL_QTY]) if row[COL_QTY] else 1
        except:
            qty = 1
        
        if option_id not in option_id_map:
            continue
        
        main_option_id = option_id_map[option_id]
        
        if order_status == '구매확정':
            product_stats[main_option_id]['구매확정'] += qty
        elif order_status == '교환완료':
            product_stats[main_option_id]['교환완료'] += qty
        elif order_status == '반품완료':
            product_stats[main_option_id]['반품완료'] += qty
        elif order_status == '취소완료':
            product_stats[main_option_id]['취소완료'] += qty
        elif order_status == '결제완료' and claim_type == '':
            product_stats[main_option_id]['결제완료'] += qty
        elif order_status == '배송중' and claim_type == '':
            product_stats[main_option_id]['배송중'] += qty
        elif order_status == '배송완료' and claim_type == '':
            product_stats[main_option_id]['배송완료'] += qty
        
        if claim_type == '반품':
            if claim_status == '반품요청':
                product_stats[main_option_id]['반품요청'] += qty
            elif claim_status == '수거중':
                product_stats[main_option_id]['반품수거중'] += qty
            elif claim_status == '수거완료':
                product_stats[main_option_id]['반품수거완료'] += qty
    
    ws_status = get_or_create_worksheet(status_sheet_name)
    if not ws_status:
        logger.error(f"   ❌ {status_sheet_name} 시트 생성 실패")
        return
    
    headers = [
        "옵션ID", "옵션ID2", "상품명", "총 차감 재고",
        "구매확정", "교환완료", "반품완료", "반품요청",
        "반품수거중", "반품수거완료", "결제완료", "배송중",
        "배송완료", "취소완료",
    ]
    
    rows = [headers]
    
    for opt_id, (name, opt_id2) in ndelivery_products.items():
        stats = product_stats[opt_id]
        total_deduct = stats['구매확정'] + stats['교환완료'] - stats['반품완료']
        
        row = [
            f"'{opt_id}", f"'{opt_id2}" if opt_id2 else "", name, total_deduct,
            stats['구매확정'], stats['교환완료'], stats['반품완료'], stats['반품요청'],
            stats['반품수거중'], stats['반품수거완료'], stats['결제완료'], stats['배송중'],
            stats['배송완료'], stats['취소완료'],
        ]
        rows.append(row)
    
    data_rows = rows[1:]
    data_rows.sort(key=lambda x: x[3] if isinstance(x[3], int) else 0, reverse=True)
    rows = [headers] + data_rows
    
    total_row = [
        "", "", "🔥 합계",
        sum(r[3] for r in data_rows if isinstance(r[3], int)),
        sum(r[4] for r in data_rows if isinstance(r[4], int)),
        sum(r[5] for r in data_rows if isinstance(r[5], int)),
        sum(r[6] for r in data_rows if isinstance(r[6], int)),
        sum(r[7] for r in data_rows if isinstance(r[7], int)),
        sum(r[8] for r in data_rows if isinstance(r[8], int)),
        sum(r[9] for r in data_rows if isinstance(r[9], int)),
        sum(r[10] for r in data_rows if isinstance(r[10], int)),
        sum(r[11] for r in data_rows if isinstance(r[11], int)),
        sum(r[12] for r in data_rows if isinstance(r[12], int)),
        sum(r[13] for r in data_rows if isinstance(r[13], int)),
    ]
    rows.append(total_row)
    
    try:
        ws_status.clear()
        ws_status.update(range_name="A1", values=rows, value_input_option="USER_ENTERED")
        
        update_time = datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S")
        ws_status.update(range_name="P1", values=[[f"최종 업데이트: {update_time}"]])
        
        logger.info(f"   ✅ {status_sheet_name} 생성 완료!")
        logger.info(f"      총 차감: {total_row[3]} | 구매확정: {total_row[4]} | 교환: {total_row[5]} | 반품: {total_row[6]}")
        
    except Exception as e:
        logger.error(f"   ❌ {status_sheet_name} 업데이트 실패: {e}")


def generate_ndelivery_status_dashboard():
    logger.info("\n" + "=" * 50)
    logger.info("📦 [N배송현황] 월별 대시보드 생성")
    logger.info("=" * 50)
    
    ndelivery_products = load_ndelivery_master()
    if not ndelivery_products:
        logger.warning("   ⚠️ N배송마스터 시트에 데이터가 없어 대시보드를 생성하지 않습니다.")
        return
    
    now = datetime.now(KST)
    current_year = now.year
    current_month = now.month
    
    if current_month == 1:
        prev_year = current_year - 1
        prev_month = 12
    else:
        prev_year = current_year
        prev_month = current_month - 1
    
    generate_ndelivery_status_for_month(prev_year, prev_month, ndelivery_products)
    time.sleep(1)
    generate_ndelivery_status_for_month(current_year, current_month, ndelivery_products)
    
    logger.info("\n   🎉 N배송현황 대시보드 생성 완료!")


# ==========================================
# 12. 메인 실행
# ==========================================
if __name__ == "__main__":
    logger.info("\n" + "=" * 70)
    logger.info(f"🤖 Optimus Daily + Review + Stats + N배송 ({PREFIX})")
    logger.info("   ✅ G열: 클레임상태 추가")
    logger.info("   ✅ F열: 클레임유형")
    logger.info("   ✅ 반품/교환/취소 철회 자동 감지")
    logger.info("   ✅ N배송 현황 대시보드")
    logger.info("   ✅ IndexError 수정 완료 🔥")
    logger.info("=" * 70)

    token = get_naver_token()
    if token:
        try:
            review_db = load_review_database_advanced()
            dispatch = fetch_target_orders_for_dispatch(token)
            auto_fill_dispatch_sheet(token, dispatch)
            archive = fetch_recent_changes_for_archive(token)
            all_data = dispatch + archive
            cost_map = sync_and_load_costs(all_data)
            
            if archive:
                update_archives(archive, cost_map, review_db)
            
            if review_db:
                sync_review_to_all_sheets(review_db)
            
            generate_statistics_sheet()
            generate_ndelivery_status_dashboard()

            logger.info("\n" + "=" * 70)
            logger.info("✅ 모든 작업이 완료되었습니다!")
            logger.info("=" * 70)

        except KeyboardInterrupt:
            logger.info("\n⚠️ 사용자에 의해 중단됨")
        except Exception as e:
            logger.error(f"\n❌ 예상치 못한 오류: {e}", exc_info=True)
    else:
        logger.error("❌ 토큰 발급 실패로 작업을 중단합니다")
