"""Read alpha silhouettes and generate crop metadata; never modifies source PNGs."""
from pathlib import Path
import json
import numpy as np
from scipy import ndimage
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
result = []
for name in ('noe', 'sekhem', 'mira', 'veer', 'luca'):
    file = f'assets/sprites/{name}-v3.png'
    im = Image.open(ROOT / 'dist' / file)
    alpha = np.asarray(im.getchannel('A'))
    labels, _ = ndimage.label(alpha > 96, np.ones((3, 3)))
    counts = np.bincount(labels.ravel())
    boxes, fragments = [], []
    for i, section in enumerate(ndimage.find_objects(labels), 1):
        y, x = section
        if counts[i] < 1000:
            if name == 'luca' and counts[i] >= 12:
                slot = min(4, int((y.start+y.stop)/2/(im.height/5)))*5 + min(4, int((x.start+x.stop)/2/(im.width/5)))
                # The last card in the throwing follow-through crosses the
                # nominal column edge; it belongs to pose 20, never Heat 21.
                if slot == 21 and x.start < 335:
                    slot = 20
                if slot in (5, 9, 12, 20, 23):
                    fragments.append((slot, dict(x=x.start, y=y.start, w=x.stop-x.start, h=y.stop-y.start)))
            continue
        boxes.append((x.start, y.start, x.stop, y.stop))
    boxes.sort(key=lambda b: (int((b[1]+b[3])/2/(im.height/5)), (b[0]+b[2])/2))
    assert len(boxes) == 25, (name, len(boxes))
    frames = []
    for i, (x0, y0, x1, y1) in enumerate(boxes):
        parts = [part for slot, part in fragments if slot == i]
        baseline = y1-1
        for part in parts:
            x0, y0 = min(x0, part['x']), min(y0, part['y'])
            x1, y1 = max(x1, part['x']+part['w']), max(y1, part['y']+part['h'])
        # Bounds follow the real silhouette, including extensions across grid cells.
        x, y = max(0, x0-2), max(0, y0-2)
        frames.append(dict(x=x, y=y, w=min(im.width, x1+2)-x,
                           h=min(im.height, y1+2)-y,
                           anchorX=round((i % 5+.5)*im.width/5, 2), baseline=baseline))
        if parts:
            frames[-1]['parts'] = parts
    basis = round((boxes[0][3]-boxes[0][1])/.89, 2)
    result.append(dict(id=name, file=file, basis=basis, frames=frames))
    print(name, im.size, len(frames), 'poses, alpha', int(alpha.min()), int(alpha.max()))

(ROOT/'dist/roster-sprite-data.json').write_text(json.dumps(result, indent=2)+'\n')
# The game and standalone build use a code-native module (no async JSON fetch).
target = ROOT/'dist/sprite-data.mjs'
source = target.read_text().split('// NEW ROSTER: generated crop metadata')[0]
target.write_text(source+'// NEW ROSTER: generated crop metadata\nSPRITES.push(...'+json.dumps(result, separators=(',', ':'))+');\n')
