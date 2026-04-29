name: Travence BIZRAW Reports

# 한국시간 기준:
# - 일간: 매일 오전 8시 (UTC 23:00 전날)
# - 주간: 매주 월요일 오전 8시
# - 월간: 매월 1일 오전 9시
on:
  schedule:
    # 매일 KST 08:00 = UTC 23:00 (전날)
    - cron: "0 23 * * *"
    # 매월 1일 KST 09:00 = UTC 00:00 (해당일)
    - cron: "0 0 1 * *"
  workflow_dispatch:
    inputs:
      mode:
        description: "수동 실행 모드"
        required: true
        default: "daily"
        type: choice
        options:
          - daily
          - weekly
          - monthly

jobs:
  daily:
    # 매일 실행 (cron 23:00 UTC) 또는 수동 daily
    if: github.event_name == 'schedule' && github.event.schedule == '0 23 * * *' || (github.event_name == 'workflow_dispatch' && github.event.inputs.mode == 'daily')
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
          cache: "pip"
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      - name: Pacsafe Daily
        env:
          ANTHROPIC_API_KEY:           ${{ secrets.ANTHROPIC_API_KEY }}
          NAVER_CLIENT_ID_PACSAFE:     ${{ secrets.NAVER_CLIENT_ID_PACSAFE }}
          NAVER_CLIENT_SECRET_PACSAFE: ${{ secrets.NAVER_CLIENT_SECRET_PACSAFE }}
          GMAIL_APP_PASSWORD:          ${{ secrets.GMAIL_APP_PASSWORD }}
        run: python pacsafe_daily.py --send
      - name: President Daily
        if: always()
        env:
          ANTHROPIC_API_KEY:             ${{ secrets.ANTHROPIC_API_KEY }}
          NAVER_CLIENT_ID_PRESIDENT:     ${{ secrets.NAVER_CLIENT_ID_PRESIDENT }}
          NAVER_CLIENT_SECRET_PRESIDENT: ${{ secrets.NAVER_CLIENT_SECRET_PRESIDENT }}
          GMAIL_APP_PASSWORD:            ${{ secrets.GMAIL_APP_PASSWORD }}
        run: python president_daily.py --send

  weekly:
    # 매일 실행되지만, 월요일에만 진짜 실행. 또는 수동 weekly
    if: github.event_name == 'schedule' && github.event.schedule == '0 23 * * *' || (github.event_name == 'workflow_dispatch' && github.event.inputs.mode == 'weekly')
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - name: Check if Monday (KST)
        id: dow
        run: |
          # KST 기준 요일 (UTC+9)
          KST_DOW=$(TZ=Asia/Seoul date +%u)
          echo "kst_dow=$KST_DOW" >> $GITHUB_OUTPUT
          echo "현재 KST 요일: $KST_DOW (1=월, 7=일)"
      - name: Setup Python
        if: steps.dow.outputs.kst_dow == '1' || github.event_name == 'workflow_dispatch'
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"
          cache: "pip"
      - name: Install dependencies
        if: steps.dow.outputs.kst_dow == '1' || github.event_name == 'workflow_dispatch'
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      - name: Pacsafe Weekly
        if: steps.dow.outputs.kst_dow == '1' || github.event_name == 'workflow_dispatch'
        env:
          ANTHROPIC_API_KEY:           ${{ secrets.ANTHROPIC_API_KEY }}
          NAVER_CLIENT_ID_PACSAFE:     ${{ secrets.NAVER_CLIENT_ID_PACSAFE }}
          NAVER_CLIENT_SECRET_PACSAFE: ${{ secrets.NAVER_CLIENT_SECRET_PACSAFE }}
          GMAIL_APP_PASSWORD:          ${{ secrets.GMAIL_APP_PASSWORD }}
        run: python pacsafe_weekly.py --send
      - name: President Weekly
        if: (steps.dow.outputs.kst_dow == '1' || github.event_name == 'workflow_dispatch') && always()
        env:
          ANTHROPIC_API_KEY:             ${{ secrets.ANTHROPIC_API_KEY }}
          NAVER_CLIENT_ID_PRESIDENT:     ${{ secrets.NAVER_CLIENT_ID_PRESIDENT }}
          NAVER_CLIENT_SECRET_PRESIDENT: ${{ secrets.NAVER_CLIENT_SECRET_PRESIDENT }}
          GMAIL_APP_PASSWORD:            ${{ secrets.GMAIL_APP_PASSWORD }}
        run: python president_weekly.py --send

  monthly:
    # 매월 1일 KST 09:00 = UTC 00:00 또는 수동 monthly
    if: github.event_name == 'schedule' && github.event.schedule == '0 0 1 * *' || (github.event_name == 'workflow_dispatch' && github.event.inputs.mode == 'monthly')
    runs-on: ubuntu-latest
    timeout-minutes: 60
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
          cache: "pip"
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      - name: Pacsafe Monthly
        env:
          ANTHROPIC_API_KEY:           ${{ secrets.ANTHROPIC_API_KEY }}
          NAVER_CLIENT_ID_PACSAFE:     ${{ secrets.NAVER_CLIENT_ID_PACSAFE }}
          NAVER_CLIENT_SECRET_PACSAFE: ${{ secrets.NAVER_CLIENT_SECRET_PACSAFE }}
          GMAIL_APP_PASSWORD:          ${{ secrets.GMAIL_APP_PASSWORD }}
        run: python pacsafe_monthly.py --send
      - name: President Monthly
        if: always()
        env:
          ANTHROPIC_API_KEY:             ${{ secrets.ANTHROPIC_API_KEY }}
          NAVER_CLIENT_ID_PRESIDENT:     ${{ secrets.NAVER_CLIENT_ID_PRESIDENT }}
          NAVER_CLIENT_SECRET_PRESIDENT: ${{ secrets.NAVER_CLIENT_SECRET_PRESIDENT }}
          GMAIL_APP_PASSWORD:            ${{ secrets.GMAIL_APP_PASSWORD }}
        run: python president_monthly.py --send
