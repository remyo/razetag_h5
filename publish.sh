#!/bin/sh
# Compatibility repository: never publish this stale copy over the current site.
printf '%s\n' 'Website editing moved to the private remyo/web_razedev repository.' \
  'From web_razedev main, run: sh publish.sh gith5 razetag "commit message"' >&2
exit 1
