#!/usr/bin/env bash
# Idempotent Cloud Agent bootstrap for the uptoolkit registry.
# Installs the Vite+ (vp) toolchain and bun, then refreshes dependencies.
set -euo pipefail

export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
VP_BIN="$HOME/.local/share/vite-plus/bin"
export PATH="$BUN_INSTALL/bin:$VP_BIN:$PATH"

if ! command -v bun >/dev/null 2>&1; then
  curl -fsSL https://bun.sh/install | bash
fi

if ! command -v vp >/dev/null 2>&1; then
  curl -fsSL https://vite.plus | bash
fi

export PATH="$BUN_INSTALL/bin:$VP_BIN:$PATH"

cd "$(dirname "$0")/.."
vp install
