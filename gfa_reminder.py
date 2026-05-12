"""
GFA 미입력 알림 — 매일 09:00 KST 실행.

전날 GFA 광고비가 폼에 입력되지 않은 브랜드를 t7832@naver.com에 알림.

GitHub Secrets 필요:
  GOOGLE_SERVICE_ACCOUNT_JSON
  GMAIL_APP_PASSWORD
"""
import json
import os
import smtplib
import ssl
import sys
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage

KST = timezone(timedelta(hours=9))
SHEET_ID = "1wyyiNvMEhmCPwJJg6pOai-JFu2vmxMqPYHD9uBJuZ8w"
SHEET_TAB = "설문지 응답 시트1"
FORM_URL = "https://docs.google.com/forms/d/1v3fgJTQPW6WKDnPiSR8VTTEhF4K7YRsDh2ZTKh_7DC4/viewform"

GMAIL_USER = "terryjung@travence.net"
RECIPIENT = "t7832@naver.com"


def _parse_date(s: str):
    s = s.strip().rstrip(".").replace(" ", "")
    for fmt in ("%Y-%m-%d", "%Y.%m.%d", "%Y/%m/%d"):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None


def check_sheet():
    from google.oauth2 import service_account
    from googleapiclient.discovery import build

    sa_json_str = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
    if not sa_json_str:
        sys.exit("GOOGLE_SERVICE_ACCOUNT_JSON 미설정")

    creds = service_account.Credentials.from_service_account_info(
        json.loads(sa_json_str),
        scopes=["https://www.googleapis.com/auth/spreadsheets.readonly"],
    )
    sheets = build("sheets", "v4", credentials=creds, cache_discovery=False)
    r = sheets.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range=f"'{SHEET_TAB}'!A:D",
    ).execute()
    return r.get("values", [])


def main():
    yesterday = (datetime.now(KST) - timedelta(days=1)).date()
    print(f"[gfa_reminder] 점검 날짜: {yesterday}")

    rows = check_sheet()
    has_pacsafe = False
    has_president = False
    for row in rows[1:]:
        if len(row) < 2:
            continue
        d = _parse_date(row[1] or "")
        if d != yesterday:
            continue
        # column 2 = 팩세이프, column 3 = 프레지던트
        if len(row) > 2 and str(row[2]).strip():
            has_pacsafe = True
        if len(row) > 3 and str(row[3]).strip():
            has_president = True

    missing = []
    if not has_pacsafe:
        missing.append("팩세이프")
    if not has_president:
        missing.append("프레지던트")

    if not missing:
        print(f"✓ 두 브랜드 모두 입력됨. 알림 안 보냄.")
        return

    print(f"미입력: {', '.join(missing)} → 알림 발송")

    gmail_pw = os.environ.get("GMAIL_APP_PASSWORD")
    if not gmail_pw:
        sys.exit("GMAIL_APP_PASSWORD 미설정")

    subject = f"⏰ GFA 광고비 입력 필요 ({yesterday}) — {', '.join(missing)}"
    body = f"""안녕하세요,

{yesterday} GFA 광고비가 아직 입력되지 않았습니다.

미입력 브랜드: {', '.join(missing)}

📝 입력 폼: {FORM_URL}

폼에 입력하시면 즉시 보고서 메일이 발송됩니다 (Apps Script trigger).
미입력 상태로 두면 다음날 보고서에 "GFA 미입력"으로 표시됩니다.

— claude-code 자동 알림 (매일 09:00 KST)
"""

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"Travence BIZRAW <{GMAIL_USER}>"
    msg["To"] = RECIPIENT
    msg.set_content(body)

    ctx = ssl.create_default_context()
    with smtplib.SMTP("smtp.gmail.com", 587, timeout=30) as s:
        s.starttls(context=ctx)
        s.login(GMAIL_USER, gmail_pw)
        s.send_message(msg)
    print(f"✓ 메일 발송 완료 → {RECIPIENT}")


if __name__ == "__main__":
    main()
