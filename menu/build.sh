#!/usr/bin/env bash
# Velvet Oven menu card build.
#   inline  -> menu/velvet-oven-menu.html  (self contained: fonts + logo embedded)
#   pdf     -> menu/out/velvet-oven-menu.pdf
#   png     -> menu/out/velvet-oven-menu.png  (300 DPI, rasterised from the PDF)
#
# Usage: ./build.sh [inline|pdf|png|all]     (default: all)
set -euo pipefail

cd "$(dirname "$0")"
mkdir -p out

SRC="menu.src.html"
HTML="velvet-oven-menu.html"
PDF="out/velvet-oven-menu.pdf"
PNG="out/velvet-oven-menu"

inline() {
  python3 - <<'PY'
import pathlib

src   = pathlib.Path("menu.src.html").read_text()
fonts = pathlib.Path("fonts/fonts-inline.css").read_text()
logo  = pathlib.Path("logo-lockup.svgpath").read_text()

out = src.replace("/* __FONTS__ */", fonts)
out = out.replace("__LOGOPATH__", logo)
pathlib.Path("velvet-oven-menu.html").write_text(out)
print("built velvet-oven-menu.html (%.1f KB)" % (len(out) / 1024))
PY
}

pdf() {
  google-chrome --headless --disable-gpu --no-sandbox \
    --no-pdf-header-footer --run-all-compositor-stages-before-draw \
    --virtual-time-budget=4000 \
    --print-to-pdf="$PDF" "file://$PWD/$HTML" 2>/dev/null
  echo "built $PDF"
}

png() {
  pdftoppm -png -r 300 -singlefile "$PDF" "$PNG"
  echo "built $PNG.png"
}

case "${1:-all}" in
  inline) inline ;;
  pdf)    pdf ;;
  png)    png ;;
  all)    inline; pdf; png ;;
  *)      echo "usage: $0 [inline|pdf|png|all]" >&2; exit 1 ;;
esac
