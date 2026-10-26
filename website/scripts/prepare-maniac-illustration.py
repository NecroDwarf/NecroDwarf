"""Crop faint transparent margins of an illustration; never use on pixel atlases.

Requires Pillow. Pass the verified upstream PNG and destination WebP explicitly.
The alpha threshold selects bounds only; alpha inside the crop is preserved.
"""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("source", type=Path)
parser.add_argument("output", type=Path)
args = parser.parse_args()
original = args.source.read_bytes()
expected = "3cad7888df6547b9f2fbcdcf3c377b678feb6806160e593a4fb4814be77c8040"
if hashlib.sha256(original).hexdigest() != expected:
    raise ValueError("Expected the verified concentrated_nightmare.png; review new sources first")
image = Image.open(args.source).convert("RGBA")
bounds = image.getchannel("A").point(lambda x: 255 if x >= 8 else 0).getbbox()
left, top, right, bottom = bounds
side = max(right-left, bottom-top) + 64
cx, cy = (left+right)//2, (top+bottom)//2
crop = (cx-side//2, cy-side//2, cx+side//2, cy+side//2)
image.crop(crop).resize((256, 256), Image.Resampling.LANCZOS).save(args.output, lossless=True)
print(json.dumps({"sourceSize": image.size, "alphaThreshold": 8, "usefulBounds": bounds,
                  "crop": crop, "outputSize": [256, 256],
                  "sha256": hashlib.sha256(args.output.read_bytes()).hexdigest(),
                  "bytes": args.output.stat().st_size}))
