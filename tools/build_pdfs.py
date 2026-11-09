"""Gera os PDF dos requisitos a partir dos .md (um por documento e um com todos).

Uso: pip install markdown playwright && playwright install chromium
     python tools/build_pdfs.py
"""

from pathlib import Path

import markdown
from playwright.sync_api import sync_playwright

FOLDER = Path(__file__).resolve().parent.parent / "requirements" / "loja-aurora"
COMBINED = "requisitos-loja-aurora-completo.pdf"

STYLE = """
body { font-family: "Segoe UI", Arial, sans-serif; font-size: 10.5pt; line-height: 1.45; color: #222; }
h1 { font-size: 19pt; color: #9a3412; margin: 0 0 4pt; }
h2 { font-size: 13.5pt; margin-top: 16pt; border-bottom: 1px solid #ddd; padding-bottom: 3pt; }
table { border-collapse: collapse; margin: 6pt 0; }
td, th { border: 1px solid #999; padding: 3pt 7pt; text-align: left; vertical-align: top; }
th { background: #f3f0eb; }
code { font-family: Consolas, monospace; }
.break { page-break-before: always; }
"""


def html(body: str) -> str:
    return f'<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><style>{STYLE}</style></head><body>{body}</body></html>'


def to_html(path: Path) -> str:
    return markdown.markdown(path.read_text(encoding="utf-8"), extensions=["tables"])


def main():
    sources = sorted(FOLDER.glob("*.md"))
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        options = {"format": "A4", "margin": {"top": "18mm", "bottom": "18mm", "left": "17mm", "right": "17mm"},
                   "display_header_footer": True, "header_template": "<span></span>",
                   "footer_template": '<div style="font-size:8pt;width:100%;text-align:center;color:#888">Loja Aurora · <span class="pageNumber"></span>/<span class="totalPages"></span></div>'}
        for source in sources:
            page.set_content(html(to_html(source)))
            page.pdf(path=str(source.with_suffix(".pdf")), **options)
            print("ok", source.with_suffix(".pdf").name)
        combined = "".join(f'<section class="{"break" if i else ""}">{to_html(s)}</section>' for i, s in enumerate(sources))
        page.set_content(html(combined))
        page.pdf(path=str(FOLDER / COMBINED), **options)
        print("ok", COMBINED)
        browser.close()


if __name__ == "__main__":
    main()
