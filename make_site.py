#!/usr/bin/env python3
"""Build the deployable static site in site/ from map/.

map/index.html is body content only (the format the artifact host expects).
This wraps it in a full HTML document so any static host can serve it.
Standard library only.  Usage: python3 make_site.py
"""
import re, shutil
from pathlib import Path

ROOT = Path(__file__).parent
SRC, OUT = ROOT / "map", ROOT / "site"

DESCRIPTION = ("Checks of claims about the business, financial and political dealings of "
               "Donald Trump, his family and his administration, with a profile for every "
               "name and a map of the documented links between them.")

def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()
    for f in SRC.iterdir():
        if f.name != "index.html":
            shutil.copy2(f, OUT / f.name)
    body = (SRC / "index.html").read_text(encoding="utf-8")
    title = re.search(r"<title>(.*?)</title>", body, re.S).group(1).strip()
    head_bits = re.findall(r"<link\b[^>]*>", body)
    for pat in (r"<title>.*?</title>\s*", r"<meta name=\"claude:[^>]*>\s*", r"<link\b[^>]*>\s*"):
        body = re.sub(pat, "", body, flags=re.S)
    head = "\n".join("  " + h for h in head_bits)
    doc = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{title}</title>
  <meta name="description" content="{DESCRIPTION}">
  <meta name="color-scheme" content="light dark">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
{head}
</head>
<body>
{body.strip()}
</body>
</html>
"""
    (OUT / "index.html").write_text(doc, encoding="utf-8")
    size = sum(f.stat().st_size for f in OUT.iterdir())
    print(f"site/ written: {len(list(OUT.iterdir()))} files, {size/1e6:.1f} MB")

if __name__ == "__main__":
    main()
