#!/usr/bin/env python3
"""
📊 팩세이프 BIZRAW + AI 경영 비서
"""
# ... (위의 프레지던트 코드와 임포트 부분 동일) ...
import time, base64, bcrypt, requests, smtplib, logging, anthropic, os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta, timezone

# =========================================================
# [1. 설정 - 여기가 다릅니다!]
# =========================================================
PREFIX = "팩세이프"

# 팩세이프 전용 키 이름 (_PACSAFE) 사용
NAVER_CLIENT_ID = os.environ.get("NAVER_CLIENT_ID_PACSAFE")
NAVER_CLIENT_SECRET = os.environ.get("NAVER_CLIENT_SECRET_PACSAFE")
# 공용 키
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD")

CLAUDE_MODEL = "claude-3-5-sonnet-20240620"
RECIPIENTS = ["t7832@naver.com", "jung7832@naver.com"]
SENDER_EMAIL = "terryjung@travence.net"

# ... (나머지 코드는 프레지던트와 100% 동일하게 복사/붙여넣기 하시면 됩니다) ...
# (지면상 생략했지만, 위의 프레지던트 코드 전체를 복사한 뒤 이 설정 부분만 바꾸면 됩니다)
