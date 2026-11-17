import os, sys
from PIL import Image, ImageDraw

D = os.path.join(os.path.dirname(__file__), "..", "shots")
OUT = os.path.join(D, "..", "sheets")
names = sys.argv[2:]
tag = sys.argv[1]
W, H = 720, 1100  # top 1440x2200 region scaled 0.5
sheet = Image.new("RGB", (W * 2, (H + 24) * ((len(names) + 1) // 2)), "white")
d = ImageDraw.Draw(sheet)
for i, n in enumerate(names):
    im = Image.open(os.path.join(D, f"{n}_full.png")).convert("RGB").crop((0, 0, 1440, 2200)).resize((W, H))
    x, y = (i % 2) * W, (i // 2) * (H + 24)
    sheet.paste(im, (x, y + 24))
    d.text((x + 6, y + 6), n, fill="black")
sheet.save(os.path.join(OUT, f"heroes_{tag}.jpg"), quality=75)
