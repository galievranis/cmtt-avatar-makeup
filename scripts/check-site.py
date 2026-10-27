"""Check the static site without external Python packages."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
errors = []
class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs, self.ids, self.uses = [], set(), []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        if tag == 'use':
            self.uses.append(attrs.get('href') or attrs.get('xlink:href', ''))
        for attr in ('src', 'poster', 'href'):
            value = attrs.get(attr, '')
            if value.startswith('./'):
                self.refs.append(value)

for name in ('index.html', 'post.html', 'blog.html'):
    path = ROOT / name
    page = Page()
    page.feed(path.read_text())
    for ref in page.refs:
        if not (ROOT / unquote(urlsplit(ref).path)).is_file():
            errors.append(f'{name}: missing resource {ref}')
    for ref in page.uses:
        if ref.startswith('#') and ref[1:] not in page.ids:
            errors.append(f'{name}: missing SVG symbol {ref}')
for number in range(1, 10):
    path = ROOT / 'frames' / f'{number}.webp'
    raw = path.read_bytes()
    if raw[:4] != b'RIFF' or raw[8:12] != b'WEBP':
        errors.append(f'Invalid WebP: {path.name}')
if errors:
    raise SystemExit('\n'.join(errors))
print('OK: three pages, local resources, SVG symbols and nine WebP frames.')
