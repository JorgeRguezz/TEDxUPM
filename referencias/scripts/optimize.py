import glob, os
from PIL import Image

D = os.path.join(os.path.dirname(__file__), "..", "shots")
OUT = os.path.join(os.path.dirname(__file__), "..", "img")
os.makedirs(OUT, exist_ok=True)
for f in glob.glob(os.path.join(D, "*.png")):
    base = os.path.basename(f)[:-4]
    im = Image.open(f).convert("RGB")
    if base.endswith("_full"):
        n = base[:-5]
        im.resize((1200, int(im.height * 1200 / im.width))).save(f"{OUT}/{n}_full.jpg", quality=72, optimize=True)
        im.crop((0, 0, 1440, 1000)).resize((720, 500)).save(f"{OUT}/{n}_thumb.jpg", quality=75, optimize=True)
    else:
        n = base[:-7]
        im.save(f"{OUT}/{n}_mobile.jpg", quality=72, optimize=True)
