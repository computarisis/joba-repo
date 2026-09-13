#!/usr/bin/env bash
#NOTE: We instructed/guided AI to generate these tests. 



#AI  generated code ----------------------------------------------------------------------------------------------------
set -u
# Use a real inbox (or a dedicated alias) that you can access during the test.
# The script pauses twice so you can paste the token received by email.
EMAIL=""
PASSWORD="password123"
NEW_PASSWORD="newPassword456"

# PostgreSQL credentials. DB_* can override these; PG_*_ARG names are also supported.
DB_CONTAINER="${DB_CONTAINER:-applyflow-db}"
DB_USER="${DB_USER:-${PG_USER_ARG:-jobapg-user}}"
DB_PASSWORD="${DB_PASSWORD:-${PG_PASS_ARG:-jobapg-pass}}"
DB_NAME="${DB_NAME:-${PG_NAME_ARG:-jobapg-db}}"

BASE_URL="${BASE_URL:-http://localhost:${PORT:-3001}}"
COOKIE_JAR="$(mktemp)"
RESP_FILE="$(mktemp)"
PASS=0
FAIL=0
STATUS=""
APP_ID=""
LOGIN_CURSOR=""
CHUNK2_CURSOR=""
REG_TOKEN=""
RESET_TOKEN=""
USER_CREATED=0

cleanup() {
  echo

  if [[ "$USER_CREATED" -eq 1 ]]; then
    echo "Cleaning test data for $EMAIL ..."

    if [[ -n "${DATABASE_URL:-}" ]] && command -v psql >/dev/null 2>&1; then
      psql "$DATABASE_URL" \
        -v ON_ERROR_STOP=1 \
        -v test_email="$EMAIL" \
        >/dev/null <<'SQL'
DELETE FROM applications
WHERE user_id IN (
  SELECT id FROM users WHERE email = :'test_email'
);

DELETE FROM users
WHERE email = :'test_email';
SQL

      if [[ $? -eq 0 ]]; then
        echo "Test DB rows removed."
      else
        echo "WARNING: DB cleanup failed."
      fi

    elif command -v docker >/dev/null 2>&1 && docker inspect "$DB_CONTAINER" >/dev/null 2>&1; then
      docker exec -e PGPASSWORD="$DB_PASSWORD" -i "$DB_CONTAINER" \
        psql -U "$DB_USER" -d "$DB_NAME" \
        -v ON_ERROR_STOP=1 \
        -v test_email="$EMAIL" \
        >/dev/null <<'SQL'
DELETE FROM applications
WHERE user_id IN (
  SELECT id FROM users WHERE email = :'test_email'
);

DELETE FROM users
WHERE email = :'test_email';
SQL

      if [[ $? -eq 0 ]]; then
        echo "Test DB rows removed."
      else
        echo "WARNING: DB cleanup failed."
      fi

    else
      echo "WARNING: Could not clean DB rows."
      echo "Set DATABASE_URL with psql installed, or run the $DB_CONTAINER container."
    fi
  else
    echo "No test user was created; skipping DB row cleanup."
  fi

  rm -f "$COOKIE_JAR" "$RESP_FILE"
}

trap cleanup EXIT

for cmd in curl jq; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "Missing dependency: $cmd"
    exit 1
  }
done

if [[ -z "$EMAIL" || "$EMAIL" == "PUT_REAL_EMAIL_HERE" ]]; then
  echo 'Set EMAIL at the top of integration.sh to a real inbox before running the test.'
  exit 1
fi

section() {
  printf '\n== %s ==\n' "$1"
}

pass() {
  PASS=$((PASS + 1))
  printf 'PASS  %s\n' "$1"
}

fail() {
  FAIL=$((FAIL + 1))
  printf 'FAIL  %s\n      %s\n' "$1" "$2"
}

body_preview() {
  tr '\n' ' ' < "$RESP_FILE" | cut -c1-220
}

call() {
  local method="$1"
  local path="$2"
  local json="${3:-}"
  local cookie_mode="${4:-jar}"

  local args=(
    -sS
    -o "$RESP_FILE"
    -w '%{http_code}'
    -X "$method"
    "${BASE_URL}${path}"
    -H 'Accept: application/json'
  )

  [[ -n "$json" ]] && args+=(
    -H 'Content-Type: application/json'
    -d "$json"
  )

  [[ "$cookie_mode" == "jar" ]] && args+=(
    -b "$COOKIE_JAR"
    -c "$COOKIE_JAR"
  )

  STATUS="$(curl "${args[@]}" 2>/dev/null || printf '000')"
}

assert_status() {
  local expected="$1"
  local name="$2"

  if [[ "$STATUS" == "$expected" ]]; then
    pass "$name"
  else
    fail "$name" "expected HTTP $expected, got $STATUS; body: $(body_preview)"
  fi
}

assert_jq() {
  local expr="$1"
  local name="$2"

  if jq -e "$expr" "$RESP_FILE" >/dev/null 2>&1; then
    pass "$name"
  else
    fail "$name" "JSON assertion failed: $expr; body: $(body_preview)"
  fi
}

normalize_token() {
  local token="$1"

  # Allows either the raw token or the complete emailed URL to be pasted.
  token="${token#*token=}"
  token="${token%%&*}"
  printf '%s' "$token"
}

section "health"

call GET /api/health "" none
assert_status 200 "health succeeds"

[[ "$STATUS" == "000" ]] && {
  echo "Server is not reachable at $BASE_URL"
  exit 1
}

assert_jq '.ok == "true" or .ok == true' "health returns ok=true"


section "register validation + email token"

call POST /api/auth/register-validate \
  '{"email":"not-an-email","password":"short"}' \
  none

assert_status 400 "register-validate rejects invalid payload"

call POST /api/auth/register-validate \
  "$(jq -nc --arg email "$EMAIL" --arg password "$PASSWORD" --arg name "Curl Test" \
    '{email:$email,password:$password,name:$name}')" \
  none

assert_status 200 "register-validate accepts valid user and sends email"

if [[ "$STATUS" == "200" ]]; then
  assert_jq '.ok == true' "register-validate returns ok=true"

  printf '\nCheck %s for the registration email.\n' "$EMAIL"
  read -r -p "Paste the registration token (or full emailed URL): " REG_TOKEN
  REG_TOKEN="$(normalize_token "$REG_TOKEN")"

  if [[ -z "$REG_TOKEN" ]]; then
    fail "registration token entered" "no token was entered"
  else
    call POST /api/auth/register \
      "$(jq -nc --arg token "$REG_TOKEN" '{token:$token}')" \
      jar

    assert_status 201 "register creates user from emailed token"

    if [[ "$STATUS" == "201" ]]; then
      USER_CREATED=1
      assert_jq '.user != null' "register returns new user id"
    fi
  fi
fi

call POST /api/auth/register \
  '{"token":"definitely-not-a-valid-registration-token"}' \
  none

assert_status 400 "register rejects invalid token"

if [[ "$USER_CREATED" -eq 1 ]]; then
  call POST /api/auth/register-validate \
    "$(jq -nc --arg email "$EMAIL" --arg password "$PASSWORD" \
      '{email:$email,password:$password}')" \
    none

  assert_status 409 "register-validate rejects duplicate email"
fi


section "login"

# Login establishes a fresh auth cookie for the application tests.
call POST /api/auth/login \
  "$(jq -nc --arg email "$EMAIL" --arg password "$PASSWORD" \
    '{email:$email,password:$password}')" \
  jar

assert_status 200 "login with correct password"

if [[ "$STATUS" == "200" ]]; then
  assert_jq ".user.email == \"$EMAIL\"" "login returns correct user"
  assert_jq '.applications | type == "array"' "login returns applications array"
fi

call POST /api/auth/login \
  "$(jq -nc --arg email "$EMAIL" --arg password "wrongpass999" \
    '{email:$email,password:$password}')" \
  none

assert_status 401 "login rejects wrong password"


section "auth me"

call GET /api/auth/me "" jar
assert_status 200 "me succeeds with authenticated cookie"

if [[ "$STATUS" == "200" ]]; then
  assert_jq ".user.email == \"$EMAIL\"" "me returns authenticated user"
fi


section "applications POST"

# Valid app #1
call POST /api/applications \
  '{"company":"Acme","role":"Engineer","status":"saved"}' \
  jar

assert_status 201 "create basic application"

# Valid app #2, including applicationDate.
call POST /api/applications \
  '{"company":"Google","role":"Frontend Engineer","status":"applied","applicationDate":"2026-08-19","jobUrl":"https://example.com/job","salaryMin":100000,"salaryMax":140000,"notes":"Applied online"}' \
  jar

assert_status 201 "create fuller application with applicationDate"

if [[ "$STATUS" == "201" ]]; then
  APP_ID="$(jq -r '.application.id // empty' "$RESP_FILE")"
fi

call POST /api/applications \
  '{"company":"Missing Status Co","role":"Engineer"}' \
  jar

assert_status 400 "create rejects missing required status"

call POST /api/applications \
  '{"role":"Missing company","status":"saved"}' \
  jar

assert_status 400 "create rejects missing company"


# Add 12 more valid apps.
# 2 above + 12 here = 14 total.
STATUSES=(saved applied interview offer rejected)

for i in $(seq 3 14); do
  status="${STATUSES[$(( (i - 3) % ${#STATUSES[@]} ))]}"

  call POST /api/applications \
    "{\"company\":\"Seed Co $i\",\"role\":\"Engineer $i\",\"status\":\"$status\"}" \
    jar

  if [[ "$STATUS" != "201" ]]; then
    fail "seed application $i" \
      "expected HTTP 201, got $STATUS; body: $(body_preview)"
  fi
done


section "applications pagination: 3 chunks"

# Chunk 1:
# Login returns first 10 out of 14.
call POST /api/auth/login \
  "$(jq -nc --arg email "$EMAIL" --arg password "$PASSWORD" \
    '{email:$email,password:$password}')" \
  jar

assert_status 200 "chunk 1: login returns first applications"

if [[ "$STATUS" == "200" ]]; then
  assert_jq '.applications | length == 10' \
    "chunk 1 contains 10 applications"

  echo "Chunk 1:"
  jq '{
    count: (.applications | length),
    ids: [.applications[].id],
    nextCursor
  }' "$RESP_FILE"

  LOGIN_CURSOR="$(jq -r '.nextCursor // empty' "$RESP_FILE")"

  if [[ -n "$LOGIN_CURSOR" ]]; then
    pass "chunk 1 returns nextCursor"
  else
    fail "chunk 1 returns nextCursor" \
      "login returned no nextCursor"
  fi
fi


# Chunk 2:
# Remaining 4 apps.
# Request 2 -> should return 2 + another cursor.
if [[ -n "$LOGIN_CURSOR" ]]; then

  call GET \
    "/api/applications?limit=2&cursor=$LOGIN_CURSOR" \
    "" \
    jar

  assert_status 200 \
    "chunk 2: GET continues from login cursor"

  if [[ "$STATUS" == "200" ]]; then

    assert_jq '.applications | length == 2' \
      "chunk 2 contains 2 applications"

    echo "Chunk 2:"
    jq '{
      count: (.applications | length),
      ids: [.applications[].id],
      nextCursor
    }' "$RESP_FILE"

    CHUNK2_CURSOR="$(jq -r '.nextCursor // empty' "$RESP_FILE")"

    if [[ -n "$CHUNK2_CURSOR" ]]; then
      pass "chunk 2 returns nextCursor"
    else
      fail "chunk 2 returns nextCursor" \
        "second chunk returned no nextCursor"
    fi
  fi
fi


# Chunk 3:
# Final 2 apps -> no nextCursor.
if [[ -n "$CHUNK2_CURSOR" ]]; then

  call GET \
    "/api/applications?limit=2&cursor=$CHUNK2_CURSOR" \
    "" \
    jar

  assert_status 200 \
    "chunk 3: GET returns final applications"

  if [[ "$STATUS" == "200" ]]; then

    assert_jq '.applications | length == 2' \
      "chunk 3 contains final 2 applications"

    echo "Chunk 3:"
    jq '{
      count: (.applications | length),
      ids: [.applications[].id],
      nextCursor
    }' "$RESP_FILE"

    assert_jq '.nextCursor == null' \
      "chunk 3 has no nextCursor"
  fi
fi


section "applications GET validation"

# GET should also be able to start fresh with no cursor.
call GET '/api/applications?limit=2' "" jar
assert_status 200 "GET can start without cursor"

call GET '/api/applications?limit=0' "" jar
assert_status 400 "list rejects limit=0"

call GET \
  '/api/applications?limit=2&cursor=not-a-real-cursor' \
  "" \
  jar

assert_status 400 "list rejects malformed cursor"


section "application PATCH"

if [[ -n "$APP_ID" ]]; then

  call PATCH \
    "/api/applications/$APP_ID" \
    '{"status":"interview","notes":"Interview next Monday"}' \
    jar

  assert_status 200 "patch status and notes"

  call PATCH \
    "/api/applications/$APP_ID" \
    '{"status":"offer"}' \
    jar

  assert_status 200 "patch status only"

else
  fail "patch application" \
    "could not get application id from POST response"
fi

call PATCH \
  '/api/applications/not-a-number' \
  '{"status":"offer"}' \
  jar

assert_status 400 "patch rejects invalid id"


section "application DELETE"

if [[ -n "$APP_ID" ]]; then

  call DELETE \
    "/api/applications/$APP_ID" \
    "" \
    jar

  assert_status 204 "delete application"

  call DELETE \
    "/api/applications/$APP_ID" \
    "" \
    jar

  assert_status 404 "delete same application twice"

else
  fail "delete application" \
    "could not get application id from POST response"
fi

call DELETE \
  '/api/applications/not-a-number' \
  "" \
  jar

assert_status 400 "delete rejects invalid id"


section "forgot password + email token"

call POST /api/auth/forgot-password \
  "$(jq -nc --arg email "$EMAIL" '{email:$email}')" \
  none

assert_status 200 "forgot-password accepts registered email and sends email"

if [[ "$STATUS" == "200" ]]; then
  assert_jq '.ok == true' "forgot-password returns ok=true"

  printf '\nCheck %s for the password-reset email.\n' "$EMAIL"
  read -r -p "Paste the password-reset token (or full emailed URL): " RESET_TOKEN
  RESET_TOKEN="$(normalize_token "$RESET_TOKEN")"

  if [[ -z "$RESET_TOKEN" ]]; then
    fail "password-reset token entered" "no token was entered"
  else
    call POST /api/auth/reset-verify \
      "$(jq -nc --arg token "$RESET_TOKEN" '{token:$token}')" \
      none

    assert_status 200 "reset-verify accepts live token"

    if [[ "$STATUS" == "200" ]]; then
      assert_jq '.valid == true' "reset-verify reports token valid"
    fi

    call POST /api/auth/reset-password \
      "$(jq -nc --arg token "$RESET_TOKEN" --arg password "$NEW_PASSWORD" \
        '{token:$token,newPassword:$password}')" \
      none

    assert_status 200 "reset-password updates password"

    if [[ "$STATUS" == "200" ]]; then
      assert_jq '.ok == true' "reset-password returns ok=true"
    fi

    call POST /api/auth/reset-verify \
      "$(jq -nc --arg token "$RESET_TOKEN" '{token:$token}')" \
      none

    assert_status 200 "reset-verify handles used token"

    if [[ "$STATUS" == "200" ]]; then
      assert_jq '.valid == false' "used reset token is invalidated"
    fi
  fi
fi


section "login after password reset"

call POST /api/auth/login \
  "$(jq -nc --arg email "$EMAIL" --arg password "$PASSWORD" \
    '{email:$email,password:$password}')" \
  none

assert_status 401 "old password is rejected after reset"

call POST /api/auth/login \
  "$(jq -nc --arg email "$EMAIL" --arg password "$NEW_PASSWORD" \
    '{email:$email,password:$password}')" \
  jar

assert_status 200 "new password logs in"


section "logout + blacklist"

call POST /api/auth/logout "" jar
assert_status 204 "logout succeeds and clears cookie"

# Cookie should be gone after logout, so protected application access must fail.
call GET '/api/applications?limit=2' "" jar
assert_status 401 "protected route rejects request after logout"

call GET /api/auth/me "" jar
assert_status 401 "me rejects request after logout"


printf '\n==============================\n'
printf 'Passed: %d\nFailed: %d\n' "$PASS" "$FAIL"
printf '==============================\n'

(( FAIL > 0 )) && exit 1

#AI  generated code ----------------------------------------------------------------------------------------------------