#!/bin/bash
# Exercise the Universal Action path with a disposable child process.
set -eu
/bin/sleep 30 &
test_pid=$!
trap 'kill "$test_pid" 2>/dev/null || true' EXIT
output=$(q='test query' /bin/bash src/kill_process.sh TERM "$test_pid")
if [[ "$output" != 'test query' ]]; then
  echo 'Failed to preserve the query' >&2
  exit 1
fi
if kill -0 "$test_pid" 2>/dev/null; then
  echo 'Failed to stop the test process' >&2
  exit 1
fi
wait "$test_pid" 2>/dev/null || true
trap - EXIT
echo 'Process termination test passed'
