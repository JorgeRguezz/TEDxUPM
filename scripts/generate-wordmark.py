"""Generate clearly identified prototype lettering from the installed Inter font.
Requires fontTools; final brand artwork must replace this generated geometry.
"""
from pathlib import Path
import json
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.svgLib.path import parse_path

root = Path(__file__).resolve().parents[1]
fonts = {weight: TTFont(root / f'node_modules/@fontsource/inter/files/inter-latin-{weight}-normal.woff') for weight in [700, 900]}
letters = []
max_x = 0
for line, baseline in [('TEDx', 125), ('Universidad', 258), ('Politecnica Madrid', 391)]:
    font = fonts[900 if line == 'TEDx' else 700]
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    scale = (150 if line == 'TEDx' else 125) / font['head'].unitsPerEm
    x = 12
    for char in line:
        name = cmap[ord(char)]
        glyph = glyphs[name]
        pen = SVGPathPen(glyphs)
        transformed = TransformPen(pen, (scale, 0, 0, -scale, x, baseline))
        glyph.draw(transformed)
        d = pen.getCommands()
        if d:
            # SVGPathPen creates independent M...Z contours; preserve their winding.
            import re
            contours = [part for part in re.findall(r'M[^M]+', d)]
            letters.append({'d': d, 'contours': contours, 'red': line == 'TEDx'})
        x += glyph.width * scale - (1.5 if char != ' ' else 0)
    max_x = max(max_x, x)
width = round(max_x + 12, 3)
data = {'viewBox': f'0 0 {width} 425', 'width': width, 'height': 425, 'assetStatus': 'prototype-not-approved-logo', 'weights': {'TEDx': 900, 'name': 700}, 'fontSizes': {'TEDx': 150, 'name': 125}, 'letters': letters}
tedx_bounds = BoundsPen(None)
for letter in letters:
    if letter['red']:
        parse_path(letter['d'], tedx_bounds)
x0, y0, x1, y1 = tedx_bounds.bounds
data['tedxViewBox'] = f'{x0} {y0} {x1 - x0} {y1 - y0}'
(root / 'src/assets/wordmark.json').write_text(json.dumps(data, separators=(',', ':')) + '\n')
print(f'Generated prototype: {len(letters)} letters, {sum(len(x["contours"]) for x in letters)} contours')
