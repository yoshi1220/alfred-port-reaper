#!/bin/bash
# Build PortReaper.alfredworkflow by zipping the contents of src/
# Usage: ./build.sh [--install]  (--install opens the artifact to import it into Alfred)
set -eu
cd "$(dirname "$0")"

ARTIFACT="PortReaper.alfredworkflow"

./tests/run_tests.sh
plutil -lint src/info.plist

rm -f "$ARTIFACT"
(cd src && zip -qr "../$ARTIFACT" . \
  -x "*.pyc" \
  -x "__pycache__/*" \
  -x "*/__pycache__/*" \
  -x ".DS_Store" \
  -x "*/.DS_Store")
echo "created: $(pwd)/$ARTIFACT"

if [[ "${1:-}" == "--install" ]]; then
  open "$ARTIFACT"
fi
