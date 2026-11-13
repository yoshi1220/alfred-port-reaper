#!/bin/bash
set -eu
cd "$(dirname "$0")/.."
test_script=$(mktemp -t portreaper-tests)
trap 'rm -f "$test_script"' EXIT
cat src/list_ports.js tests/test_list_ports.js > "$test_script"
/usr/bin/osascript -l JavaScript "$test_script"
./tests/test_kill_process.sh
