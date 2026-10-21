#!/bin/sh
set -eu

usage() {
  printf '%s\n' 'Usage: sh publish.sh gith5 ["commit message"]' \
    'Commits and pushes this source main, then publishes only RazeTag to RazeDev.' \
    'Requires GitHub SSH access and Node.js 24+. No publishing token is needed.'
}
case "${1-}" in
  -h|--help) usage; exit 0 ;;
  gith5) [ "$#" -le 2 ] || { usage >&2; exit 2; } ;;
  *) usage >&2; exit 2 ;;
esac

command -v git >/dev/null 2>&1 || { printf '%s\n' 'Git is required.' >&2; exit 1; }
command -v node >/dev/null 2>&1 || { printf '%s\n' 'Node.js 24 or newer is required.' >&2; exit 1; }
node -e 'if(Number(process.versions.node.split(".")[0])<24)process.exit(1)' || {
  printf '%s\n' 'Node.js 24 or newer is required.' >&2; exit 1;
}
source_dir=$(CDPATH='' cd -P "$(dirname "$0")" && pwd -P)
publish_tmp=$(mktemp -d "${TMPDIR:-/tmp}/razedev-publish.XXXXXX")
trap 'rm -rf "$publish_tmp"' 0
trap 'exit 1' 1 2 15
publish_tmp=$(CDPATH='' cd -P "$publish_tmp" && pwd -P)

printf '%s\n' 'Preparing the RazeTag publisher from RazeDev main...'
GIT_TERMINAL_PROMPT=0 git clone --quiet --single-branch --branch main \
  git@github.com:remyo/razedev.git "$publish_tmp/razedev"
if [ "$#" -eq 2 ]; then
  node "$publish_tmp/razedev/scripts/publish-local.mjs" --app razetag --source "$source_dir" --message "$2"
else
  node "$publish_tmp/razedev/scripts/publish-local.mjs" --app razetag --source "$source_dir"
fi
