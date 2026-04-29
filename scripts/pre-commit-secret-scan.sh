#!/usr/bin/env bash
# Pre-commit hook: blocks staged content containing common secret patterns
# and obvious env-file paths. Exit 1 cancels the commit.
#
# Patterns covered:
#   - JWT tokens (eyJ...)
#   - Stripe keys (sk_live_, sk_test_)
#   - Google API keys (AIza...)
#   - GitHub PATs (ghp_, ghs_, gho_)
#   - Slack tokens (xox[baprs]-)
#   - AWS access keys (AKIA...)
#   - Google OAuth client secrets (GOCSPX-)
#   - Supabase secret keys (sb_secret_)
#   - OpenAI / Anthropic keys (sk-ant-, sk-proj-)
#   - PEM private keys
#   - .env / .env.local / .env.production files staged for commit
#
# Bypass for emergencies: git commit --no-verify (don't make a habit of it).

set -euo pipefail

# Files that should never be committed, even if .gitignore is wrong.
BLOCKED_PATHS_REGEX='(^|/)\.env(\.[a-z]+)?(\.local)?$|(^|/)id_rsa$|(^|/)id_ed25519$|(^|/)\.pem$|(^|/)\.p12$|(^|/)\.pfx$|(^|/)\.keystore$|(^|/)\.aws/credentials$|(^|/)\.ssh/'

# Content patterns that look like real secrets.
# Each pattern is paired with a human-readable label.
declare -a PATTERNS=(
  'eyJ[A-Za-z0-9_=-]{20,}\.eyJ[A-Za-z0-9_=-]{20,}\.[A-Za-z0-9_=-]{20,}|JWT-like token'
  'sk_live_[0-9a-zA-Z]{20,}|Stripe live key'
  'sk_test_[0-9a-zA-Z]{20,}|Stripe test key'
  'AIza[0-9A-Za-z_-]{35}|Google API key'
  'ghp_[A-Za-z0-9]{30,}|GitHub PAT (classic)'
  'gh[pousr]_[A-Za-z0-9]{30,}|GitHub token'
  'xox[baprs]-[A-Za-z0-9-]{20,}|Slack token'
  'AKIA[0-9A-Z]{16}|AWS access key'
  'GOCSPX-[A-Za-z0-9_-]{20,}|Google OAuth client secret'
  'sb_secret_[A-Za-z0-9]{20,}|Supabase secret key'
  'sk-ant-[A-Za-z0-9_-]{30,}|Anthropic API key'
  'sk-proj-[A-Za-z0-9_-]{30,}|OpenAI project key'
  '-----BEGIN (RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----|PEM private key'
)

# 1. Blocked-path check on staged file list.
staged=$(git diff --cached --name-only --diff-filter=ACMR)
if [ -n "$staged" ]; then
  bad_paths=$(printf '%s\n' "$staged" | grep -E "$BLOCKED_PATHS_REGEX" || true)
  if [ -n "$bad_paths" ]; then
    echo "ERROR: refusing to commit forbidden path(s):" >&2
    printf '  %s\n' $bad_paths >&2
    echo "If this is a false positive, run with --no-verify (not recommended)." >&2
    exit 1
  fi
fi

# 2. Content-pattern check on staged diff (added lines only).
diff_added=$(git diff --cached --diff-filter=ACMR -U0 | grep -E '^\+[^+]' || true)
if [ -z "$diff_added" ]; then
  exit 0
fi

found=0
for entry in "${PATTERNS[@]}"; do
  pattern="${entry%%|*}"
  label="${entry##*|}"
  matches=$(printf '%s\n' "$diff_added" | grep -E "$pattern" || true)
  if [ -n "$matches" ]; then
    if [ "$found" = "0" ]; then
      echo "ERROR: staged diff contains likely secret(s):" >&2
      found=1
    fi
    echo "  [$label]" >&2
    printf '%s\n' "$matches" | sed 's/^/    /' | head -3 >&2
  fi
done

if [ "$found" = "1" ]; then
  echo "" >&2
  echo "If these are placeholder/test values, replace them or use --no-verify (not recommended)." >&2
  exit 1
fi
exit 0
