#!/bin/bash

API_KEY="QyrHrU4ol1uwIsbbEdRZp7pRCA9Kr08UkWuOLhqJnPy2mHYDyXSAvIoXshHKEENy"
API_SECRET="c0mZO7jt71lEwCnGflBnn9WM4kPUDL5nZcnO4NIm6yPmDIfT5Z3FunQaNmmEWnE2"

TIMESTAMP=$(node -e "console.log(Date.now())")
QUERY="timestamp=${TIMESTAMP}"
SIGNATURE=$(echo -n "${QUERY}" | openssl dgst -sha256 -hmac "${API_SECRET}" | awk '{print $2}')

curl -s -H "X-MBX-APIKEY: ${API_KEY}" \
  "https://api.binance.com/api/v3/account?${QUERY}&signature=${SIGNATURE}"
