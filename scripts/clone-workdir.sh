#!/usr/bin/env bash

set -euo pipefail

source_dir="$(pwd)"
target_dir="${1:-}"

if [[ -z "$target_dir" ]]; then
  echo "Usage: $(basename "$0") <target-directory>"
  exit 1
fi

if [[ -e "$target_dir" ]]; then
  echo "Target already exists: $target_dir"
  exit 1
fi

mkdir -p "$target_dir"

rsync -a \
  --exclude ".git" \
  --exclude "node_modules" \
  --exclude ".next" \
  --exclude "dist" \
  --exclude "coverage" \
  --exclude ".turbo" \
  --exclude ".cache" \
  "$source_dir/" "$target_dir/"

if [[ ! -f "$target_dir/.env.local" ]]; then
  echo "Warning: .env.local was not found in the source directory."
fi

cd "$target_dir"
pnpm install
