import sys
from PIL import Image, ImageDraw, ImageFilter
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
w, h = im.size
mask = Image.new('L', im.size, 0)
# flood-fill background from corners on a copy, marking with sentinel colour
work = im.copy()
for c in [(0,0),(w-1,0),(0,h-1),(w-1,h-1)]:
    ImageDraw.floodfill(work, c, (255,0,255), thresh=28)
px = work.load(); m = mask.load()
for y in range(h):
    for x in range(w):
        m[x,y] = 0 if px[x,y] == (255,0,255) else 255
mask = mask.filter(ImageFilter.GaussianBlur(1.2))
rgba = im.convert('RGBA'); rgba.putalpha(mask)
rgba = rgba.crop(rgba.getbbox())
rgba.thumbnail((900,900), Image.LANCZOS)
rgba.save(out, 'WEBP', quality=90)
small = rgba.copy(); small.thumbnail((192,192), Image.LANCZOS); small.save(out.replace('.webp','-192.png'))
print(rgba.size)
