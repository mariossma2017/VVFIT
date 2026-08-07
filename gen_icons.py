from PIL import Image, ImageDraw, ImageFont
import os

def make_icon(size, path, maskable=False):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # background rounded square with gradient-like purple tone
    bg_color = (124, 77, 160, 255)  # roxo
    if maskable:
        draw.rectangle([0, 0, size, size], fill=bg_color)
    else:
        radius = int(size * 0.22)
        draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=bg_color)

    # inner circle accent (rosa queimado)
    accent = (196, 120, 130, 255)
    margin = size * (0.30 if maskable else 0.16)
    draw.ellipse([margin, margin, size - margin, size - margin], outline=accent, width=max(2, size // 40))

    # "VV" text centered
    text = "VV"
    font = None
    font_candidates = [
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]
    font_size = int(size * (0.34 if maskable else 0.4))
    for fp in font_candidates:
        if os.path.exists(fp):
            font = ImageFont.truetype(fp, font_size)
            break
    if font is None:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (size - tw) / 2 - bbox[0]
    y = (size - th) / 2 - bbox[1]
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)

    img.save(path, "PNG")
    print("saved", path)

base = os.path.dirname(os.path.abspath(__file__))
make_icon(192, os.path.join(base, "icon-192.png"), maskable=False)
make_icon(512, os.path.join(base, "icon-512.png"), maskable=False)
make_icon(192, os.path.join(base, "icon-maskable-192.png"), maskable=True)
make_icon(512, os.path.join(base, "icon-maskable-512.png"), maskable=True)
