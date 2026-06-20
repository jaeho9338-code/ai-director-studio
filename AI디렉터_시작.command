#!/bin/bash

PROJECT="/Users/user/Desktop/ai-director-studio"
export PATH="/Users/user/.nvm/versions/node/v22.22.2/bin:$PATH"
ENV_FILE="$PROJECT/.env.local"

echo "=== AI Director Studio ==="
echo ""

# API 키 확인
API_KEY=$(grep 'ANTHROPIC_API_KEY=' "$ENV_FILE" 2>/dev/null | cut -d= -f2-)

# API 키 없으면 터미널에서 입력받기
if [ -z "$API_KEY" ]; then
    echo "Anthropic API 키를 입력하세요 (입력 후 Enter):"
    echo "(발급: https://console.anthropic.com)"
    echo ""
    read -r API_KEY

    if [ -z "$API_KEY" ]; then
        echo "API 키가 입력되지 않았습니다. 종료합니다."
        read -r -p "아무 키나 누르면 창이 닫힙니다..."
        exit 1
    fi

    printf 'ANTHROPIC_API_KEY=%s\n' "$API_KEY" > "$ENV_FILE"
    echo "API 키가 저장되었습니다."
    echo ""
fi

# 이미 실행 중이면 바로 브라우저 열기
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "서버가 이미 실행 중입니다. 브라우저를 엽니다."
    open "http://localhost:3001"
    exit 0
fi

# 서버 시작
echo "서버를 시작합니다..."
cd "$PROJECT"
npm run dev -- -p 3001 &

# 준비 대기
echo -n "준비 중"
for i in $(seq 1 40); do
    sleep 1
    echo -n "."
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>/dev/null)
    if [ "$STATUS" = "200" ]; then
        echo ""
        echo "완료! 브라우저를 엽니다."
        open "http://localhost:3001"
        wait
        exit 0
    fi
done

echo ""
echo "서버 시작에 실패했습니다."
read -r -p "아무 키나 누르면 창이 닫힙니다..."
exit 1
