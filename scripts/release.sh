#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

bump="${1:-}"
case "$bump" in
  patch | minor | major) ;;
  *)
    echo "usage: scripts/release.sh patch|minor|major" >&2
    exit 1
    ;;
esac

if [ -n "$(git status --porcelain)" ]; then
  echo "working tree is not clean" >&2
  exit 1
fi

branch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$branch" != "main" ]; then
  echo "releases are cut from main, not $branch" >&2
  exit 1
fi

git fetch origin main
if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
  echo "main is not in sync with origin/main" >&2
  exit 1
fi

version="$(npm version "$bump" --no-git-tag-version)"
docker compose run --rm install
docker compose run --rm verify

git add package.json bun.lock
git commit -m "Release $version"
git tag "$version"

npm publish --access public

git push origin main "$version"

echo "published @westonkd/sprint $version"
