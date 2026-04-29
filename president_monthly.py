#!/usr/bin/env python3
"""
📊 프레지던트 월간 네이버 리포트
"""
import os
import sys
from report_core import run_report

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

PREFIX = "프레지던트"
PREFIX_EN = "PRESIDENT"

NAVER_ID = os.environ.get("NAVER_CLIENT_ID_PRESIDENT")
NAVER_SECRET = os.environ.get("NAVER_CLIENT_SECRET_PRESIDENT")
ANTHROPIC_KEY = os.environ.get("ANTHROPIC_API_KEY")
GMAIL_PW = os.environ.get("GMAIL_APP_PASSWORD", "")

SENDER = "terryjung@travence.net"
RECIPIENTS = ["t7832@naver.com", "jung7832@naver.com"]


def main():
    required = {
        "NAVER_CLIENT_ID_PRESIDENT": NAVER_ID,
        "NAVER_CLIENT_SECRET_PRESIDENT": NAVER_SECRET,
        "ANTHROPIC_API_KEY": ANTHROPIC_KEY,
    }
    missing = [k for k, v in required.items() if not v]
    if missing:
        print(f"❌ 환경변수 누락: {', '.join(missing)}")
        sys.exit(1)

    send_mail = "--send" in sys.argv
    if send_mail and not GMAIL_PW:
        print("❌ 메일 발송하려면 .env에 GMAIL_APP_PASSWORD 입력 필요")
        sys.exit(1)

    save_path = None if send_mail else "preview_president_monthly.html"

    success = run_report(
        prefix=PREFIX, prefix_en=PREFIX_EN,
        naver_id=NAVER_ID, naver_secret=NAVER_SECRET,
        anthropic_key=ANTHROPIC_KEY, gmail_pw=GMAIL_PW,
        sender=SENDER, recipients=RECIPIENTS,
        save_html_path=save_path,
        mode="monthly",
    )

    if success and save_path:
        print(f"\n✅ 완료! '{save_path}' 파일을 브라우저로 열어보세요.")

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
