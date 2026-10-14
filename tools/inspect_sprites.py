"""Read-only alpha-component inspection. Does not alter the source images."""
from collections import deque
from pathlib import Path
import json
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[1]
result = {}
for name in ('jin', 'kazuya', 'jun', 'reina'):
    im = Image.open(root / 'dist/assets/sprites' / f'{name}-v2.png')
    alpha = np.array(im.getchannel('A'))
    mask = alpha > 96
    seen = np.zeros(mask.shape, dtype=bool)
    height, width = mask.shape
    components = []
    for yy, xx in np.argwhere(mask):
        if seen[yy, xx]:
            continue
        seen[yy, xx] = True
        todo = deque([(int(xx), int(yy))])
        count = 0
        x0 = x1 = int(xx)
        y0 = y1 = int(yy)
        while todo:
            x, y = todo.popleft()
            count += 1
            x0, x1 = min(x0, x), max(x1, x)
            y0, y1 = min(y0, y), max(y1, y)
            for dx, dy in ((-1,0),(1,0),(0,-1),(0,1),(-1,-1),(1,-1),(-1,1),(1,1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height and mask[ny,nx] and not seen[ny,nx]:
                    seen[ny,nx] = True
                    todo.append((nx,ny))
        if count > 1200:
            components.append({'x': x0, 'y': y0, 'w': x1-x0+1, 'h': y1-y0+1, 'pixels':count})
    components.sort(key=lambda b: (round((b['y']+b['h']/2)/(height/4)-.5), b['x']))
    result[name] = {'size': [width,height], 'components':components}
    print(name, len(components), components)
(root / 'qa/sprite-components.json').write_text(json.dumps(result, indent=2))
