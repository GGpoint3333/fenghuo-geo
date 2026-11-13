# -*- coding: utf-8 -*-
"""生成 1200x630 OG 图（纯 Pillow，无外部图片 / 无 ImageResponse 中文 tofu）。

运行：python scripts/make-og.py
输出：site/public/og-image.png
色彩严格遵循五行风火规范：朱砂红→九紫唯一渐变、暖玄深色仅作小面积角标底、
大面积为暖白 #FAFAFB / 白 #FFFFFF，朱砂红全程显色。
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "site" / "public" / "og-image.png"
OUT.parent.mkdir(parents=True, exist_ok=True)

W, H = 1200, 630
ZHU = (194, 59, 34)        # #c23b22 朱砂红
JIUZI = (139, 47, 190)     # #8b2fbe 九紫
DAI = (47, 110, 90)        # #2f6e5a 黛青
BAIJIN = (212, 175, 55)    # #d4af37 八白金
INK = (43, 35, 32)         # #2B2320
INK2 = (107, 95, 88)       # #6B5F58
INK3 = (156, 144, 137)     # #9C9089
LINE = (239, 232, 227)     # #EFE8E3
CREAM = (250, 250, 251)    # #FAFAFB
WARM_WHITE = (250, 246, 240)

FONTS = Path("C:/Windows/Fonts")
def font(bold, size):
    name = "msyhbd.ttc" if bold else "msyh.ttc"
    return ImageFont.truetype(str(FONTS / name), size, index=0)

f_brand = font(True, 40)
f_tag = font(False, 22)
f_h1 = font(True, 76)
f_sub = font(False, 27)
f_small = font(False, 21)
f_panel_head = font(True, 26)
f_engine = font(False, 24)
f_badge = font(True, 20)

img = Image.new("RGB", (W, H), CREAM)
draw = ImageDraw.Draw(img)

# ---- 右侧品牌渐变面板（朱砂红→九紫，逐列线性插值）----
panel_x0 = 640
for x in range(panel_x0, W):
    t = (x - panel_x0) / (W - panel_x0)
    c = tuple(int(ZHU[i] + (JIUZI[i] - ZHU[i]) * t) for i in range(3))
    draw.line([(x, 0), (x, H)], fill=c)
# 暖白斜带分隔（风势），左缘从 x=560 斜到 x=540
draw.polygon([(560, 0), (700, 0), (680, H), (540, H)], fill=CREAM)

# ---- 渐变区装饰：火焰余烬圆点 + 风线（全部压在下半部，避开文字）----
for (cx, cy, r) in [(900, 470, 58), (1090, 520, 34), (800, 560, 20),
                    (1140, 420, 26), (760, 430, 14)]:
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=tuple(
        int(ZHU[i] * 0.35 + JIUZI[i] * 0.35 + WARM_WHITE[i] * 0.30) for i in range(3)))
for y, xoff in [(460, 0), (510, 40), (560, 10)]:
    draw.arc([700 + xoff, y, 1180 + xoff, y + 110], 200, 340, fill=WARM_WHITE, width=3)

# ---- 渐变区「引擎墙」（暖白文字，2 列 × 4 行）----
draw.text((760, 78), "覆盖 8 大主流 AI 引擎", font=f_panel_head, fill=WARM_WHITE)
draw.line([(760, 124), (1130, 124)], fill=WARM_WHITE, width=2)
engines = ["豆包", "DeepSeek", "通义千问", "腾讯元宝", "文心一言", "Kimi", "GPT", "Gemini"]
for i, e in enumerate(engines):
    col, row = i % 2, i // 2
    draw.text((760 + col * 200, 155 + row * 60), e, font=f_engine, fill=WARM_WHITE)

# ---- 左上品牌标志：朱砂红火焰 + 黛青风线 ----
ox, oy = 72, 70
for (y0, dx) in [(oy + 8, 0), (oy + 18, 6), (oy + 28, 0)]:
    draw.arc([ox - 2 + dx, y0, ox + 46 + dx, y0 + 22], 200, 340, fill=DAI, width=3)
flame = [
    (ox + 26, oy + 2), (ox + 30, oy + 22), (ox + 20, oy + 30),
    (ox + 42, oy + 34), (ox + 50, oy + 56), (ox + 48, oy + 76),
    (ox + 40, oy + 92), (ox + 12, oy + 92), (ox + 4, oy + 76),
    (ox + 2, oy + 56), (ox + 10, oy + 34), (ox + 20, oy + 40),
    (ox + 16, oy + 22),
]
draw.polygon(flame, fill=ZHU)
draw.ellipse([ox + 19, oy + 58, ox + 33, oy + 86], fill=WARM_WHITE)
draw.text((ox + 66, oy + 14), "风火GEO", font=f_brand, fill=INK)
draw.text((ox + 66, oy + 64), "别让AI漏掉你的品牌", font=f_tag, fill=ZHU)

# ---- 主标题（h1 唯一，左栏内，不越过斜带）----
draw.text((72, 240), "别让 AI", font=f_h1, fill=INK)
draw.text((72, 332), "漏掉你的品牌", font=f_h1, fill=ZHU)

# ---- 副标：折成两行，严格收在 x<540 的左栏 ----
draw.text((74, 432), "实时监测 8 大引擎中品牌的排名、", font=f_sub, fill=INK2)
draw.text((74, 470), "口碑与引用来源", font=f_sub, fill=INK2)

# ---- 八白金描边小徽章 ----
bx0, by0, bx1, by1 = 72, 518, 300, 564
draw.rounded_rectangle([bx0, by0, bx1, by1], radius=8, outline=BAIJIN, width=2)
draw.text((bx0 + 18, by0 + 8), "GEO · 生成式引擎优化", font=f_badge, fill=INK2)

# ---- 底部信息条 ----
draw.line([(72, 560), (530, 560)], fill=LINE, width=2)
draw.text((72, 568), "© 2026 Point · 风火GEO", font=f_small, fill=INK3)
draw.text((72, 594), "本网站为个人学习演示项目，非商业运营", font=f_small, fill=INK3)

img.save(OUT, "PNG", optimize=True)
print(f"wrote {OUT} ({W}x{H})")
