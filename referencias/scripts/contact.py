import glob, os, sys
from PIL import Image, ImageDraw

D = os.path.join(os.path.dirname(__file__), "..", "shots")
files = sorted(glob.glob(os.path.join(D, "*_full.png")))
COLS, TW, TH = 4, 480, 1400  # crop top 4200px -> scaled to 480 wide
per = 8
os.makedirs(os.path.join(D, "..", "sheets"), exist_ok=True)
for i in range(0, len(files), per):
    chunk = files[i:i + per]
    rows = (len(chunk) + COLS - 1) // COLS
    sheet = Image.new("RGB", (COLS * TW, rows * (TH + 30)), "white")
    d = ImageDraw.Draw(sheet)
    for j, f in enumerate(chunk):
        im = Image.open(f).convert("RGB")
        im = im.resize((TW, int(im.height * TW / im.width)))
        im = im.crop((0, 0, TW, TH))
        x, y = (j % COLS) * TW, (j // COLS) * (TH + 30)
        sheet.paste(im, (x, y + 30))
        d.text((x + 6, y + 8), os.path.basename(f).replace("_full.png", ""), fill="black")
    sheet.save(os.path.join(D, "..", "sheets", f"sheet_{i // per:02d}.jpg"), quality=70)
print(len(files))
