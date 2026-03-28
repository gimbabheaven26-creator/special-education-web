#!/bin/bash
# 성취기준 JSON을 SEW 루트에서 nadaun/src/data/로 복사
# 용도: Vercel 배포 시 src 외부 파일 접근 불가 → 복사본 사용

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SEW_ROOT="$(dirname "$PROJECT_ROOT")"
SOURCE="$SEW_ROOT/data/curriculum/achievement-stds"
DEST="$PROJECT_ROOT/src/data/achievement-stds"

if [ ! -d "$SOURCE" ]; then
  echo "Error: Source directory not found: $SOURCE"
  exit 1
fi

mkdir -p "$DEST"
cp "$SOURCE"/*.json "$DEST/"
echo "Synced $(ls -1 "$DEST"/*.json | wc -l | tr -d ' ') achievement standard files to $DEST"
