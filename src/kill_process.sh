#!/bin/bash
# Args: $1 = signal name (TERM | KILL), $2 = PID
# Env: q = filter query to carry over to the reopened list, pname = process name for notifications
# Stdout: the query string (forwarded to the Script Filter via Call External Trigger)
set -u

signal="$1"
pid="$2"

notify() {
  /usr/bin/osascript -e 'on run argv' \
    -e 'display notification (item 1 of argv) with title "PortReaper"' \
    -e 'end run' "$1"
}

if [[ "$signal" != TERM && "$signal" != KILL ]]; then
  notify "Invalid signal"
elif [[ "$pid" =~ ^[0-9]+$ && "$pid" -gt 1 ]]; then
  # When invoked from the list, verify that the PID still listens on a
  # previously displayed port. Universal Actions have no such context.
  if [[ -n "${pports:-}" ]]; then
    current=$(/usr/sbin/lsof -nP -a -p "$pid" -iTCP -sTCP:LISTEN 2>/dev/null || true)
    found=false
    for port in $pports; do
      if [[ "$port" =~ ^[0-9]+$ ]] && [[ "$current" =~ :${port}[[:space:]]+\(LISTEN\) ]]; then
        found=true
        break
      fi
    done
    if [[ "$found" != true ]]; then
      notify "Process or listening port changed; no signal sent (PID ${pid})"
      printf '%s' "${q:-}"
      exit 0
    fi
  fi
  if kill "-${signal}" "$pid" 2>/dev/null; then
    sleep 0.15
  elif ps -p "$pid" >/dev/null 2>&1; then
    notify "Could not kill ${pname:-process} (PID ${pid}) — insufficient permissions?"
  fi
else
  notify "Invalid PID: ${pid}"
fi

printf '%s' "${q:-}"
